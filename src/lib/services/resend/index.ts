import { Resend } from 'resend';
import dotenv from 'dotenv';
import {
  createCaptureTransport,
  EMAIL_CAPTURE_FILE,
} from './capture-transport';

dotenv.config({ path: '.vercel/.env.development.local' });

export interface EmailMessage {
  from: string;
  to: string | string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailSendResult {
  data: { id: string } | null;
  error: { message: string } | null;
}

export interface EmailTransport {
  send(message: EmailMessage): Promise<EmailSendResult>;
}

let resend: Resend | undefined;

export const resendTransport: EmailTransport = {
  send(message) {
    resend ??= new Resend(process.env.RESEND_API_KEY);
    return resend.emails.send(message);
  },
};

let transport: EmailTransport | undefined;

export function getEmailTransport(): EmailTransport {
  transport ??=
    process.env.NEXT_PUBLIC_ENV === 'testing'
      ? createCaptureTransport({ file: EMAIL_CAPTURE_FILE })
      : resendTransport;
  return transport;
}

export function setEmailTransport(next: EmailTransport | undefined) {
  transport = next;
}
