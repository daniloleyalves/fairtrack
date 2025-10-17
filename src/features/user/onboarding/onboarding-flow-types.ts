import { ExperienceLevel, UserPreferences } from '@/server/db/db-types';

export interface OnboardingStepData {
  selectedLevel?: ExperienceLevel;
  selectedGamificationElements?: SelectedGamificationElement[];
  selectedPrferences?: UserPreferences[];
}

export interface OnboardingMetadata {
  stepStartTime: Date;
  source: 'web' | 'mobile';
  skipReason?: string;
  selectionTime?: number;
  userAgent?: string;
}

// Define proper interfaces for gamification elements
export interface GamificationElement {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface SelectedGamificationElement extends GamificationElement {
  enabled: boolean;
}
