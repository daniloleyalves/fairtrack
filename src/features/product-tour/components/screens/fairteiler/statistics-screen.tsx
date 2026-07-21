import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  PlusCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  FONT_DISPLAY,
  FONT_SANS,
  Pop,
  SvgButton,
  SvgCard,
  tourTime,
} from '../../svg-primitives';
import { FairteilerChrome } from './fairteiler-chrome';

const STEP_DURATION = 8.5;
const t = (seconds: number) => seconds / STEP_DURATION;
const FILTER_AT = 5.8;

function swapOut(at: number) {
  return {
    idle: { opacity: 1 },
    active: {
      opacity: [1, 1, 0],
      transition: {
        duration: tourTime(STEP_DURATION),
        times: [0, t(at), t(at + 0.3)],
      },
    },
    done: { opacity: 0, transition: { duration: 0.2 } },
  };
}

function swapIn(at: number) {
  return {
    idle: { opacity: 0 },
    active: {
      opacity: [0, 0, 1],
      transition: {
        duration: tourTime(STEP_DURATION),
        times: [0, t(at), t(at + 0.3)],
      },
    },
    done: { opacity: 1, transition: { duration: 0.2 } },
  };
}

const KATEGORIEN = [
  {
    fraction: 0.42,
    filtered: 0.97,
    rotate: -90,
    color: 'var(--primary)',
    label: 'Backwaren salzig',
  },
  {
    fraction: 0.3,
    filtered: 0.001,
    rotate: 61,
    color: 'var(--tertiary)',
    label: 'Backwaren süß',
  },
  {
    fraction: 0.16,
    filtered: 0.001,
    rotate: 169,
    color: 'var(--secondary)',
    label: 'Sonstiges',
  },
  {
    fraction: 0.1,
    filtered: 0.001,
    rotate: 227,
    color: 'var(--muted-foreground)',
    label: 'Milchprodukte',
  },
];

const HERKUENFTE = [
  {
    fraction: 0.62,
    filtered: 0.75,
    rotate: -90,
    color: 'var(--primary)',
    label: 'Gastronomie',
  },
  {
    fraction: 0.34,
    filtered: 0.22,
    rotate: 133,
    color: 'var(--tertiary)',
    label: 'Haushalt',
  },
];

const FILTER_CHIPS = [
  { label: 'Dieses Jahr', x: 300, w: 108, Icon: Clock },
  { label: 'Kategorie', x: 420, w: 96, Icon: PlusCircle },
  { label: 'Herkunft', x: 528, w: 92, Icon: PlusCircle },
  { label: 'Betrieb', x: 632, w: 82, Icon: PlusCircle },
];

const KEY_FIGURES = [
  {
    x: 220,
    value: '16,0',
    filtered: '6,7',
    unit: 'kg',
    caption: 'gerettet',
    tinted: true,
  },
  {
    x: 390,
    value: '4',
    filtered: '2',
    unit: '',
    caption: 'Abgaben',
    tinted: false,
  },
  {
    x: 560,
    value: '4,0',
    filtered: '3,4',
    unit: 'kg',
    caption: 'Ø Abgabemenge',
    tinted: false,
  },
  {
    x: 730,
    value: '1',
    filtered: '1',
    unit: '',
    caption: 'Registrierte Nutzer',
    tinted: false,
  },
];

const CALENDAR_HIGHLIGHTS = [1, 4, 5];

function DonutCard({
  x,
  title,
  centerLabel,
  segments,
  drawDelay,
}: {
  x: number;
  title: string;
  centerLabel: string;
  segments: typeof KATEGORIEN;
  drawDelay: number;
}) {
  return (
    <g>
      <SvgCard x={x} y={288} w={320} h={162} rx={12} />
      <text
        x={x + 20}
        y={314}
        fontFamily={FONT_SANS}
        fontSize={13}
        fontWeight={700}
        fill='var(--foreground)'
      >
        {title}
      </text>
      <Download
        x={x + 280}
        y={302}
        width={14}
        height={14}
        color='var(--muted-foreground)'
      />
      <g transform={`translate(${x + 72}, 386)`}>
        {segments.map((seg) => (
          <g key={seg.label} transform={`rotate(${seg.rotate})`}>
            <motion.circle
              r={33}
              fill='none'
              stroke={seg.color}
              strokeWidth={15}
              variants={{
                idle: { pathLength: 0, opacity: 0 },
                active: {
                  pathLength: [0, 0, seg.fraction, seg.fraction, seg.filtered],
                  opacity: [0, 0, 1, 1, 1],
                  transition: {
                    duration: tourTime(STEP_DURATION),
                    times: [
                      0,
                      t(drawDelay),
                      t(drawDelay + 1),
                      t(FILTER_AT),
                      t(FILTER_AT + 0.8),
                    ],
                  },
                },
                done: {
                  pathLength: seg.filtered,
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
          x={x + 72}
          y={389}
          textAnchor='middle'
          fontFamily={FONT_SANS}
          fontSize={8.5}
          fontWeight={700}
          fill='var(--foreground)'
        >
          {centerLabel}
        </text>
      </Pop>
      {segments.map((seg, i) => (
        <Pop key={seg.label} delay={drawDelay + 0.2 + i * 0.08} dy={4}>
          <rect
            x={x + 130}
            y={346 + i * 21}
            width={9}
            height={9}
            rx={3}
            fill={seg.color}
          />
          <text
            x={x + 145}
            y={354 + i * 21}
            fontFamily={FONT_SANS}
            fontSize={10}
            fill='var(--muted-foreground)'
          >
            {seg.label}
          </text>
        </Pop>
      ))}
    </g>
  );
}

export function FairteilerStatisticsScreen({ state }: { state: string }) {
  return (
    <motion.g initial='idle' animate={state}>
      <FairteilerChrome active='stats' title='Statistiken' bannerH={220} />

      <Pop delay={0.2} dy={4}>
        <text
          x={224}
          y={82}
          fontFamily={FONT_SANS}
          fontSize={11}
          fill='var(--primary-foreground)'
        >
          Analysiere die gesammelten Daten und verschaffe dir einen Überblick
          über alle relevanten Statistiken.
        </text>
      </Pop>
      <Pop delay={0.3} dy={4}>
        <SvgButton
          x={768}
          y={96}
          w={112}
          h={28}
          variant='tertiary'
          fontSize={11}
          icon={Download}
          label='Excel Export'
        />
      </Pop>

      {/* filter card */}
      <Pop delay={0.35}>
        <SvgCard x={220} y={140} w={660} h={44} rx={12} />
        <text
          x={240}
          y={167}
          fontFamily={FONT_SANS}
          fontSize={13}
          fontWeight={700}
          fill='var(--foreground)'
        >
          Filter:
        </text>
        {FILTER_CHIPS.map((chip) => (
          <SvgButton
            key={chip.label}
            x={chip.x}
            y={148}
            w={chip.w}
            h={28}
            variant='outline'
            fontSize={10.5}
            icon={chip.Icon}
            label={chip.label}
          />
        ))}
        {/* active filter highlight after click */}
        <motion.g
          variants={{
            idle: { opacity: 0 },
            active: {
              opacity: 1,
              transition: { delay: tourTime(5.6), duration: 0.3 },
            },
            done: { opacity: 1, transition: { duration: 0.2 } },
          }}
        >
          <rect
            x={420}
            y={148}
            width={96}
            height={28}
            rx={8}
            fill='none'
            stroke='var(--primary)'
            strokeWidth={2}
          />
          <circle cx={516} cy={148} r={8} fill='var(--primary)' />
          <text
            x={516}
            y={151.5}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={9}
            fontWeight={700}
            fill='var(--primary-foreground)'
          >
            1
          </text>
        </motion.g>
      </Pop>

      {/* key figures */}
      {KEY_FIGURES.map((fig, i) => {
        const center = fig.x + 75;
        const numberFill = fig.tinted ? 'var(--primary)' : 'var(--foreground)';
        return (
          <Pop key={fig.caption} delay={0.5 + i * 0.12}>
            <SvgCard x={fig.x} y={200} w={150} h={72} rx={12} />
            <rect
              x={fig.x + 3}
              y={203}
              width={144}
              height={66}
              rx={10}
              fill={fig.tinted ? 'var(--tertiary)' : 'var(--muted-foreground)'}
              opacity={fig.tinted ? 0.35 : 0.15}
            />
            {[
              { text: fig.value, swap: swapOut },
              { text: fig.filtered, swap: swapIn },
            ].map(({ text: value, swap }, vi) =>
              fig.value === fig.filtered && vi === 1 ? null : (
                <motion.g
                  key={vi}
                  variants={
                    fig.value === fig.filtered
                      ? undefined
                      : swap(FILTER_AT + 0.1)
                  }
                >
                  {fig.unit ? (
                    <>
                      <text
                        x={center + 14}
                        y={238}
                        textAnchor='end'
                        fontFamily={FONT_DISPLAY}
                        fontSize={24}
                        fill={numberFill}
                      >
                        {value}
                      </text>
                      <text
                        x={center + 20}
                        y={238}
                        fontFamily={FONT_SANS}
                        fontSize={11}
                        fontWeight={700}
                        fill={numberFill}
                      >
                        {fig.unit}
                      </text>
                    </>
                  ) : (
                    <text
                      x={center}
                      y={238}
                      textAnchor='middle'
                      fontFamily={FONT_DISPLAY}
                      fontSize={24}
                      fill='var(--foreground)'
                    >
                      {value}
                    </text>
                  )}
                </motion.g>
              ),
            )}
            <text
              x={center}
              y={254}
              textAnchor='middle'
              fontFamily={FONT_SANS}
              fontSize={9.5}
              fontWeight={700}
              fill={fig.tinted ? 'var(--primary)' : 'var(--muted-foreground)'}
            >
              {fig.caption}
            </text>
          </Pop>
        );
      })}

      {/* donut cards */}
      <Pop delay={0.75}>
        <DonutCard
          x={220}
          title='Kategorien'
          centerLabel='Kategorie'
          segments={KATEGORIEN}
          drawDelay={1.0}
        />
      </Pop>
      <Pop delay={0.85}>
        <DonutCard
          x={560}
          title='Herkünfte'
          centerLabel='Herkunft'
          segments={HERKUENFTE}
          drawDelay={1.15}
        />
      </Pop>

      {/* bottom row, clipped at the screen edge */}
      <clipPath id='tour-stats-screen-clip'>
        <rect width={900} height={560} rx={24} />
      </clipPath>
      <g clipPath='url(#tour-stats-screen-clip)'>
        {/* trend line card */}
        <Pop delay={1.0}>
          <SvgCard x={220} y={466} w={320} h={100} rx={12} />
          <text
            x={240}
            y={488}
            fontFamily={FONT_SANS}
            fontSize={10}
            fontWeight={700}
            fill='var(--foreground)'
          >
            Gerettete Lebensmittel über Zeit
          </text>
          <motion.path
            d='M240 552 C 275 547, 300 538, 330 540 S 380 528, 410 529 S 480 518, 510 512'
            fill='none'
            stroke='var(--primary)'
            strokeWidth={2.5}
            strokeLinecap='round'
            variants={{
              idle: { pathLength: 0, opacity: 0 },
              active: {
                pathLength: [0, 0, 1, 1, 1],
                opacity: [0, 0, 1, 1, 0],
                transition: {
                  duration: tourTime(STEP_DURATION),
                  times: [0, t(1.5), t(2.7), t(FILTER_AT), t(FILTER_AT + 0.4)],
                },
              },
              done: {
                pathLength: 1,
                opacity: 0,
                transition: { duration: 0.2 },
              },
            }}
          />
          <motion.path
            d='M240 556 C 280 554, 320 548, 360 550 S 420 542, 460 544 S 490 538, 510 536'
            fill='none'
            stroke='var(--primary)'
            strokeWidth={2.5}
            strokeLinecap='round'
            variants={{
              idle: { pathLength: 0, opacity: 0 },
              active: {
                pathLength: [0, 0, 1],
                opacity: [0, 0, 1],
                transition: {
                  duration: tourTime(STEP_DURATION),
                  times: [0, t(FILTER_AT + 0.2), t(FILTER_AT + 1.2)],
                },
              },
              done: {
                pathLength: 1,
                opacity: 1,
                transition: { duration: 0.2 },
              },
            }}
          />
          {/* hover tooltip on the unfiltered line */}
          <motion.g
            variants={{
              idle: { opacity: 0 },
              active: {
                opacity: [0, 0, 1, 1, 0],
                transition: {
                  duration: tourTime(STEP_DURATION),
                  times: [0, t(3.2), t(3.5), t(5.6), t(5.9)],
                },
              },
              done: { opacity: 0, transition: { duration: 0.2 } },
            }}
          >
            <circle
              cx={450}
              cy={521}
              r={4.5}
              fill='var(--primary)'
              stroke='var(--card)'
              strokeWidth={2}
            />
            <rect
              x={455}
              y={494}
              width={78}
              height={24}
              rx={7}
              fill='var(--foreground)'
            />
            <text
              x={494}
              y={504}
              textAnchor='middle'
              fontFamily={FONT_SANS}
              fontSize={7.5}
              fill='var(--background)'
            >
              24. Juni
            </text>
            <text
              x={494}
              y={514}
              textAnchor='middle'
              fontFamily={FONT_SANS}
              fontSize={9}
              fontWeight={700}
              fill='var(--background)'
            >
              12,5 kg
            </text>
          </motion.g>
        </Pop>

        {/* calendar */}
        <Pop delay={1.1}>
          <SvgCard x={560} y={466} w={320} h={100} rx={12} />
          <text
            x={580}
            y={490}
            fontFamily={FONT_SANS}
            fontSize={13}
            fontWeight={700}
            fill='var(--foreground)'
          >
            Kalender
          </text>
          <ChevronLeft
            x={580}
            y={504}
            width={11}
            height={11}
            color='var(--muted-foreground)'
          />
          <text
            x={720}
            y={513}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={9}
            fontWeight={600}
            fill='var(--foreground)'
          >
            Juni 2026
          </text>
          <ChevronRight
            x={849}
            y={504}
            width={11}
            height={11}
            color='var(--muted-foreground)'
          />
          {Array.from({ length: 7 }, (_, i) => {
            const x = 580 + i * 40;
            const highlighted = CALENDAR_HIGHLIGHTS.includes(i);
            return (
              <motion.g
                key={i}
                variants={{
                  idle: { opacity: 0 },
                  active: {
                    opacity: 1,
                    transition: {
                      delay: tourTime(1.3 + i * 0.05),
                      duration: 0.25,
                    },
                  },
                  done: { opacity: 1, transition: { duration: 0.2 } },
                }}
              >
                <rect
                  x={x}
                  y={524}
                  width={34}
                  height={34}
                  rx={8}
                  fill={highlighted ? 'var(--primary)' : 'var(--muted)'}
                />
                <text
                  x={x + 17}
                  y={545.5}
                  textAnchor='middle'
                  fontFamily={FONT_SANS}
                  fontSize={11}
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
      </g>
    </motion.g>
  );
}
