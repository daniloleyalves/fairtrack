import { MemberRolesEnum } from '@/lib/auth/auth-permissions';
import z from 'zod';

export const changeRoleSchema = z.object({
  userId: z.string(),
  memberId: z.string(),
  role: z.enum(MemberRolesEnum, {
    message: 'Bitte wähle eine gültige Rolle.',
  }),
});

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Ungültige E-Mail-Adresse.' })
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9_+-]*(\.[a-zA-Z0-9_+-]+)*)?@[a-zA-Z0-9]([a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)*)?\.+[a-zA-Z]{2,}$/,
      'Ungültige E-Mail-Adresse.',
    ),
  role: z.enum(MemberRolesEnum, {
    message: 'Bitte wähle eine gültige Rolle.',
  }),
});

export const accessViewSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Der Name muss mindestens 3 Zeichen lang sein.' }),
  role: z.enum([MemberRolesEnum.EMPLOYEE, MemberRolesEnum.GUEST], {
    message: 'Bitte wähle eine gültige Rolle.',
  }),
});

export const removeMemberSchema = z.object({
  organizationId: z.string(),
  email: z
    .string()
    .min(1, 'Ungültige E-Mail-Adresse.')
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9_+-]*(\.[a-zA-Z0-9_+-]+)*)?@[a-zA-Z0-9]([a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)*)?\.+[a-zA-Z]{2,}$/,
      'Ungültige E-Mail-Adresse.',
    ),
});

export const disableAccessViewSchema = z.object({
  userId: z.string(),
  memberId: z.string(),
});
