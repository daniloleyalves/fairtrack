import { Environment } from '../../drizzle';

export interface SeedData {
  users: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
    role?: string;
    banned?: boolean;
    banReason?: string;
    banExpires?: Date;
    username?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    foodsharingId?: string;
    secure: boolean;
    isFirstLogin: boolean;
  }[];
  fairteiler: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    address?: string;
    geoLink?: string;
    geoLng: string;
    geoLat: string;
    website?: string;
    thumbnail?: string;
    disabled: boolean;
    createdAt: Date;
    metadata?: string;
  }[];
  categories: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    status: 'active' | 'pending' | 'disabled';
    createdAt: Date;
  }[];
  origins: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    status: 'active' | 'pending' | 'disabled';
    createdAt: Date;
  }[];
  companies: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    attachment?: string;
    status: 'active' | 'pending' | 'disabled';
    originId?: string;
    createdAt: Date;
  }[];
  fairteilerOrigins: {
    id: string;
    fairteilerId: string;
    originId: string;
    createdAt: Date;
  }[];
  fairteilerCategories: {
    id: string;
    fairteilerId: string;
    categoryId: string;
    createdAt: Date;
  }[];
  fairteilerCompanies: {
    id: string;
    fairteilerId: string;
    companyId: string;
    createdAt: Date;
  }[];
  accounts?: {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  experienceLevels?: {
    id: string;
    value: string;
    name: string;
    sortIndex: number;
    icon: string;
  }[];
  milestones?: {
    id: string;
    quantity: number;
  }[];
  stepFlowProgress?: {
    id: string;
    flowId: string;
    userId: string;
    currentStepIndex: number;
    completedSteps: string[];
    skippedSteps: string[];
    stepData: Record<string, unknown>;
    progress: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
  userPreferences?: {
    id: string;
    userId: string;
    formTableView: 'fast' | 'wizard';
    enableStreaks: boolean;
    enableQuests: boolean;
    enableAIFeedback: boolean;
  }[];
  members: {
    id: string;
    organizationId: string;
    userId: string;
    role: 'owner' | 'member' | 'viewer' | 'guest' | 'employee' | 'disabled';
    createdAt: Date;
  }[];
  tags: {
    id: string;
    name: string;
    fairteilerId: string;
    createdAt: Date;
  }[];
  food: {
    id: string;
    title: string;
    originId: string;
    categoryId: string;
    companyId?: string | null;
    company?: string | null;
    cool: boolean;
    allergens?: string | null;
    comment?: string | null;
    createdAt: Date;
  }[];
  checkins: {
    id: string;
    userId: string;
    fairteilerId: string;
    foodId: string;
    quantity: number;
    shelfLife?: Date;
    createdAt: Date;
  }[];
}

export interface SeedOptions {
  environment: Environment;
  clean?: boolean;
  verbose?: boolean;
}
