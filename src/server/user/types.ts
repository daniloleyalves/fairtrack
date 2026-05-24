import {
  ExperienceLevel,
  StepFlowProgress,
  UserPreferences,
} from '../db/db-types';
import { GamificationElement } from '@/features/user/onboarding/onboarding-flow-types';

export interface OnboardingData {
  user: {
    id: string;
    isFirstLogin: boolean;
  };
  experienceLevels: ExperienceLevel[];
  gamificationElements: GamificationElement[];
  userPreferences: UserPreferences | null | undefined;
  stepFlowProgress: StepFlowProgress | null | undefined;
}
