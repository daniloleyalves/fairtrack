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

/** Bag mouth the packed bundle sits in and the flight radiates from. */
const CENTER = { left: 50, top: 64 };

/**
 * The composite artwork (food_bag_illustration.svg) is one frame of this
 * animation; finals sit slightly past it along the outward flow.
 */
const PUSH = 1.08;

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
 * `artLeft`/`artTop` is the item's center in the composite artwork (% of
 * its frame); the final position extends that placement a little further
 * out from the bag mouth. `upright` counters the asset's drawn tilt while
 * packed so the bundle stands vertical; the flight rotates it back into
 * its natural artwork pose (`finalRotate`, 0 for the vegetables).
 */
const petal = (
  src: (typeof Illustrations)[string],
  width: number,
  artLeft: number,
  artTop: number,
  upright: number,
  packed: Packed,
  window: [number, number],
  finalRotate = 0,
): ItemSpec => ({
  src,
  width,
  final: {
    left: CENTER.left + (artLeft - CENTER.left) * PUSH,
    top: CENTER.top + (artTop - CENTER.top) * PUSH,
    rotate: finalRotate,
  },
  packed: { ...packed, rotate: upright + packed.rotate },
  window,
});

const ITEMS: ItemSpec[] = [
  // the long produce, packed as an upright bouquet peeking out of the bag
  petal(
    Illustrations.salad,
    26,
    27,
    46,
    40,
    { left: 46, top: 60, rotate: -4, scale: 0.35 },
    [0.12, 0.88],
  ),
  petal(
    Illustrations.carrot,
    24,
    31,
    26,
    -40,
    { left: 47, top: 58, rotate: -2, scale: 0.35 },
    [0.15, 0.9],
    -48,
  ),
  petal(
    Illustrations.onion,
    24,
    49,
    22,
    -18,
    { left: 53, top: 58, rotate: 2, scale: 0.35 },
    [0.24, 0.96],
  ),
  petal(
    Illustrations.beetroot,
    30,
    77,
    48,
    -25,
    { left: 55, top: 60, rotate: 4, scale: 0.35 },
    [0.27, 0.98],
  ),
  petal(
    Illustrations.garlic,
    14,
    59,
    30,
    -12,
    { left: 51, top: 58, rotate: 0, scale: 0.4 },
    [0.21, 0.94],
  ),
  // the small stuff around the bag mouth
  petal(
    Illustrations.tomato,
    10,
    55.5,
    60,
    0,
    { left: 46, top: 63, rotate: 0, scale: 0.5 },
    [0.3, 0.95],
  ),
  petal(
    Illustrations.mushroom2,
    9,
    33,
    60,
    0,
    { left: 45, top: 65, rotate: 6, scale: 0.5 },
    [0.33, 0.97],
  ),
  petal(
    Illustrations.mushroom1,
    8,
    41,
    61,
    0,
    { left: 47, top: 64, rotate: -6, scale: 0.5 },
    [0.31, 0.96],
  ),
  petal(
    Illustrations.mushroom4,
    7,
    58,
    52,
    0,
    { left: 53, top: 64, rotate: 4, scale: 0.5 },
    [0.32, 0.97],
  ),
  petal(
    Illustrations.pepper2,
    12,
    48.8,
    52.5,
    0,
    { left: 54, top: 63, rotate: 2, scale: 0.5 },
    [0.3, 0.95],
  ),
  petal(
    Illustrations.mushroom3,
    9,
    61,
    61,
    0,
    { left: 55, top: 65, rotate: -6, scale: 0.5 },
    [0.34, 0.98],
  ),
  // loose leaves drifting out last
  petal(
    Illustrations.leafPrimary,
    6,
    14,
    27,
    0,
    { left: 48, top: 62, rotate: -20, scale: 0.4 },
    [0.38, 1],
    -25,
  ),
  petal(
    Illustrations.leaf2Primary,
    5,
    89,
    19,
    0,
    { left: 52, top: 62, rotate: 20, scale: 0.4 },
    [0.42, 1],
    30,
  ),
  petal(
    Illustrations.leafSecondary,
    7,
    70,
    57,
    0,
    { left: 50, top: 61, rotate: 30, scale: 0.4 },
    [0.4, 1],
    45,
  ),
];

/**
 * The FairTrack bag with the artwork's vegetables packed inside; on scroll
 * they fountain out of the bag and settle just past their places in
 * food_bag_illustration.svg.
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
      className={`relative aspect-[150/187] ${className ?? ''}`}
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
        className='absolute bottom-0 left-1/2 z-10 w-[41%] -translate-x-1/2'
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
  // Fountain curve: a quadratic Bezier whose control point sits above the
  // bag mouth, so every item launches vertically and bends outward along
  // one continuous arc scaled to its flight distance.
  const dist = Math.hypot(final.left - packed.left, final.top - packed.top);
  const ctrl = {
    left: packed.left + 0.1 * (final.left - packed.left),
    top: packed.top - 0.6 * dist,
  };
  const T = [0, 0.2, 0.4, 0.6, 0.8, 1];
  const steps = T.map((s) => w[0] + s * (w[1] - w[0]));
  const at = (a: number, b: number, c: number, s: number) =>
    (1 - s) * (1 - s) * a + 2 * (1 - s) * s * b + s * s * c;
  const left = useTransform(
    progress,
    steps,
    T.map((s) => `${at(packed.left, ctrl.left, final.left, s)}%`),
  );
  const top = useTransform(
    progress,
    steps,
    T.map((s) => `${at(packed.top, ctrl.top, final.top, s)}%`),
  );
  const rotate = useTransform(
    progress,
    [w[0], w[1]],
    [packed.rotate, final.rotate],
  );
  const scale = useTransform(progress, [w[0], w[1]], [packed.scale, 1]);

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
