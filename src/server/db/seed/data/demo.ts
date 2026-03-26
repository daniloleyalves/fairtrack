import type { SeedData } from '../utils/types';
import { generateId, createTimestamp } from '../utils/seed-helpers';
import bcrypt from 'bcrypt';

export const DEMO_PASSWORD = 'Demo1234';
export const DEMO_PASSWORD_HASH = bcrypt.hashSync(DEMO_PASSWORD, 10);

export const demoSeedData: SeedData = {
  users: [
    {
      id: generateId(),
      name: 'Demo Admin',
      email: 'demo.admin@fairtrack.com',
      emailVerified: true,
      image: undefined,
      createdAt: createTimestamp(60),
      updatedAt: createTimestamp(1),
      role: 'admin',
      username: 'demoadmin',
      firstName: 'Demo',
      lastName: 'Admin',
      secure: true,
      isFirstLogin: false,
    },
    {
      id: generateId(),
      name: 'Sarah Wilson',
      email: 'sarah.wilson@demo.com',
      emailVerified: true,
      image: undefined,
      createdAt: createTimestamp(45),
      updatedAt: createTimestamp(2),
      username: 'sarahwilson',
      firstName: 'Sarah',
      lastName: 'Wilson',
      secure: true,
      isFirstLogin: false,
    },
    {
      id: generateId(),
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@demo.com',
      emailVerified: true,
      image: undefined,
      createdAt: createTimestamp(20),
      updatedAt: createTimestamp(1),
      username: 'emmarodriguez',
      firstName: 'Emma',
      lastName: 'Rodriguez',
      secure: true,
      isFirstLogin: false,
    },
    {
      id: generateId(),
      name: 'Mitarbeitende',
      email: 'employee-1@stuttgart-mitte.local',
      emailVerified: true,
      image: undefined,
      createdAt: createTimestamp(20),
      updatedAt: createTimestamp(1),
      username: undefined,
      firstName: 'Mitarbeitende',
      lastName: 'stuttgart-mitte',
      secure: true,
      isFirstLogin: false,
    },
    {
      id: generateId(),
      name: 'Gastzugang',
      email: 'guest-1@stuttgart-mitte.local',
      emailVerified: true,
      image: undefined,
      createdAt: createTimestamp(10),
      updatedAt: createTimestamp(1),
      username: undefined,
      firstName: 'Gastzugang',
      lastName: 'stuttgart-mitte',
      secure: true,
      isFirstLogin: false,
    },
  ],

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

  fairteiler: [
    {
      id: generateId(),
      name: 'Stuttgart-Mitte',
      slug: 'stuttgart-mitte',
      logo: undefined,
      address: 'Königstraße 42, 70173 Stuttgart',
      geoLink: 'https://maps.google.com/?q=Königstraße+42+Stuttgart',
      geoLng: '9.1829',
      geoLat: '48.7758',
      website: undefined,
      thumbnail:
        'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com/fairteiler_thumbnails/raupe_thumbnail-testing.jpg',
      disabled: false,
      createdAt: createTimestamp(40),
      metadata: JSON.stringify({
        capacity: 100,
        openHours: '7-22',
        featured: true,
      }),
    },
    {
      id: generateId(),
      name: 'Bad Cannstatt',
      slug: 'bad-cannstatt',
      logo: undefined,
      address: 'Marktstraße 18, 70372 Stuttgart',
      geoLink: 'https://maps.google.com/?q=Marktstraße+18+Bad+Cannstatt',
      geoLng: '9.2166',
      geoLat: '48.8043',
      website: undefined,
      thumbnail: undefined,
      disabled: false,
      createdAt: createTimestamp(35),
      metadata: JSON.stringify({ capacity: 75, openHours: '8-20' }),
    },
    {
      id: generateId(),
      name: 'Vaihingen',
      slug: 'vaihingen',
      address: 'Hauptstraße 7, 70563 Stuttgart',
      geoLink: 'https://maps.google.com/?q=Hauptstraße+7+Stuttgart+Vaihingen',
      geoLng: '9.1067',
      geoLat: '48.7278',
      disabled: false,
      createdAt: createTimestamp(25),
      metadata: JSON.stringify({
        capacity: 40,
        openHours: '10-18',
      }),
    },
  ],

  categories: [
    {
      id: generateId(),
      name: 'Obst',
      description: '',
      image:
        'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com/category_icons/icon_obst.png',
      status: 'active',
      createdAt: createTimestamp(40),
    },
    {
      id: generateId(),
      name: 'Backwaren',
      description: '',
      image:
        'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com/category_icons/icon_backwaren-salzig.png',
      status: 'active',
      createdAt: createTimestamp(40),
    },
    {
      id: generateId(),
      name: 'Milchprodukte',
      description: '',
      image:
        'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com/category_icons/icon_kuehlprodukte.png',
      status: 'active',
      createdAt: createTimestamp(40),
    },
    {
      id: generateId(),
      name: 'Gemüse',
      description: '',
      image:
        'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com/category_icons/icon_gemuese.png',
      status: 'active',
      createdAt: createTimestamp(35),
    },
    {
      id: generateId(),
      name: 'Trockenprodukte',
      description: '',
      image:
        'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com/category_icons/icon_trockenprodukte.png',
      status: 'active',
      createdAt: createTimestamp(30),
    },
    {
      id: generateId(),
      name: 'Sonstiges',
      description: '',
      image:
        'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com/category_icons/icon_sonstiges.png',
      status: 'active',
      createdAt: createTimestamp(30),
    },
  ],

  origins: [
    {
      id: generateId(),
      name: 'Supermarkt',
      description: '',
      status: 'active',
      createdAt: createTimestamp(45),
    },
    {
      id: generateId(),
      name: 'Bäckerei',
      description: '',
      status: 'active',
      createdAt: createTimestamp(45),
    },
    {
      id: generateId(),
      name: 'Gastronomie',
      description: '',
      status: 'active',
      createdAt: createTimestamp(40),
    },
    {
      id: generateId(),
      name: 'Haushalt',
      description: '',
      status: 'active',
      createdAt: createTimestamp(35),
    },
    {
      id: generateId(),
      name: 'Wochen-/Großmarkt',
      description: '',
      status: 'active',
      createdAt: createTimestamp(30),
    },
    {
      id: generateId(),
      name: 'Sonstige',
      description: '',
      status: 'active',
      createdAt: createTimestamp(30),
    },
  ],

  companies: [
    {
      id: generateId(),
      name: 'Sunshine Organic Farm',
      description: 'Family-owned organic farm growing seasonal vegetables',
      image: undefined,
      status: 'active',
      originId: '', // Will be set after origins are created
      createdAt: createTimestamp(35),
    },
    {
      id: generateId(),
      name: 'Metro Fresh Markets',
      description: 'Regional supermarket chain with 15 locations',
      image: undefined,
      status: 'active',
      originId: '', // Will be set after origins are created
      createdAt: createTimestamp(30),
    },
    {
      id: generateId(),
      name: 'Golden Crust Bakery',
      description: 'Artisanal bakery specializing in sourdough and pastries',
      image: undefined,
      status: 'active',
      originId: '', // Will be set after origins are created
      createdAt: createTimestamp(25),
    },
    {
      id: generateId(),
      name: 'Bella Vista Restaurant',
      description: 'Italian restaurant committed to zero waste',
      status: 'active',
      originId: '', // Will be set after origins are created
      createdAt: createTimestamp(20),
    },
    {
      id: generateId(),
      name: 'Urban Harvest Co-op',
      description: 'Community-supported agriculture cooperative',
      status: 'active',
      originId: '', // Will be set after origins are created
      createdAt: createTimestamp(15),
    },
  ],

  accounts: [], // Will be populated in populateRelationships with DEMO_PASSWORD_HASH
  stepFlowProgress: [], // Will be populated for onboarded users
  userPreferences: [], // Will be populated for onboarded users

  fairteilerOrigins: [], // Will be populated after fairteiler and origins are created
  fairteilerCategories: [], // Will be populated after fairteiler and categories are created
  fairteilerCompanies: [], // Will be populated after fairteiler and companies are created

  members: [], // Will be populated after users and fairteiler are created

  tags: [], // Will be populated after fairteiler are created

  food: [], // Will be populated after origins, categories, companies are created

  checkins: [], // Will be populated after users, fairteiler, and food are created
};
