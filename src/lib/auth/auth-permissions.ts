import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements } from 'better-auth/plugins/admin/access';

const statement = {
  ...defaultStatements,
  user: ['read', 'update', 'delete', 'ban'],
  organization: ['read', 'update', 'delete'],
  member: ['create', 'update', 'delete'],
  preferences: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  dashboard: ['read'],
  operations: ['read', 'update'],
  contribution: ['read', 'create'],
  history: ['read'],
  reporting: ['read'],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
  user: ['read', 'update', 'delete', 'ban'],
  organization: ['read', 'update', 'delete'],
  member: ['create', 'update', 'delete'],
  preferences: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  dashboard: ['read'],
  operations: ['read', 'update'],
  contribution: ['read', 'create'],
  history: ['read'],
  reporting: ['read'],
});

export const member = ac.newRole({
  user: ['read', 'update', 'delete'],
  organization: ['read'],
  member: [],
  preferences: ['create', 'update', 'delete'],
  dashboard: ['read'],
  operations: ['read', 'update'],
  contribution: ['read', 'create'],
  history: ['read'],
  reporting: ['read'],
});

export const viewer = ac.newRole({
  user: ['read', 'update', 'delete'],
  organization: ['read'],
  member: [],
  preferences: [],
  dashboard: ['read'],
  operations: ['read'],
  contribution: ['read'],
  history: ['read'],
  reporting: ['read'],
});

export const employee = ac.newRole({
  user: ['read'],
  organization: ['read'],
  member: [],
  preferences: [],
  dashboard: [],
  operations: ['read', 'update'],
  contribution: ['read', 'create'],
  history: ['read'],
  reporting: ['read'],
});

export const guest = ac.newRole({
  user: ['read'],
  organization: ['read'],
  member: [],
  preferences: [],
  dashboard: [],
  operations: [],
  contribution: ['read', 'create'],
  history: [],
  reporting: [],
});

export const disabled = ac.newRole({
  user: ['read'],
  organization: [],
  member: [],
  preferences: [],
  dashboard: [],
  operations: [],
  contribution: [],
  history: [],
  reporting: [],
});

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'tertiary'
  | 'destructive'
  | 'outline'
  | undefined;

type Roles = Record<
  string,
  Record<
    string,
    {
      key: string;
      title: string;
      description: string;
      variant: BadgeVariant;
    }
  >
>;

export const roles: Roles = {
  team: {
    owner: {
      key: 'owner',
      title: 'Inhaber:in',
      description:
        'Besitzt uneingeschränkte Zugangsrechte über den Fairteiler.',
      variant: 'default',
    },
    member: {
      key: 'member',
      title: 'Mitglied',
      description:
        'Erhält Zugang zu allen nicht-administrativen Bereichen des Fairteilers und ist berechtigt, Lebensmittel zu verwalten.',
      variant: 'tertiary',
    },
    viewer: {
      key: 'viewer',
      title: 'Betrachter:in',
      description:
        'Erhält Zugang zu allen nicht-administrativen Bereichen des Fairteilers, verfügt jedoch über keine verwaltende Rechte.',
      variant: 'secondary',
    },
  },
  views: {
    employee: {
      key: 'employee',
      title: 'Mitarbeiter:in',
      description: 'Hat ausschließlich Zugriff auf die Lebensmittelverwaltung.',
      variant: 'secondary',
    },
    guest: {
      key: 'guest',
      title: 'Gast',
      description:
        'Hat ausschließlich Zugriff auf das Rettformular. Alle von Gastzugängen geleisteten Beiträge werden unter Gastbeiträge erfasst.',
      variant: 'secondary',
    },
  },
} as const;

export enum MemberRolesEnum {
  OWNER = 'owner',
  MEMBER = 'member',
  VIEWER = 'viewer',
  EMPLOYEE = 'employee',
  GUEST = 'guest',
  DISABLED = 'disabled',
}

export type MemberRoles =
  | 'owner'
  | 'member'
  | 'viewer'
  | 'employee'
  | 'guest'
  | 'disabled';

export const ACCESS_VIEW_ROLES = new Set([
  MemberRolesEnum.GUEST,
  MemberRolesEnum.EMPLOYEE,
  MemberRolesEnum.DISABLED,
]);
