/* eslint-disable */

import * as schema from '../schema';
import { devSeedData } from './data/dev';
import { demoSeedData } from './data/demo';
import {
  getOptionsFromArgs,
  cleanDatabase,
  resetSequences,
  logProgress,
  logSuccess,
  logError,
  generateId,
  createTimestamp,
} from './utils/seed-helpers';
import type { SeedData } from './utils/types';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { Environment, getDatabaseURL } from '../drizzle';
dotenv.config({ path: '.vercel/.env.development.local' });

const getSeedData = (environment: Environment): SeedData => {
  switch (environment) {
    case 'development':
      return devSeedData;
    case 'demo':
      return demoSeedData;
    default:
      throw new Error(
        `Unknown environment: ${environment}. Supported environments: development, demo`,
      );
  }
};

const populateRelationships = (data: SeedData): SeedData => {
  // Create copies to avoid mutating original data
  const populatedData = structuredClone(data) as SeedData;

  // Set company origin references
  if (populatedData.companies.length > 0 && populatedData.origins.length > 0) {
    populatedData.companies.forEach((company, index) => {
      if (!company.originId) {
        // Distribute companies across origins
        const originIndex = index % populatedData.origins.length;
        company.originId = populatedData.origins[originIndex].id;
      }
    });
  }

  // fairteilerOrigins
  populatedData.fairteilerOrigins = populatedData.fairteiler.flatMap(
    (fairteiler) => {
      const shuffled = [...populatedData.origins].sort(
        () => Math.random() - 0.5,
      );
      return shuffled
        .slice(0, Math.min(3, populatedData.origins.length))
        .map((origin) => ({
          id: generateId(),
          fairteilerId: fairteiler.id,
          originId: origin.id,
          createdAt: createTimestamp(Math.floor(Math.random() * 10)),
        }));
    },
  );

  // fairteilerCategories
  populatedData.fairteilerCategories = populatedData.fairteiler.flatMap(
    (fairteiler) => {
      const shuffled = [...populatedData.categories].sort(
        () => Math.random() - 0.5,
      );
      return shuffled
        .slice(0, Math.min(4, populatedData.categories.length))
        .map((category) => ({
          id: generateId(),
          fairteilerId: fairteiler.id,
          categoryId: category.id,
          createdAt: createTimestamp(Math.floor(Math.random() * 10)),
        }));
    },
  );

  // fairteilerCompanies
  populatedData.fairteilerCompanies = populatedData.fairteiler.flatMap(
    (fairteiler) => {
      const shuffled = [...populatedData.companies].sort(
        () => Math.random() - 0.5,
      );
      return shuffled
        .slice(0, Math.min(3, populatedData.companies.length))
        .map((company) => ({
          id: generateId(),
          fairteilerId: fairteiler.id,
          companyId: company.id,
          createdAt: createTimestamp(Math.floor(Math.random() * 10)),
        }));
    },
  );

  // Create member relationships (users to fairteiler) - each user only in one fairteiler
  populatedData.members = (() => {
    const shuffledUsers = [...populatedData.users].sort(
      () => Math.random() - 0.5,
    );
    let userIndex = 0;

    return populatedData.fairteiler.flatMap((fairteiler, fairteilerIndex) => {
      const usersPerFairteiler = Math.ceil(
        shuffledUsers.length / populatedData.fairteiler.length,
      );
      const fairteilerUsers = shuffledUsers.slice(
        userIndex,
        userIndex + usersPerFairteiler,
      );
      userIndex += usersPerFairteiler;

      return fairteilerUsers.map((user, localUserIndex) => ({
        id: generateId(),
        organizationId: fairteiler.id,
        userId: user.id,
        role:
          fairteilerIndex === 0 && localUserIndex === 0
            ? ('owner' as const)
            : ('member' as const),
        createdAt: createTimestamp(Math.floor(Math.random() * 15)),
      }));
    });
  })();

  // Create tags for fairteiler
  if (populatedData.tags.length > 0) {
    populatedData.tags.forEach((tag, index) => {
      if (!tag.fairteilerId) {
        const fairteilerIndex = index % populatedData.fairteiler.length;
        tag.fairteilerId = populatedData.fairteiler[fairteilerIndex].id;
      }
    });
  }

  // Add more tags for demo environment
  if (populatedData.fairteiler.length > 0) {
    const additionalTags = ['Stuttgart', 'Berlin', 'Café'].map(
      (tagName, index) => ({
        id: generateId(),
        name: tagName,
        fairteilerId:
          populatedData.fairteiler[index % populatedData.fairteiler.length].id,
        createdAt: createTimestamp(Math.floor(Math.random() * 20)),
      }),
    );
    populatedData.tags.push(...additionalTags);
  }

  // Create food items
  if (populatedData.origins.length > 0 && populatedData.categories.length > 0) {
    const foodItems = [
      {
        title: 'Fresh Tomatoes',
        cool: true,
        allergens: undefined,
        company: 'Local Farm',
      },
      {
        title: 'Whole Wheat Bread',
        cool: false,
        allergens: 'gluten',
        company: 'Artisan Bakery',
      },
      {
        title: 'Organic Milk',
        cool: true,
        allergens: 'lactose',
        company: 'Dairy Co-op',
      },
      {
        title: 'Mixed Salad Greens',
        cool: true,
        allergens: undefined,
        company: 'Green Valley',
      },
      {
        title: 'Sourdough Rolls',
        cool: false,
        allergens: 'gluten',
        company: 'Golden Crust',
      },
      {
        title: 'Greek Yogurt',
        cool: true,
        allergens: 'lactose',
        company: 'Dairy Fresh',
      },
      {
        title: 'Seasonal Fruit Mix',
        cool: true,
        allergens: undefined,
        company: 'Orchard Direct',
      },
      {
        title: 'Pasta Primavera',
        cool: true,
        allergens: 'gluten',
        company: 'Bella Vista',
      },
    ];

    populatedData.food = foodItems.map((item, index) => ({
      id: generateId(),
      title: item.title,
      originId: populatedData.origins[index % populatedData.origins.length].id,
      categoryId:
        populatedData.categories[index % populatedData.categories.length].id,
      companyId:
        populatedData.companies.length > 0
          ? populatedData.companies[index % populatedData.companies.length].id
          : undefined,
      company: item.company,
      cool: item.cool,
      allergens: item.allergens,
      comment: `Fresh ${item.title.toLowerCase()} available for pickup`,
      createdAt: createTimestamp(Math.floor(Math.random() * 5)),
    }));
  }

  // Create checkins (contributions)
  if (
    populatedData.users.length > 0 &&
    populatedData.fairteiler.length > 0 &&
    populatedData.food.length > 0
  ) {
    populatedData.checkins = populatedData.food.map((food, index) => ({
      id: generateId(),
      userId: populatedData.users[index % populatedData.users.length].id,
      fairteilerId:
        populatedData.fairteiler[index % populatedData.fairteiler.length].id,
      foodId: food.id,
      quantity: Math.round((Math.random() * 5 + 0.5) * 10) / 10, // 0.5 to 5.5, rounded to 1 decimal
      shelfLife: food.cool
        ? new Date(Date.now() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000) // 1-8 days for cool items
        : new Date(Date.now() + (Math.random() * 14 + 3) * 24 * 60 * 60 * 1000), // 3-17 days for non-cool items
      createdAt: createTimestamp(Math.floor(Math.random() * 3)),
    }));
  }

  return populatedData;
};

const seedDatabase = async (
  data: SeedData,
  verbose = false,
  db: NeonHttpDatabase<typeof schema> & {
    $client: NeonQueryFunction<false, false>;
  },
) => {
  try {
    // Seed in dependency order
    logProgress('Seeding users...', verbose);
    if (data.users.length > 0) {
      await db.insert(schema.user).values(data.users);
      logSuccess(`✓ Seeded ${data.users.length} users`);
    }

    logProgress('Seeding fairteiler...', verbose);
    if (data.fairteiler.length > 0) {
      await db.insert(schema.fairteiler).values(data.fairteiler);
      logSuccess(`✓ Seeded ${data.fairteiler.length} fairteiler`);
    }

    logProgress('Seeding categories...', verbose);
    if (data.categories.length > 0) {
      await db.insert(schema.category).values(data.categories);
      logSuccess(`✓ Seeded ${data.categories.length} categories`);
    }

    logProgress('Seeding origins...', verbose);
    if (data.origins.length > 0) {
      await db.insert(schema.origin).values(data.origins);
      logSuccess(`✓ Seeded ${data.origins.length} origins`);
    }

    logProgress('Seeding companies...', verbose);
    if (data.companies.length > 0) {
      await db.insert(schema.company).values(data.companies);
      logSuccess(`✓ Seeded ${data.companies.length} companies`);
    }

    // Seed junction tables
    logProgress('Seeding fairteiler-origin relationships...', verbose);
    if (data.fairteilerOrigins.length > 0) {
      await db.insert(schema.fairteilerOrigin).values(data.fairteilerOrigins);
      logSuccess(
        `✓ Seeded ${data.fairteilerOrigins.length} fairteiler-origin relationships`,
      );
    }

    logProgress('Seeding fairteiler-category relationships...', verbose);
    if (data.fairteilerCategories.length > 0) {
      await db
        .insert(schema.fairteilerCategory)
        .values(data.fairteilerCategories);
      logSuccess(
        `✓ Seeded ${data.fairteilerCategories.length} fairteiler-category relationships`,
      );
    }

    logProgress('Seeding fairteiler-company relationships...', verbose);
    if (data.fairteilerCompanies.length > 0) {
      await db
        .insert(schema.fairteilerCompany)
        .values(data.fairteilerCompanies);
      logSuccess(
        `✓ Seeded ${data.fairteilerCompanies.length} fairteiler-company relationships`,
      );
    }

    logProgress('Seeding members...', verbose);
    if (data.members.length > 0) {
      await db.insert(schema.member).values(data.members);
      logSuccess(`✓ Seeded ${data.members.length} members`);
    }

    logProgress('Seeding tags...', verbose);
    if (data.tags.length > 0) {
      await db.insert(schema.tag).values(data.tags);
      logSuccess(`✓ Seeded ${data.tags.length} tags`);
    }

    logProgress('Seeding food items...', verbose);
    if (data.food.length > 0) {
      await db.insert(schema.food).values(data.food);
      logSuccess(`✓ Seeded ${data.food.length} food items`);
    }

    logProgress('Seeding checkins...', verbose);
    if (data.checkins.length > 0) {
      await db.insert(schema.checkin).values(data.checkins);
      logSuccess(`✓ Seeded ${data.checkins.length} checkins`);
    }
  } catch (error) {
    logError('Failed to seed database', error);
    throw error;
  }
};

const main = async () => {
  try {
    const options = getOptionsFromArgs();

    console.log(
      `🌱 Starting database operation for environment: ${options.environment}`,
    );

    const client = neon(getDatabaseURL(options.environment));
    const db = drizzle(client, { schema });

    if (options.clean) {
      await cleanDatabase(options.verbose, db);
      resetSequences(options.verbose, db);
      return;
    }

    const rawData = getSeedData(options.environment);
    const populatedData = populateRelationships(rawData);

    await seedDatabase(populatedData, options.verbose, db);

    logSuccess(
      `🎉 Database seeding completed successfully for environment: ${options.environment}`,
    );

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`Users: ${populatedData.users.length}`);
    console.log(`Fairteiler: ${populatedData.fairteiler.length}`);
    console.log(`Categories: ${populatedData.categories.length}`);
    console.log(`Origins: ${populatedData.origins.length}`);
    console.log(`Companies: ${populatedData.companies.length}`);
    console.log(`Members: ${populatedData.members.length}`);
    console.log(`Tags: ${populatedData.tags.length}`);
    console.log(`Food Items: ${populatedData.food.length}`);
    console.log(`Checkins: ${populatedData.checkins.length}`);
    console.log(
      `Junction Tables: ${populatedData.fairteilerOrigins.length + populatedData.fairteilerCategories.length + populatedData.fairteilerCompanies.length}`,
    );
  } catch (error) {
    logError('Database seeding failed', error);
    process.exit(1);
  }
};

// Run the seeding script
if (require.main === module) {
  main();
}
