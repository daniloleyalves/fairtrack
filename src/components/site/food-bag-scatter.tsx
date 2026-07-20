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

/** Rotation that points an upright item's root at CENTER (flower petal). */
const radial = (left: number, top: number, jitter = 0) =>
  (Math.atan2(left - CENTER.left, CENTER.top - top) * 180) / Math.PI + jitter;

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

const petal = (
  src: (typeof Illustrations)[string],
  width: number,
  left: number,
  top: number,
  jitter: number,
  packed: Packed,
  window: [number, number],
): ItemSpec => ({
  src,
  width,
  final: { left, top, rotate: radial(left, top, jitter) },
  packed,
  window,
});

const ITEMS: ItemSpec[] = [
  // big petals, packed as an upright bouquet peeking out of the bag
  petal(
    Illustrations.salad,
    30,
    11,
    54,
    0,
    { left: 45, top: 56, rotate: -18, scale: 0.35 },
    [0.38, 0.85],
  ),
  petal(
    Illustrations.carrot,
    26,
    21,
    29,
    0,
    { left: 47, top: 54, rotate: -10, scale: 0.35 },
    [0.4, 0.87],
  ),
  petal(
    Illustrations.reddish,
    18,
    37,
    15,
    0,
    { left: 49, top: 55, rotate: -4, scale: 0.35 },
    [0.42, 0.89],
  ),
  petal(
    Illustrations.garlic,
    13,
    55,
    12,
    0,
    { left: 51, top: 54, rotate: 0, scale: 0.35 },
    [0.44, 0.9],
  ),
  petal(
    Illustrations.onion,
    21,
    72,
    23,
    0,
    { left: 53, top: 54, rotate: 8, scale: 0.35 },
    [0.46, 0.92],
  ),
  petal(
    Illustrations.beetroot,
    27,
    88,
    47,
    0,
    { left: 55, top: 56, rotate: 16, scale: 0.35 },
    [0.48, 0.94],
  ),
  // small fillers
  petal(
    Illustrations.tomato,
    9,
    27,
    47,
    -8,
    { left: 46, top: 59, rotate: -12, scale: 0.5 },
    [0.5, 0.93],
  ),
  petal(
    Illustrations.pepper2,
    11,
    67,
    51,
    6,
    { left: 54, top: 59, rotate: 10, scale: 0.5 },
    [0.5, 0.95],
  ),
  petal(
    Illustrations.mushroom1,
    8,
    32,
    40,
    -15,
    { left: 47, top: 60, rotate: -18, scale: 0.5 },
    [0.52, 0.96],
  ),
  petal(
    Illustrations.mushroom4,
    7,
    61,
    38,
    10,
    { left: 53, top: 60, rotate: 14, scale: 0.5 },
    [0.52, 0.97],
  ),
  petal(
    Illustrations.mushroom2,
    8,
    16,
    68,
    20,
    { left: 45, top: 61, rotate: 24, scale: 0.5 },
    [0.55, 0.98],
  ),
  petal(
    Illustrations.mushroom3,
    8,
    84,
    65,
    -20,
    { left: 55, top: 61, rotate: -24, scale: 0.5 },
    [0.55, 0.98],
  ),
  // loose leaves with more chaotic spin
  petal(
    Illustrations.leafPrimary,
    6,
    7,
    30,
    -25,
    { left: 48, top: 58, rotate: -70, scale: 0.4 },
    [0.55, 1],
  ),
  petal(
    Illustrations.leaf2Primary,
    5,
    93,
    28,
    30,
    { left: 52, top: 58, rotate: 80, scale: 0.4 },
    [0.58, 1],
  ),
  petal(
    Illustrations.leafSecondary,
    7,
    46,
    34,
    50,
    { left: 50, top: 57, rotate: 100, scale: 0.4 },
    [0.56, 1],
  ),
];

/**
 * The FairTrack bag with the illustration's vegetables packed inside; on
 * scroll they burst radially out of the bag like an opening flower, long
 * items keeping their roots pointed at the bag mouth.
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
  const left = useTransform(progress, w, [`${packed.left}%`, `${final.left}%`]);
  const top = useTransform(progress, w, [`${packed.top}%`, `${final.top}%`]);
  const rotate = useTransform(progress, w, [packed.rotate, final.rotate]);
  const scale = useTransform(progress, w, [packed.scale, 1]);

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
