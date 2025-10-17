import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from '../../src/server/db/schema';
import { createAuthClient } from 'better-auth/react';
import {
  inferAdditionalFields,
  organizationClient,
} from 'better-auth/client/plugins';
import { auth } from '../../src/lib/auth/auth';
import {
  ac,
  disabled,
  employee,
  guest,
  member,
  MemberRoles,
  owner,
  viewer,
} from '@/lib/auth/auth-permissions';
import dotenv from 'dotenv';
import { TestUser } from '../support/types';

dotenv.config({ path: '.vercel/.env.development.local' });

const getTestDatabaseUrl = () => {
  const testUrl = process.env.DATABASE_TEST_URL;
  if (!testUrl) {
    throw new Error(
      'DATABASE_TEST_URL environment variable is required for E2E tests',
    );
  }
  return testUrl;
};

const testClient = neon(getTestDatabaseUrl());
const testDb = drizzle(testClient, { schema });

// Create Cypress-specific auth client
const cypressAuthClient = createAuthClient({
  baseURL: 'http://localhost:3001',
  plugins: [
    organizationClient({
      ac: ac,
      roles: {
        owner,
        member,
        viewer,
        employee,
        guest,
        disabled,
      },
    }),
    inferAdditionalFields<typeof auth>(),
  ],
  fetchOptions: {
    onError(e) {
      console.error('Cypress auth client error:', e);
    },
  },
});

export const databaseTasks = {
  async cleanDatabase() {
    try {
      // Clean up in correct order due to foreign keys
      await testDb.delete(schema.contributionVersionHistory);
      await testDb.delete(schema.checkin);
      await testDb.delete(schema.food);
      await testDb.delete(schema.fairteilerCompany);
      await testDb.delete(schema.fairteilerCategory);
      await testDb.delete(schema.fairteilerOrigin);
      await testDb.delete(schema.company);
      await testDb.delete(schema.category);
      await testDb.delete(schema.origin);
      await testDb.delete(schema.tag);
      await testDb.delete(schema.member);
      await testDb.delete(schema.invitation);
      await testDb.delete(schema.session);
      await testDb.delete(schema.account);
      await testDb.delete(schema.verification);
      await testDb.delete(schema.user);
      await testDb.delete(schema.fairteiler);
      await testDb.delete(schema.feedback);

      return null;
    } catch (error) {
      console.error('Database cleanup failed:', error);
      throw error;
    }
  },

  async createTestUser(userData: TestUser) {
    console.log('cypress: attempting to create user with cypress auth client');

    try {
      const result = await cypressAuthClient.signUp.email({
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password || 'SecurePass123!',
        isFirstLogin: userData.isFirstLogin,
        isAnonymous: userData.isAnonymous,
      });

      if (result.error) {
        console.error('Auth client error details:', result.error);
        return null;
      }

      if (!result.data) {
        console.error('No data returned from auth client');
        return null;
      }

      await testDb
        .update(schema.user)
        .set({ ...result.data.user, role: 'admin' })
        .where(eq(schema.user.id, result.data.user.id))
        .returning();

      console.log('User created successfully:', result.data.user?.email);

      return result.data.user;
    } catch (error) {
      console.error('Exception during user creation:', error);
      throw error;
    }
  },

  async removeTestUserByEmail(userEmail: string) {
    console.log('cypress: attempting to remove user ');

    try {
      const result = await testDb
        .delete(schema.user)
        .where(eq(schema.user.email, userEmail))
        .returning();
      return result;
    } catch (error) {
      console.error('Exception during user removal:', error);
      throw error;
    }
  },

  async createTestFairteiler({
    fairteilerData,
    withTestData,
  }: {
    fairteilerData: {
      name?: string;
      address?: string;
      geoLink?: string;
      geoLng?: string;
      geoLat?: string;
      website?: string;
      slug?: string;
      disabled?: boolean;
    };
    withTestData?: boolean;
  }) {
    try {
      const timestamp = Date.now();
      const fairteiler = await testDb
        .insert(schema.fairteiler)
        .values({
          name: fairteilerData.name || `Test Fairteiler ${timestamp}`,
          slug: fairteilerData.slug || `test-fairteiler-${timestamp}`,
          address: fairteilerData.address || 'Test Address 123',
          geoLink: fairteilerData.geoLink || 'Test geoLink 123',
          geoLng: fairteilerData.geoLng || '13.4050',
          geoLat: fairteilerData.geoLat || '52.5200',
          website: fairteilerData.website || 'Test Website 123',
          disabled: fairteilerData.disabled || false,
          createdAt: new Date(),
        })
        .returning();

      if (withTestData) {
        await testDb.insert(schema.fairteilerCategory).values([
          {
            fairteilerId: fairteiler[0].id,
            categoryId: '803e0b43-6bd7-4b7d-9a49-8d5316b2cf9c',
          },
          {
            fairteilerId: fairteiler[0].id,
            categoryId: 'f5ae71f7-e8a2-4867-9bb9-e146460d6e45',
          },
          {
            fairteilerId: fairteiler[0].id,
            categoryId: '71b61524-4332-4e71-94b5-ceca7a92df1b',
          },
        ]);
        await testDb.insert(schema.fairteilerOrigin).values([
          {
            fairteilerId: fairteiler[0].id,
            originId: '1db6c487-6c91-4d1a-b41a-6628be30c72c',
          },
          {
            fairteilerId: fairteiler[0].id,
            originId: 'dade7265-e5c9-4c85-8ec0-2cc2854ca67b',
          },
          {
            fairteilerId: fairteiler[0].id,
            originId: 'dea63001-bc5e-4af8-8ff6-9b7919c234fd',
          },
        ]);
        await testDb.insert(schema.fairteilerCompany).values([
          {
            fairteilerId: fairteiler[0].id,
            companyId: '97979131-c498-4722-8527-fb6f21dc7aa8',
          },
          {
            fairteilerId: fairteiler[0].id,
            companyId: 'e53be2f4-8a98-4022-bc6b-f48c5d490585',
          },
        ]);
      }

      return fairteiler[0];
    } catch (error) {
      console.error('Create test fairteiler failed:', error);
      throw error;
    }
  },

  async removeTestFairteilerByFairteilerSlug(fairteilerSlug: string) {
    console.log('cypress: attempting to remove test fairteiler');

    try {
      const result = await testDb
        .delete(schema.fairteiler)
        .where(eq(schema.fairteiler.slug, fairteilerSlug))
        .returning();
      return result;
    } catch (error) {
      console.error('Exception during fairteiler removal:', error);
      throw error;
    }
  },

  async addUserToFairteiler({
    userId,
    fairteilerId,
    role = 'member',
  }: {
    userId: string;
    fairteilerId: string;
    role?: string;
  }) {
    try {
      const member = await testDb
        .insert(schema.member)
        .values({
          id: `member-${Date.now()}`,
          organizationId: fairteilerId,
          userId: userId,
          role: role as MemberRoles,
          createdAt: new Date(),
        })
        .returning();

      return member[0];
    } catch (error) {
      console.error('Add user to fairteiler failed:', error);
      throw error;
    }
  },

  async getUserByEmail(email: string) {
    try {
      const user = await testDb.query.user.findFirst({
        where: eq(schema.user.email, email),
      });

      return user || null;
    } catch (error) {
      console.error('Get user by email failed:', error);
      throw error;
    }
  },

  async getSessionByUserId(userId: string) {
    try {
      const session = await testDb.query.session.findFirst({
        where: eq(schema.session.userId, userId),
      });

      return session || null;
    } catch (error) {
      console.error('Get session by user ID failed:', error);
      throw error;
    }
  },

  async createTestSession(userId: string) {
    try {
      const session = await testDb
        .insert(schema.session)
        .values({
          id: `session-${Date.now()}`,
          userId: userId,
          token: `token-${Date.now()}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return session[0];
    } catch (error) {
      console.error('Create test session failed:', error);
      throw error;
    }
  },

  async seedBasicTestData() {
    try {
      // Create test categories
      const categories = await testDb
        .insert(schema.category)
        .values([
          {
            id: '803e0b43-6bd7-4b7d-9a49-8d5316b2cf9c',
            name: 'Obst',
            description: 'Fresh fruits and vegetables',
            status: 'active',
          },
          {
            id: 'f5ae71f7-e8a2-4867-9bb9-e146460d6e45',
            name: 'Backwaren',
            description: 'Bread and baked goods',
            status: 'active',
          },
          {
            id: '71b61524-4332-4e71-94b5-ceca7a92df1b',
            name: 'Milchprodukte',
            description: 'Dairy products',
            status: 'active',
          },
        ])
        .returning();

      // Create test origins
      const origins = await testDb
        .insert(schema.origin)
        .values([
          {
            id: '1db6c487-6c91-4d1a-b41a-6628be30c72c',
            name: 'Supermarkt',
            description: 'Supermarket',
            status: 'active',
          },
          {
            id: 'dade7265-e5c9-4c85-8ec0-2cc2854ca67b',
            name: 'Bäckerei',
            description: 'Bakery',
            status: 'active',
          },
          {
            id: 'dea63001-bc5e-4af8-8ff6-9b7919c234fd',
            name: 'Privat',
            description: 'Private',
            status: 'active',
          },
        ])
        .returning();

      // Create test companies
      const companies = await testDb
        .insert(schema.company)
        .values([
          {
            id: '97979131-c498-4722-8527-fb6f21dc7aa8',
            name: 'REWE',
            description: 'REWE Supermarket',
            status: 'active',
            originId: origins[0].id,
          },
          {
            id: 'e53be2f4-8a98-4022-bc6b-f48c5d490585',
            name: 'Edeka',
            description: 'Edeka Supermarket',
            status: 'active',
            originId: origins[0].id,
          },
        ])
        .returning();

      return {
        categories,
        origins,
        companies,
      };
    } catch (error) {
      console.error('Seed basic test data failed:', error);
      throw error;
    }
  },

  async createTestInvitation(invitationData: {
    id: string;
    email: string;
    organizationId: string;
    role: string;
    inviterId: string;
  }) {
    try {
      const invitation = await testDb
        .insert(schema.invitation)
        .values({
          id: invitationData.id,
          email: invitationData.email,
          organizationId: invitationData.organizationId,
          role: invitationData.role,
          status: 'pending',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          inviterId: invitationData.inviterId,
        })
        .returning();

      return invitation[0];
    } catch (error) {
      console.error('Create test invitation failed:', error);
      throw error;
    }
  },

  async getMemberByUserId(userId: string) {
    try {
      const member = await testDb.query.member.findFirst({
        where: eq(schema.member.userId, userId),
      });

      return member || null;
    } catch (error) {
      console.error('Get member by user ID failed:', error);
      throw error;
    }
  },

  async banUser(userId: string) {
    try {
      const user = await testDb
        .update(schema.user)
        .set({
          banned: true,
          banReason: 'Test ban',
          banExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        })
        .where(eq(schema.user.id, userId))
        .returning();

      return user[0];
    } catch (error) {
      console.error('Ban user failed:', error);
      throw error;
    }
  },

  async createResetToken(resetTokenData: { userId: string; token: string }) {
    try {
      const verification = await testDb
        .insert(schema.verification)
        .values({
          id: `verification-${Date.now()}`,
          identifier: `reset-password:${resetTokenData.token}`,
          value: resetTokenData.userId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      console.log('VERIFICATION', verification);
      return verification[0];
    } catch (error) {
      console.error('Create reset token failed:', error);
      throw error;
    }
  },

  async createExpiredResetToken(tokenData: { email: string; token: string }) {
    try {
      const verification = await testDb
        .insert(schema.verification)
        .values({
          id: `verification-${Date.now()}`,
          identifier: tokenData.email,
          value: tokenData.token,
          expiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago (expired)
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return verification[0];
    } catch (error) {
      console.error('Create expired reset token failed:', error);
      throw error;
    }
  },

  async getFairteilerById(fairteilerId: string) {
    try {
      const fairteiler = await testDb.query.fairteiler.findFirst({
        where: eq(schema.fairteiler.id, fairteilerId),
      });

      return fairteiler || null;
    } catch (error) {
      console.error('Get fairteiler by ID failed:', error);
      throw error;
    }
  },
};
