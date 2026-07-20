export type PointerKind = 'arrow' | 'touch';

export interface TourStep {
  id: string;
  label: string;
  duration: number;
  camera: { x: number; y: number; scale: number };
  cursor: { xs: number[]; ys: number[]; times: number[] };
  clicks: { x: number; y: number; t: number }[];
}

export interface TourPersona {
  id: 'user' | 'fairteiler';
  label: string;
  pointer: PointerKind;
  offsets: number[];
  screenY: number;
  steps: TourStep[];
}

export const TOUR_PERSONAS: TourPersona[] = [
  {
    id: 'user',
    label: 'Als Foodsaver',
    pointer: 'touch',
    offsets: [0, 460, 920, 1380],
    screenY: 10,
    steps: [
      {
        id: 'user-dashboard',
        label: 'Dashboard',
        duration: 5.5,
        camera: { x: 150, y: 320, scale: 0.92 },
        cursor: {
          xs: [150, 150, 244, 244, 93, 93],
          ys: [700, 430, 395, 395, 590, 590],
          times: [0, 1.1, 2.0, 3.2, 4.3, 5.5],
        },
        clicks: [{ x: 93, y: 590, t: 4.7 }],
      },
      {
        id: 'user-finder',
        label: 'Fairteiler finden',
        duration: 6.5,
        camera: { x: 610, y: 330, scale: 0.95 },
        cursor: {
          xs: [93, 560, 580, 580, 610, 610],
          ys: [590, 400, 430, 430, 380, 380],
          times: [0, 1.2, 2.5, 3.4, 4.6, 6.5],
        },
        clicks: [
          { x: 580, y: 430, t: 2.8 },
          { x: 610, y: 380, t: 5.7 },
        ],
      },
      {
        id: 'user-form',
        label: 'Beitrag erfassen',
        duration: 12,
        camera: { x: 1070, y: 330, scale: 1.02 },
        cursor: {
          xs: [610, 1000, 1009, 1009, 1009, 1009, 1143, 1143, 1126, 1140, 1140],
          ys: [380, 350, 240, 240, 266, 240, 318, 318, 397, 494, 494],
          times: [0, 1.0, 1.4, 3.2, 3.9, 6.2, 7.4, 8.6, 9.2, 10.4, 12],
        },
        clicks: [
          { x: 1009, y: 240, t: 1.7 },
          { x: 1009, y: 266, t: 4.1 },
          { x: 1009, y: 240, t: 6.6 },
          { x: 1143, y: 318, t: 7.7 },
          { x: 1143, y: 318, t: 8.4 },
          { x: 1126, y: 397, t: 9.3 },
          { x: 1140, y: 494, t: 10.9 },
        ],
      },
      {
        id: 'user-success',
        label: 'Geschafft!',
        duration: 5,
        camera: { x: 1530, y: 334, scale: 1.05 },
        cursor: {
          xs: [1140, 1470, 1530, 1530, 1530, 1530],
          ys: [494, 420, 494, 494, 335, 335],
          times: [0, 1.5, 2.4, 4.0, 4.6, 5],
        },
        clicks: [{ x: 1530, y: 335, t: 4.8 }],
      },
    ],
  },
  {
    id: 'fairteiler',
    label: 'Als Fairteiler',
    pointer: 'arrow',
    offsets: [0, 1100, 2200, 3300],
    screenY: 40,
    steps: [
      {
        id: 'ft-dashboard',
        label: 'Dashboard',
        duration: 6,
        camera: { x: 450, y: 320, scale: 1.08 },
        cursor: {
          xs: [980, 560, 540, 100, 100],
          ys: [660, 340, 360, 192, 192],
          times: [0, 1.4, 2.4, 4.4, 6],
        },
        clicks: [{ x: 100, y: 192, t: 5.0 }],
      },
      {
        id: 'ft-form',
        label: 'Retteformular',
        duration: 8,
        camera: { x: 1550, y: 320, scale: 1.08 },
        cursor: {
          xs: [100, 1840, 1845, 1650, 1415, 1575, 1725, 1840, 1920, 1920],
          ys: [192, 107, 180, 420, 245, 245, 245, 245, 528, 528],
          times: [0, 1.3, 2.5, 3.6, 4.5, 5.2, 5.8, 6.4, 7.2, 8],
        },
        clicks: [
          { x: 1840, y: 107, t: 1.5 },
          { x: 1845, y: 180, t: 2.7 },
          { x: 1650, y: 420, t: 3.8 },
          { x: 1415, y: 245, t: 4.7 },
          { x: 1575, y: 245, t: 5.3 },
          { x: 1725, y: 245, t: 5.9 },
          { x: 1840, y: 245, t: 6.5 },
          { x: 1920, y: 528, t: 7.4 },
        ],
      },
      {
        id: 'ft-success',
        label: 'Bestätigung',
        duration: 5,
        camera: { x: 2650, y: 320, scale: 1.08 },
        cursor: {
          xs: [1920, 2560, 2650, 2654, 2650],
          ys: [528, 420, 374, 380, 374],
          times: [0, 1.4, 2.4, 3.5, 5],
        },
        clicks: [],
      },
      {
        id: 'ft-stats',
        label: 'Statistiken',
        duration: 8.5,
        camera: { x: 3750, y: 320, scale: 1.08 },
        cursor: {
          xs: [2650, 3600, 3750, 3750, 3768, 3768],
          ys: [374, 420, 561, 561, 202, 202],
          times: [0, 1.6, 3.0, 4.4, 5.2, 8.5],
        },
        clicks: [{ x: 3768, y: 202, t: 5.4 }],
      },
    ],
  },
];
