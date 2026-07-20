/* eslint-disable */

import ValueBackground from './value_background.svg';
import FoodBag from './food_bag_illustration.svg';
import WalkingIllustration from './walking_illustration.svg';
import ArrivingIllustration from './arriving_illustration.svg';
import StatisticsIllustration from './statistics_illustration.svg';
import FooterPlantsLeft from './footer_plants_left.svg';
import FooterPlantsRight from './footer_plants_right.svg';
import LoginIllustration from './login_illustration.svg';
import SendInstructionsIllustration from './send_instructions_illustration.svg';
import ResetPasswordIllustration from './reset_password_illustration.svg';
import LandingTextBackground from './landing_text_background.svg';
import FAQIllustration from './faq_illustration.svg';
import noPageFoundIllustration from './404_illustration.svg';
import ProfileIllustration from './profile_illustration.svg';
import PreferencesIllustration from './preferences_illustration.svg';
import Bag from './bag.svg';
import Carrot from './carrot.svg';
import LeafPrimary from './leaf_primary.svg';
import LeafSecondary from './leaf_secondary.svg';
import Leaf2Primary from './leaf2_primary.svg';
import Mushrooms from './mushrooms.svg';
import Pepper from './pepper.svg';
import Reddish from './reddish.svg';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

export const Illustrations: Record<string, StaticImport> = {
  valueBackground: ValueBackground,
  foodBag: FoodBag,
  walkingIllustration: WalkingIllustration,
  arrivingIllustration: ArrivingIllustration,
  statisticsIllustration: StatisticsIllustration,
  footerPlantsLeft: FooterPlantsLeft,
  footerPlantsRight: FooterPlantsRight,
  loginIllustration: LoginIllustration,
  sendInstructionsIllustration: SendInstructionsIllustration,
  resetPasswordIllustration: ResetPasswordIllustration,
  landingTextBackground: LandingTextBackground,
  faqIllustration: FAQIllustration,
  noPageFoundIllustration: noPageFoundIllustration,
  profileIllustration: ProfileIllustration,
  preferencesIllustration: PreferencesIllustration,
  bag: Bag,
  carrot: Carrot,
  leafPrimary: LeafPrimary,
  leafSecondary: LeafSecondary,
  leaf2Primary: Leaf2Primary,
  mushrooms: Mushrooms,
  pepper: Pepper,
  reddish: Reddish,
} as const;

export type Illustrations = typeof Illustrations;
