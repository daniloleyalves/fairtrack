import { DELETED_USER_ID } from '../../schema';
import type { SeedData } from '../utils/types';
import { generateId } from '../utils/seed-helpers';

export const DEMO_PASSWORD = 'Demo1234';

const BLOB_BASE = 'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com';

// Deterministic PRNG (mulberry32) so every weekly demo reset produces the same dataset
const createRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const random = createRandom(0x5eedf00d);

const daysAgo = (days: number, hour = 12, minute = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)];

const randomBetween = (min: number, max: number) =>
  min + random() * (max - min);

type DemoUser = SeedData['users'][number];

const createUser = (input: {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  avatar?: string;
  createdDaysAgo: number;
  role?: string;
}): DemoUser => ({
  id: generateId(),
  name: `${input.firstName} ${input.lastName}`,
  email: input.email,
  emailVerified: true,
  image: input.avatar ? `${BLOB_BASE}/user_avatars/${input.avatar}` : undefined,
  createdAt: daysAgo(input.createdDaysAgo, 10),
  updatedAt: daysAgo(1, 9),
  role: input.role,
  username: input.username,
  firstName: input.firstName,
  lastName: input.lastName,
  secure: true,
  isFirstLogin: false,
});

const demoAdmin = createUser({
  firstName: 'Demo',
  lastName: 'Admin',
  email: 'demo.admin@fairtrack.com',
  username: 'demoadmin',
  avatar: 'demo-demo-admin.png',
  createdDaysAgo: 110,
  role: 'admin',
});
const sarah = createUser({
  firstName: 'Sarah',
  lastName: 'Wilson',
  email: 'sarah.wilson@demo.com',
  username: 'sarahwilson',
  avatar: 'demo-sarah.png',
  createdDaysAgo: 98,
});
const emma = createUser({
  firstName: 'Emma',
  lastName: 'Rodriguez',
  email: 'emma.rodriguez@demo.com',
  username: 'emmarodriguez',
  avatar: 'demo-emma.png',
  createdDaysAgo: 92,
});
const employee = createUser({
  firstName: 'Mitarbeitende',
  lastName: 'stuttgart-mitte',
  email: 'employee-1@stuttgart-mitte.local',
  createdDaysAgo: 90,
});
employee.name = 'Mitarbeitende';
const guest = createUser({
  firstName: 'Gastzugang',
  lastName: 'stuttgart-mitte',
  email: 'guest-1@stuttgart-mitte.local',
  createdDaysAgo: 85,
});
guest.name = 'Gastzugang';

const lukas = createUser({
  firstName: 'Lukas',
  lastName: 'Baumann',
  email: 'lukas.baumann@demo.com',
  username: 'lukasbaumann',
  avatar: 'demo-lukas.png',
  createdDaysAgo: 105,
});
const mia = createUser({
  firstName: 'Mia',
  lastName: 'Schneider',
  email: 'mia.schneider@demo.com',
  username: 'miaschneider',
  avatar: 'demo-mia.png',
  createdDaysAgo: 88,
});
const jonas = createUser({
  firstName: 'Jonas',
  lastName: 'Weber',
  email: 'jonas.weber@demo.com',
  username: 'jonasweber',
  avatar: 'demo-jonas.png',
  createdDaysAgo: 102,
});
const lea = createUser({
  firstName: 'Lea',
  lastName: 'Hoffmann',
  email: 'lea.hoffmann@demo.com',
  username: 'leahoffmann',
  avatar: 'demo-lea.png',
  createdDaysAgo: 80,
});
const finn = createUser({
  firstName: 'Finn',
  lastName: 'Krüger',
  email: 'finn.krueger@demo.com',
  username: 'finnkrueger',
  avatar: 'demo-finn.png',
  createdDaysAgo: 100,
});
const anna = createUser({
  firstName: 'Anna',
  lastName: 'Fischer',
  email: 'anna.fischer@demo.com',
  username: 'annafischer',
  avatar: 'demo-anna.png',
  createdDaysAgo: 82,
});
const david = createUser({
  firstName: 'David',
  lastName: 'Wagner',
  email: 'david.wagner@demo.com',
  username: 'davidwagner',
  avatar: 'demo-david.png',
  createdDaysAgo: 95,
});
const clara = createUser({
  firstName: 'Clara',
  lastName: 'Zimmermann',
  email: 'clara.zimmermann@demo.com',
  username: 'clarazimmermann',
  avatar: 'demo-clara.png',
  createdDaysAgo: 78,
});

// Placeholder that checkins fall back to when a visitor deletes a demo account
const deletedUser: DemoUser = {
  id: DELETED_USER_ID,
  name: 'Gelöschter Account',
  email: 'deleted@fairtrack.internal',
  emailVerified: true,
  createdAt: daysAgo(120, 10),
  updatedAt: daysAgo(120, 10),
  firstName: 'Gelöschter',
  lastName: 'Account',
  secure: true,
  isFirstLogin: true,
};

const users = [
  demoAdmin,
  sarah,
  emma,
  employee,
  guest,
  lukas,
  mia,
  jonas,
  lea,
  finn,
  anna,
  david,
  clara,
  deletedUser,
];

type Fairteiler = SeedData['fairteiler'][number];

const mitte: Fairteiler = {
  id: generateId(),
  name: 'Stuttgart-Mitte',
  slug: 'stuttgart-mitte',
  address: 'Königstraße 42, 70173 Stuttgart',
  geoLink: 'https://maps.google.com/?q=Königstraße+42+Stuttgart',
  geoLng: '9.1829',
  geoLat: '48.7758',
  website: 'https://foodsharing.de',
  thumbnail: `${BLOB_BASE}/fairteiler_thumbnails/demo-fairteiler-mitte.jpg`,
  disabled: false,
  createdAt: daysAgo(100, 9),
  metadata: JSON.stringify({
    capacity: 100,
    openHours: '7-22',
    featured: true,
  }),
};
const cannstatt: Fairteiler = {
  id: generateId(),
  name: 'Bad Cannstatt',
  slug: 'bad-cannstatt',
  address: 'Marktstraße 18, 70372 Stuttgart',
  geoLink: 'https://maps.google.com/?q=Marktstraße+18+Bad+Cannstatt',
  geoLng: '9.2166',
  geoLat: '48.8043',
  thumbnail: `${BLOB_BASE}/fairteiler_thumbnails/demo-fairteiler-markt.jpg`,
  disabled: false,
  createdAt: daysAgo(95, 14),
  metadata: JSON.stringify({ capacity: 75, openHours: '8-20' }),
};
const vaihingen: Fairteiler = {
  id: generateId(),
  name: 'Vaihingen',
  slug: 'vaihingen',
  address: 'Hauptstraße 7, 70563 Stuttgart',
  geoLink: 'https://maps.google.com/?q=Hauptstraße+7+Stuttgart+Vaihingen',
  geoLng: '9.1067',
  geoLat: '48.7278',
  thumbnail: `${BLOB_BASE}/fairteiler_thumbnails/demo-fairteiler-obst.jpg`,
  disabled: false,
  createdAt: daysAgo(90, 11),
  metadata: JSON.stringify({ capacity: 40, openHours: '10-18' }),
};
const west: Fairteiler = {
  id: generateId(),
  name: 'Stuttgart-West',
  slug: 'stuttgart-west',
  address: 'Schwabstraße 55, 70197 Stuttgart',
  geoLink: 'https://maps.google.com/?q=Schwabstraße+55+Stuttgart',
  geoLng: '9.1601',
  geoLat: '48.7735',
  thumbnail: `${BLOB_BASE}/fairteiler_thumbnails/demo-fairteiler-backwaren.jpg`,
  disabled: false,
  createdAt: daysAgo(85, 16),
  metadata: JSON.stringify({ capacity: 60, openHours: '0-24' }),
};
const degerloch: Fairteiler = {
  id: generateId(),
  name: 'Degerloch',
  slug: 'degerloch',
  address: 'Epplestraße 20, 70597 Stuttgart',
  geoLink: 'https://maps.google.com/?q=Epplestraße+20+Stuttgart',
  geoLng: '9.1692',
  geoLat: '48.7451',
  thumbnail: `${BLOB_BASE}/fairteiler_thumbnails/demo-fairteiler-spende.jpg`,
  disabled: false,
  createdAt: daysAgo(80, 13),
  metadata: JSON.stringify({ capacity: 35, openHours: '8-20' }),
};

const fairteiler = [mitte, cannstatt, vaihingen, west, degerloch];

type Category = SeedData['categories'][number];

const createCategory = (
  name: string,
  description: string,
  icon: string,
): Category => ({
  id: generateId(),
  name,
  description,
  image: `${BLOB_BASE}/category_icons/${icon}`,
  status: 'active',
  createdAt: daysAgo(100, 9),
});

const obst = createCategory(
  'Obst',
  'Frisches Obst und Früchte',
  'icon_obst.png',
);
const gemuese = createCategory(
  'Gemüse',
  'Frisches Gemüse und Salate',
  'icon_gemuese.png',
);
const backwaren = createCategory(
  'Backwaren',
  'Brot, Brötchen und Gebäck',
  'icon_backwaren-salzig.png',
);
const milchprodukte = createCategory(
  'Milchprodukte',
  'Gekühlte Milch- und Frischeprodukte',
  'icon_kuehlprodukte.png',
);
const trockenprodukte = createCategory(
  'Trockenprodukte',
  'Nudeln, Reis, Hülsenfrüchte und Müsli',
  'icon_trockenprodukte.png',
);
const konserven = createCategory(
  'Konserven',
  'Haltbare Dosen- und Glaskonserven',
  'icon_konserven.png',
);
const sonstiges = createCategory(
  'Sonstiges',
  'Alles, was in keine andere Kategorie passt',
  'icon_sonstiges.png',
);

const categories = [
  obst,
  gemuese,
  backwaren,
  milchprodukte,
  trockenprodukte,
  konserven,
  sonstiges,
];

type Origin = SeedData['origins'][number];

const createOrigin = (name: string, description: string): Origin => ({
  id: generateId(),
  name,
  description,
  status: 'active',
  createdAt: daysAgo(100, 9),
});

const supermarkt = createOrigin(
  'Supermarkt',
  'Überschüsse aus dem Einzelhandel',
);
const baeckerei = createOrigin('Bäckerei', 'Backwaren vom Vortag');
const gastronomie = createOrigin(
  'Gastronomie',
  'Übriggebliebenes aus Restaurants und Cafés',
);
const haushalt = createOrigin('Haushalt', 'Private Spenden aus dem Haushalt');
const grossmarkt = createOrigin(
  'Wochen-/Großmarkt',
  'Marktstände und Großhandel',
);
const sonstige = createOrigin('Sonstige', 'Andere Herkünfte');

const origins = [
  supermarkt,
  baeckerei,
  gastronomie,
  haushalt,
  grossmarkt,
  sonstige,
];

type Company = SeedData['companies'][number];

const createCompany = (
  name: string,
  description: string,
  origin: Origin,
): Company => ({
  id: generateId(),
  name,
  description,
  status: 'active',
  originId: origin.id,
  createdAt: daysAgo(90, 9),
});

const frischemarkt = createCompany(
  'Frischemarkt Schwaben',
  'Regionaler Supermarkt mit Fokus auf Lebensmittelrettung',
  supermarkt,
);
const brotzeit = createCompany(
  'Bäckerei Brotzeit',
  'Familienbäckerei, spendet Backwaren vom Vortag',
  baeckerei,
);
const zurLinde = createCompany(
  'Gasthaus Zur Linde',
  'Schwäbisches Gasthaus mit Zero-Waste-Küche',
  gastronomie,
);
const biohof = createCompany(
  'Biohof Remstal',
  'Bio-Hof mit Marktstand, gibt Ernteüberschüsse ab',
  grossmarkt,
);
const morgenrot = createCompany(
  'Café Morgenrot',
  'Kiez-Café, rettet Kuchen und belegte Brötchen',
  gastronomie,
);
const aslan = createCompany(
  'Feinkost Aslan',
  'Feinkostladen an der Marktstraße',
  supermarkt,
);

const companies = [frischemarkt, brotzeit, zurLinde, biohof, morgenrot, aslan];

const fairteilerProfiles: {
  fairteiler: Fairteiler;
  origins: Origin[];
  categories: Category[];
  tags: string[];
  contributors: DemoUser[];
  checkinsPerWeek: number;
}[] = [
  {
    fairteiler: mitte,
    origins,
    categories,
    tags: ['Innenstadt', 'Kühlschrank', 'Barrierefrei'],
    contributors: [demoAdmin, sarah, emma, employee],
    checkinsPerWeek: 10,
  },
  {
    fairteiler: cannstatt,
    origins: [supermarkt, grossmarkt, haushalt, sonstige],
    categories: [obst, gemuese, milchprodukte, konserven, sonstiges],
    tags: ['Marktplatz', 'Überdacht'],
    contributors: [lukas, mia],
    checkinsPerWeek: 5,
  },
  {
    fairteiler: vaihingen,
    origins: [supermarkt, haushalt, sonstige],
    categories: [obst, gemuese, trockenprodukte, sonstiges],
    tags: ['Uni-Nähe', 'Kühlschrank'],
    contributors: [jonas, lea],
    checkinsPerWeek: 4,
  },
  {
    fairteiler: west,
    origins: [baeckerei, supermarkt, haushalt],
    categories: [backwaren, milchprodukte, obst, sonstiges],
    tags: ['Wohngebiet', 'Rund um die Uhr'],
    contributors: [finn, anna],
    checkinsPerWeek: 5,
  },
  {
    fairteiler: degerloch,
    origins: [supermarkt, haushalt, gastronomie, sonstige],
    categories: [obst, gemuese, konserven, sonstiges],
    tags: ['Stadtbahn-Nähe'],
    contributors: [david, clara],
    checkinsPerWeek: 3,
  },
];

const members: SeedData['members'] = [
  { user: demoAdmin, org: mitte, role: 'owner' as const },
  { user: sarah, org: mitte, role: 'member' as const },
  { user: emma, org: mitte, role: 'member' as const },
  { user: employee, org: mitte, role: 'employee' as const },
  { user: guest, org: mitte, role: 'guest' as const },
  { user: lukas, org: cannstatt, role: 'owner' as const },
  { user: mia, org: cannstatt, role: 'member' as const },
  { user: jonas, org: vaihingen, role: 'owner' as const },
  { user: lea, org: vaihingen, role: 'member' as const },
  { user: finn, org: west, role: 'owner' as const },
  { user: anna, org: west, role: 'member' as const },
  { user: david, org: degerloch, role: 'owner' as const },
  { user: clara, org: degerloch, role: 'member' as const },
].map(({ user, org, role }) => ({
  id: generateId(),
  organizationId: org.id,
  userId: user.id,
  role,
  createdAt: user.createdAt,
}));

const tags: SeedData['tags'] = fairteilerProfiles.flatMap((profile) =>
  profile.tags.map((name) => ({
    id: generateId(),
    name,
    fairteilerId: profile.fairteiler.id,
    createdAt: profile.fairteiler.createdAt,
  })),
);

const fairteilerOrigins: SeedData['fairteilerOrigins'] =
  fairteilerProfiles.flatMap((profile) =>
    profile.origins.map((origin) => ({
      id: generateId(),
      fairteilerId: profile.fairteiler.id,
      originId: origin.id,
      createdAt: profile.fairteiler.createdAt,
    })),
  );

const fairteilerCategories: SeedData['fairteilerCategories'] =
  fairteilerProfiles.flatMap((profile) =>
    profile.categories.map((category) => ({
      id: generateId(),
      fairteilerId: profile.fairteiler.id,
      categoryId: category.id,
      createdAt: profile.fairteiler.createdAt,
    })),
  );

const fairteilerCompanies: SeedData['fairteilerCompanies'] =
  fairteilerProfiles.flatMap((profile) => {
    const originIds = new Set(profile.origins.map((origin) => origin.id));
    return companies
      .filter((company) => company.originId && originIds.has(company.originId))
      .map((company) => ({
        id: generateId(),
        fairteilerId: profile.fairteiler.id,
        companyId: company.id,
        createdAt: profile.fairteiler.createdAt,
      }));
  });

interface CatalogItem {
  title: string;
  category: Category;
  origin: Origin;
  company?: Company;
  cool: boolean;
  allergens?: string;
  minKg: number;
  maxKg: number;
}

const foodCatalog: CatalogItem[] = [
  {
    title: 'Äpfel',
    category: obst,
    origin: grossmarkt,
    company: biohof,
    cool: false,
    minKg: 2,
    maxKg: 10,
  },
  {
    title: 'Bananen',
    category: obst,
    origin: supermarkt,
    company: frischemarkt,
    cool: false,
    minKg: 1,
    maxKg: 8,
  },
  {
    title: 'Erdbeeren',
    category: obst,
    origin: grossmarkt,
    company: biohof,
    cool: true,
    minKg: 0.5,
    maxKg: 4,
  },
  {
    title: 'Weintrauben',
    category: obst,
    origin: supermarkt,
    company: frischemarkt,
    cool: true,
    minKg: 0.5,
    maxKg: 4,
  },
  {
    title: 'Birnen',
    category: obst,
    origin: haushalt,
    cool: false,
    minKg: 0.5,
    maxKg: 5,
  },
  {
    title: 'Orangen',
    category: obst,
    origin: supermarkt,
    company: frischemarkt,
    cool: false,
    minKg: 1,
    maxKg: 8,
  },
  {
    title: 'Karotten',
    category: gemuese,
    origin: grossmarkt,
    company: biohof,
    cool: false,
    minKg: 1,
    maxKg: 10,
  },
  {
    title: 'Tomaten',
    category: gemuese,
    origin: supermarkt,
    company: frischemarkt,
    cool: true,
    minKg: 1,
    maxKg: 6,
  },
  {
    title: 'Paprika',
    category: gemuese,
    origin: supermarkt,
    company: frischemarkt,
    cool: true,
    minKg: 0.5,
    maxKg: 5,
  },
  {
    title: 'Kopfsalat',
    category: gemuese,
    origin: grossmarkt,
    company: biohof,
    cool: true,
    minKg: 0.5,
    maxKg: 3,
  },
  {
    title: 'Zucchini',
    category: gemuese,
    origin: haushalt,
    cool: false,
    minKg: 0.5,
    maxKg: 5,
  },
  {
    title: 'Kartoffeln',
    category: gemuese,
    origin: grossmarkt,
    company: biohof,
    cool: false,
    minKg: 2,
    maxKg: 12,
  },
  {
    title: 'Brötchen vom Vortag',
    category: backwaren,
    origin: baeckerei,
    company: brotzeit,
    cool: false,
    allergens: 'Gluten',
    minKg: 1,
    maxKg: 8,
  },
  {
    title: 'Vollkornbrot',
    category: backwaren,
    origin: baeckerei,
    company: brotzeit,
    cool: false,
    allergens: 'Gluten',
    minKg: 1,
    maxKg: 6,
  },
  {
    title: 'Brezeln',
    category: backwaren,
    origin: baeckerei,
    company: brotzeit,
    cool: false,
    allergens: 'Gluten',
    minKg: 0.5,
    maxKg: 5,
  },
  {
    title: 'Croissants',
    category: backwaren,
    origin: baeckerei,
    company: brotzeit,
    cool: false,
    allergens: 'Gluten, Laktose',
    minKg: 0.5,
    maxKg: 4,
  },
  {
    title: 'Kuchenreste',
    category: backwaren,
    origin: gastronomie,
    company: morgenrot,
    cool: true,
    allergens: 'Gluten, Laktose, Ei',
    minKg: 0.5,
    maxKg: 4,
  },
  {
    title: 'Joghurt',
    category: milchprodukte,
    origin: supermarkt,
    company: frischemarkt,
    cool: true,
    allergens: 'Laktose',
    minKg: 0.5,
    maxKg: 4,
  },
  {
    title: 'Frische Milch',
    category: milchprodukte,
    origin: supermarkt,
    company: frischemarkt,
    cool: true,
    allergens: 'Laktose',
    minKg: 1,
    maxKg: 6,
  },
  {
    title: 'Schnittkäse',
    category: milchprodukte,
    origin: supermarkt,
    company: aslan,
    cool: true,
    allergens: 'Laktose',
    minKg: 0.5,
    maxKg: 3,
  },
  {
    title: 'Quark',
    category: milchprodukte,
    origin: supermarkt,
    company: frischemarkt,
    cool: true,
    allergens: 'Laktose',
    minKg: 0.5,
    maxKg: 3,
  },
  {
    title: 'Nudeln',
    category: trockenprodukte,
    origin: haushalt,
    cool: false,
    allergens: 'Gluten',
    minKg: 0.5,
    maxKg: 5,
  },
  {
    title: 'Reis',
    category: trockenprodukte,
    origin: haushalt,
    cool: false,
    minKg: 0.5,
    maxKg: 5,
  },
  {
    title: 'Rote Linsen',
    category: trockenprodukte,
    origin: supermarkt,
    company: aslan,
    cool: false,
    minKg: 0.5,
    maxKg: 4,
  },
  {
    title: 'Müsli',
    category: trockenprodukte,
    origin: haushalt,
    cool: false,
    allergens: 'Gluten, Nüsse',
    minKg: 0.5,
    maxKg: 4,
  },
  {
    title: 'Kichererbsen (Dose)',
    category: konserven,
    origin: supermarkt,
    company: aslan,
    cool: false,
    minKg: 0.5,
    maxKg: 6,
  },
  {
    title: 'Gehackte Tomaten (Dose)',
    category: konserven,
    origin: supermarkt,
    company: frischemarkt,
    cool: false,
    minKg: 0.5,
    maxKg: 6,
  },
  {
    title: 'Mais (Dose)',
    category: konserven,
    origin: haushalt,
    cool: false,
    minKg: 0.5,
    maxKg: 4,
  },
  {
    title: 'Apfelsaft',
    category: sonstiges,
    origin: gastronomie,
    company: zurLinde,
    cool: false,
    minKg: 1,
    maxKg: 8,
  },
  {
    title: 'Belegte Brötchen',
    category: sonstiges,
    origin: gastronomie,
    company: morgenrot,
    cool: true,
    allergens: 'Gluten',
    minKg: 0.5,
    maxKg: 3,
  },
  {
    title: 'Suppengrün-Paket',
    category: sonstiges,
    origin: gastronomie,
    company: zurLinde,
    cool: true,
    minKg: 0.5,
    maxKg: 3,
  },
  {
    title: 'Schokolade',
    category: sonstiges,
    origin: haushalt,
    cool: false,
    allergens: 'Laktose, Nüsse',
    minKg: 0.5,
    maxKg: 3,
  },
];

const commentPool = [
  'Noch original verpackt',
  'MHD heute erreicht',
  'Aus Überproduktion gerettet',
  'Bitte zeitnah abholen',
  'Frisch vom Marktstand',
  'Vom Wochenende übrig',
];

const HISTORY_WEEKS = 10;

const food: SeedData['food'] = [];
const checkins: SeedData['checkins'] = [];

for (const profile of fairteilerProfiles) {
  const originIds = new Set(profile.origins.map((origin) => origin.id));
  const categoryIds = new Set(
    profile.categories.map((category) => category.id),
  );
  const catalog = foodCatalog.filter(
    (item) =>
      originIds.has(item.origin.id) && categoryIds.has(item.category.id),
  );
  const total = profile.checkinsPerWeek * HISTORY_WEEKS;

  for (let i = 0; i < total; i++) {
    const item = pick(catalog);
    const createdAt = daysAgo(
      Math.floor(random() * HISTORY_WEEKS * 7),
      8 + Math.floor(random() * 13),
      Math.floor(random() * 60),
    );
    const foodId = generateId();

    food.push({
      id: foodId,
      title: item.title,
      originId: item.origin.id,
      categoryId: item.category.id,
      companyId: item.company?.id,
      company: item.company?.name,
      cool: item.cool,
      allergens: item.allergens,
      comment: random() < 0.25 ? pick(commentPool) : undefined,
      createdAt,
    });

    const shelfLifeDays = item.cool
      ? randomBetween(1, 4)
      : randomBetween(3, 14);
    checkins.push({
      id: generateId(),
      userId: pick(profile.contributors).id,
      fairteilerId: profile.fairteiler.id,
      foodId,
      quantity: Math.round(randomBetween(item.minKg, item.maxKg) * 10) / 10,
      shelfLife:
        item.cool || random() < 0.7
          ? new Date(createdAt.getTime() + shelfLifeDays * 24 * 60 * 60 * 1000)
          : undefined,
      createdAt,
    });
  }
}

export const demoSeedData: SeedData = {
  users,

  experienceLevels: [
    {
      id: generateId(),
      value: 'newcomer',
      name: 'Neuling',
      sortIndex: 0,
      icon: 'star',
    },
    {
      id: generateId(),
      value: 'experienced',
      name: 'Erfahren',
      sortIndex: 1,
      icon: 'graduated',
    },
    {
      id: generateId(),
      value: 'expert',
      name: 'Profi',
      sortIndex: 2,
      icon: 'rocket',
    },
  ],

  milestones: [
    { id: generateId(), quantity: 10 },
    { id: generateId(), quantity: 25 },
    { id: generateId(), quantity: 50 },
    { id: generateId(), quantity: 100 },
    { id: generateId(), quantity: 250 },
    { id: generateId(), quantity: 500 },
    { id: generateId(), quantity: 1000 },
  ],

  fairteiler,
  categories,
  origins,
  companies,

  accounts: [], // Populated in populateRelationships with the hashed DEMO_PASSWORD
  stepFlowProgress: [], // Populated in populateRelationships for onboarded users
  userPreferences: [], // Populated in populateRelationships for onboarded users

  fairteilerOrigins,
  fairteilerCategories,
  fairteilerCompanies,

  members,
  tags,
  food,
  checkins,
};
