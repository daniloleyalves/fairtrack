import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dismissAnnouncementAction } from '../actions';
import { getVisibleAnnouncements } from '../queries';
import { insertAnnouncementDismissal, loadVisibleAnnouncements } from '../dal';
import { loadAuthenticatedSession, loadSession } from '../../user/dal';
import { mockSession } from '@/__tests__/mocks/server-only';

vi.mock('../dal', () => ({
  loadVisibleAnnouncements: vi.fn(),
  insertAnnouncementDismissal: vi.fn(),
}));
vi.mock('../../user/dal', () => ({
  loadSession: vi.fn(),
  loadAuthenticatedSession: vi.fn(),
}));

const releaseAnnouncement = {
  id: 'release-1.2.0',
  title: 'Neu in FairTrack 1.2',
  message: 'Beiträge brauchen einen Nachweis vor Ort.',
  highlights: ['QR-Codes'],
  linkUrl: null,
  linkLabel: null,
};

describe('getVisibleAnnouncements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadSession).mockResolvedValue(mockSession);
  });

  it('loads the announcements visible to the signed-in user', async () => {
    vi.mocked(loadVisibleAnnouncements).mockResolvedValue([
      releaseAnnouncement,
      { ...releaseAnnouncement, id: 'other', highlights: null },
    ]);

    const result = await getVisibleAnnouncements('fairteiler');

    expect(loadVisibleAnnouncements).toHaveBeenCalledWith(
      'fairteiler',
      mockSession.user.id,
    );
    expect(result).toEqual([
      releaseAnnouncement,
      { ...releaseAnnouncement, id: 'other', highlights: [] },
    ]);
  });

  it('returns nothing without a session', async () => {
    vi.mocked(loadSession).mockResolvedValue(null);

    await expect(getVisibleAnnouncements('user')).resolves.toEqual([]);
    expect(loadVisibleAnnouncements).not.toHaveBeenCalled();
  });

  it('returns nothing for an unknown audience', async () => {
    await expect(
      getVisibleAnnouncements('admin' as unknown as 'user'),
    ).resolves.toEqual([]);
    expect(loadVisibleAnnouncements).not.toHaveBeenCalled();
  });
});

describe('dismissAnnouncementAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadAuthenticatedSession).mockResolvedValue(mockSession);
  });

  it('dismisses the announcement for the signed-in user', async () => {
    const result = await dismissAnnouncementAction({ id: 'release-1.2.0' });

    expect(result?.serverError).toBeUndefined();
    expect(insertAnnouncementDismissal).toHaveBeenCalledWith(
      'release-1.2.0',
      mockSession.user.id,
    );
  });

  it('rejects an empty id', async () => {
    const result = await dismissAnnouncementAction({ id: '' });

    expect(result?.validationErrors).toBeDefined();
    expect(insertAnnouncementDismissal).not.toHaveBeenCalled();
  });
});
