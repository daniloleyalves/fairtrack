import {
  LayoutDashboard,
  CircleUser,
  Settings2,
  Store,
  Users,
  LayoutDashboardIcon,
  Map,
  History,
  ChartBar,
  Globe,
  Rocket,
  MessageCircleHeart,
  LucideIcon,
  ClipboardList,
} from 'lucide-react';

export enum SiteRoutes {
  HOME = 'Home',
  FAIRTEILER = 'Fairteiler',
  INFO_AND_FAQ = 'Informationen & FAQ',
}

export interface Route {
  title: string;
  url: string;
  icon?: LucideIcon;
  disabled: boolean;
  reqPermissions?: { section: string; permissions: string[] };
  routes?: Route[];
}

export const siteRoutes: Route[] = [
  {
    title: SiteRoutes.FAIRTEILER,
    url: '/fairteiler',
    disabled: false,
  },
  {
    title: SiteRoutes.INFO_AND_FAQ,
    url: '/info-and-faq',
    disabled: false,
  },
];

export const routes: Record<string, Route[]> = {
  mainRoutes: [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      url: `/hub/fairteiler/dashboard`,
      disabled: false,
      reqPermissions: { section: 'dashboard', permissions: ['read'] },
    },
    // {
    //   title: 'Verwaltung',
    //   icon: Boxes,
    //   url: `/hub/fairteiler/operations`,
    //   disabled: false,
    //   reqPermissions: {
    //     section: 'operations',
    //     permissions: ['read', 'update'],
    //   },
    //   routes: [
    //     {
    //       title: 'Lager',
    //       icon: Icons.boxes,
    //       url: `/${modules.fairteiler.slug}/operations/warehouse`,
    //       disabled: false,
    //       reqPermissions: {
    //         section: 'operations',
    //         permissions: ['read', 'update'],
    //       },
    //     },
    //     {
    //       title: 'Retteformular',
    //       icon: Icons.shoppingBasket,
    //       url: `/${modules.fairteiler.slug}/operations/contribution`,
    //       disabled: false,
    //       reqPermissions: {
    //         section: 'contribution',
    //         permissions: ['read', 'create'],
    //       },
    //     },
    //   ],
    // },
    {
      title: 'Retteformular',
      icon: ClipboardList,
      url: `/hub/fairteiler/contribution`,
      disabled: false,
      reqPermissions: {
        section: 'contribution',
        permissions: ['read', 'create'],
      },
    },
    {
      title: 'Verlauf',
      icon: History,
      url: `/hub/fairteiler/history`,
      disabled: false,
      reqPermissions: { section: 'history', permissions: ['read'] },
    },
    {
      title: 'Statistiken',
      icon: ChartBar,
      url: `/hub/fairteiler/reporting`,
      disabled: false,
      reqPermissions: { section: 'reporting', permissions: ['read'] },
    },
  ],
  platformRoutes: [
    {
      title: 'Platform-Statistiken',
      icon: Globe,
      url: `/hub/fairteiler/platform-reporting`,
      disabled: false,
      reqPermissions: { section: 'reporting', permissions: ['read'] },
    },
    {
      title: 'Releases & Roadmap',
      icon: Rocket,
      url: `/hub/releases-roadmap`,
      disabled: true,
    },
    {
      title: 'Feedback',
      icon: MessageCircleHeart,
      url: `/hub/fairteiler/feedback`,
      disabled: false,
    },
  ],
  userRoutes: [
    {
      title: 'Dashboard',
      icon: LayoutDashboardIcon,
      url: `/hub/user/dashboard`,
      disabled: false,
      reqPermissions: { section: 'user', permissions: ['read', 'update'] },
    },
    {
      title: 'Fairteiler-Finder',
      icon: Map,
      url: `/hub/user/fairteiler-finder`,
      disabled: false,
      reqPermissions: { section: 'user', permissions: ['read', 'update'] },
    },
    {
      title: 'Meine Beiträge',
      icon: History,
      url: `/hub/user/history`,
      disabled: false,
      reqPermissions: { section: 'user', permissions: ['read'] },
    },
    {
      title: 'Einstellungen',
      icon: Settings2,
      url: `/hub/user/settings`,
      disabled: false,
      reqPermissions: {
        section: 'user',
        permissions: ['read', 'update', 'delete'],
      },
      routes: [
        {
          title: 'Account',
          icon: CircleUser,
          // illustration: Illustrations.profileIllustration,
          url: `/user/settings/account`,
          disabled: false,
          reqPermissions: { section: 'user', permissions: ['read', 'update'] },
        },
        // {
        //   title: 'Präferenzen',
        //   icon: Icons.settings,
        //   // illustration: Illustrations.preferencesIllustration,
        //   url: `/user/settings/preferences`,
        //   disabled: true,
        // },
      ],
    },
  ],
  adminRoutes: [
    {
      title: 'Fairteilerprofil',
      icon: Store,
      url: `/hub/fairteiler/profile`,
      disabled: false,
      reqPermissions: {
        section: 'organization',
        permissions: ['read', 'update'],
      },
    },
    {
      title: 'Mitglieder',
      icon: Users,
      url: `/hub/fairteiler/members`,
      disabled: false,
      reqPermissions: { section: 'member', permissions: ['create', 'update'] },
    },
    {
      title: 'Präferenzen',
      icon: Settings2,
      url: '/hub/fairteiler/preferences',
      disabled: false,
      reqPermissions: {
        section: 'organization',
        permissions: ['read', 'update'],
      },
    },
  ],
} as const;
