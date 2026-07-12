import 'server-only';
import OpenAI from 'openai';
import { z } from 'zod';

export const openai =
  process.env.NEXT_PUBLIC_ENV !== 'testing'
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export const userFeedbackDataSchema = z.object({
  recentContributions: z.array(
    z.object({
      id: z.string(),
      date: z.date(),
      quantity: z.number(),
      shelfLife: z.date().nullable(),
      title: z.string().nullable(),
      cool: z.boolean().nullable(),
      allergens: z.string().nullable(),
      comment: z.string().nullable(),
      origin: z.object({
        name: z.string().nullable(),
      }),
      category: z.object({
        name: z.string().nullable(),
        image: z.string().nullable(),
      }),
      company: z.object({
        name: z.string().nullable(),
      }),
      fairteiler: z.object({
        name: z.string(),
      }),
    }),
  ),
  achievedMilestones: z.number(),
  nextMilestone: z.number(),
  totalContributions: z.number().optional(),
  totalWeight: z.number().optional(),
  topCategories: z.array(z.string()).optional(),
  contributionStreak: z.number().optional(),
  averageContributionSize: z.number().optional(),
});

export type UserFeedbackDataSchema = z.infer<typeof userFeedbackDataSchema>;
export type UserFeedbackData = z.infer<typeof userFeedbackDataSchema>;

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Checks and enforces rate limiting for a user
 * @throws {RateLimitError} if rate limit is exceeded
 */
function checkRateLimit(userId: string): void {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  // Initialize or reset expired limit
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  // Check if limit exceeded
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    throw new RateLimitError(
      'Zu viele Anfragen. Bitte versuche es in einer Stunde nochmal. ⏰',
    );
  }

  userLimit.count++;
}

/**
 * Generates personalized feedback with streaming for user contributions
 * Uses OpenAI streaming to create encouraging, context-aware messages in German
 */
export async function generatePersonalizedFeedbackStream(
  userData: UserFeedbackData,
  userId?: string,
): Promise<ReadableStream<Uint8Array>> {
  if (!openai) {
    const encoder = new TextEncoder();
    return Promise.resolve(
      new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('OpenAI client not initialized'));
          controller.close();
        },
      }),
    );
  }

  if (userId) {
    checkRateLimit(userId);
  }

  const prompt = buildPrompt(userData);

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini-2025-04-14',
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
    });

    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error('OpenAI streaming error:', error);
          // Send fallback message on error
          const fallback = getFallbackMessage();
          controller.enqueue(encoder.encode(fallback));
          controller.close();
        }
      },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Return fallback as stream
    const encoder = new TextEncoder();
    const fallback = getFallbackMessage();

    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(fallback));
        controller.close();
      },
    });
  }
}

/**
 * Builds the prompt with user data
 */
function buildPrompt(userData: UserFeedbackData): string {
  const {
    totalContributions,
    totalWeight,
    recentContributions,
    achievedMilestones,
    nextMilestone,
    topCategories,
    averageContributionSize,
    contributionStreak,
  } = userData;

  return `Erstelle eine personalisierte, aufmunternde Nachricht für einen Foodsaver der Foodsharing-Bewegung.
            Nutzerdaten:
            - Gesamtbeiträge: ${totalContributions}
            - Gerettetes Gewicht: ${totalWeight}kg
            - Letzten 5 Beiträge (nicht max Beiträge): ${JSON.stringify(recentContributions)}
            - Erreichte Meilensteine: ${achievedMilestones}
            ${nextMilestone ? `- Nächster Meilenstein: ${nextMilestone} Beiträge` : ''}
            ${topCategories ? `- Top-Kategorien: ${topCategories.join(', ') || 'Keine'}` : ''}
            ${averageContributionSize ? `- Durchschnittliche Größe: ${averageContributionSize}kg` : ''}
            ${contributionStreak ? `- Streak: ${contributionStreak} Tage` : ''}

            Erstelle eine 2-3 Sätze lange Nachricht, die:
            1. Konkrete, vergangene Erfolge des Nutzers würdigen
            2. Motivierend und ermutigend ist
            3. Kann auch humorvoll sein
            4. Nutze passende Emojis (2-3 pro Nachricht)
            5. Natürliches, freundliches Deutsch
            6. Bezieht sich auf spezifische Daten

            WICHTIG: Sei authentisch und locker! Sage nicht Food-Held, sei konkret in den Zahlenwerten.
            
            Max 2 Sätze`;
}

/**
 * Returns the system prompt for OpenAI
 */
function getSystemPrompt(): string {
  return `Du bist ein freundlicher Assistent für eine Food-Sharing-Plattform. 
            Deine Nachrichten sind:
            - Authentisch und warm, wie von einem Freund
            - Ermutigend ohne übertrieben zu sein
            - Humorvoll wenn passend
            - Mit passenden Emojis versehen
            - In natürlichem, modernem Deutsch
            - Konkret auf die Nutzerdaten bezogen

            Du bist KEIN Coach, sondern gibst einfach nettes, kontextbezogenes Feedback.`;
}

/**
 * Returns a fallback message if OpenAI doesn't respond
 */
function getFallbackMessage(): string {
  return 'Super, dass du dabei bist! 🌱 Jeder Beitrag zählt! 💚';
}
