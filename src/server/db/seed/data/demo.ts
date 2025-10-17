import type { SeedData } from '../utils/types';
import { generateId, createTimestamp } from '../utils/seed-helpers';

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
      name: 'David Chen',
      email: 'david.chen@demo.com',
      emailVerified: true,
      image: undefined,
      createdAt: createTimestamp(30),
      updatedAt: createTimestamp(3),
      username: 'davidchen',
      firstName: 'David',
      lastName: 'Chen',
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
  ],

  fairteiler: [
    {
      id: generateId(),
      name: 'Central Community Hub',
      slug: 'central-community-hub',
      logo: undefined,
      address: '789 Community Blvd, City Center',
      geoLink: 'https://maps.google.com/?q=789+Community+Blvd+City+Center',
      geoLng: '13.4050',
      geoLat: '52.5200',
      website: 'https://central-hub.demo.com',
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
      name: 'Riverside Food Network',
      slug: 'riverside-food-network',
      logo: undefined,
      address: '321 River St, Riverside District',
      geoLink: 'https://maps.google.com/?q=321+River+St+Riverside+District',
      geoLng: '13.3777',
      geoLat: '52.5162',
      website: 'https://riverside-network.demo.com',
      thumbnail: undefined,
      disabled: false,
      createdAt: createTimestamp(35),
      metadata: JSON.stringify({ capacity: 75, openHours: '8-20' }),
    },
    {
      id: generateId(),
      name: 'University Campus Share',
      slug: 'university-campus-share',
      address: '555 Campus Dr, University District',
      geoLink: 'https://maps.google.com/?q=555+Campus+Dr+University+District',
      geoLng: '13.4194',
      geoLat: '52.4582',
      disabled: false,
      createdAt: createTimestamp(25),
      metadata: JSON.stringify({
        capacity: 40,
        openHours: '10-18',
        studentOnly: false,
      }),
    },
  ],

  categories: [
    {
      id: generateId(),
      name: 'Fresh Produce',
      description: 'Seasonal fruits, vegetables, and herbs',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
      status: 'active',
      createdAt: createTimestamp(40),
    },
    {
      id: generateId(),
      name: 'Dairy & Eggs',
      description: 'Milk, cheese, yogurt, eggs and dairy alternatives',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200',
      status: 'active',
      createdAt: createTimestamp(40),
    },
    {
      id: generateId(),
      name: 'Bread & Pastries',
      description: 'Fresh bread, croissants, muffins and baked goods',
      image:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
      status: 'active',
      createdAt: createTimestamp(40),
    },
    {
      id: generateId(),
      name: 'Prepared Foods',
      description: 'Ready-to-eat meals and prepared dishes',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
      status: 'active',
      createdAt: createTimestamp(35),
    },
    {
      id: generateId(),
      name: 'Pantry Staples',
      description: 'Canned goods, grains, pasta and non-perishables',
      status: 'active',
      createdAt: createTimestamp(30),
    },
  ],

  origins: [
    {
      id: generateId(),
      name: 'Local Organic Farms',
      description: 'Certified organic farms within 50km radius',
      image:
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200',
      status: 'active',
      createdAt: createTimestamp(45),
    },
    {
      id: generateId(),
      name: 'Supermarket Partners',
      description: 'Major grocery chains and supermarkets',
      image:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
      status: 'active',
      createdAt: createTimestamp(45),
    },
    {
      id: generateId(),
      name: 'Restaurant Network',
      description: 'Restaurants, cafes and food service providers',
      image:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
      status: 'active',
      createdAt: createTimestamp(40),
    },
    {
      id: generateId(),
      name: 'Community Gardens',
      description: 'Local community and urban gardens',
      status: 'active',
      createdAt: createTimestamp(35),
    },
    {
      id: generateId(),
      name: 'Food Manufacturers',
      description: 'Food processing and manufacturing companies',
      status: 'active',
      createdAt: createTimestamp(30),
    },
  ],

  companies: [
    {
      id: generateId(),
      name: 'Sunshine Organic Farm',
      description: 'Family-owned organic farm growing seasonal vegetables',
      image:
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200',
      status: 'active',
      originId: '', // Will be set after origins are created
      createdAt: createTimestamp(35),
    },
    {
      id: generateId(),
      name: 'Metro Fresh Markets',
      description: 'Regional supermarket chain with 15 locations',
      image:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
      status: 'active',
      originId: '', // Will be set after origins are created
      createdAt: createTimestamp(30),
    },
    {
      id: generateId(),
      name: 'Golden Crust Bakery',
      description: 'Artisanal bakery specializing in sourdough and pastries',
      image:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
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

  fairteilerOrigins: [], // Will be populated after fairteiler and origins are created
  fairteilerCategories: [], // Will be populated after fairteiler and categories are created
  fairteilerCompanies: [], // Will be populated after fairteiler and companies are created

  members: [], // Will be populated after users and fairteiler are created

  tags: [], // Will be populated after fairteiler are created

  food: [], // Will be populated after origins, categories, companies are created

  checkins: [], // Will be populated after users, fairteiler, and food are created
};
