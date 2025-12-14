import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgSchema,
  pgTable,
  pgView,
  real,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const DELETED_USER_ID = 'GBmR1xyha3sVJ1H0WUx367FGhiGBo6lZ';

//  AUTH RELATED SCHEMA -----------

export const memberRoleEnum = pgEnum('member_role', [
  'owner',
  'member',
  'viewer',
  'guest',
  'employee',
  'disabled',
]);

export const authSchema = pgSchema('auth');

export const fairteiler = authSchema.table(
  'fairteiler',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    logo: text('logo'),
    address: text('address'),
    geoLink: text('geo_link'),
    geoLng: text('geo_lng').notNull(),
    geoLat: text('geo_lat').notNull(),
    website: text('website'),
    thumbnail: text('thumbnail'),
    disabled: boolean('disabled').notNull().default(false),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    metadata: text('metadata'),
  },
  (table) => [uniqueIndex('fairteiler_slug_idx').on(table.slug)],
);

export const fairteilerRelations = relations(fairteiler, ({ many }) => ({
  tags: many(tag),
  members: many(member),
  fairteilerOrigins: many(fairteilerOrigin),
  fairteilerCategory: many(fairteilerCategory),
  fairteilerCompany: many(fairteilerCompany),
  checkins: many(checkin),
}));

export const tag = authSchema.table(
  'tag',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text('name').notNull(),
    fairteilerId: text('fairteiler_id')
      .notNull()
      .references(() => fairteiler.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (table) => [index('tag_fairteiler_id_idx').on(table.fairteilerId)],
);

export const tagsRelations = relations(tag, ({ one }) => ({
  fairteiler: one(fairteiler, {
    fields: [tag.fairteilerId],
    references: [fairteiler.id],
  }),
}));

export const user = authSchema.table(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    role: text('role'),
    banned: boolean('banned'),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
    username: text('username').unique(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    phone: numeric('phone', { precision: 15, scale: 0 }),
    foodsharingId: numeric('foodsharing_id', { precision: 6, scale: 0 }),
    secure: boolean('secure').notNull().default(true),
    isFirstLogin: boolean('is_first_login').notNull().default(true),
    isAnonymous: boolean('is_anonymous').notNull().default(false),
    notificationsConsent: boolean('notifications_consent')
      .notNull()
      .default(false),
  },
  (table) => [uniqueIndex('user_email_idx').on(table.email)],
);

export const session = authSchema.table('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by'),
  activeOrganizationId: text('active_organization_id'),
});

export const account = authSchema.table(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
  },
  (table) => [uniqueIndex('account_user_id_idx').on(table.userId)],
);

export const verification = authSchema.table('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

export const jwks = authSchema.table('jwks', {
  id: text('id').primaryKey(),
  publicKey: text('public_key').notNull(),
  privateKey: text('private_key').notNull(),
  createdAt: timestamp('created_at').notNull(),
});

export const member = authSchema.table(
  'member',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => fairteiler.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').default('member').notNull(),
    createdAt: timestamp('created_at').notNull(),
  },
  (table) => [
    index('member_organization_id_idx').on(table.organizationId),
    uniqueIndex('member_user_id_idx').on(table.userId),
    uniqueIndex('member_organization_user_idx').on(
      table.organizationId,
      table.userId,
    ),
  ],
);

export const memberRelations = relations(member, ({ one }) => ({
  fairteiler: one(fairteiler, {
    fields: [member.organizationId],
    references: [fairteiler.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitation = authSchema.table('invitation', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => fairteiler.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role'),
  status: text('status').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  inviterId: text('inviter_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const formTableViewEnum = pgEnum('form_table_view', ['fast', 'wizard']);

export const userPreferences = authSchema.table(
  'user_preferences',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    formTableView: formTableViewEnum('form_table_view')
      .notNull()
      .default('wizard'),
    enableStreaks: boolean('enable_streaks').notNull().default(true),
    enableQuests: boolean('enable_quests').notNull().default(true),
    enableAIFeedback: boolean('enable_ai_feedback').notNull().default(true),
  },
  (table) => [uniqueIndex('user_preferences_user_id_idx').on(table.userId)],
);

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(user, {
      fields: [userPreferences.userId],
      references: [user.id],
    }),
  }),
);

// GAMIFICATION SCHEMA ---------

export const gamificationSchema = pgSchema('gamification');

// Levels
export const experienceLevels = gamificationSchema.table('experience_levels', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  value: text('value').notNull(),
  name: text('name').notNull(),
  sortIndex: integer('sort_index').notNull(),
  icon: text('icon').notNull(),
});

// Level Events
export const experiencLevelEvents = gamificationSchema.table(
  'experience_level_events',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    levelId: text('level_id')
      .notNull()
      .references(() => experienceLevels.id),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
);

export const experienceLevelEventsRelationships = relations(
  experiencLevelEvents,
  ({ one }) => ({
    experienceLevel: one(experienceLevels, {
      fields: [experiencLevelEvents.levelId],
      references: [experienceLevels.id],
    }),
    user: one(user, {
      fields: [experiencLevelEvents.userId],
      references: [user.id],
    }),
  }),
);

// Quests
export const quests = gamificationSchema.table('quests', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description').notNull(),
  goalQuantity: real('goal_quantity').notNull(),
  start: timestamp('start').notNull(),
  end: timestamp('end').notNull(),
  currentQuantity: real('current_quantity').notNull(),
});

// Quest Badge Events
export const questBadgeEvents = gamificationSchema.table('quest_badge_events', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  questId: text('quest_id')
    .notNull()
    .references(() => quests.id),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
});

export const questBadgeEventsRelationships = relations(
  questBadgeEvents,
  ({ one }) => ({
    quest: one(quests, {
      fields: [questBadgeEvents.questId],
      references: [quests.id],
    }),
  }),
);

// Milestones
export const milestones = gamificationSchema.table('milestones', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  quantity: real('quantity').notNull(),
});

// Milestone Events
export const milestoneEvents = gamificationSchema.table('milestone_events', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  milestoneId: text('milestone_id')
    .notNull()
    .references(() => milestones.id),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
});

export const milestoneEventsRelationships = relations(
  milestoneEvents,
  ({ one }) => ({
    milestone: one(milestones, {
      fields: [milestoneEvents.milestoneId],
      references: [milestones.id],
    }),
  }),
);

// Onboarding Steps
export const onboardingSteps = gamificationSchema.table('onboarding_steps', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  value: integer('value').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
});

// Onboarding Steps Events
export const onboardingStepsEvents = gamificationSchema.table(
  'onboarding_steps_events',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    onboardingStepId: text('onboarding_step_id')
      .notNull()
      .references(() => onboardingSteps.id),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
);

// STEP FLOW RELATED --------

export const stepFlowProgress = pgTable(
  'step_flow_progress',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    flowId: text('flow_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    currentStepIndex: integer('current_step_index').notNull().default(0),
    completedSteps: jsonb('completed_steps').notNull().default('[]'),
    skippedSteps: jsonb('skipped_steps').notNull().default('[]'),
    stepData: jsonb('step_data').notNull().default('{}'),
    progress: real('progress').notNull().default(0),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`now()`),
  },
  (table) => [uniqueIndex('user_flow_unique').on(table.userId, table.flowId)],
);

export const stepFlowProgressRelationships = relations(
  stepFlowProgress,
  ({ one }) => ({
    user: one(user, {
      fields: [stepFlowProgress.userId],
      references: [user.id],
    }),
  }),
);

// FEEDBACK RELATED SCHEMA ---------

export const feedback = pgTable('feedback', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  rating: smallint().notNull(),
  comment: text('content'),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
});

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(user, {
    fields: [feedback.userId],
    references: [user.id],
  }),
}));

export const feedbackCategoryEnum = pgEnum('feedback_category', [
  'bug',
  'feature',
  'improvement',
  'general',
]);

export const userFeedback = pgTable('user_feedback', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  fairteilerId: text('fairteiler_id').references(() => fairteiler.id, {
    onDelete: 'set null',
  }),
  category: feedbackCategoryEnum('category').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
});

export const userFeedbackRelations = relations(userFeedback, ({ one }) => ({
  user: one(user, {
    fields: [userFeedback.userId],
    references: [user.id],
  }),
  fairteiler: one(fairteiler, {
    fields: [userFeedback.fairteilerId],
    references: [fairteiler.id],
  }),
}));

// TUTORIAL RELATED SCHEMA -----------

export const fairteilerTutorial = pgTable(
  'fairteiler_tutorial',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    fairteilerId: text('fairteiler_id')
      .notNull()
      .references(() => fairteiler.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('fairteiler_tutorial_fairteiler_id_idx').on(table.fairteilerId),
    uniqueIndex('fairteiler_tutorial_unique').on(table.fairteilerId),
  ],
);

export const fairteilerTutorialStep = pgTable(
  'fairteiler_tutorial_step',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    tutorialId: text('tutorial_id')
      .notNull()
      .references(() => fairteilerTutorial.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    media: text('media'),
    sortIndex: integer('sort_index').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('fairteiler_tutorial_step_tutorial_id_idx').on(table.tutorialId),
    uniqueIndex('tutorial_step_order_unique').on(
      table.tutorialId,
      table.sortIndex,
    ),
  ],
);

export const fairteilerTutorialRelations = relations(
  fairteilerTutorial,
  ({ one, many }) => ({
    fairteiler: one(fairteiler, {
      fields: [fairteilerTutorial.fairteilerId],
      references: [fairteiler.id],
    }),
    steps: many(fairteilerTutorialStep),
  }),
);

export const fairteilerTutorialStepRelations = relations(
  fairteilerTutorialStep,
  ({ one }) => ({
    tutorial: one(fairteilerTutorial, {
      fields: [fairteilerTutorialStep.tutorialId],
      references: [fairteilerTutorial.id],
    }),
  }),
);

//  CONTRIBUTION RELATED SCHEMA -----------

export const formOptionStatus = pgEnum('form_option_status', [
  'active',
  'pending',
  'disabled',
]);

// ----

export const company = pgTable(
  'company',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text('name').notNull(),
    description: text('description'),
    image: text('image'),
    attachment: text('attachment'),
    status: formOptionStatus('status').default('pending').notNull(),
    originId: text('origin_id').references(() => origin.id),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (table) => [index('company_origin_id_idx').on(table.originId)],
);

export const companyRelations = relations(company, ({ many, one }) => ({
  origin: one(origin, {
    fields: [company.originId],
    references: [origin.id],
  }),
  fairteilerCompany: many(fairteilerCompany),
}));

// ----

export const origin = pgTable('origin', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  status: formOptionStatus('status').default('pending').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
});

export const originRelations = relations(origin, ({ many }) => ({
  company: many(company),
  fairteilerOrigin: many(fairteilerOrigin),
}));

// ----

export const category = pgTable('category', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  status: formOptionStatus('status').default('pending').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
});

export const categoryRelations = relations(category, ({ many }) => ({
  fairteilerCategory: many(fairteilerCategory),
}));

// ----

export const fairteilerOrigin = pgTable(
  'fairteiler_origin',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    fairteilerId: text('fairteiler_id')
      .notNull()
      .references(() => fairteiler.id, { onDelete: 'cascade' }),
    originId: text('origin_id')
      .notNull()
      .references(() => origin.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('fairteiler_origin_fairteiler_id_idx').on(table.fairteilerId),
    uniqueIndex('unique_fairteiler_origin_idx').on(
      table.fairteilerId,
      table.originId,
    ),
  ],
);

export const fairteilerOriginRelations = relations(
  fairteilerOrigin,
  ({ one }) => ({
    fairteiler: one(fairteiler, {
      fields: [fairteilerOrigin.fairteilerId],
      references: [fairteiler.id],
    }),
    origin: one(origin, {
      fields: [fairteilerOrigin.originId],
      references: [origin.id],
    }),
  }),
);

// ----

export const fairteilerCategory = pgTable(
  'fairteiler_category',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    fairteilerId: text('fairteiler_id')
      .notNull()
      .references(() => fairteiler.id, { onDelete: 'cascade' }),
    categoryId: text('category_id')
      .notNull()
      .references(() => category.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('fairteiler_category_fairteiler_id_idx').on(table.fairteilerId),
    uniqueIndex('unique_fairteiler_category_idx').on(
      table.fairteilerId,
      table.categoryId,
    ),
  ],
);

export const fairteilerCategoryRelations = relations(
  fairteilerCategory,
  ({ one }) => ({
    fairteiler: one(fairteiler, {
      fields: [fairteilerCategory.fairteilerId],
      references: [fairteiler.id],
    }),
    category: one(category, {
      fields: [fairteilerCategory.categoryId],
      references: [category.id],
    }),
  }),
);

// ----

export const fairteilerCompany = pgTable(
  'fairteiler_company',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    fairteilerId: text('fairteiler_id')
      .notNull()
      .references(() => fairteiler.id, { onDelete: 'cascade' }),
    companyId: text('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('fairteiler_company_fairteiler_id_idx').on(table.fairteilerId),
    uniqueIndex('unique_fairteiler_company_idx').on(
      table.fairteilerId,
      table.companyId,
    ),
  ],
);

export const fairteilerCompanyRelations = relations(
  fairteilerCompany,
  ({ one }) => ({
    fairteiler: one(fairteiler, {
      fields: [fairteilerCompany.fairteilerId],
      references: [fairteiler.id],
    }),
    company: one(company, {
      fields: [fairteilerCompany.companyId],
      references: [company.id],
    }),
  }),
);

// CONTRIBUTION RELATED -------------------------------------

export const food = pgTable(
  'food',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: text('title').notNull(),
    originId: text('origin_id')
      .notNull()
      .references(() => origin.id, { onDelete: 'cascade' }),
    categoryId: text('category_id')
      .notNull()
      .references(() => category.id, { onDelete: 'cascade' }),
    companyId: text('company_id').references(() => company.id, {
      onDelete: 'set null',
    }),
    company: text('company'),
    cool: boolean('cool').notNull(),
    allergens: text('allergens'),
    comment: text('comment'),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('food_origin_id_idx').on(table.originId),
    index('food_category_id_idx').on(table.categoryId),
    index('food_company_id_idx').on(table.companyId),
  ],
);

export const foodRelations = relations(food, ({ one, many }) => ({
  origin: one(origin, {
    fields: [food.originId],
    references: [origin.id],
  }),
  category: one(category, {
    fields: [food.categoryId],
    references: [category.id],
  }),
  company: one(company, {
    fields: [food.companyId],
    references: [company.id],
  }),
  checkins: many(checkin),
}));

export const checkin = pgTable(
  'checkin',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .default(DELETED_USER_ID)
      .references(() => user.id, { onDelete: 'set default' }),
    fairteilerId: text('fairteiler_id')
      .notNull()
      .default(DELETED_USER_ID)
      .references(() => fairteiler.id, { onDelete: 'set default' }),
    foodId: text('food_id')
      .notNull()
      .references(() => food.id, { onDelete: 'cascade' }),
    quantity: real('quantity').notNull(),
    shelfLife: timestamp('shelf_life', { withTimezone: true }),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('checkin_user_id_idx').on(table.userId),
    index('checkin_fairteiler_id_idx').on(table.fairteilerId),
    uniqueIndex('checkin_food_id_idx').on(table.foodId),
  ],
);

export const checkinRelations = relations(checkin, ({ one }) => ({
  user: one(user, {
    fields: [checkin.userId],
    references: [user.id],
  }),
  fairteiler: one(fairteiler, {
    fields: [checkin.fairteilerId],
    references: [fairteiler.id],
  }),
  food: one(food, {
    fields: [checkin.foodId],
    references: [food.id],
  }),
}));

export const contributionVersionHistory = pgTable(
  'contribution_version_history',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    checkinId: text('checkin_id')
      .notNull()
      .references(() => checkin.id, { onDelete: 'cascade' }),
    fairteilerId: text('fairteiler_id')
      .notNull()
      .references(() => fairteiler.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .default(DELETED_USER_ID)
      .references(() => user.id, { onDelete: 'set default' }),
    prevValue: text('prev_value').notNull(),
    newValue: text('new_value').notNull(),
    field: text('field').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
);

export const contributionVersionHistoryRelations = relations(
  contributionVersionHistory,
  ({ one }) => ({
    checkin: one(checkin, {
      fields: [contributionVersionHistory.checkinId],
      references: [checkin.id],
    }),
    fairteiler: one(fairteiler, {
      fields: [contributionVersionHistory.fairteilerId],
      references: [fairteiler.id],
    }),
    user: one(user, {
      fields: [contributionVersionHistory.userId],
      references: [user.id],
    }),
  }),
);

export const vContributions = pgView('v_contributions', {
  checkinId: text('checkin_id').notNull(),
  fairteilerId: text('fairteiler_id').notNull(),
  contributionDate: timestamp('contribution_date').notNull(),
  userId: text('user_id').notNull(),
  quantity: real('quantity').notNull(),
  shelfLife: timestamp('shelf_life', { withTimezone: true }),
  foodId: text('food_id'),
  foodTitle: text('food_title'),
  foodCool: boolean('food_cool'),
  foodAllergens: text('food_allergens'),
  foodComment: text('food_comment'),
  foodCompany: text('food_company'),

  userName: text('user_name'),
  userEmail: text('user_email'),
  userImage: text('user_image'),
  userIsAnonymous: boolean('user_is_anonymous'),

  fairteilerName: text('fairteiler_name').notNull(),

  categoryId: text('category_id'),
  categoryName: text('category_name'),
  categoryImage: text('category_image'),

  originId: text('origin_id'),
  originName: text('origin_name'),

  companyId: text('company_id'),
  companyName: text('company_name'),
}).as(sql`
    SELECT
        c.id AS checkin_id,
        c.fairteiler_id AS fairteiler_id,
        c.created_at AS contribution_date,
        c.user_id AS user_id,
        c.quantity AS quantity,
        c.shelf_life AS shelf_life,
        f.id AS food_id,
        f.title AS food_title,
        f.cool AS food_cool,
        f.allergens AS food_allergens,
        f.comment AS food_comment,
        f.company AS food_company,
        u.name AS user_name,
        u.email AS user_email,
        u.image AS user_image,
        u.is_anonymous AS user_is_anonymous,
        ft.name AS fairteiler_name,
        cat.id AS category_id,
        cat.name AS category_name,
        cat.image AS category_image,
        o.id AS origin_id,
        o.name AS origin_name,
        comp.id AS company_id,
        comp.name AS company_name
    FROM
        "checkin" c 
    LEFT JOIN
        auth."user" u ON c.user_id = u.id 
    LEFT JOIN
        auth.fairteiler ft ON c.fairteiler_id = ft.id
    LEFT JOIN
        "food" f ON c.food_id = f.id 
    LEFT JOIN
        "category" cat ON f.category_id = cat.id
    LEFT JOIN
        "origin" o ON f.origin_id = o.id 
    LEFT JOIN
        "company" comp ON f.company_id = comp.id
`);
