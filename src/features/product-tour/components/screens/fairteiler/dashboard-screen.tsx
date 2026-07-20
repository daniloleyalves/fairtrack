import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  History,
  Search,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORY_ICONS } from '../../../assets';
import { FONT_DISPLAY, FONT_SANS, Pop, SvgCard } from '../../svg-primitives';
import { FairteilerChrome } from './fairteiler-chrome';

const KATEGORIEN = [
  {
    fraction: 0.4,
    rotate: -90,
    color: 'var(--primary)',
    label: 'Backwaren salzig',
  },
  { fraction: 0.28, rotate: 54, color: 'var(--tertiary)', label: 'Gemüse' },
  {
    fraction: 0.18,
    rotate: 155,
    color: 'var(--secondary)',
    label: 'Milchprodukte',
  },
  {
    fraction: 0.12,
    rotate: 220,
    color: 'var(--muted-foreground)',
    label: 'Sonstiges',
  },
];

const HERKUNFT = [
  { fraction: 0.45, rotate: -90, color: 'var(--primary)', label: 'Bäckerei' },
  { fraction: 0.25, rotate: 72, color: 'var(--tertiary)', label: 'Supermarkt' },
  {
    fraction: 0.17,
    rotate: 162,
    color: 'var(--secondary)',
    label: 'Gastronomie',
  },
  {
    fraction: 0.1,
    rotate: 223,
    color: 'var(--muted-foreground)',
    label: 'Haushalt',
  },
];

const LEADERBOARD = [
  { name: 'Gastzugang', kg: '12.542,3 kg', crown: true },
  { name: 'Anna Schmidt', kg: '2.072 kg', crown: false },
  { name: 'Jonas Weber', kg: '528,5 kg', crown: false },
  { name: 'Mara Klein', kg: '405 kg', crown: false },
  { name: 'Tilda Vogt', kg: '371,7 kg', crown: false },
  { name: 'Jürgen Günther', kg: '339,5 kg', crown: false },
  { name: 'Alina Roth', kg: '247,5 kg', crown: false },
  { name: 'Ben Keller', kg: '189 kg', crown: false },
];

const RECENT = [
  {
    date: '05.06.2026',
    icon: CATEGORY_ICONS.sonstiges,
    name: 'Sonstiges',
    qty: '1',
  },
  {
    date: '22.05.2026',
    icon: CATEGORY_ICONS.backwaren,
    name: 'Backwaren süß',
    qty: '3,02',
  },
  {
    date: '18.05.2026',
    icon: CATEGORY_ICONS.gemuese,
    name: 'Gemüse',
    qty: '2,4',
  },
];

const CALENDAR_HIGHLIGHTS = [1, 4, 5];

function Donut({
  cy,
  segments,
  centerLabel,
  drawDelay,
}: {
  cy: number;
  segments: typeof KATEGORIEN;
  centerLabel: string;
  drawDelay: number;
}) {
  return (
    <g>
      <g transform={`translate(285, ${cy})`}>
        {segments.map((seg) => (
          <g key={seg.label} transform={`rotate(${seg.rotate})`}>
            <motion.circle
              r={34}
              fill='none'
              stroke={seg.color}
              strokeWidth={15}
              variants={{
                idle: { pathLength: 0, opacity: 0 },
                active: {
                  pathLength: seg.fraction,
                  opacity: 1,
                  transition: {
                    pathLength: {
                      delay: drawDelay,
                      duration: 1,
                      ease: 'easeOut',
                    },
                    opacity: { delay: drawDelay, duration: 0.1 },
                  },
                },
                done: {
                  pathLength: seg.fraction,
                  opacity: 1,
                  transition: { duration: 0.2 },
                },
              }}
            />
          </g>
        ))}
      </g>
      <Pop delay={drawDelay + 0.3} dy={0}>
        <text
          x={285}
          y={cy + 3.5}
          textAnchor='middle'
          fontFamily={FONT_SANS}
          fontSize={9}
          fontWeight={700}
          fill='var(--foreground)'
        >
          {centerLabel}
        </text>
      </Pop>
      {segments.map((seg, i) => (
        <Pop key={seg.label} delay={drawDelay + 0.2 + i * 0.08} dy={4}>
          <rect
            x={345 + (i % 2) * 110}
            y={cy - 26 + Math.floor(i / 2) * 22}
            width={9}
            height={9}
            rx={3}
            fill={seg.color}
          />
          <text
            x={359 + (i % 2) * 110}
            y={cy - 18 + Math.floor(i / 2) * 22}
            fontFamily={FONT_SANS}
            fontSize={9.5}
            fill='var(--muted-foreground)'
          >
            {seg.label}
          </text>
        </Pop>
      ))}
    </g>
  );
}

export function FairteilerDashboardScreen({ state }: { state: string }) {
  return (
    <motion.g initial='idle' animate={state}>
      <FairteilerChrome
        active='dashboard'
        title='Fairteiler Dashboard'
        bannerH={220}
      />

      {/* key figures above the donuts */}
      <Pop delay={0.35}>
        <SvgCard x={220} y={84} w={185} h={74} rx={12} />
        <rect
          x={223}
          y={87}
          width={179}
          height={68}
          rx={10}
          fill='var(--tertiary)'
          opacity={0.35}
        />
        <text
          x={343}
          y={122}
          textAnchor='end'
          fontFamily={FONT_DISPLAY}
          fontSize={22}
          fill='var(--primary)'
        >
          21.285,4
        </text>
        <text
          x={349}
          y={121}
          fontFamily={FONT_SANS}
          fontSize={10}
          fontWeight={700}
          fill='var(--primary)'
        >
          kg
        </text>
        <text
          x={312.5}
          y={138}
          textAnchor='middle'
          fontFamily={FONT_SANS}
          fontSize={10}
          fontWeight={700}
          fill='var(--primary)'
        >
          gerettet
        </text>
      </Pop>
      <Pop delay={0.5}>
        <SvgCard x={415} y={84} w={185} h={74} rx={12} />
        <rect
          x={418}
          y={87}
          width={179}
          height={68}
          rx={12}
          fill='var(--muted-foreground)'
          opacity={0.15}
        />
        <text
          x={507.5}
          y={122}
          textAnchor='middle'
          fontFamily={FONT_DISPLAY}
          fontSize={22}
          fill='var(--foreground)'
        >
          3.023
        </text>
        <text
          x={507.5}
          y={138}
          textAnchor='middle'
          fontFamily={FONT_SANS}
          fontSize={10}
          fontWeight={700}
          fill='var(--muted-foreground)'
        >
          Abgaben
        </text>
      </Pop>

      {/* stacked donuts card */}
      <Pop delay={0.65}>
        <SvgCard x={220} y={174} w={380} h={240} rx={12} />
        <Donut
          cy={228}
          segments={KATEGORIEN}
          centerLabel='Kategorien'
          drawDelay={0.9}
        />
        <line
          x1={240}
          y1={288}
          x2={580}
          y2={288}
          stroke='var(--border)'
          strokeWidth={1}
        />
        <Donut
          cy={348}
          segments={HERKUNFT}
          centerLabel='Herkunft'
          drawDelay={1.1}
        />
      </Pop>

      {/* leaderboard, full height of the left column */}
      <Pop delay={0.85}>
        <SvgCard x={616} y={84} w={264} h={330} rx={12} />
        <clipPath id='tour-lb-clip'>
          <rect x={616} y={84} width={264} height={330} rx={12} />
        </clipPath>
        <text
          x={632}
          y={114}
          fontFamily={FONT_SANS}
          fontSize={14}
          fontWeight={700}
          fill='var(--foreground)'
        >
          Foodsaver:innen
        </text>
        <rect
          x={750}
          y={98}
          width={90}
          height={22}
          rx={11}
          fill='var(--muted)'
        />
        <Search
          x={759}
          y={103}
          width={12}
          height={12}
          color='var(--muted-foreground)'
        />
        <text
          x={776}
          y={113}
          fontFamily={FONT_SANS}
          fontSize={9.5}
          fill='var(--muted-foreground)'
        >
          Suchen...
        </text>
        <ArrowUpDown
          x={850}
          y={103}
          width={13}
          height={13}
          color='var(--muted-foreground)'
        />
        <g clipPath='url(#tour-lb-clip)'>
          {LEADERBOARD.map((row, i) => (
            <Pop key={row.name} delay={1.05 + i * 0.1} dy={5}>
              {row.crown ? (
                <Crown
                  x={630}
                  y={136 + i * 38}
                  width={16}
                  height={16}
                  color='#eab308'
                />
              ) : (
                <text
                  x={638}
                  y={149 + i * 38}
                  textAnchor='middle'
                  fontFamily={FONT_SANS}
                  fontSize={12}
                  fontWeight={700}
                  fill='var(--muted-foreground)'
                >
                  {i + 1}
                </text>
              )}
              <text
                x={658}
                y={149 + i * 38}
                fontFamily={FONT_SANS}
                fontSize={12}
                fontWeight={600}
                fill='var(--foreground)'
              >
                {row.name}
              </text>
              <text
                x={864}
                y={149 + i * 38}
                textAnchor='end'
                fontFamily={FONT_DISPLAY}
                fontSize={14}
                fill='var(--primary)'
              >
                {row.kg}
              </text>
              <line
                x1={630}
                y1={161 + i * 38}
                x2={864}
                y2={161 + i * 38}
                stroke='var(--border)'
                strokeWidth={1}
              />
            </Pop>
          ))}
        </g>
      </Pop>

      {/* recent contributions */}
      <Pop delay={1.0}>
        <SvgCard x={220} y={430} w={380} h={100} rx={12} />
        <clipPath id='tour-hist-clip'>
          <rect x={220} y={430} width={380} height={100} rx={12} />
        </clipPath>
        <History
          x={240}
          y={444}
          width={14}
          height={14}
          color='var(--foreground)'
        />
        <text
          x={262}
          y={456}
          fontFamily={FONT_SANS}
          fontSize={13}
          fontWeight={700}
          fill='var(--foreground)'
        >
          Kürzliche Abgaben
        </text>
        <g clipPath='url(#tour-hist-clip)'>
          {RECENT.map((row, i) => (
            <Pop key={row.name} delay={1.2 + i * 0.12} dy={4}>
              <text
                x={240}
                y={482 + i * 26}
                fontFamily={FONT_SANS}
                fontSize={9.5}
                fill='var(--muted-foreground)'
              >
                {row.date}
              </text>
              <image
                href={row.icon}
                x={320}
                y={471 + i * 26}
                width={14}
                height={14}
                preserveAspectRatio='xMidYMid meet'
              />
              <text
                x={342}
                y={482 + i * 26}
                fontFamily={FONT_SANS}
                fontSize={10.5}
                fontWeight={600}
                fill='var(--foreground)'
              >
                {row.name}
              </text>
              <text
                x={580}
                y={482 + i * 26}
                textAnchor='end'
                fontFamily={FONT_SANS}
                fontSize={10.5}
                fill='var(--muted-foreground)'
              >
                {row.qty}
              </text>
            </Pop>
          ))}
        </g>
      </Pop>

      {/* calendar */}
      <Pop delay={1.1}>
        <SvgCard x={616} y={430} w={264} h={100} rx={12} />
        <text
          x={632}
          y={454}
          fontFamily={FONT_SANS}
          fontSize={13}
          fontWeight={700}
          fill='var(--foreground)'
        >
          Kalender
        </text>
        <ChevronLeft
          x={632}
          y={468}
          width={11}
          height={11}
          color='var(--muted-foreground)'
        />
        <text
          x={748}
          y={477}
          textAnchor='middle'
          fontFamily={FONT_SANS}
          fontSize={9}
          fontWeight={600}
          fill='var(--foreground)'
        >
          Juni 2026
        </text>
        <ChevronRight
          x={853}
          y={468}
          width={11}
          height={11}
          color='var(--muted-foreground)'
        />
        {Array.from({ length: 7 }, (_, i) => {
          const x = 632 + i * 33;
          const highlighted = CALENDAR_HIGHLIGHTS.includes(i);
          return (
            <motion.g
              key={i}
              variants={{
                idle: { opacity: 0 },
                active: {
                  opacity: 1,
                  transition: { delay: 1.3 + i * 0.05, duration: 0.25 },
                },
                done: { opacity: 1, transition: { duration: 0.2 } },
              }}
            >
              <rect
                x={x}
                y={488}
                width={30}
                height={34}
                rx={7}
                fill={highlighted ? 'var(--primary)' : 'var(--muted)'}
              />
              <text
                x={x + 15}
                y={509.5}
                textAnchor='middle'
                fontFamily={FONT_SANS}
                fontSize={10}
                fontWeight={highlighted ? 700 : 500}
                fill={
                  highlighted
                    ? 'var(--primary-foreground)'
                    : 'var(--muted-foreground)'
                }
              >
                {i + 1}
              </text>
            </motion.g>
          );
        })}
      </Pop>
    </motion.g>
  );
}
