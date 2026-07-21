import raupe from '@/lib/assets/raupe.png';
import {
  Coffee,
  Flame,
  History,
  LayoutDashboard,
  Map,
  MessageCircle,
  Settings2,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  FONT_DISPLAY,
  FONT_SANS,
  PhoneBanner,
  PhoneChrome,
  Pop,
  SvgCard,
  tourTime,
  useTourFilter,
} from '../../svg-primitives';

const DONUT = [
  { fraction: 0.4, rotate: -90, color: 'var(--primary)', label: 'Backwaren' },
  { fraction: 0.28, rotate: 54, color: 'var(--tertiary)', label: 'Gemüse' },
  { fraction: 0.18, rotate: 155, color: 'var(--secondary)', label: 'Obst' },
  {
    fraction: 0.12,
    rotate: 220,
    color: 'var(--muted-foreground)',
    label: 'Sonstiges',
  },
];

const DOCK_ICONS = [
  { Icon: LayoutDashboard, x: 57 },
  { Icon: Map, x: 93 },
  { Icon: History, x: 129 },
  { Icon: MessageCircle, x: 165 },
  { Icon: Settings2, x: 201 },
  { Icon: Coffee, x: 243 },
];

const MILESTONES = [
  { n: 1, cx: 55, achieved: true },
  { n: 5, cx: 118, achieved: true },
  { n: 10, cx: 181, achieved: true },
  { n: 20, cx: 244, achieved: false },
];

export function DashboardPhone({ state }: { state: string }) {
  const shadowFilter = useTourFilter('shadow');
  const grayscaleFilter = useTourFilter('grayscale');
  return (
    <motion.g initial='idle' animate={state}>
      <PhoneChrome>
        <PhoneBanner h={130} />
        <Pop delay={0.15} dy={6}>
          <text
            x={150}
            y={66}
            textAnchor='middle'
            fontFamily={FONT_DISPLAY}
            fontSize={26}
            letterSpacing={1}
            fill='var(--primary-foreground)'
          >
            Hallo Marie!
          </text>
        </Pop>
        <Pop delay={0.3} dy={4}>
          <rect
            x={85}
            y={82}
            width={130}
            height={26}
            rx={13}
            fill='var(--primary-foreground)'
            opacity={0.25}
          />
          <Flame
            x={97}
            y={87}
            width={16}
            height={16}
            color='#eab308'
            fill='#eab308'
          />
          <text
            x={119}
            y={99}
            fontFamily={FONT_SANS}
            fontSize={10}
            fontWeight={600}
            fill='var(--primary-foreground)'
          >
            3 Tage Streak
          </text>
        </Pop>

        <Pop delay={0.4}>
          <SvgCard x={20} y={148} w={260} h={76} rx={14} />
          <rect
            x={25}
            y={153}
            width={250}
            height={66}
            rx={10}
            fill='var(--tertiary)'
            opacity={0.35}
          />
          <text
            x={163}
            y={186}
            textAnchor='end'
            fontFamily={FONT_DISPLAY}
            fontSize={30}
            fill='var(--primary)'
          >
            33,6
          </text>
          <text
            x={170}
            y={186}
            fontFamily={FONT_SANS}
            fontSize={12}
            fontWeight={700}
            fill='var(--primary)'
          >
            kg
          </text>
          <text
            x={150}
            y={208}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={11}
            fontWeight={700}
            fill='var(--primary)'
          >
            gerettet
          </text>
        </Pop>
        <Pop delay={0.55}>
          <SvgCard x={20} y={234} w={260} h={76} rx={13} />
          <rect
            x={25}
            y={239}
            width={250}
            height={66}
            rx={10}
            fill='var(--muted-foreground)'
            opacity={0.15}
          />
          <text
            x={150}
            y={272}
            textAnchor='middle'
            fontFamily={FONT_DISPLAY}
            fontSize={30}
            fill='var(--foreground)'
          >
            16
          </text>
          <text
            x={150}
            y={294}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={11}
            fontWeight={700}
            fill='var(--muted-foreground)'
          >
            Abgaben
          </text>
        </Pop>

        {/* Meilensteine */}
        <Pop delay={0.7}>
          <SvgCard x={20} y={322} w={260} h={100} rx={14} />
          <text
            x={150}
            y={344}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={13}
            fontWeight={700}
            fill='var(--foreground)'
          >
            Meilensteine
          </text>
          <text
            x={150}
            y={359}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={9}
            fill='var(--muted-foreground)'
          >
            (Abgaben)
          </text>
          {MILESTONES.map((m, i) => (
            <motion.g
              key={m.n}
              variants={{
                idle: { opacity: 0, y: 6 },
                active: {
                  opacity: m.achieved ? 1 : 0.5,
                  y: 0,
                  transition: {
                    delay: tourTime(0.95 + i * 0.18),
                    duration: 0.4,
                    ease: 'backOut',
                  },
                },
                done: {
                  opacity: m.achieved ? 1 : 0.5,
                  y: 0,
                  transition: { duration: 0.2 },
                },
              }}
            >
              <image
                href={raupe.src}
                x={m.cx - 22}
                y={366}
                width={44}
                height={38}
                preserveAspectRatio='xMidYMid meet'
                filter={m.achieved ? undefined : grayscaleFilter}
              />
              <circle
                cx={m.cx}
                cy={385}
                r={9}
                fill={m.achieved ? '#eab308' : 'var(--muted)'}
              />
              <text
                x={m.cx}
                y={388.5}
                textAnchor='middle'
                fontFamily={FONT_SANS}
                fontSize={9}
                fontWeight={700}
                fill={m.achieved ? 'var(--card)' : 'var(--muted-foreground)'}
              >
                {m.n}
              </text>
            </motion.g>
          ))}
          {/* pulse ring on the next milestone */}
          <motion.circle
            cx={244}
            cy={387}
            r={22}
            fill='none'
            stroke='var(--tertiary)'
            strokeWidth={2}
            variants={{
              idle: { opacity: 0, scale: 0.8 },
              active: {
                opacity: [0, 0.7, 0],
                scale: [0.8, 1.2, 1.35],
                transition: {
                  delay: tourTime(1.9),
                  duration: 1.4,
                  repeat: Infinity,
                  repeatDelay: 0.4,
                },
              },
              done: { opacity: 0, transition: { duration: 0.2 } },
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        </Pop>

        {/* Kategorien */}
        <Pop delay={0.85}>
          <SvgCard x={20} y={432} w={260} h={168} rx={14} />
          <g transform='translate(150, 500)'>
            {DONUT.map((seg) => (
              <g key={seg.label} transform={`rotate(${seg.rotate})`}>
                <motion.circle
                  r={34}
                  fill='none'
                  stroke={seg.color}
                  strokeWidth={16}
                  variants={{
                    idle: { pathLength: 0, opacity: 0 },
                    active: {
                      pathLength: seg.fraction,
                      opacity: 1,
                      transition: {
                        pathLength: {
                          delay: tourTime(1.3),
                          duration: 1,
                          ease: 'easeOut',
                        },
                        opacity: { delay: tourTime(1.3), duration: 0.1 },
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
          <Pop delay={1.6} dy={0}>
            <text
              x={150}
              y={504}
              textAnchor='middle'
              fontFamily={FONT_SANS}
              fontSize={10}
              fontWeight={700}
              fill='var(--foreground)'
            >
              Kategorien
            </text>
          </Pop>
          {DONUT.map((seg, i) => (
            <Pop key={seg.label} delay={1.6 + i * 0.1} dy={4}>
              <rect
                x={45 + (i % 2) * 120}
                y={545 + Math.floor(i / 2) * 17}
                width={9}
                height={9}
                rx={3}
                fill={seg.color}
              />
              <text
                x={60 + (i % 2) * 120}
                y={553 + Math.floor(i / 2) * 17}
                fontFamily={FONT_SANS}
                fontSize={10}
                fill='var(--muted-foreground)'
              >
                {seg.label}
              </text>
            </Pop>
          ))}
        </Pop>

        <Pop delay={0.55} dy={16}>
          <rect
            x={30}
            y={555}
            width={240}
            height={50}
            rx={25}
            fill='var(--card)'
            stroke='var(--border)'
            strokeWidth={1.5}
            filter={shadowFilter}
          />
          {DOCK_ICONS.map(({ Icon, x }) => (
            <Icon
              key={x}
              x={x - 10}
              y={570}
              width={20}
              height={20}
              color={x === 57 ? 'var(--primary)' : 'var(--muted-foreground)'}
            />
          ))}
          <line
            x1={227}
            y1={568}
            x2={227}
            y2={592}
            stroke='var(--border)'
            strokeWidth={1.5}
          />
        </Pop>
      </PhoneChrome>
    </motion.g>
  );
}
