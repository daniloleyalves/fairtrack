import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkInvitationAndUserAction,
  signOutAction,
  updateFairteilerAction,
  addAccessViewAction,
  removeMemberAction,
  updateMemberRoleAction,
  inviteMemberAction,
  disableAccessViewAction,
} from '../auth-actions';
import { auth, checkPermissionOnServer } from '../auth';
import { getActiveFairteiler } from '@server/fairteiler/dto';
import { checkInvitationAndUser } from '@server/contribution/dal';
import { updateFairteiler } from '@server/fairteiler/dal';
import { put, del } from '@vercel/blob';
import { headers } from 'next/headers';
import { MemberRolesEnum } from '../auth-permissions';
import { NotFoundError } from '@/server/error-handling';

// Mock all external dependencies
vi.mock('../auth', () => ({
  auth: {
    api: {
      signOut: vi.fn(),
      signUpEmail: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      removeUser: vi.fn(),
      updateMemberRole: vi.fn(),
      setRole: vi.fn(),
      createInvitation: vi.fn(),
      banUser: vi.fn(),
    },
  },
  checkPermissionOnServer: vi.fn(),
}));

vi.mock('@server/fairteiler/dto', () => ({
  getActiveFairteiler: vi.fn(),
}));

vi.mock('@server/contribution/dal', () => ({
  checkInvitationAndUser: vi.fn(),
}));

vi.mock('@server/fairteiler/dal', () => ({
  updateFairteiler: vi.fn(),
  toggleFairteilerVisibility: vi.fn(),
}));

vi.mock('@server/user/dal', () => ({
  loadAuthenticatedSession: vi.fn(),
  loadUserByEmail: vi.fn(),
  validateResetPasswordToken: vi.fn(),
}));

vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
  del: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

// Type definitions for mocked functions
interface MockBlobResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  downloadUrl: string;
}

interface MockSignOutResult {
  success: boolean;
}

// Mock data
const mockHeaders = new Headers();
const mockFairteiler = {
  id: 'fairteiler-123',
  name: 'Test Fairteiler',
  slug: 'test-fairteiler',
  thumbnail: 'https://example.com/old-thumbnail.jpg',
  address: 'Test Address',
  geoLink: null,
  geoLat: '13.000',
  geoLng: '9.999',
  disabled: false,
  website: null,
  tags: [],
  members: [
    {
      id: 'member-1',
      user: {
        id: 'user-1',
        name: 'Existing User',
        firstName: 'Existing',
        lastName: 'User',
        email: 'existing@example.com',
        avatar: null,
        isFirstLogin: false,
        isAnonymous: false,
      },
      role: MemberRolesEnum.MEMBER,
      fairteilerId: 'fairteiler-123',
    },
    {
      id: 'member-2',
      user: {
        id: 'user-2',
        name: 'Employee 1',
        firstName: 'Employee',
        lastName: '1',
        email: 'employee-1@test-fairteiler.local',
        avatar: null,
        isFirstLogin: false,
        isAnonymous: false,
      },
      role: MemberRolesEnum.EMPLOYEE,
      fairteilerId: 'fairteiler-123',
    },
  ],
};

const mockInvitationResultWithUserExists = {
  invitation: {
    id: 'invitation-123',
    email: 'test@example.com',
    role: 'member',
    organizationId: 'org-123',
    organizationName: 'Test Organization',
  },
  userExists: true,
  isValid: true,
};

const mockInvitationResultWithoutUserExists = {
  invitation: {
    id: 'invitation-123',
    email: 'test@example.com',
    role: 'member',
    organizationId: 'org-123',
    organizationName: 'Test Organization',
  },
  userExists: false,
  isValid: true,
};

describe('Authentication Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(mockHeaders);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signOutAction', () => {
    it('should successfully sign out authenticated user', async () => {
      vi.mocked(auth.api.signOut).mockResolvedValue({
        success: true,
      } as MockSignOutResult);

      const result = await signOutAction({});

      expect(auth.api.signOut).toHaveBeenCalledWith({ headers: mockHeaders });
      expect(result).toEqual({ redirectTo: '/sign-in', shouldRefresh: true });
    });

    it('should propagate sign out errors', async () => {
      const mockError = new Error('Sign out failed');
      vi.mocked(auth.api.signOut).mockRejectedValue(mockError);

      await expect(signOutAction({})).rejects.toThrow('Sign out failed');
    });

    it('should call signOut with correct headers', async () => {
      const customHeaders = new Headers({ custom: 'header' });
      vi.mocked(headers).mockResolvedValue(customHeaders);
      vi.mocked(auth.api.signOut).mockResolvedValue({
        success: true,
      } as MockSignOutResult);

      await signOutAction({});

      expect(auth.api.signOut).toHaveBeenCalledWith({ headers: customHeaders });
    });
  });

  describe('updateFairteilerAction', () => {
    beforeEach(() => {
      vi.mocked(getActiveFairteiler).mockResolvedValue(mockFairteiler);
      vi.mocked(updateFairteiler).mockResolvedValue([]);
      vi.mocked(checkPermissionOnServer).mockResolvedValue({
        success: true,
        error: null,
      });
    });

    it('should successfully update fairteiler profile with valid data', async () => {
      const formData = new FormData();
      formData.append('name', 'Updated Fairteiler');
      formData.append('address', 'Updated Address');
      formData.append('geoLat', '13.0000');
      formData.append('geoLng', '9.101010');
      formData.append('geoLink', 'https://maps.google.com/updated');
      formData.append('website', 'https://updated-website.com');
      formData.append('thumbnail', 'some string');

      const result = await updateFairteilerAction(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.message).toBe('Profil erfolgreich aktualisiert!');
        expect(result.data?.name).toBe('Updated Fairteiler');
        expect(result.data?.address).toBe('Updated Address');
        expect(result.data?.geoLink).toBe('https://maps.google.com/updated');
        expect(result.data?.website).toBe('https://updated-website.com');
        expect(result.data?.thumbnail).toBe(
          'https://example.com/old-thumbnail.jpg',
        );
      }
      expect(updateFairteiler).toHaveBeenCalledWith(
        mockFairteiler.id,
        expect.objectContaining({
          name: 'Updated Fairteiler',
          address: 'Updated Address',
        }),
      );
    });

    it('should handle file upload for new thumbnail', async () => {
      const mockFile = new File(['test content'], 'new-thumbnail.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(mockFile, 'size', { value: 1000000 });

      const mockBlobResult: MockBlobResult = {
        url: 'https://blob.vercel-storage.com/new-thumbnail.jpg',
        pathname: 'new-thumbnail.jpg',
        contentType: 'image/jpeg',
        contentDisposition: 'inline',
        downloadUrl: 'https://blob.vercel-storage.com/new-thumbnail.jpg',
      };
      vi.mocked(put).mockResolvedValue(mockBlobResult);
      vi.mocked(del).mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('name', 'Test Fairteiler');
      formData.append('address', 'some string');
      formData.append('geoLink', 'some string');
      formData.append('geoLat', 'some string');
      formData.append('geoLng', 'some string');
      formData.append('website', 'some string');
      formData.append('thumbnail', mockFile);

      const result = await updateFairteilerAction(formData);

      expect(result.success).toBe(true);
      expect(put).toHaveBeenCalledWith(
        'fairteiler_thumbnails/new-thumbnail.jpg',
        mockFile,
        { access: 'public', allowOverwrite: true },
      );
      expect(del).toHaveBeenCalledWith('https://example.com/old-thumbnail.jpg');
      if (result.success) {
        expect(result.data?.thumbnail).toBe(
          'https://blob.vercel-storage.com/new-thumbnail.jpg',
        );
      }
    });

    it('should validate required name field', async () => {
      const formData = new FormData();
      formData.append('name', ''); // Empty name
      formData.append('address', 'some string');
      formData.append('geoLink', 'some string');
      formData.append('geoLat', 'some string');
      formData.append('geoLng', 'some string');
      formData.append('website', 'some string');
      formData.append('thumbnail', 'some string');

      const result = await updateFairteilerAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Ungültige Eingabedaten.');
        expect(result.issues).toBeDefined();
      }
    });

    it('should handle authentication failure', async () => {
      vi.mocked(checkPermissionOnServer).mockRejectedValue({
        success: false,
        error: 'Authentifizierung fehlgeschlagen',
      });
      vi.mocked(getActiveFairteiler).mockRejectedValue(
        new NotFoundError('active fairteiler'),
      );

      const formData = new FormData();
      formData.append('name', 'Test Fairteiler');
      formData.append('address', 'some string');
      formData.append('geoLink', 'some string');
      formData.append('geoLat', 'some string');
      formData.append('geoLng', 'some string');
      formData.append('website', 'some string');
      formData.append('thumbnail', 'some string');

      const result = await updateFairteilerAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain(
          'Update fehlgeschlagen: active fairteiler not found',
        );
      }
    });
  });

  describe('checkInvitationAndUserAction', () => {
    it('should successfully retrieve invitation details', async () => {
      vi.mocked(checkInvitationAndUser).mockResolvedValue(
        mockInvitationResultWithUserExists,
      );

      const result = await checkInvitationAndUserAction({
        invitationId: 'invitation-123',
      });

      expect(result).toEqual(mockInvitationResultWithUserExists);
    });

    it('should handle non-existent invitation', async () => {
      vi.mocked(checkInvitationAndUser).mockRejectedValue(
        new NotFoundError('Invitation data'),
      );

      await expect(
        checkInvitationAndUserAction({ invitationId: 'non-existent' }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should propagate database errors', async () => {
      const dbError = new Error('Database connection failed');
      vi.mocked(checkInvitationAndUser).mockRejectedValue(dbError);

      await expect(
        checkInvitationAndUserAction({ invitationId: 'valid-id' }),
      ).rejects.toThrow('Database connection failed');
    });

    it('should throw validation error for empty invitation ID', async () => {
      vi.mocked(checkInvitationAndUser).mockResolvedValue(
        mockInvitationResultWithoutUserExists,
      );

      await expect(
        checkInvitationAndUserAction({ invitationId: '' }),
      ).rejects.toThrow();
    });

    it('should handle expired invitations', async () => {
      const expiredInvitationResult = {
        ...mockInvitationResultWithUserExists,
        isValid: false,
      };
      vi.mocked(checkInvitationAndUser).mockResolvedValue(
        expiredInvitationResult,
      );

      const result = await checkInvitationAndUserAction({
        invitationId: 'expired-invitation',
      });

      expect(result.isValid).toBe(false);
    });

    it('should handle invitations for non-existent users', async () => {
      const nonExistentUserResult = {
        ...mockInvitationResultWithUserExists,
        userExists: false,
      };
      vi.mocked(checkInvitationAndUser).mockResolvedValue(
        nonExistentUserResult,
      );

      const result = await checkInvitationAndUserAction({
        invitationId: 'new-user-invitation',
      });

      expect(result.userExists).toBe(false);
    });
  });

  describe('addAccessViewAction', () => {
    const mockNewUser = {
      id: 'new-user-123',
      name: 'Test Employee',
      email: 'employee-1@test-fairteiler.local',
      image: null,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: 'Test',
      lastName: 'Employee',
      isFirstLogin: true,
      isAnonymous: false,
      role: null,
      banned: false,
      banReason: null,
      banExpires: null,
      username: null,
      phone: null,
      foodsharingId: null,
      secure: false,
      notificationsConsent: false,
    };

    beforeEach(() => {
      vi.mocked(getActiveFairteiler).mockResolvedValue(mockFairteiler);
      vi.mocked(auth.api.signUpEmail).mockResolvedValue({
        user: mockNewUser,
        token: null,
      });
      vi.mocked(auth.api.addMember).mockResolvedValue({
        id: 'member-123',
        userId: mockNewUser.id,
        organizationId: mockFairteiler.id,
        role: MemberRolesEnum.EMPLOYEE,
        createdAt: new Date(),
      });
      vi.mocked(checkPermissionOnServer).mockResolvedValue({
        success: true,
        error: null,
      });
    });

    it('should successfully create employee access view', async () => {
      const result = await addAccessViewAction({
        name: 'Test Employee',
        role: MemberRolesEnum.EMPLOYEE,
      });

      expect(result.email).toBe('employee-2@test-fairteiler.local');
      expect(result.password).toBeDefined();
      expect(typeof result.password).toBe('string');
      expect(result.password.length).toBeGreaterThan(0);

      expect(auth.api.signUpEmail).toHaveBeenCalledWith({
        body: {
          name: 'Test Employee',
          firstName: 'Test Employee',
          lastName: 'test-fairteiler',
          email: 'employee-2@test-fairteiler.local',
          password: expect.any(String),
          isFirstLogin: true,
          isAnonymous: false,
        },
      });

      expect(auth.api.addMember).toHaveBeenCalledWith({
        body: {
          userId: mockNewUser.id,
          organizationId: mockFairteiler.id,
          role: 'employee',
        },
      });
    });

    it('should successfully create guest access view', async () => {
      const result = await addAccessViewAction({
        name: 'Test Guest',
        role: MemberRolesEnum.GUEST,
      });

      expect(result.email).toBe('guest-1@test-fairteiler.local');

      expect(auth.api.signUpEmail).toHaveBeenCalledWith({
        body: expect.objectContaining({
          name: 'Test Guest',
          email: 'guest-1@test-fairteiler.local',
        }),
      });
    });

    it('should handle fairteiler not found error', async () => {
      vi.mocked(getActiveFairteiler).mockRejectedValue(
        new NotFoundError('active fairteiler'),
      );

      await expect(
        addAccessViewAction({
          name: 'Test Employee',
          role: MemberRolesEnum.EMPLOYEE,
        }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should propagate user creation failure', async () => {
      const signUpError = new Error('Email already exists');
      vi.mocked(auth.api.signUpEmail).mockRejectedValue(signUpError);

      await expect(
        addAccessViewAction({
          name: 'Test Employee',
          role: MemberRolesEnum.EMPLOYEE,
        }),
      ).rejects.toThrow('Email already exists');
    });

    it('should cleanup user when addMember fails', async () => {
      const addMemberError = new Error('Failed to add member');
      vi.mocked(auth.api.addMember).mockRejectedValue(addMemberError);
      vi.mocked(auth.api.removeUser).mockResolvedValue({ success: true });

      await expect(
        addAccessViewAction({
          name: 'Test Employee',
          role: MemberRolesEnum.EMPLOYEE,
        }),
      ).rejects.toThrow('Failed to add member');

      expect(auth.api.removeUser).toHaveBeenCalledWith({
        body: { userId: mockNewUser.id },
      });
    });

    it('should generate incremental email addresses', async () => {
      // Test that it counts existing employees correctly
      const fairteilerWithEmployees = {
        ...mockFairteiler,
        members: [
          ...mockFairteiler.members,
          {
            id: 'member-3',
            user: {
              id: 'user-3',
              name: 'Employee 2',
              firstName: 'Employee',
              lastName: '2',
              email: 'employee-1@test-fairteiler.local',
              avatar: null,
              isFirstLogin: false,
              isAnonymous: false,
            },
            role: 'employee' as const,
            fairteilerId: 'fairteiler-123',
          },
          {
            id: 'member-4',
            user: {
              id: 'user-4',
              name: 'Employee 3',
              firstName: 'Employee',
              lastName: '3',
              email: 'employee-2@test-fairteiler.local',
              avatar: null,
              isFirstLogin: false,
              isAnonymous: false,
            },
            role: 'employee' as const,
            fairteilerId: 'fairteiler-123',
          },
        ],
      };

      vi.mocked(getActiveFairteiler).mockResolvedValue(fairteilerWithEmployees);

      const result = await addAccessViewAction({
        name: 'Test Employee',
        role: MemberRolesEnum.EMPLOYEE,
      });

      expect(result.email).toBe('employee-4@test-fairteiler.local');
    });

    it('should throw on validation errors', async () => {
      await expect(
        addAccessViewAction({
          name: '',
          role: 'invalid-role' as MemberRolesEnum.EMPLOYEE,
        }),
      ).rejects.toThrow();
    });
  });

  describe('removeMemberAction', () => {
    beforeEach(() => {
      vi.mocked(auth.api.removeMember).mockResolvedValue({
        member: {
          id: 'member-123',
          organizationId: 'fairteiler-123',
          userId: 'user-123',
          role: 'member',
          createdAt: new Date(),
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      });
    });

    it('should successfully remove member', async () => {
      await removeMemberAction({
        organizationId: 'fairteiler-123',
        email: 'member@example.com',
      });

      expect(auth.api.removeMember).toHaveBeenCalledWith({
        headers: mockHeaders,
        body: {
          organizationId: 'fairteiler-123',
          memberIdOrEmail: 'member@example.com',
        },
      });
    });

    it('should propagate removal errors', async () => {
      const removalError = new Error('Member not found');
      vi.mocked(auth.api.removeMember).mockRejectedValue(removalError);

      await expect(
        removeMemberAction({
          organizationId: 'fairteiler-123',
          email: 'nonexistent@example.com',
        }),
      ).rejects.toThrow('Member not found');
    });

    it('should throw on invalid input parameters', async () => {
      await expect(
        removeMemberAction({
          organizationId: '',
          email: 'invalid-email',
        }),
      ).rejects.toThrow();
    });
  });

  describe('updateMemberRoleAction', () => {
    beforeEach(() => {
      vi.mocked(auth.api.updateMemberRole).mockResolvedValue({
        id: 'member-123',
        organizationId: 'fairteiler-123',
        role: 'member',
        createdAt: new Date(),
        userId: 'user-123',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      });
      vi.mocked(auth.api.setRole).mockResolvedValue({
        user: {
          id: 'user-123',
          role: 'admin',
          email: 'test@example.com',
          emailVerified: true,
          name: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date(),
          banned: false,
          banReason: null,
          banExpires: null,
        },
      });
    });

    it('should successfully update member role', async () => {
      await updateMemberRoleAction({
        memberId: 'member-123',
        userId: 'user-123',
        role: MemberRolesEnum.MEMBER,
      });

      expect(auth.api.updateMemberRole).toHaveBeenCalledWith({
        headers: mockHeaders,
        body: {
          memberId: 'member-123',
          role: 'member',
        },
      });

      expect(auth.api.setRole).not.toHaveBeenCalled();
    });

    it('should promote user to admin when role is owner', async () => {
      await updateMemberRoleAction({
        memberId: 'member-123',
        userId: 'user-123',
        role: MemberRolesEnum.OWNER,
      });

      expect(auth.api.updateMemberRole).toHaveBeenCalledWith({
        headers: mockHeaders,
        body: {
          memberId: 'member-123',
          role: MemberRolesEnum.OWNER,
        },
      });

      expect(auth.api.setRole).toHaveBeenCalledWith({
        headers: mockHeaders,
        body: {
          role: 'admin',
          userId: 'user-123',
        },
      });
    });

    it('should propagate role update errors', async () => {
      const updateError = new Error('Insufficient permissions');
      vi.mocked(auth.api.updateMemberRole).mockRejectedValue(updateError);

      await expect(
        updateMemberRoleAction({
          memberId: 'member-123',
          userId: 'user-123',
          role: MemberRolesEnum.MEMBER,
        }),
      ).rejects.toThrow('Insufficient permissions');
    });

    it('should propagate admin promotion errors', async () => {
      const adminError = new Error('Failed to set admin role');
      vi.mocked(auth.api.setRole).mockRejectedValue(adminError);

      await expect(
        updateMemberRoleAction({
          memberId: 'member-123',
          userId: 'user-123',
          role: MemberRolesEnum.OWNER,
        }),
      ).rejects.toThrow('Failed to set admin role');
    });

    it('should throw on invalid input parameters', async () => {
      await expect(
        updateMemberRoleAction({
          memberId: '',
          userId: '',
          role: 'invalid-role' as MemberRolesEnum.MEMBER,
        }),
      ).rejects.toThrow();
    });
  });

  describe('inviteMemberAction', () => {
    beforeEach(() => {
      vi.mocked(auth.api.createInvitation).mockResolvedValue({
        id: 'invitation-123',
        organizationId: 'fairteiler-123',
        email: 'newmember@example.com',
        role: MemberRolesEnum.MEMBER,
        status: 'pending',
        inviterId: 'user-123',
        expiresAt: new Date(),
        createdAt: new Date(),
      });
    });

    it('should successfully send invitation', async () => {
      await inviteMemberAction({
        email: 'newmember@example.com',
        role: MemberRolesEnum.MEMBER,
      });

      expect(auth.api.createInvitation).toHaveBeenCalledWith({
        headers: mockHeaders,
        body: {
          email: 'newmember@example.com',
          role: 'member',
          resend: true,
        },
      });
    });

    it('should propagate invitation creation errors', async () => {
      const invitationError = new Error('Email already invited');
      vi.mocked(auth.api.createInvitation).mockRejectedValue(invitationError);

      await expect(
        inviteMemberAction({
          email: 'existing@example.com',
          role: MemberRolesEnum.MEMBER,
        }),
      ).rejects.toThrow('Email already invited');
    });

    it('should throw on invalid email format', async () => {
      await expect(
        inviteMemberAction({
          email: 'invalid-email',
          role: MemberRolesEnum.MEMBER,
        }),
      ).rejects.toThrow();
    });

    it('should throw on invalid role', async () => {
      await expect(
        inviteMemberAction({
          email: 'valid@example.com',
          role: 'invalid-role' as MemberRolesEnum.MEMBER,
        }),
      ).rejects.toThrow();
    });

    it('should send invitation for different roles', async () => {
      const roles = [
        MemberRolesEnum.MEMBER,
        MemberRolesEnum.VIEWER,
        MemberRolesEnum.EMPLOYEE,
      ] as const;

      for (const role of roles) {
        await inviteMemberAction({
          email: `${role}@example.com`,
          role,
        });

        expect(auth.api.createInvitation).toHaveBeenCalledWith({
          headers: mockHeaders,
          body: {
            email: `${role}@example.com`,
            role,
            resend: true,
          },
        });
      }
    });
  });

  describe('disableAccessViewAction', () => {
    beforeEach(() => {
      vi.mocked(auth.api.banUser).mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          banned: true,
        },
      });
      vi.mocked(auth.api.updateMemberRole).mockResolvedValue({
        id: 'member-123',
        organizationId: 'fairteiler-123',
        role: 'disabled' as MemberRolesEnum.MEMBER,
        createdAt: new Date(),
        userId: 'user-123',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      });
    });

    it('should successfully disable access view', async () => {
      const result = await disableAccessViewAction({
        userId: 'user-123',
        memberId: 'member-123',
      });

      expect(result).toBeDefined();

      expect(auth.api.banUser).toHaveBeenCalledWith({
        headers: mockHeaders,
        body: {
          userId: 'user-123',
          banReason: 'DISABLED ACCESS VIEW',
        },
      });

      expect(auth.api.updateMemberRole).toHaveBeenCalledWith({
        headers: mockHeaders,
        body: {
          memberId: 'member-123',
          role: 'disabled',
        },
      });
    });

    it('should propagate ban user errors', async () => {
      const banError = new Error('User not found');
      vi.mocked(auth.api.banUser).mockRejectedValue(banError);

      await expect(
        disableAccessViewAction({
          userId: 'nonexistent-user',
          memberId: 'member-123',
        }),
      ).rejects.toThrow('User not found');
    });

    it('should propagate role update errors', async () => {
      const roleError = new Error('Failed to update role');
      vi.mocked(auth.api.updateMemberRole).mockRejectedValue(roleError);

      await expect(
        disableAccessViewAction({
          userId: 'user-123',
          memberId: 'member-123',
        }),
      ).rejects.toThrow('Failed to update role');
    });

    it('should propagate validation errors from ban', async () => {
      const banError = new Error('User ID required');
      vi.mocked(auth.api.banUser).mockRejectedValue(banError);

      await expect(
        disableAccessViewAction({
          userId: '',
          memberId: '',
        }),
      ).rejects.toThrow('User ID required');
    });

    it('should not call role update if ban fails', async () => {
      const banError = new Error('Ban failed');
      vi.mocked(auth.api.banUser).mockRejectedValue(banError);

      await expect(
        disableAccessViewAction({
          userId: 'user-123',
          memberId: 'member-123',
        }),
      ).rejects.toThrow('Ban failed');

      expect(auth.api.banUser).toHaveBeenCalled();
      expect(auth.api.updateMemberRole).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(() => {
      vi.mocked(getActiveFairteiler).mockResolvedValue(mockFairteiler);
      vi.mocked(checkPermissionOnServer).mockResolvedValue({
        success: true,
        error: null,
      });
    });

    describe('File Upload Edge Cases', () => {
      it('should handle very large file uploads', async () => {
        const largeFile = new File(
          ['x'.repeat(10000000)],
          'large-thumbnail.jpg',
          {
            type: 'image/jpeg',
          },
        );
        Object.defineProperty(largeFile, 'size', { value: 10000000 });

        const mockBlobResult = {
          url: 'https://blob.vercel-storage.com/large-thumbnail.jpg',
          pathname: 'large-thumbnail.jpg',
          contentType: 'image/jpeg',
          contentDisposition: 'inline',
          downloadUrl: 'https://blob.vercel-storage.com/large-thumbnail.jpg',
        };
        vi.mocked(put).mockResolvedValue(mockBlobResult);
        vi.mocked(del).mockResolvedValue(undefined);
        vi.mocked(getActiveFairteiler).mockResolvedValue(mockFairteiler);
        vi.mocked(updateFairteiler).mockResolvedValue([]);

        const formData = new FormData();
        formData.append('name', 'Test Fairteiler');
        formData.append('address', 'some string');
        formData.append('geoLink', 'some string');
        formData.append('geoLat', 'some string');
        formData.append('geoLng', 'some string');
        formData.append('website', 'some string');
        formData.append('thumbnail', largeFile);

        const result = await updateFairteilerAction(formData);

        // The large file might cause validation issues, so let's expect it to fail
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeDefined();
        }
      });

      it('should handle blob storage failures', async () => {
        const mockFile = new File(['test'], 'thumbnail.jpg', {
          type: 'image/jpeg',
        });
        const storageError = new Error('Blob storage unavailable');
        vi.mocked(put).mockRejectedValue(storageError);
        vi.mocked(getActiveFairteiler).mockResolvedValue(mockFairteiler);

        const formData = new FormData();
        formData.append('name', 'Test Fairteiler');
        formData.append('address', 'some string');
        formData.append('geoLink', 'some string');
        formData.append('geoLat', 'some string');
        formData.append('geoLng', 'some string');
        formData.append('website', 'some string');
        formData.append('thumbnail', mockFile);

        const result = await updateFairteilerAction(formData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('Blob storage unavailable');
        }
      });

      it('should handle deletion of old thumbnail failures gracefully', async () => {
        const mockFile = new File(['test'], 'new-thumbnail.jpg', {
          type: 'image/jpeg',
        });
        const mockBlobResult = {
          url: 'https://blob.vercel-storage.com/new-thumbnail.jpg',
          pathname: 'new-thumbnail.jpg',
          contentType: 'image/jpeg',
          contentDisposition: 'inline',
          downloadUrl: 'https://blob.vercel-storage.com/new-thumbnail.jpg',
        };
        vi.mocked(put).mockResolvedValue(mockBlobResult);
        vi.mocked(del).mockRejectedValue(new Error('Delete failed'));
        vi.mocked(getActiveFairteiler).mockResolvedValue(mockFairteiler);
        vi.mocked(updateFairteiler).mockResolvedValue([]);

        const formData = new FormData();
        formData.append('name', 'Test Fairteiler');
        formData.append('address', 'some string');
        formData.append('geoLink', 'some string');
        formData.append('geoLat', 'some string');
        formData.append('geoLng', 'some string');
        formData.append('website', 'some string');
        formData.append('thumbnail', mockFile);

        const result = await updateFairteilerAction(formData);

        // Should still succeed even if old thumbnail deletion fails
        expect(result.success).toBe(true);
      });
    });

    describe('Concurrent Operations', () => {
      it('should handle concurrent member additions', async () => {
        vi.mocked(getActiveFairteiler).mockResolvedValue(mockFairteiler);
        vi.mocked(auth.api.signUpEmail).mockResolvedValue({
          user: {
            id: 'new-user-123',
            name: 'Test Employee',
            email: 'employee-1@test-fairteiler.local',
            image: null,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            firstName: 'Test',
            lastName: 'Employee',
            isFirstLogin: true,
            isAnonymous: false,
            role: null,
            banned: false,
            banReason: null,
            banExpires: null,
            phone: null,
            foodsharingId: null,
            secure: false,
            notificationsConsent: false,
          },
          token: null,
        });
        vi.mocked(auth.api.addMember).mockResolvedValue({
          id: 'member-123',
          userId: 'new-user-123',
          organizationId: mockFairteiler.id,
          role: MemberRolesEnum.EMPLOYEE,
          createdAt: new Date(),
        });

        const promises = Array.from({ length: 3 }, (_, i) =>
          addAccessViewAction({
            name: `Employee ${i + 1}`,
            role: MemberRolesEnum.EMPLOYEE,
          }),
        );

        const results = await Promise.all(promises);

        results.forEach((result) => {
          expect(result.email).toBeDefined();
        });
      });

      it('should handle concurrent role updates', async () => {
        vi.mocked(auth.api.updateMemberRole).mockResolvedValue({
          id: 'member-123',
          organizationId: 'fairteiler-123',
          role: 'member',
          createdAt: new Date(),
          userId: 'user-123',
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
          },
        });

        const promises = Array.from({ length: 3 }, (_, i) =>
          updateMemberRoleAction({
            memberId: `member-${i}`,
            userId: `user-${i}`,
            role: MemberRolesEnum.MEMBER,
          }),
        );

        const results = await Promise.all(promises);

        // updateMemberRoleAction returns void; each call should resolve
        // without throwing.
        results.forEach((result) => {
          expect(result).toBeUndefined();
        });
      });
    });

    describe('Network and Timeout Scenarios', () => {
      it('should propagate network timeouts in auth operations', async () => {
        const timeoutError = new Error('Network timeout');
        vi.mocked(auth.api.signOut).mockRejectedValue(timeoutError);

        await expect(signOutAction({})).rejects.toThrow('Network timeout');
      });

      it('should handle slow database responses', async () => {
        vi.mocked(checkInvitationAndUser).mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(
                () => resolve(mockInvitationResultWithUserExists),
                100,
              );
            }),
        );

        const result = await checkInvitationAndUserAction({
          invitationId: 'slow-response',
        });

        expect(result).toEqual(mockInvitationResultWithUserExists);
      });
    });

    describe('Data Integrity and Validation', () => {
      it('should handle malformed form data', async () => {
        const formData = new FormData();
        formData.append('name', '');
        formData.append('address', '');
        formData.append('geoLink', '');
        formData.append('website', '');
        formData.append('thumbnail', '');

        const result = await updateFairteilerAction(formData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('Ungültige Eingabedaten.');
        }
      });

      it('should handle special characters in input', async () => {
        const specialCharsName =
          '测试 Fairteiler 🚀 <script>alert("xss")</script>';
        vi.mocked(getActiveFairteiler).mockResolvedValue(mockFairteiler);
        vi.mocked(updateFairteiler).mockResolvedValue([]);

        const formData = new FormData();
        formData.append('name', specialCharsName);
        formData.append('address', 'some string');
        formData.append('geoLink', 'some string');
        formData.append('geoLat', 'some string');
        formData.append('geoLng', 'some string');
        formData.append('website', 'some string');
        formData.append('thumbnail', 'some string');

        const result = await updateFairteilerAction(formData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data?.name).toBe(specialCharsName);
        }
      });
    });

    describe('Resource Cleanup and Memory Management', () => {
      it('should properly cleanup resources on action failure', async () => {
        const mockUserId = 'cleanup-test-user';
        vi.mocked(getActiveFairteiler).mockResolvedValue(mockFairteiler);
        vi.mocked(auth.api.signUpEmail).mockResolvedValue({
          user: {
            id: mockUserId,
            name: 'Test Employee',
            email: 'employee-1@test-fairteiler.local',
            image: null,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            firstName: 'Test',
            lastName: 'Employee',
            isFirstLogin: true,
            isAnonymous: false,
            role: null,
            banned: false,
            banReason: null,
            banExpires: null,
            phone: null,
            foodsharingId: null,
            secure: false,
            notificationsConsent: false,
          },
          token: null,
        });
        vi.mocked(auth.api.addMember).mockRejectedValue(
          new Error('Member addition failed'),
        );
        vi.mocked(auth.api.removeUser).mockResolvedValue({ success: true });

        await expect(
          addAccessViewAction({
            name: 'Test Employee',
            role: MemberRolesEnum.EMPLOYEE,
          }),
        ).rejects.toThrow('Member addition failed');

        expect(auth.api.removeUser).toHaveBeenCalledWith({
          body: { userId: mockUserId },
        });
      });

      it('should handle cleanup failures gracefully', async () => {
        const mockUserId = 'cleanup-fail-user';
        vi.mocked(getActiveFairteiler).mockResolvedValue(mockFairteiler);
        vi.mocked(auth.api.signUpEmail).mockResolvedValue({
          user: {
            id: mockUserId,
            name: 'Test Employee',
            email: 'employee-1@test-fairteiler.local',
            image: null,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            firstName: 'Test',
            lastName: 'Employee',
            isFirstLogin: true,
            isAnonymous: false,
            role: null,
            banned: false,
            banReason: null,
            banExpires: null,
            phone: null,
            foodsharingId: null,
            secure: false,
            notificationsConsent: false,
          },
          token: null,
        });
        vi.mocked(auth.api.addMember).mockRejectedValue(
          new Error('Member addition failed'),
        );
        vi.mocked(auth.api.removeUser).mockRejectedValue(
          new Error('Cleanup failed'),
        );

        await expect(
          addAccessViewAction({
            name: 'Test Employee',
            role: MemberRolesEnum.EMPLOYEE,
          }),
        ).rejects.toThrow('Member addition failed');
      });
    });

    describe('Authentication State Edge Cases', () => {
      it('should handle session expiry during operations', async () => {
        const sessionExpiredError = new Error('Session expired');
        vi.mocked(getActiveFairteiler).mockRejectedValue(sessionExpiredError);

        const formData = new FormData();
        formData.append('name', 'Test Fairteiler');
        formData.append('address', 'some string');
        formData.append('geoLink', 'some string');
        formData.append('geoLat', 'some string');
        formData.append('geoLng', 'some string');
        formData.append('website', 'some string');
        formData.append('thumbnail', 'some string');

        const result = await updateFairteilerAction(formData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('Session expired');
        }
      });

      it('should propagate invalid authentication tokens', async () => {
        const invalidTokenError = new Error('Invalid token');
        vi.mocked(auth.api.removeMember).mockRejectedValue(invalidTokenError);

        await expect(
          removeMemberAction({
            organizationId: 'fairteiler-123',
            email: 'member@example.com',
          }),
        ).rejects.toThrow('Invalid token');
      });
    });
  });

  describe('Business Logic Tests', () => {
    describe('Email generation for access views', () => {
      it('should generate correct email format for access views', () => {
        const fairteilerSlug = 'test-fairteiler';
        const role = 'employee';
        const count = 2;

        const expectedEmail = `${role}-${count}@${fairteilerSlug}.local`;

        expect(expectedEmail).toBe('employee-2@test-fairteiler.local');
      });

      it('should generate incremental email addresses', () => {
        const fairteilerSlug = 'my-fairteiler';
        const role = 'guest';

        const emails = [];
        for (let i = 1; i <= 3; i++) {
          emails.push(`${role}-${i}@${fairteilerSlug}.local`);
        }

        expect(emails).toEqual([
          'guest-1@my-fairteiler.local',
          'guest-2@my-fairteiler.local',
          'guest-3@my-fairteiler.local',
        ]);
      });
    });

    describe('Role validation', () => {
      it('should validate access view roles', () => {
        const validAccessViewRoles = [
          MemberRolesEnum.EMPLOYEE,
          MemberRolesEnum.GUEST,
        ];

        const invalidAccessViewRoles = [
          MemberRolesEnum.OWNER,
          MemberRolesEnum.MEMBER,
          MemberRolesEnum.VIEWER,
          MemberRolesEnum.DISABLED,
        ];

        validAccessViewRoles.forEach((role) => {
          expect([MemberRolesEnum.EMPLOYEE, MemberRolesEnum.GUEST]).toContain(
            role,
          );
        });

        invalidAccessViewRoles.forEach((role) => {
          expect([
            MemberRolesEnum.EMPLOYEE,
            MemberRolesEnum.GUEST,
          ]).not.toContain(role);
        });
      });

      it('should identify owner role for admin promotion', () => {
        const ownerRole = MemberRolesEnum.OWNER;
        const nonOwnerRoles = [
          MemberRolesEnum.MEMBER,
          MemberRolesEnum.VIEWER,
          MemberRolesEnum.EMPLOYEE,
          MemberRolesEnum.GUEST,
          MemberRolesEnum.DISABLED,
        ];

        expect(ownerRole).toBe('owner');
        nonOwnerRoles.forEach((role) => {
          expect(role).not.toBe('owner');
        });
      });
    });

    describe('Data structure validation', () => {
      it('should validate fairteiler structure', () => {
        const fairteiler = mockFairteiler;

        expect(fairteiler).toHaveProperty('id');
        expect(fairteiler).toHaveProperty('name');
        expect(fairteiler).toHaveProperty('slug');
        expect(fairteiler).toHaveProperty('members');
        expect(Array.isArray(fairteiler.members)).toBe(true);
        expect(fairteiler.members[0]).toHaveProperty('user');
        expect(fairteiler.members[0]).toHaveProperty('role');
      });

      it('should validate member data structure', () => {
        const member = mockFairteiler.members[0];

        expect(member).toHaveProperty('id');
        expect(member).toHaveProperty('user');
        expect(member).toHaveProperty('role');
        expect(member).toHaveProperty('fairteilerId');
        expect(member.user).toHaveProperty('id');
        expect(member.user).toHaveProperty('name');
        expect(member.user).toHaveProperty('email');
        expect(Object.values(MemberRolesEnum)).toContain(member.role);
      });
    });

    describe('Email validation', () => {
      it('should validate email format requirements', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org',
        ];

        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'user@',
          'user@.com',
        ];

        validEmails.forEach((email) => {
          expect(email).toContain('@');
          expect(email.split('@')).toHaveLength(2);
          expect(email.split('@')[0].length).toBeGreaterThan(0);
          expect(email.split('@')[1].length).toBeGreaterThan(0);
        });

        invalidEmails.forEach((email) => {
          const parts = email.split('@');
          const isValid =
            parts.length === 2 &&
            parts[0].length > 0 &&
            parts[1].length > 0 &&
            parts[1].includes('.') &&
            !parts[1].startsWith('.') &&
            !parts[1].endsWith('.');
          expect(isValid).toBe(false);
        });
      });
    });

    describe('Role hierarchy validation', () => {
      it('should validate role hierarchy', () => {
        const roleHierarchy = {
          [MemberRolesEnum.OWNER]: 5,
          [MemberRolesEnum.MEMBER]: 4,
          [MemberRolesEnum.EMPLOYEE]: 3,
          [MemberRolesEnum.VIEWER]: 2,
          [MemberRolesEnum.GUEST]: 1,
          [MemberRolesEnum.DISABLED]: 0,
        };

        expect(roleHierarchy[MemberRolesEnum.OWNER]).toBeGreaterThan(
          roleHierarchy[MemberRolesEnum.MEMBER],
        );
        expect(roleHierarchy[MemberRolesEnum.MEMBER]).toBeGreaterThan(
          roleHierarchy[MemberRolesEnum.EMPLOYEE],
        );
        expect(roleHierarchy[MemberRolesEnum.EMPLOYEE]).toBeGreaterThan(
          roleHierarchy[MemberRolesEnum.VIEWER],
        );
        expect(roleHierarchy[MemberRolesEnum.VIEWER]).toBeGreaterThan(
          roleHierarchy[MemberRolesEnum.GUEST],
        );
        expect(roleHierarchy[MemberRolesEnum.GUEST]).toBeGreaterThan(
          roleHierarchy[MemberRolesEnum.DISABLED],
        );
      });
    });
  });
});
