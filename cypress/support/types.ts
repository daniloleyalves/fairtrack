/// <reference types="cypress" />

import type { InferSelectModel } from 'drizzle-orm';
import type {
  user,
  fairteiler,
  session,
  member,
  invitation,
  verification,
  category,
  origin,
  company,
} from '@/server/db/schema';

// ============================================================================
// FIXTURE TYPES
// ============================================================================

export type FixtureUser = {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAnonymous: boolean;
  isFirstLogin: boolean;
};

export type UsersFixture = {
  validUser: FixtureUser;
  existingUser: FixtureUser;
  invalidUser: FixtureUser;
  invitedUser: FixtureUser;
  testCredentials: {
    email: string;
    password: string;
  };
};

// ============================================================================
// DATABASE TYPES (using schema inference)
// ============================================================================

export type DatabaseUser = InferSelectModel<typeof user>;
export type DatabaseFairteiler = InferSelectModel<typeof fairteiler>;
export type DatabaseSession = InferSelectModel<typeof session>;
export type DatabaseMember = InferSelectModel<typeof member>;
export type DatabaseInvitation = InferSelectModel<typeof invitation>;
export type DatabaseVerification = InferSelectModel<typeof verification>;
export type DatabasePreference =
  | InferSelectModel<typeof category>
  | InferSelectModel<typeof origin>
  | InferSelectModel<typeof company>;

// ============================================================================
// TEST INPUT TYPES
// ============================================================================

export type TestUser = {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  isAnonymous: boolean;
  isFirstLogin: boolean;
  password?: string;
  role?: string;
  acceptTos?: boolean;
};

export type TestFairteiler = {
  id?: string;
  name?: string;
  slug?: string;
  address?: string;
};

export type TestInvitation = {
  id: string;
  email: string;
  organizationId: string;
  role: string;
};

export type TestResetToken = {
  email: string;
  token: string;
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegistrationData = TestUser;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isDatabaseUser(user: unknown): user is DatabaseUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'email' in user &&
    'firstName' in user &&
    'lastName' in user
  );
}

export function isDatabaseSession(
  session: unknown,
): session is DatabaseSession {
  return (
    typeof session === 'object' &&
    session !== null &&
    'id' in session &&
    'userId' in session &&
    'token' in session
  );
}

export function isDatabaseMember(member: unknown): member is DatabaseMember {
  return (
    typeof member === 'object' &&
    member !== null &&
    'id' in member &&
    'organizationId' in member &&
    'userId' in member &&
    'role' in member
  );
}

export function isDatabaseFairteiler(
  fairteiler: unknown,
): fairteiler is DatabaseFairteiler {
  return (
    typeof fairteiler === 'object' &&
    fairteiler !== null &&
    'id' in fairteiler &&
    'name' in fairteiler &&
    'slug' in fairteiler
  );
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export type ApiError = {
  error: string;
  message?: string;
  code?: string;
};

export type ApiSuccess<T = unknown> = {
  success: true;
  data: T;
};

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

export type FormValidationError = {
  field: string;
  message: string;
};

export type FormValidationResult = {
  isValid: boolean;
  errors: FormValidationError[];
};
