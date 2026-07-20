import {
  ChartBar,
  ClipboardList,
  Coffee,
  Globe,
  History,
  LayoutDashboard,
  MessageCircleHeart,
  Rocket,
} from 'lucide-react';
import { FONT_DISPLAY, FONT_SANS, Pop } from '../../svg-primitives';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'form', label: 'Retteformular', Icon: ClipboardList },
  { id: 'history', label: 'Verlauf', Icon: History },
  { id: 'stats', label: 'Statistiken', Icon: ChartBar },
];

export const SIDEBAR_ITEM_CENTER: Record<string, { x: number; y: number }> = {
  dashboard: { x: 100, y: 116 },
  form: { x: 100, y: 152 },
  history: { x: 100, y: 188 },
  stats: { x: 100, y: 224 },
};

export function FairteilerChrome({
  active,
  title,
  bannerH = 100,
}: {
  active: 'dashboard' | 'form' | 'stats';
  title: string;
  bannerH?: number;
}) {
  return (
    <g>
      <rect
        width={900}
        height={560}
        rx={24}
        fill='var(--background)'
        stroke='var(--border)'
        strokeWidth={1.5}
        filter='url(#tour-shadow)'
      />
      {/* sidebar */}
      <path
        d='M0 24 A24 24 0 0 1 24 0 H200 V560 H24 A24 24 0 0 1 0 536 Z'
        fill='var(--card)'
      />
      <line
        x1={200}
        y1={0}
        x2={200}
        y2={560}
        stroke='var(--border)'
        strokeWidth={1.5}
      />
      <Pop delay={0.1} dy={0}>
        <rect
          x={16}
          y={20}
          width={36}
          height={36}
          rx={10}
          fill='var(--primary)'
        />
        <Coffee
          x={24}
          y={28}
          width={20}
          height={20}
          color='var(--primary-foreground)'
        />
        <text
          x={60}
          y={43}
          fontFamily={FONT_SANS}
          fontSize={12}
          fontWeight={700}
          fill='var(--foreground)'
        >
          Raupe Immersatt
        </text>
      </Pop>
      <Pop delay={0.2} dy={0}>
        <text
          x={20}
          y={92}
          fontFamily={FONT_SANS}
          fontSize={10}
          fontWeight={600}
          fill='var(--muted-foreground)'
        >
          Fairteiler
        </text>
      </Pop>
      {NAV_ITEMS.map((item, i) => (
        <Pop key={item.id} delay={0.25 + i * 0.08} dy={4}>
          {item.id === active ? (
            <rect
              x={12}
              y={SIDEBAR_ITEM_CENTER[item.id].y - 16}
              width={176}
              height={32}
              rx={8}
              fill='var(--muted)'
            />
          ) : null}
          <item.Icon
            x={24}
            y={SIDEBAR_ITEM_CENTER[item.id].y - 8}
            width={16}
            height={16}
            color={
              item.id === active ? 'var(--primary)' : 'var(--muted-foreground)'
            }
          />
          <text
            x={50}
            y={SIDEBAR_ITEM_CENTER[item.id].y + 4}
            fontFamily={FONT_SANS}
            fontSize={13}
            fontWeight={item.id === active ? 700 : 500}
            fill={
              item.id === active
                ? 'var(--foreground)'
                : 'var(--muted-foreground)'
            }
          >
            {item.label}
          </text>
        </Pop>
      ))}
      <Pop delay={0.55} dy={4}>
        <text
          x={20}
          y={268}
          fontFamily={FONT_SANS}
          fontSize={10}
          fontWeight={600}
          fill='var(--muted-foreground)'
        >
          Platform
        </text>
        {[
          { label: 'Platform-Statistiken', Icon: Globe, muted: false },
          { label: 'Releases & Roadmap', Icon: Rocket, muted: true },
          { label: 'Feedback', Icon: MessageCircleHeart, muted: false },
        ].map((item, i) => (
          <g key={item.label} opacity={item.muted ? 0.45 : 1}>
            <item.Icon
              x={24}
              y={284 + i * 28}
              width={16}
              height={16}
              color='var(--muted-foreground)'
            />
            <text
              x={50}
              y={296 + i * 28}
              fontFamily={FONT_SANS}
              fontSize={13}
              fontWeight={500}
              fill='var(--muted-foreground)'
            >
              {item.label}
            </text>
          </g>
        ))}
      </Pop>
      <Pop delay={0.6} dy={4}>
        <clipPath id='tour-avatar-clip'>
          <circle cx={30} cy={526} r={14} />
        </clipPath>
        <circle cx={30} cy={526} r={14} fill='var(--secondary)' />
        <g clipPath='url(#tour-avatar-clip)'>
          <circle cx={30} cy={521} r={8} fill='#8a5a3b' />
          <rect
            x={21.5}
            y={519}
            width={5}
            height={16}
            rx={2.5}
            fill='#8a5a3b'
          />
          <rect
            x={33.5}
            y={519}
            width={5}
            height={16}
            rx={2.5}
            fill='#8a5a3b'
          />
          <circle cx={30} cy={524} r={5.5} fill='#eabf9a' />
          <ellipse cx={30} cy={541} rx={10} ry={8} fill='var(--primary)' />
        </g>
        <circle
          cx={30}
          cy={526}
          r={14}
          fill='none'
          stroke='var(--border)'
          strokeWidth={1}
        />
        <text
          x={52}
          y={523}
          fontFamily={FONT_SANS}
          fontSize={12}
          fontWeight={700}
          fill='var(--foreground)'
        >
          Marie
        </text>
        <text
          x={52}
          y={537}
          fontFamily={FONT_SANS}
          fontSize={9}
          fill='var(--muted-foreground)'
        >
          marie.mueller@gmail.com
        </text>
      </Pop>
      {/* green band over main area */}
      <path
        d={`M200 0 H876 A24 24 0 0 1 900 24 V${bannerH - 20} A20 20 0 0 1 880 ${bannerH} H200 Z`}
        fill='var(--primary)'
      />
      <Pop delay={0.15} dy={6}>
        <text
          x={224}
          y={58}
          fontFamily={FONT_DISPLAY}
          fontSize={30}
          letterSpacing={1}
          fill='var(--primary-foreground)'
        >
          {title}
        </text>
      </Pop>
    </g>
  );
}
