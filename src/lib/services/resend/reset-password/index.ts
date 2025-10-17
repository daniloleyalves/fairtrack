import { render } from '@react-email/render';
import { ResetPasswordEmail } from './reset-password-email';
import resetPasswordTxt from './reset-password.txt?raw';
import { createElement } from 'react';

function fillTextTemplate(
  template: string,
  data: {
    url: string;
  },
): string {
  return template.replace('{{ url }}', data.url ?? '-');
}

export interface ResetPasswordTemplateData {
  url: string;
}

export async function getResetPasswordTemplate(
  data: ResetPasswordTemplateData,
): Promise<string> {
  return await render(createElement(ResetPasswordEmail, data));
}

export function getResetPasswordText(data: ResetPasswordTemplateData): string {
  return fillTextTemplate(resetPasswordTxt, data);
}
