import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { loadAuthenticatedSession } from '@/server/dal';
import {
  generatePersonalizedFeedbackStream,
  UserFeedbackData,
} from '@/lib/services/openai';
import { AuthError } from '@/server/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const nextHeaders = await headers();
    const session = await loadAuthenticatedSession(nextHeaders);

    if (!session.user.id) {
      throw new AuthError('No active session');
    }

    const body = (await request.json()) as UserFeedbackData;

    const stream = await generatePersonalizedFeedbackStream(
      body,
      session.user.id,
    );

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Feedback streaming error:', error);

    if (error instanceof AuthError) {
      return new Response('Unauthorized', { status: 401 });
    }

    return new Response('Internal Server Error', { status: 500 });
  }
}
