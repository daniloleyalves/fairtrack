import z from 'zod';

export const feedbackSchema = z.object({
  category: z.enum(['bug', 'feature', 'improvement', 'general']),
  message: z
    .string()
    .min(10, 'Deine Nachricht sollte mindestens 10 Zeichen lang sein')
    .max(2000, 'Deine Nachricht darf maximal 2000 Zeichen lang sein'),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;
