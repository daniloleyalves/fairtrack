import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';
import { headers } from 'next/headers';
import {
  createCaptureTransport,
  type CaptureTransport,
} from '@/lib/services/resend/capture-transport';
import { setEmailTransport } from '@/lib/services/resend';
import { mockSession } from '@/__tests__/mocks/server-only';
import { submitFeedbackAction } from '../actions';
import {
  loadAuthenticatedSession,
  submitUserFeedbackWithDetails,
} from '../dal';

vi.mock('@server/db/drizzle', () => ({ db: {} }));

vi.mock('../dal', () => ({
  addExperienceLevelEvent: vi.fn(),
  addUserPreferences: vi.fn(),
  loadAuthenticatedSession: vi.fn(),
  submitUserFeedbackWithDetails: vi.fn(),
  updateFirstLogin: vi.fn(),
  updateUserPreferences: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

let mail: CaptureTransport;

beforeEach(() => {
  mail = createCaptureTransport();
  setEmailTransport(mail);
  vi.mocked(headers).mockResolvedValue(new Headers());
  vi.mocked(loadAuthenticatedSession).mockResolvedValue(mockSession);
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  setEmailTransport(undefined);
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('submitFeedbackAction email', () => {
  it('notifies the admin after the feedback is stored', async () => {
    vi.mocked(submitUserFeedbackWithDetails).mockResolvedValue({
      feedbackId: 'feedback-1',
      category: 'feature',
      message: 'Bitte eine Kartenansicht für alle Fairteiler.',
      createdAt: new Date('2026-10-18T15:00:00Z'),
      userName: 'Alice Example',
      userEmail: 'alice@example.com',
      fairteilerName: null,
    });

    const result = await submitFeedbackAction({
      category: 'feature',
      message: 'Bitte eine Kartenansicht für alle Fairteiler.',
    });

    expect(result?.serverError).toBeUndefined();
    expect(submitUserFeedbackWithDetails).toHaveBeenCalledWith(
      mockSession.user.id,
      mockSession.session.activeOrganizationId,
      'feature',
      'Bitte eine Kartenansicht für alle Fairteiler.',
    );
    expect(mail.sent).toHaveLength(1);
    expect(mail.sent[0]).toMatchObject({
      replyTo: 'alice@example.com',
      subject: '[FairTrack] Neues Feedback: Feature-Wunsch',
    });
    expect(mail.sent[0].text).toContain(
      'Bitte eine Kartenansicht für alle Fairteiler.',
    );
  });

  it('sends nothing when the feedback could not be stored', async () => {
    vi.mocked(submitUserFeedbackWithDetails).mockResolvedValue(null);

    const result = await submitFeedbackAction({
      category: 'bug',
      message: 'Etwas funktioniert nicht.',
    });

    expect(result?.serverError).toBeDefined();
    expect(mail.sent).toHaveLength(0);
  });

  it('sends nothing for invalid input', async () => {
    const result = await submitFeedbackAction({
      category: 'bug',
      message: 'kurz',
    });

    expect(result?.validationErrors).toBeDefined();
    expect(submitUserFeedbackWithDetails).not.toHaveBeenCalled();
    expect(mail.sent).toHaveLength(0);
  });

  it('still succeeds when the email fails', async () => {
    vi.mocked(submitUserFeedbackWithDetails).mockResolvedValue({
      feedbackId: 'feedback-2',
      category: 'general',
      message: 'Allgemeines Feedback zur App.',
      createdAt: new Date('2026-10-18T15:00:00Z'),
      userName: 'Alice Example',
      userEmail: 'alice@example.com',
      fairteilerName: 'Raupe Immersatt',
    });
    setEmailTransport({
      send: () =>
        Promise.resolve({ data: null, error: { message: 'rejected' } }),
    });

    const result = await submitFeedbackAction({
      category: 'general',
      message: 'Allgemeines Feedback zur App.',
    });

    expect(result?.serverError).toBeUndefined();
    expect(result?.data).toMatchObject({ feedbackId: 'feedback-2' });
  });
});
