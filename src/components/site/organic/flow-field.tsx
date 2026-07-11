'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { createNoise3D } from './noise';

interface FlowFieldProps {
  className?: string;
  /** particles per 10.000 px² of canvas area */
  density?: number;
  colors?: string[];
  seed?: number;
}

const BRAND_COLORS = ['#446622', '#99BB44', '#6d8f3a'];
const NOISE_SCALE = 0.0016;
const TIME_SCALE = 0.00008;
const SPEED = 0.9;
const POINTER_RADIUS = 140;

interface Particle {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
}

export function FlowField({
  className,
  density = 0.16,
  colors = BRAND_COLORS,
  seed = 7,
}: FlowFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const noise = createNoise3D(seed);
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let frame = 0;
    let running = false;
    let visible = true;
    let inView = true;
    const pointer = { x: -9999, y: -9999 };

    const spawn = (particle?: Particle): Particle => {
      const p = particle ?? ({} as Particle);
      p.x = Math.random() * width;
      p.y = Math.random() * height;
      p.maxLife = 120 + Math.random() * 240;
      p.life = Math.random() * p.maxLife;
      p.color = colors[Math.floor(Math.random() * colors.length)];
      return p;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      const count = Math.round(((width * height) / 10_000) * density * 10);
      particles = Array.from({ length: count }, () => spawn());
      ctx.clearRect(0, 0, width, height);
      if (reducedMotion) drawStatic();
    };

    const fieldAngle = (x: number, y: number, t: number) =>
      noise(x * NOISE_SCALE, y * NOISE_SCALE, t) * Math.PI * 3;

    /** One motionless frame for prefers-reduced-motion: short streamlines. */
    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 0.1;
      for (const p of particles) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        let x = p.x;
        let y = p.y;
        ctx.moveTo(x, y);
        for (let s = 0; s < 14; s++) {
          const a = fieldAngle(x, y, 0);
          x += Math.cos(a) * 3;
          y += Math.sin(a) * 3;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      if (!running) return;
      frame = requestAnimationFrame(step);
      const t = performance.now() * TIME_SCALE;

      // fade existing trails toward transparent
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.035)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 1.3;
      for (const p of particles) {
        const angle = fieldAngle(p.x, p.y, t);
        let vx = Math.cos(angle) * SPEED;
        let vy = Math.sin(angle) * SPEED;

        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < POINTER_RADIUS * POINTER_RADIUS) {
          const dist = Math.sqrt(distSq) || 1;
          const push = (1 - dist / POINTER_RADIUS) * 2.2;
          vx += (dx / dist) * push;
          vy += (dy / dist) * push;
        }

        const nx = p.x + vx;
        const ny = p.y + vy;
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        p.x = nx;
        p.y = ny;
        p.life += 1;
        if (
          p.life > p.maxLife ||
          p.x < -10 ||
          p.x > width + 10 ||
          p.y < -10 ||
          p.y > height + 10
        ) {
          spawn(p);
        }
      }
      ctx.globalAlpha = 1;
    };

    const sync = () => {
      const shouldRun = !reducedMotion && visible && inView;
      if (shouldRun && !running) {
        running = true;
        frame = requestAnimationFrame(step);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      sync();
    };

    resize();
    sync();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    intersectionObserver.observe(canvas);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [colors, density, seed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden='true'
      className={cn(
        'pointer-events-none absolute inset-0 size-full',
        className,
      )}
    />
  );
}
