import z from 'zod';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export const fairteilerTutorialStepSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Titel ist erforderlich'),
  content: z.string(),
  sortIndex: z.number(),
  media: z
    .union([z.string(), z.instanceof(File)])
    .nullable()
    .refine(
      (value) => {
        if (typeof value === 'string') return true;
        if (!value || !(value instanceof File)) return true;
        return ACCEPTED_IMAGE_TYPES.includes(value.type);
      },
      {
        message:
          'Es werden nur folgende Formate unterstützt: .jpg, .jpeg und .png',
      },
    ),
});

export const fairteilerTutorialSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Titel ist erforderlich'),
  isActive: z.boolean().optional(),
});

export type TutorialFormData = z.infer<typeof fairteilerTutorialSchema>;
export type TutorialStepFormData = z.infer<typeof fairteilerTutorialStepSchema>;
