import type { LucideIcon } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { createContext, useContext, type ReactNode } from 'react';
import { tourTime } from '../tour-steps';

export { tourTime };

export const FONT_DISPLAY = 'var(--font-londrina-solid)';
export const FONT_SANS = 'var(--font-geist-sans), sans-serif';

/**
 * Multiple ProductTour instances render on one page, so filter ids are
 * suffixed with the instance id to keep DOM ids unique; url() references
 * resolve through this context.
 */
export const TourInstanceContext = createContext('');

export function useTourFilter(name: 'shadow' | 'grayscale') {
  return `url(#tour-${name}-${useContext(TourInstanceContext)})`;
}

export function pop(delay: number, dy = 12): Variants {
  return {
    idle: { opacity: 0, y: dy },
    active: {
      opacity: 1,
      y: 0,
      transition: { delay: tourTime(delay), duration: 0.5, ease: 'easeOut' },
    },
    done: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };
}

export function draw(delay: number, duration = 0.8): Variants {
  return {
    idle: { pathLength: 0, opacity: 0 },
    active: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: tourTime(delay), duration, ease: 'easeInOut' },
        opacity: { delay: tourTime(delay), duration: 0.15 },
      },
    },
    done: { pathLength: 1, opacity: 1, transition: { duration: 0.2 } },
  };
}

export function Pop({
  delay,
  dy,
  children,
}: {
  delay: number;
  dy?: number;
  children: ReactNode;
}) {
  return <motion.g variants={pop(delay, dy)}>{children}</motion.g>;
}

export function SvgCard({
  x,
  y,
  w,
  h,
  rx = 16,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={rx}
      fill='var(--card)'
      stroke='var(--border)'
      strokeWidth={1.5}
      filter={useTourFilter('shadow')}
    />
  );
}

const BUTTON_STYLES = {
  primary: {
    fill: 'var(--primary)',
    text: 'var(--primary-foreground)',
    stroke: undefined,
  },
  outline: {
    fill: 'var(--card)',
    text: 'var(--foreground)',
    stroke: 'var(--border)',
  },
  tertiary: {
    fill: 'var(--tertiary)',
    text: 'var(--tertiary-foreground)',
    stroke: undefined,
  },
  muted: {
    fill: 'var(--muted)',
    text: 'var(--muted-foreground)',
    stroke: undefined,
  },
  card: { fill: 'var(--card)', text: 'var(--foreground)', stroke: undefined },
} as const;

export function SvgButton({
  x,
  y,
  w,
  h = 36,
  label,
  children,
  variant = 'primary',
  fontSize = 14,
  icon: Icon,
  trailingIcon: TrailingIcon,
  shadow = false,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label?: string;
  children?: ReactNode;
  variant?: keyof typeof BUTTON_STYLES;
  fontSize?: number;
  icon?: LucideIcon;
  trailingIcon?: LucideIcon;
  shadow?: boolean;
}) {
  const style = BUTTON_STYLES[variant];
  const shadowFilter = useTourFilter('shadow');
  const iconSize = fontSize + 3;
  const iconY = y + (h - iconSize) / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={style.stroke ? 1.5 : undefined}
        filter={shadow ? shadowFilter : undefined}
      />
      {Icon ? (
        <Icon
          x={x + 12}
          y={iconY}
          width={iconSize}
          height={iconSize}
          color={style.text}
        />
      ) : null}
      {TrailingIcon ? (
        <TrailingIcon
          x={x + w - 12 - iconSize}
          y={iconY}
          width={iconSize}
          height={iconSize}
          color='var(--muted-foreground)'
        />
      ) : null}
      {children ??
        (label ? (
          <text
            x={Icon ? x + 12 + iconSize + 8 : x + w / 2}
            y={y + h / 2 + fontSize * 0.36}
            textAnchor={Icon ? 'start' : 'middle'}
            fontFamily={FONT_SANS}
            fontSize={fontSize}
            fontWeight={600}
            fill={style.text}
          >
            {label}
          </text>
        ) : null)}
    </g>
  );
}

export const PHONE = { w: 300, h: 620 };

export function PhoneChrome({ children }: { children?: ReactNode }) {
  return (
    <g>
      <rect
        x={-10}
        y={-10}
        width={PHONE.w + 20}
        height={PHONE.h + 20}
        rx={46}
        fill='var(--foreground)'
        filter={useTourFilter('shadow')}
      />
      <rect width={PHONE.w} height={PHONE.h} rx={38} fill='var(--background)' />
      {children}
      <rect
        x={PHONE.w / 2 - 40}
        y={12}
        width={80}
        height={20}
        rx={10}
        fill='var(--foreground)'
      />
    </g>
  );
}

export function PhoneBanner({ h }: { h: number }) {
  return (
    <path
      d={`M0 38 A38 38 0 0 1 38 0 H${PHONE.w - 38} A38 38 0 0 1 ${PHONE.w} 38 V${h - 18} A18 18 0 0 1 ${PHONE.w - 18} ${h} H18 A18 18 0 0 1 0 ${h - 18} Z`}
      fill='var(--primary)'
    />
  );
}

export function ScreenChrome({
  w,
  h,
  bannerH,
  title,
}: {
  w: number;
  h: number;
  bannerH: number;
  title?: string;
}) {
  return (
    <g>
      <rect
        width={w}
        height={h}
        rx={24}
        fill='var(--background)'
        stroke='var(--border)'
        strokeWidth={1.5}
        filter={useTourFilter('shadow')}
      />
      <path
        d={`M0 24 A24 24 0 0 1 24 0 H${w - 24} A24 24 0 0 1 ${w} 24 V${bannerH - 20} A20 20 0 0 1 ${w - 20} ${bannerH} H20 A20 20 0 0 1 0 ${bannerH - 20} Z`}
        fill='var(--primary)'
      />
      {title ? (
        <text
          x={40}
          y={bannerH / 2 + 24}
          fontFamily={FONT_DISPLAY}
          fontSize={36}
          letterSpacing={1}
          fill='var(--primary-foreground)'
        >
          {title}
        </text>
      ) : null}
    </g>
  );
}
