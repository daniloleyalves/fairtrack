import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  clearCapturedEmails,
  createCaptureTransport,
  extractLinks,
  readCapturedEmails,
} from '../capture-transport';
import { getEmailTransport, resendTransport, setEmailTransport } from '..';

const message = {
  from: 'support@fairteiler-tracker.de',
  to: 'jane@example.com',
  subject: 'Betreff',
  html: '<a href="https://app.test/a?x=1&amp;y=2">Link</a>',
  text: 'Link: **https://app.test/b**\nhttps://app.test/a?x=1&y=2',
};

describe('capture transport', () => {
  afterEach(() => setEmailTransport(undefined));

  it('records recipient, subject, body and links', async () => {
    const transport = createCaptureTransport();

    const result = await transport.send(message);

    expect(result.error).toBeNull();
    expect(transport.sent).toHaveLength(1);
    expect(transport.sent[0]).toMatchObject({
      to: ['jane@example.com'],
      subject: 'Betreff',
      html: message.html,
      text: message.text,
      links: ['https://app.test/a?x=1&y=2', 'https://app.test/b'],
    });
  });

  it('extracts links from html hrefs and plain text without markdown', () => {
    expect(
      extractLinks({
        html: '<a href="mailto:a@b.de">a</a><a href="https://x.test/c">c</a>',
        text: 'siehe (https://x.test/d) und **https://x.test/e**',
      }),
    ).toEqual(['https://x.test/c', 'https://x.test/d', 'https://x.test/e']);
  });

  it('appends to a file that can be read back and cleared', async () => {
    const file = path.join(
      mkdtempSync(path.join(tmpdir(), 'emails-')),
      'out.jsonl',
    );
    const transport = createCaptureTransport({ file });

    await transport.send(message);
    await transport.send({ ...message, to: ['a@x.de', 'b@x.de'] });

    const emails = readCapturedEmails(file);
    expect(emails.map((email) => email.to)).toEqual([
      ['jane@example.com'],
      ['a@x.de', 'b@x.de'],
    ]);

    clearCapturedEmails(file);
    expect(readCapturedEmails(file)).toEqual([]);
  });

  it('uses the capture transport in the testing environment', () => {
    expect(process.env.NEXT_PUBLIC_ENV).toBe('testing');
    expect(getEmailTransport()).not.toBe(resendTransport);
  });

  it('can be replaced', () => {
    const transport = createCaptureTransport();
    setEmailTransport(transport);
    expect(getEmailTransport()).toBe(transport);
  });
});
