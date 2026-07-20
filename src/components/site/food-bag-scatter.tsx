'use client';

import { Illustrations } from '@/lib/assets/illustrations';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import Image from 'next/image';
import { useRef } from 'react';

/** Bag-mouth the packed bundle sits in and the petals radiate from. */
const CENTER = { left: 50, top: 60 };

interface Packed {
  left: number;
  top: number;
  rotate: number;
  scale: number;
}

interface ItemSpec {
  src: (typeof Illustrations)[string];
  width: number;
  final: { left: number; top: number; rotate: number };
  packed: Packed;
  window: [number, number];
}

/**
 * A petal of the bloom: placed on a polar fan around CENTER. `angle` is
 * degrees from straight up (negative = left, +/-45 is the cone edge),
 * `radius` the flight distance in container %. Items stay upright, taking
 * only a mild lean from their fan angle so they never lie sideways.
 */
const LEAN = 0.35;
const petal = (
  src: (typeof Illustrations)[string],
  width: number,
  angle: number,
  radius: number,
  jitter: number,
  packed: Packed,
  window: [number, number],
): ItemSpec => {
  const rad = (angle * Math.PI) / 180;
  return {
    src,
    width,
    final: {
      left: CENTER.left + radius * Math.sin(rad),
      top: CENTER.top - radius * Math.cos(rad),
      rotate: angle * LEAN + jitter,
    },
    packed,
    window,
  };
};

const ITEMS: ItemSpec[] = [
  // big petals, packed as an upright bouquet peeking out of the bag
  petal(
    Illustrations.salad,
    30,
    -45,
    45,
    0,
    { left: 45, top: 56, rotate: -6, scale: 0.35 },
    [0.12, 0.88],
  ),
  petal(
    Illustrations.carrot,
    26,
    -30,
    44,
    0,
    { left: 47, top: 54, rotate: -4, scale: 0.35 },
    [0.15, 0.9],
  ),
  petal(
    Illustrations.reddish,
    18,
    -12,
    45,
    0,
    { left: 49, top: 55, rotate: -2, scale: 0.35 },
    [0.18, 0.92],
  ),
  petal(
    Illustrations.garlic,
    13,
    2,
    47,
    0,
    { left: 51, top: 54, rotate: 0, scale: 0.35 },
    [0.21, 0.94],
  ),
  petal(
    Illustrations.onion,
    21,
    18,
    44,
    0,
    { left: 53, top: 54, rotate: 3, scale: 0.35 },
    [0.24, 0.96],
  ),
  petal(
    Illustrations.beetroot,
    27,
    38,
    42,
    0,
    { left: 55, top: 56, rotate: 6, scale: 0.35 },
    [0.27, 0.98],
  ),
  // small fillers on an inner ring
  petal(
    Illustrations.tomato,
    9,
    -38,
    26,
    -8,
    { left: 46, top: 59, rotate: -6, scale: 0.5 },
    [0.3, 0.95],
  ),
  petal(
    Illustrations.mushroom2,
    8,
    -44,
    33,
    20,
    { left: 45, top: 61, rotate: 8, scale: 0.5 },
    [0.33, 0.97],
  ),
  petal(
    Illustrations.mushroom1,
    8,
    -20,
    30,
    -15,
    { left: 47, top: 60, rotate: -8, scale: 0.5 },
    [0.31, 0.96],
  ),
  petal(
    Illustrations.mushroom4,
    7,
    10,
    28,
    10,
    { left: 53, top: 60, rotate: 6, scale: 0.5 },
    [0.32, 0.97],
  ),
  petal(
    Illustrations.pepper2,
    11,
    30,
    27,
    6,
    { left: 54, top: 59, rotate: 5, scale: 0.5 },
    [0.3, 0.95],
  ),
  petal(
    Illustrations.mushroom3,
    8,
    44,
    30,
    -20,
    { left: 55, top: 61, rotate: -8, scale: 0.5 },
    [0.34, 0.98],
  ),
  // loose leaves drifting out last, with chaotic spin
  petal(
    Illustrations.leafPrimary,
    6,
    -45,
    56,
    -25,
    { left: 48, top: 58, rotate: -20, scale: 0.4 },
    [0.38, 1],
  ),
  petal(
    Illustrations.leaf2Primary,
    5,
    45,
    54,
    30,
    { left: 52, top: 58, rotate: 20, scale: 0.4 },
    [0.42, 1],
  ),
  petal(
    Illustrations.leafSecondary,
    7,
    0,
    31,
    50,
    { left: 50, top: 57, rotate: 30, scale: 0.4 },
    [0.4, 1],
  ),
];

/**
 * The FairTrack bag with the illustration's vegetables packed inside; on
 * scroll they bloom out of the bag in a 90-degree upward fan, long items
 * keeping their roots pointed at the bag mouth.
 */
export function FoodBagScatter({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end 0.85'],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 20 });

  return (
    <div
      ref={containerRef}
      className={`relative aspect-square ${className ?? ''}`}
    >
      {ITEMS.map((item, i) => (
        <ScatterItem
          key={i}
          item={item}
          progress={progress}
          reducedMotion={!!reducedMotion}
        />
      ))}
      <Image
        src={Illustrations.fairtrackBag}
        alt=''
        aria-hidden
        className='absolute bottom-0 left-1/2 z-10 w-[30%] -translate-x-1/2'
      />
    </div>
  );
}

function ScatterItem({
  item,
  progress,
  reducedMotion,
}: {
  item: ItemSpec;
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const { final, packed, window: w } = item;
  // Fountain arc: rise straight out of the bag mouth first, then swing
  // outward to the fan position while the outward tilt develops.
  const steps = [w[0], w[0] + 0.55 * (w[1] - w[0]), w[1]];
  const midLeft = packed.left + 0.25 * (final.left - packed.left);
  const midTop = packed.top - 0.8 * (packed.top - final.top);
  const left = useTransform(progress, steps, [
    `${packed.left}%`,
    `${midLeft}%`,
    `${final.left}%`,
  ]);
  const top = useTransform(progress, steps, [
    `${packed.top}%`,
    `${midTop}%`,
    `${final.top}%`,
  ]);
  const rotate = useTransform(progress, steps, [
    packed.rotate,
    0.3 * final.rotate,
    final.rotate,
  ]);
  const scale = useTransform(progress, steps, [packed.scale, 0.85, 1]);

  return (
    <motion.div
      aria-hidden='true'
      className='absolute'
      style={{
        width: `${item.width}%`,
        x: '-50%',
        y: '-50%',
        ...(reducedMotion
          ? {
              left: `${final.left}%`,
              top: `${final.top}%`,
              rotate: final.rotate,
              scale: 1,
            }
          : { left, top, rotate, scale }),
      }}
    >
      <Image src={item.src} alt='' className='w-full' />
    </motion.div>
  );
}
