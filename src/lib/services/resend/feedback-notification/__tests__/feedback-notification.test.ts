import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';
import * as Sentry from '@sentry/nextjs';
import {
  createCaptureTransport,
  type CaptureTransport,
} from '../../capture-transport';
import { setEmailTransport } from '../..';
import {
  sendFeedbackNotification,
  type FeedbackNotificationTemplateData,
} from '..';

vi.mock('@sentry/nextjs', () => ({
  startSpan: vi.fn((_options: unknown, callback: () => unknown) => callback()),
  captureException: vi.fn(),
}));

const feedback: FeedbackNotificationTemplateData = {
  category: 'bug',
  message: 'Der Export bricht bei großen Zeiträumen ab.',
  userName: 'Jane Doe',
  userEmail: 'jane@example.com',
  fairteilerName: 'Raupe Immersatt',
  submittedAt: '18.10.26, 17:00',
};

let mail: CaptureTransport;

beforeEach(() => {
  mail = createCaptureTransport();
  setEmailTransport(mail);
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  setEmailTransport(undefined);
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('sendFeedbackNotification', () => {
  it('sends the feedback to the admin with the user as reply-to', async () => {
    vi.stubEnv('ADMIN_EMAIL', 'team@example.org');

    const result = await sendFeedbackNotification(feedback);

    expect(result).toEqual({ success: true });
    expect(mail.sent).toHaveLength(1);
    const [email] = mail.sent;
    expect(email.from).toBe('support@fairteiler-tracker.de');
    expect(email.to).toEqual(['team@example.org']);
    expect(email.replyTo).toBe('jane@example.com');
    expect(email.subject).toBe('[FairTrack] Neues Feedback: Fehler melden');
    for (const body of [email.text, email.html]) {
      expect(body).toContain(feedback.message);
      expect(body).toContain('Jane Doe');
      expect(body).toContain('jane@example.com');
      expect(body).toContain('Raupe Immersatt');
      expect(body).toContain(feedback.submittedAt);
    }
    expect(email.text).toContain('Kategorie: Fehler melden');
  });

  it('falls back to the default admin address', async () => {
    vi.stubEnv('ADMIN_EMAIL', undefined);

    await sendFeedbackNotification(feedback);

    expect(mail.sent[0].to).toEqual(['admin@fairteiler-tracker.de']);
  });

  it.each([
    ['feature', 'Feature-Wunsch'],
    ['improvement', 'Verbesserungsvorschlag'],
    ['general', 'Allgemeines Feedback'],
  ] as const)('labels %s feedback as %s', async (category, label) => {
    await sendFeedbackNotification({ ...feedback, category });

    expect(mail.sent[0].subject).toBe(`[FairTrack] Neues Feedback: ${label}`);
    expect(mail.sent[0].text).toContain(`Kategorie: ${label}`);
  });

  it('omits the fairteiler line without an active fairteiler', async () => {
    await sendFeedbackNotification({ ...feedback, fairteilerName: undefined });

    expect(mail.sent[0].text).not.toContain('Fairteiler:');
    expect(mail.sent[0].html).not.toContain('Raupe Immersatt');
  });

  it('reports a transport error without throwing', async () => {
    setEmailTransport({
      send: () =>
        Promise.resolve({ data: null, error: { message: 'rejected' } }),
    });

    const result = await sendFeedbackNotification(feedback);

    expect(result).toEqual({ success: false, error: 'rejected' });
    expect(Sentry.captureException).toHaveBeenCalledWith(
      { message: 'rejected' },
      { tags: { service: 'resend', email: 'feedback-notification' } },
    );
  });

  it('reports a thrown transport error without throwing', async () => {
    setEmailTransport({ send: () => Promise.reject(new Error('offline')) });

    const result = await sendFeedbackNotification(feedback);

    expect(result).toEqual({ success: false, error: 'offline' });
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
