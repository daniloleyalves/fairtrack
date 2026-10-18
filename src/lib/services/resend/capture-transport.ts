import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import path from 'node:path';
import type { EmailMessage, EmailTransport } from '.';

export interface CapturedEmail extends Omit<EmailMessage, 'to'> {
  to: string[];
  links: string[];
  sentAt: string;
}

export interface CaptureTransport extends EmailTransport {
  sent: CapturedEmail[];
}

export const EMAIL_CAPTURE_FILE = path.join(
  process.cwd(),
  '.test-results',
  'emails.jsonl',
);

export function extractLinks({
  html,
  text,
}: Pick<EmailMessage, 'html' | 'text'>) {
  const hrefs = Array.from(html.matchAll(/href="([^"]+)"/g), (match) =>
    match[1].replaceAll('&amp;', '&'),
  );
  const plain = text.match(/https?:\/\/[^\s<>"'*)]+/g) ?? [];
  return [...new Set([...hrefs, ...plain])].filter((link) =>
    /^https?:\/\//.test(link),
  );
}

export function createCaptureTransport({
  file,
}: { file?: string } = {}): CaptureTransport {
  const sent: CapturedEmail[] = [];
  return {
    sent,
    send(message) {
      const email: CapturedEmail = {
        ...message,
        to: [message.to].flat(),
        links: extractLinks(message),
        sentAt: new Date().toISOString(),
      };
      sent.push(email);
      if (file) {
        mkdirSync(path.dirname(file), { recursive: true });
        appendFileSync(file, `${JSON.stringify(email)}\n`);
      }
      return Promise.resolve({
        data: { id: `captured-${sent.length}` },
        error: null,
      });
    },
  };
}

export function readCapturedEmails(file = EMAIL_CAPTURE_FILE): CapturedEmail[] {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as CapturedEmail);
}

export function clearCapturedEmails(file = EMAIL_CAPTURE_FILE) {
  rmSync(file, { force: true });
}
