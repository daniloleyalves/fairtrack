import { motion } from 'motion/react';
import {
  draw,
  FONT_SANS,
  Pop,
  ScreenChrome,
  SvgButton,
  SvgCard,
} from '../../svg-primitives';

const CONFETTI = [
  { dx: -90, dy: -70, color: 'var(--primary)' },
  { dx: 80, dy: -90, color: 'var(--tertiary)' },
  { dx: -120, dy: 20, color: 'var(--tertiary)' },
  { dx: 120, dy: -10, color: 'var(--primary)' },
  { dx: -60, dy: 90, color: 'var(--primary)' },
  { dx: 70, dy: 80, color: 'var(--tertiary)' },
];

export function SuccessScreen({ state }: { state: string }) {
  return (
    <motion.g initial='idle' animate={state}>
      <ScreenChrome w={900} h={560} bannerH={90} />

      {CONFETTI.map((c, i) => (
        <motion.circle
          key={i}
          cx={450}
          cy={190}
          r={5}
          fill={c.color}
          variants={{
            idle: { opacity: 0, x: 0, y: 0 },
            active: {
              opacity: [0, 1, 0],
              x: c.dx,
              y: c.dy,
              transition: {
                delay: 0.9,
                duration: 1,
                ease: 'easeOut',
                times: [0, 0.2, 1],
              },
            },
            done: { opacity: 0, transition: { duration: 0.2 } },
          }}
        />
      ))}

      <Pop delay={0.2}>
        <SvgCard x={280} y={120} w={340} h={330} rx={20} />
      </Pop>

      <motion.circle
        cx={450}
        cy={190}
        r={30}
        fill='none'
        stroke='var(--primary)'
        strokeWidth={4}
        strokeLinecap='round'
        variants={draw(0.4, 0.7)}
      />
      <motion.path
        d='M436 191 l10 11 l19 -22'
        fill='none'
        stroke='var(--primary)'
        strokeWidth={4}
        strokeLinecap='round'
        strokeLinejoin='round'
        variants={draw(1, 0.4)}
      />

      <Pop delay={1.2} dy={8}>
        <text
          x={450}
          y={254}
          textAnchor='middle'
          fontFamily={FONT_SANS}
          fontSize={24}
          fontWeight={700}
          fill='var(--foreground)'
        >
          Super!
        </text>
      </Pop>
      <Pop delay={1.35} dy={8}>
        <text
          x={450}
          y={278}
          textAnchor='middle'
          fontFamily={FONT_SANS}
          fontSize={13}
          fill='var(--muted-foreground)'
        >
          Das Retteformular wurde
        </text>
        <text
          x={450}
          y={296}
          textAnchor='middle'
          fontFamily={FONT_SANS}
          fontSize={13}
          fill='var(--muted-foreground)'
        >
          erfolgreich ausgefüllt.
        </text>
      </Pop>

      <Pop delay={1.55} dy={8}>
        <SvgButton x={320} y={316} w={260} label='Weiter zum Dashboard' />
      </Pop>
      <Pop delay={1.7} dy={8}>
        <SvgButton
          x={320}
          y={362}
          w={260}
          variant='outline'
          label='Formular erneut ausfüllen'
        />
      </Pop>
      <Pop delay={1.85} dy={6}>
        <line
          x1={320}
          y1={422}
          x2={392}
          y2={422}
          stroke='var(--border)'
          strokeWidth={1.5}
        />
        <text
          x={450}
          y={426}
          textAnchor='middle'
          fontFamily={FONT_SANS}
          fontSize={11}
          fontWeight={600}
          fill='var(--muted-foreground)'
        >
          Beiträge anzeigen
        </text>
        <line
          x1={508}
          y1={422}
          x2={580}
          y2={422}
          stroke='var(--border)'
          strokeWidth={1.5}
        />
      </Pop>
    </motion.g>
  );
}
