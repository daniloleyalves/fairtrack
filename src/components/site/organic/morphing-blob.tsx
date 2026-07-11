'use client';

import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { createNoise3D, type Noise3D } from './noise';

interface MorphingBlobProps {
  className?: string;
  fill: string;
  seed?: number;
  /** radius wobble as a fraction of the base radius */
  amplitude?: number;
  speed?: number;
}

const POINTS = 10;
const CENTER = 100;
const BASE_RADIUS = 78;

function blobPath(noise: Noise3D, t: number, amplitude: number): string {
  const points: [number, number][] = [];
  for (let i = 0; i < POINTS; i++) {
    const angle = (i / POINTS) * Math.PI * 2;
    const wobble = noise(Math.cos(angle) + 2, Math.sin(angle) + 2, t);
    const radius = BASE_RADIUS * (1 + wobble * amplitude);
    points.push([
      CENTER + Math.cos(angle) * radius,
      CENTER + Math.sin(angle) * radius,
    ]);
  }

  // closed Catmull-Rom spline converted to cubic beziers
  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 0; i < POINTS; i++) {
    const p0 = points[(i - 1 + POINTS) % POINTS];
    const p1 = points[i];
    const p2 = points[(i + 1) % POINTS];
    const p3 = points[(i + 2) % POINTS];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return `${d} Z`;
}

export function MorphingBlob({
  className,
  fill,
  seed = 3,
  amplitude = 0.14,
  speed = 1,
}: MorphingBlobProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const noise = useMemo(() => createNoise3D(seed), [seed]);
  const initialPath = useMemo(
    () => blobPath(noise, 0, amplitude),
    [noise, amplitude],
  );

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let running = true;

    const step = () => {
      if (!running) return;
      const t = performance.now() * 0.00012 * speed;
      path.setAttribute('d', blobPath(noise, t, amplitude));
      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        frame = requestAnimationFrame(step);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
    });
    observer.observe(path.ownerSVGElement ?? path);
    frame = requestAnimationFrame(step);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [noise, amplitude, speed]);

  return (
    <svg
      viewBox='0 0 200 200'
      aria-hidden='true'
      className={cn('pointer-events-none', className)}
    >
      <path ref={pathRef} d={initialPath} fill={fill} />
    </svg>
  );
}
