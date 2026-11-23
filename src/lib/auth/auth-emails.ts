import { getEmailTransport } from '@/lib/services/resend';
import {
  getResetPasswordTemplate,
  getResetPasswordText,
} from '@/lib/services/resend/reset-password';
import {
  getInviteMemberTemplate,
  getInviteMemberText,
} from '@/lib/services/resend/invite-member';

export async function sendResetPasswordEmail({
  user,
  url,
}: {
  user: { email: string };
  url: string;
}) {
  if (process.env.NEXT_PUBLIC_ENV === 'demo') {
    console.log('Skipping reset password email in demo environment');
    return;
  }
  const { error } = await getEmailTransport().send({
    from: 'support@fairteiler-tracker.de',
    to: user.email,
    subject: 'FairTrack Passwort zurücksetzen',
    html: await getResetPasswordTemplate({ url }),
    text: getResetPasswordText({ url }),
  });
  if (error) {
    console.error('Failed to send reset password email:', error);
    throw new Error('Failed to send reset password email');
  }
}

export async function sendInvitationEmail(data: {
  id: string;
  email: string;
  organization: { name: string };
}) {
  if (process.env.NEXT_PUBLIC_ENV === 'demo') {
    console.log('Skipping invitation email in demo environment');
    return;
  }
  const inviteLink = `${process.env.NEXT_PUBLIC_ENV_URL}/sign-up?invitationId=${data.id}`;
  const { error } = await getEmailTransport().send({
    from: 'support@fairteiler-tracker.de',
    to: data.email,
    subject: 'FairTrack Fairteilereinladung',
    html: await getInviteMemberTemplate({
      url: inviteLink,
      fairteilerName: data.organization.name,
    }),
    text: getInviteMemberText({
      url: inviteLink,
      fairteilerName: data.organization.name,
    }),
  });
  if (error) {
    console.error('Failed to send invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
}
