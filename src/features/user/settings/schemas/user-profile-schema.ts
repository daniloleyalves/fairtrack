import z from 'zod';

const MAX_FILE_SIZE = 3000000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export const userProfileSchema = z.object({
  name: z.string().trim(),
  firstName: z
    .string()
    .min(2, { message: 'Bitte gib mindestens 2 Zeichen ein' })
    .trim()
    .refine((data) => data.length > 0, { message: 'Name erforderlich' }),
  lastName: z
    .string()
    .trim()
    .refine((data) => data.length > 0, {
      message: 'Standortkoordinaten erforderlich',
    }),
  isAnonymous: z.boolean(),
  avatar: z
    .union([z.string(), z.instanceof(File)])
    .nullable()
    .refine(
      (value) => {
        // If it's a string, it's our existing URL. We accept it.
        if (typeof value === 'string') return true;
        // If it's a new file, we validate it.
        // The field is optional, so null/undefined is also valid.
        if (!value || !(value instanceof File)) return true;
        return value.size <= MAX_FILE_SIZE;
      },
      { message: `Maximale Dateigröße darf 3 Megabyte nicht überschreiten.` },
    )
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
