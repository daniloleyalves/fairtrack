import { z } from 'zod';

export const signInSchema = z.object({
  email: z
    .string()
    .email({ message: 'Ungültige E-Mail-Adresse.' })
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(6, { message: 'Passwort muss mindestens 6 Zeichen lang sein.' }),
});

export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, { message: 'Bitte gib mindestens 2 Zeichen ein.' }),
    lastName: z
      .string()
      .trim()
      .min(2, { message: 'Bitte gib mindestens 2 Zeichen ein.' }),
    email: z
      .string()
      .email({ message: 'Ungültige E-Mail-Adresse.' })
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string({ message: 'Passwort wird benötigt.' })
      .min(8, { message: 'Passwort muss mindestens 8 Zeichen lang sein.' })
      .trim()
      .refine((password) => /[A-Z]/.test(password), {
        message: 'Das Passwort muss mindestens einen Großbuchstaben enthalten.',
      })
      .refine((password) => /\d/.test(password), {
        message: 'Das Passwort muss mindestens eine Ziffer enthalten.',
      }),
    passwordConfirm: z
      .string()
      .trim()
      .min(1, { message: 'Passwort bestätigen wird benötigt.' }),
    tos: z
      .boolean({ message: 'Bitte aktzeptiere die Nutzungsbedingungen.' })
      .refine((val) => val === true, {
        message: 'Bitte aktzeptiere die Nutzungsbedingungen.',
      }),
    notificationsConsent: z.boolean(),
  })
  .superRefine(({ passwordConfirm, password }, ctx) => {
    if (passwordConfirm !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwörter stimmen nicht überein.',
        path: ['passwordConfirm'],
      });
    }
  });

export const sendInstructionsSchema = z.object({
  email: z
    .string()
    .email({ message: 'Ungültige E-Mail-Adresse.' })
    .transform((val) => val.toLowerCase().trim()),
});

export const emailOnlySchema = z.object({
  email: z
    .string()
    .email({ message: 'Ungültige E-Mail-Adresse.' })
    .transform((val) => val.toLowerCase().trim()),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string({ message: 'Passwort wird benötigt.' })
      .min(8, { message: 'Passwort muss mindestens 8 Zeichen lang sein.' })
      .trim()
      .refine((password) => /[A-Z]/.test(password), {
        message: 'Das Passwort muss mindestens einen Großbuchstaben enthalten.',
      })
      .refine((password) => /\d/.test(password), {
        message: 'Das Passwort muss mindestens eine Ziffer enthalten.',
      }),
    passwordConfirm: z
      .string({ message: 'Passwörter stimmen nicht überein.' })
      .trim(),
  })
  .superRefine(({ passwordConfirm, password }, ctx) => {
    if (passwordConfirm !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwörter stimmen nicht überein.',
        path: ['passwordConfirm'],
      });
    }
  });

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type SendInstructionsFormValues = z.infer<typeof sendInstructionsSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type EmailOnlyFormValues = z.infer<typeof emailOnlySchema>;
