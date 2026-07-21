import { Globe, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { FAIRTEILER_THUMBNAIL } from '../../../assets';
import {
  draw,
  FONT_SANS,
  PhoneChrome,
  Pop,
  SvgButton,
  SvgCard,
  tourTime,
  useTourFilter,
} from '../../svg-primitives';

const PINS = [
  { x: 120, y: 420, delay: 1.1 },
  { x: 200, y: 260, delay: 1.25 },
  { x: 70, y: 300, delay: 1.4 },
];

export function FinderPhone({ state }: { state: string }) {
  const shadowFilter = useTourFilter('shadow');
  return (
    <motion.g initial='idle' animate={state}>
      <PhoneChrome>
        <Pop delay={0.2} dy={0}>
          <rect width={300} height={620} rx={38} fill='var(--muted)' />
          <motion.path
            d='M0 220 C 80 200, 180 250, 300 230'
            fill='none'
            stroke='var(--card)'
            strokeWidth={12}
            variants={draw(0.4, 0.8)}
          />
          <motion.path
            d='M0 480 C 100 500, 220 450, 300 490'
            fill='none'
            stroke='var(--card)'
            strokeWidth={9}
            variants={draw(0.55, 0.8)}
          />
          <motion.path
            d='M170 0 C 180 160, 150 400, 170 620'
            fill='none'
            stroke='var(--card)'
            strokeWidth={9}
            variants={draw(0.7, 0.8)}
          />
        </Pop>

        {/* proximity radius + user location */}
        <motion.g
          variants={{
            idle: { opacity: 0 },
            active: {
              opacity: 1,
              transition: { delay: tourTime(0.9), duration: 0.5 },
            },
            done: { opacity: 1, transition: { duration: 0.2 } },
          }}
        >
          <circle
            cx={150}
            cy={470}
            r={90}
            fill='var(--tertiary)'
            opacity={0.12}
          />
          <circle
            cx={150}
            cy={470}
            r={90}
            fill='none'
            stroke='var(--tertiary)'
            strokeWidth={1.5}
            strokeDasharray='5 5'
          />
          <circle cx={150} cy={470} r={10} fill='var(--card)' />
          <circle cx={150} cy={470} r={6.5} fill='#3b82f6' />
        </motion.g>

        {PINS.map((pin) => (
          <motion.g
            key={`${pin.x}-${pin.y}`}
            variants={{
              idle: { opacity: 0, y: -20 },
              active: {
                opacity: 1,
                y: 0,
                transition: {
                  delay: tourTime(pin.delay),
                  duration: 0.45,
                  ease: 'backOut',
                },
              },
              done: { opacity: 1, y: 0, transition: { duration: 0.2 } },
            }}
          >
            <circle cx={pin.x} cy={pin.y} r={11} fill='var(--card)' />
            <circle cx={pin.x} cy={pin.y} r={7} fill='var(--tertiary)' />
          </motion.g>
        ))}

        <Pop delay={0.5} dy={-10}>
          <rect
            x={75}
            y={45}
            width={150}
            height={34}
            rx={17}
            fill='var(--primary)'
            filter={shadowFilter}
          />
          <MapPin
            x={92}
            y={53}
            width={18}
            height={18}
            color='var(--primary-foreground)'
          />
          <text
            x={160}
            y={67}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={13}
            fontWeight={600}
            fill='var(--primary-foreground)'
          >
            Fairteiler (3)
          </text>
        </Pop>

        <motion.g
          variants={{
            idle: { opacity: 0, y: 10, scale: 0.95 },
            active: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                delay: tourTime(3.1),
                duration: 0.4,
                ease: 'backOut',
              },
            },
            done: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.2 },
            },
          }}
          style={{ transformBox: 'fill-box', transformOrigin: 'bottom center' }}
        >
          <path
            d='M120 402 l-8 -10 h16 Z'
            fill='var(--card)'
            filter={shadowFilter}
          />
          <SvgCard x={62} y={194} w={176} h={198} rx={12} />
          <clipPath id='tour-ft-thumb'>
            <path d='M62 206 A12 12 0 0 1 74 194 H226 A12 12 0 0 1 238 206 V272 H62 Z' />
          </clipPath>
          <image
            href={FAIRTEILER_THUMBNAIL}
            x={62}
            y={194}
            width={176}
            height={78}
            preserveAspectRatio='xMidYMid slice'
            clipPath='url(#tour-ft-thumb)'
          />
          <text
            x={150}
            y={294}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={13}
            fontWeight={700}
            fill='var(--foreground)'
          >
            Raupe Immersatt
          </text>
          <rect
            x={94}
            y={304}
            width={44}
            height={18}
            rx={9}
            fill='var(--secondary)'
          />
          <text
            x={116}
            y={317}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={10}
            fontWeight={600}
            fill='var(--secondary-foreground)'
          >
            Café
          </text>
          <rect
            x={146}
            y={304}
            width={60}
            height={18}
            rx={9}
            fill='var(--secondary)'
          />
          <text
            x={176}
            y={317}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={10}
            fontWeight={600}
            fill='var(--secondary-foreground)'
          >
            Stuttgart
          </text>
          <Globe
            x={100}
            y={335}
            width={11}
            height={11}
            color='var(--primary)'
          />
          <text
            x={117}
            y={343.5}
            fontFamily={FONT_SANS}
            fontSize={9.5}
            fontWeight={600}
            fill='var(--primary)'
            textDecoration='underline'
          >
            raupeimmersatt.de
          </text>
          <SvgButton
            x={70}
            y={356}
            w={160}
            h={28}
            fontSize={11}
            label='Hier Lebensmittel abgeben'
          />
        </motion.g>
      </PhoneChrome>
    </motion.g>
  );
}
