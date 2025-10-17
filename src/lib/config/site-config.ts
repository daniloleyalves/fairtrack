export const siteConfig = {
  name: 'FairTrack - Foodsharing Tracker',
  short_name: 'FairTrack',
  url: 'https://fairteiler-tracker.de',
  ogImage: '../assets/icons/logo.svelte',
  description:
    'Nutze die FairTrack-Plattform, um deinen Foodsharing-Beitrag zu tracken und zu teilen',
  keywords: `FairTrack, Foodsharing, Lebensmittelretten, Retten, Lebensmittel, Beitrag, Teilen, Tracken, Daten, Impact, Foodsharingimpact, Café, Foodsharing Café, Netzwerk, Foodsharing Café Netzwerk`,
  contact: 'admin@fairteiler-tracker.de',
};
export type SiteConfig = typeof siteConfig;

export const initialContributionQuantity = 70000; // kg

export const defaultDateRange = {
  from: new Date(2023, 0, 1),
  to: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59),
};

export const STANDARD_PASSWORD = 'standard';
