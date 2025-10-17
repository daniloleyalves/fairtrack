import { render } from '@react-email/render';
import { FeedbackNotificationEmail } from './feedback-notification-email';
import feedbackNotificationTxt from './feedback-notification.txt?raw';
import { createElement } from 'react';
import { resend } from '..';

const categoryLabels = {
  bug: 'Fehler melden',
  feature: 'Feature-Wunsch',
  improvement: 'Verbesserungsvorschlag',
  general: 'Allgemeines Feedback',
};

function fillTextTemplate(
  template: string,
  data: {
    categoryLabel: string;
    userName: string;
    userEmail: string;
    fairteilerInfo: string;
    submittedAt: string;
    message: string;
  },
): string {
  return template
    .replace('{{ categoryLabel }}', data.categoryLabel)
    .replace('{{ userName }}', data.userName)
    .replace('{{ userEmail }}', data.userEmail)
    .replace('{{ fairteilerInfo }}', data.fairteilerInfo)
    .replace('{{ submittedAt }}', data.submittedAt)
    .replace('{{ message }}', data.message);
}

export interface FeedbackNotificationTemplateData {
  category: 'bug' | 'feature' | 'improvement' | 'general';
  message: string;
  userName: string;
  userEmail: string;
  fairteilerName?: string;
  submittedAt: string;
}

async function getFeedbackNotificationTemplate(
  data: FeedbackNotificationTemplateData,
): Promise<string> {
  return await render(createElement(FeedbackNotificationEmail, data));
}

function getFeedbackNotificationText(
  data: FeedbackNotificationTemplateData,
): string {
  const categoryLabel = categoryLabels[data.category];
  const fairteilerInfo = data.fairteilerName
    ? `\nFairteiler: ${data.fairteilerName}`
    : '';

  return fillTextTemplate(feedbackNotificationTxt, {
    categoryLabel,
    userName: data.userName,
    userEmail: data.userEmail,
    fairteilerInfo,
    submittedAt: data.submittedAt,
    message: data.message,
  });
}

function getFeedbackNotificationSubject(
  category: 'bug' | 'feature' | 'improvement' | 'general',
): string {
  const categoryLabel = categoryLabels[category];
  return `[FairTrack] Neues Feedback: ${categoryLabel}`;
}

export async function sendFeedbackNotification(
  data: FeedbackNotificationTemplateData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@fairteiler-tracker.de';

    const [htmlTemplate, textTemplate] = await Promise.all([
      getFeedbackNotificationTemplate(data),
      Promise.resolve(getFeedbackNotificationText(data)),
    ]);

    const subject = getFeedbackNotificationSubject(data.category);

    const result = await resend.emails.send({
      from: 'support@fairteiler-tracker.de',
      to: [adminEmail],
      replyTo: data.userEmail,
      subject,
      html: htmlTemplate,
      text: textTemplate,
    });

    if (result.error) {
      console.error('Failed to send feedback notification:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log('Feedback notification sent successfully:', result.data?.id);
    return { success: true };
  } catch (error) {
    console.error('Error sending feedback notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
