import { auth } from './auth';
import { authClient } from './auth-client';
import { MemberRoles } from './auth-permissions';

type ErrorTypes = Partial<
  Record<
    keyof typeof auth.$ERROR_CODES,
    {
      en: string;
      de: string;
    }
  >
>;

export const errorCodes = {
  USER_ALREADY_EXISTS: {
    en: 'User already registered.',
    de: 'Benutzer bereits registriert.',
  },
  INVALID_EMAIL_OR_PASSWORD: {
    en: 'Invalid email or password.',
    de: 'Ungültige E-Mail-Adresse oder Passwort.',
  },
  BANNED_USER: {
    en: 'This account has been disabled.',
    de: 'Dieser Nutzer wurde deaktiviert.',
  },
  INVALID_TOKEN: {
    en: 'Invalid or expired Token. Please request a new one.',
    de: 'Ungültiger oder abgelaufener Token. Bitte fordere einen neuen an.',
  },
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION: {
    en: 'You are not allowed to perform that operation.',
    de: 'Du bist nicht befugt diese Aktion auszuführen',
  },
  YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS: {
    en: 'You are not allowed to create users.',
    de: 'Du bist nicht befugt User zu erstellen',
  },
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_USERS: {
    en: 'You are not allowed to update users.',
    de: 'Du bist nicht befugt User zu aktualisieren',
  },
} satisfies ErrorTypes;

const customErrorCodes = {
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: {
    en: 'User already registered.',
    de: 'Benutzer bereits registriert.',
  },
};

export const getErrorMessage = (
  code: string | undefined,
  lang: 'en' | 'de',
): string => {
  const unexpectedErrorMessage =
    'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.';

  if (!code) {
    return unexpectedErrorMessage;
  }

  if (code in errorCodes) {
    return errorCodes[code as keyof typeof errorCodes][lang];
  }

  if (code in customErrorCodes) {
    return customErrorCodes[code as keyof typeof customErrorCodes][lang];
  }
  return unexpectedErrorMessage;
};

export const getNameAbbreviation = (name: string): string => {
  // Split the string by whitespace and remove any empty entries
  const words = name.split(' ').filter(Boolean);
  if (!words.length) {
    return '';
  }

  const firstLetter = words[0][0].toUpperCase();
  const secondLetter = words[1] ? words[1][0].toUpperCase() : '';

  return (firstLetter + secondLetter).toLowerCase();
};

export const generatePassword = (): string => {
  const length = 8;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

export const checkAccess = (
  reqPermissions: { section: string; permissions: string[] } | undefined,
  role: MemberRoles | undefined,
) => {
  if (!reqPermissions) {
    return true;
  }

  return authClient.organization.checkRolePermission({
    permission: {
      [reqPermissions.section]: reqPermissions.permissions,
    },
    role: role ?? 'disabled',
  });
};

export const ANONYMOUS_USER_NAME = 'Anonyme Person';
