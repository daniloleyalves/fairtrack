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
import Beetroot from './beetroot.svg';
import Carrot from './carrot.svg';
import FairtrackBag from './fairtrack_bag.svg';
import Garlic from './garlic.svg';
import Mushroom1 from './mushroom1.svg';
import Mushroom2 from './mushroom2.svg';
import Mushroom3 from './mushroom3.svg';
import Mushroom4 from './mushroom4.svg';
import Onion from './onion.svg';
import Pepper2 from './pepper2.svg';
import LeafPrimary from './leaf_primary.svg';
import LeafSecondary from './leaf_secondary.svg';
import Leaf2Primary from './leaf2_primary.svg';
import Mushrooms from './mushrooms.svg';
import Pepper from './pepper.svg';
import Reddish from './reddish.svg';
import Salad from './salad.svg';
import Tomato from './tomato.svg';
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
  beetroot: Beetroot,
  carrot: Carrot,
  fairtrackBag: FairtrackBag,
  garlic: Garlic,
  mushroom1: Mushroom1,
  mushroom2: Mushroom2,
  mushroom3: Mushroom3,
  mushroom4: Mushroom4,
  onion: Onion,
  pepper2: Pepper2,
  leafPrimary: LeafPrimary,
  leafSecondary: LeafSecondary,
  leaf2Primary: Leaf2Primary,
  mushrooms: Mushrooms,
  pepper: Pepper,
  reddish: Reddish,
  salad: Salad,
  tomato: Tomato,
} as const;

export type Illustrations = typeof Illustrations;
