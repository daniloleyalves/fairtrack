import { render } from '@react-email/render';
import { InviteMemberEmail } from './invite-member-email';
import inviteMemberTxt from './invite-member.txt?raw';
import { createElement } from 'react';

function fillTextTemplate(
  template: string,
  data: {
    url: string;
    fairteilerName: string;
  },
): string {
  return template
    .replace('{{ url }}', data.url ?? '-')
    .replace('{{ fairteilerName }}', data.fairteilerName);
}

export interface InviteMemberTemplateData {
  url: string;
  fairteilerName: string;
}

export async function getInviteMemberTemplate(
  data: InviteMemberTemplateData,
): Promise<string> {
  return await render(createElement(InviteMemberEmail, data));
}

export function getInviteMemberText(data: InviteMemberTemplateData): string {
  return fillTextTemplate(inviteMemberTxt, data);
}
