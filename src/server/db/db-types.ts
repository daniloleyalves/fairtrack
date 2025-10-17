import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  checkin,
  company,
  experienceLevels,
  fairteilerTutorial,
  fairteilerTutorialStep,
  food,
  milestoneEvents,
  milestones,
  stepFlowProgress,
  tag,
  user,
  userPreferences,
} from './schema';
import { MemberRoles } from '@/lib/auth/auth-permissions';

export interface Fairteiler {
  id: string;
  name: string;
  thumbnail: string | null;
  address: string | null;
  website: string | null;
  geoLat: string;
  geoLng: string;
  geoLink: string | null;
  disabled: boolean;
  tags: Tag[];
  slug: string;
}

// export type DBMember = InferSelectModel<typeof member>;
export interface Member {
  id: string;
  user: User;
  role: MemberRoles;
  fairteilerId: string;
}

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null | undefined;
  isAnonymous: boolean;
  isFirstLogin: boolean;
}

export type UpdateUser = InferInsertModel<typeof user>;

export interface GenericItem {
  id: string;
  name: string;
  status?: 'active' | 'pending' | 'disabled';
}

export type Company = InferInsertModel<typeof company>;

export type Food = InferInsertModel<typeof food>;
export type Checkin = InferInsertModel<typeof checkin>;

export type FairteilerWithMembers = Fairteiler & {
  members: (Member & { user: User })[];
};

export type Tag = InferInsertModel<typeof tag>;

export interface vContribution {
  checkinId: string;
  contributionDate: string | Date;
  quantity: number;
  shelfLife: string | Date | null;
  categoryName: string | null;
  categoryImage: string | null;
  originName: string | null;
  companyName: string | null;
  foodTitle: string | null;
  foodCompany: string | null;
  foodCool: boolean | null;
  foodAllergens: string | null;
  foodComment: string | null;
  contributorId: string;
  contributorName: string | null;
  contributorImage: string | null;
  contributorEmail: string | null;
  fairteilerId: string;
  fairteilerName: string;
}

export interface ContributionVersionHistory {
  id: string;
  checkinId: string;
  fairteilerId: string;
  userId: string;
  authorName: string;
  authorEmail: string;
  prevValue: string;
  newValue: string;
  field: string;
  changeDate: string;
}

export type UserPreferences = InferSelectModel<typeof userPreferences>;
export type StepFlowProgress = InferSelectModel<typeof stepFlowProgress>;

// GAMIFICATION --------

export type ExperienceLevel = InferSelectModel<typeof experienceLevels>;
export type Milestone = InferSelectModel<typeof milestones>;
export type MilestoneEvent = InferSelectModel<typeof milestoneEvents>;

// TUTORIAL --------

export type FairteilerTutorial = InferInsertModel<typeof fairteilerTutorial>;
export type FairteilerTutorialStep = InferInsertModel<
  typeof fairteilerTutorialStep
>;
export type FairteilerTutorialWithSteps = FairteilerTutorial & {
  steps: FairteilerTutorialStep[];
};
