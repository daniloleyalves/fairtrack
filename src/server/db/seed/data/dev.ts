import type { SeedData } from '../utils/types';
import { generateId, createTimestamp } from '../utils/seed-helpers';

export const devSeedData: SeedData = {
  users: [
    {
      id: generateId(),
      name: 'John Doe',
      email: 'john.doe@example.com',
      emailVerified: true,
      image: undefined,
      createdAt: createTimestamp(30),
      updatedAt: createTimestamp(1),
      role: 'admin',
      banned: false,
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      secure: true,
      isFirstLogin: false,
    },
    {
      id: generateId(),
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      emailVerified: true,
      image: undefined,
      createdAt: createTimestamp(25),
      updatedAt: createTimestamp(2),
      username: 'janesmith',
      firstName: 'Jane',
      lastName: 'Smith',
      secure: true,
      isFirstLogin: false,
    },
    {
      id: generateId(),
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      emailVerified: true,
      createdAt: createTimestamp(20),
      updatedAt: createTimestamp(3),
      username: 'mikejohnson',
      firstName: 'Mike',
      lastName: 'Johnson',
      secure: true,
      isFirstLogin: true,
    },
    {
      id: generateId(),
      name: 'Deleted User',
      email: 'deleted.user@fairtrack.de',
      emailVerified: true,
      createdAt: createTimestamp(20),
      updatedAt: createTimestamp(20),
      username: 'deleteduser',
      firstName: 'Deleted',
      lastName: 'User',
      secure: true,
      isFirstLogin: false,
    },
  ],

  fairteiler: [
    {
      id: generateId(),
      name: 'Downtown Food Share',
      slug: 'downtown-food-share',
      logo: undefined,
      address: '123 Main St, Downtown',
      geoLink: 'https://maps.google.com/?q=123+Main+St+Downtown',
      geoLng: '13.4050',
      geoLat: '52.5200',
      website: 'https://downtown-foodshare.org',
      thumbnail:
        'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com/fairteiler_thumbnails/raupe_thumbnail-testing.jpg',
      disabled: false,
      createdAt: createTimestamp(15),
      metadata: JSON.stringify({ capacity: 50, openHours: '9-17' }),
    },
    {
      id: generateId(),
      name: 'Community Garden Share',
      slug: 'community-garden-share',
      address: '456 Garden Ave, Suburbs',
      geoLink: 'https://maps.google.com/?q=456+Garden+Ave+Suburbs',
      geoLng: '13.3777',
      geoLat: '52.5162',
      disabled: false,
      createdAt: createTimestamp(10),
      metadata: JSON.stringify({ capacity: 30, openHours: '8-20' }),
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
      createdAt: createTimestamp(20),
    },
    {
      id: generateId(),
      name: 'Backwaren',
      description: '',
      image:
        'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com/category_icons/icon_backwaren-salzig.png',
      status: 'active',
      createdAt: createTimestamp(20),
    },
    {
      id: generateId(),
      name: 'Milchprodukte',
      description: '',
      image:
        'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com/category_icons/icon_kuehlprodukte.png',
      status: 'active',
      createdAt: createTimestamp(20),
    },
    {
      id: generateId(),
      name: 'Gemüse',
      description: 'Fresh produce including  vegetables',
      image:
        'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com/category_icons/icon_gemuese.png',
      status: 'active',
      createdAt: createTimestamp(20),
    },
    {
      id: generateId(),
      name: 'Trockenprodukte',
      description: 'Noodles, Rice, etc.',
      image:
        'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com/category_icons/icon_trockenprodukte.png',
      status: 'active',
      createdAt: createTimestamp(20),
    },
    {
      id: generateId(),
      name: 'Sonstiges',
      description: 'misc.',
      image:
        'https://mmm5u4fjrhaoeehc.public.blob.vercel-storage.com/category_icons/icon_sonstiges.png',
      status: 'active',
      createdAt: createTimestamp(20),
    },
  ],

  origins: [
    {
      id: generateId(),
      name: 'Supermarkt',
      description: '',

      status: 'active',
      createdAt: createTimestamp(25),
    },
    {
      id: generateId(),
      name: 'Bäckerei',
      description: '',

      status: 'active',
      createdAt: createTimestamp(25),
    },
    {
      id: generateId(),
      name: 'Gastronomie',
      description: '',

      status: 'active',
      createdAt: createTimestamp(25),
    },
    {
      id: generateId(),
      name: 'Haushalt',
      description: '',

      status: 'active',
      createdAt: createTimestamp(25),
    },
    {
      id: generateId(),
      name: 'Wochen-/Großmarkt',
      description: 'Surplus food from retail grocery stores',

      status: 'active',
      createdAt: createTimestamp(25),
    },
    {
      id: generateId(),
      name: 'Sonstige',
      description: 'misc.',
      status: 'active',
      createdAt: createTimestamp(25),
    },
  ],

  companies: [
    {
      id: generateId(),
      name: 'Green Valley Farm',
      description: 'Organic farm specializing in seasonal vegetables',
      status: 'active',
      originId: '', // Will be set after origins are created
      createdAt: createTimestamp(20),
    },
    {
      id: generateId(),
      name: 'Fresh Market Co',
      description: 'Local grocery chain committed to reducing waste',

      status: 'active',
      originId: '', // Will be set after origins are created
      createdAt: createTimestamp(18),
    },
    {
      id: generateId(),
      name: 'Artisan Bakery',
      description: 'Traditional bakery with daily fresh bread',
      status: 'active',
      originId: '', // Will be set after origins are created
      createdAt: createTimestamp(15),
    },
  ],

  fairteilerOrigins: [], // Will be populated after fairteiler and origins are created
  fairteilerCategories: [], // Will be populated after fairteiler and categories are created
  fairteilerCompanies: [], // Will be populated after fairteiler and companies are created

  members: [], // Will be populated after users and fairteiler are created

  tags: [], // Will be populated after fairteiler are created

  food: [], // Will be populated after origins, categories, companies are created

  checkins: [], // Will be populated after users, fairteiler, and food are created
};
