import { GamificationElement } from '../onboarding/onboarding-flow-types';

export const gamificationElements: GamificationElement[] = [
  {
    id: 'streaks',
    name: 'Streak',
    description: 'Halte eine Streak und erhalte zusätzliche Belohnungen',
    active: true,
  },
  {
    id: 'quests',
    name: 'Abzeichen',
    description: 'Erhalte Abzeichen für die Teilnahme an Quests',
    active: false,
  },
  {
    id: 'ai_feedback',
    name: 'AI-Feedback',
    description:
      'Erhalte AI-gestütztes, Feedback zu deinen Lebensmittelabgaben',
    active: true,
  },
];
