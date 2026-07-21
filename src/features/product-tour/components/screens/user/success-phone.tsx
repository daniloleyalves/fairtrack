import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import {
  draw,
  FONT_SANS,
  PhoneChrome,
  Pop,
  SvgButton,
  SvgCard,
  tourTime,
} from '../../svg-primitives';

const AI_PURPLE = '#7c3aed';
const AI_LINES = [
  'Super gemacht, Marie! Noch drei Abgaben',
  'und du erreichst deinen nächsten Meilenstein!',
];
const AI_TYPE_START = 2.2;
const AI_CHAR_DELAY = 0.035;

const CONFETTI = [
  { dx: -70, dy: -55, color: 'var(--primary)' },
  { dx: 60, dy: -70, color: 'var(--tertiary)' },
  { dx: -90, dy: 15, color: 'var(--tertiary)' },
  { dx: 90, dy: -8, color: 'var(--primary)' },
  { dx: -45, dy: 70, color: 'var(--primary)' },
  { dx: 55, dy: 60, color: 'var(--tertiary)' },
];

export function SuccessPhone({ state }: { state: string }) {
  return (
    <motion.g initial='idle' animate={state}>
      <PhoneChrome>
        {CONFETTI.map((c, i) => (
          <motion.circle
            key={i}
            cx={150}
            cy={200}
            r={4}
            fill={c.color}
            variants={{
              idle: { opacity: 0, x: 0, y: 0 },
              active: {
                opacity: [0, 1, 0],
                x: c.dx,
                y: c.dy,
                transition: {
                  delay: tourTime(0.9),
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
          <SvgCard x={25} y={130} w={250} h={355} rx={16} />
        </Pop>

        <motion.circle
          cx={150}
          cy={200}
          r={26}
          fill='none'
          stroke='var(--primary)'
          strokeWidth={3.5}
          strokeLinecap='round'
          variants={draw(0.4, 0.7)}
        />
        <motion.path
          d='M138 201 l9 10 l16 -19'
          fill='none'
          stroke='var(--primary)'
          strokeWidth={3.5}
          strokeLinecap='round'
          strokeLinejoin='round'
          variants={draw(1, 0.4)}
        />

        <Pop delay={1.2} dy={6}>
          <text
            x={150}
            y={256}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={20}
            fontWeight={700}
            fill='var(--foreground)'
          >
            Super!
          </text>
        </Pop>
        <Pop delay={1.35} dy={6}>
          <text
            x={150}
            y={278}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={11}
            fill='var(--muted-foreground)'
          >
            Das Retteformular wurde
          </text>
          <text
            x={150}
            y={293}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={11}
            fill='var(--muted-foreground)'
          >
            erfolgreich ausgefüllt.
          </text>
        </Pop>

        <Pop delay={1.55} dy={6}>
          <SvgButton
            x={45}
            y={310}
            w={210}
            h={30}
            fontSize={11}
            label='Weiter zum Dashboard'
          />
        </Pop>
        <Pop delay={1.7} dy={6}>
          <SvgButton
            x={45}
            y={350}
            w={210}
            h={30}
            fontSize={11}
            variant='outline'
            label='Formular erneut ausfüllen'
          />
        </Pop>
        <Pop delay={1.85} dy={4}>
          <line
            x1={45}
            y1={400}
            x2={98}
            y2={400}
            stroke='var(--border)'
            strokeWidth={1.5}
          />
          <text
            x={150}
            y={404}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={10}
            fontWeight={600}
            fill='var(--muted-foreground)'
          >
            Beiträge anzeigen
          </text>
          <line
            x1={202}
            y1={400}
            x2={255}
            y2={400}
            stroke='var(--border)'
            strokeWidth={1.5}
          />
        </Pop>

        {/* AI feedback, typed in */}
        <Pop delay={2.0} dy={6}>
          <rect
            x={40}
            y={420}
            width={220}
            height={50}
            rx={10}
            fill={AI_PURPLE}
            opacity={0.1}
          />
          <Sparkles x={48} y={429} width={15} height={15} color={AI_PURPLE} />
          {AI_LINES.map((line, li) => {
            const offset = AI_LINES.slice(0, li).reduce(
              (n, l) => n + l.length,
              0,
            );
            return (
              <text
                key={line}
                x={li === 0 ? 68 : 48}
                y={440 + li * 17}
                fontFamily={FONT_SANS}
                fontSize={9}
                fontWeight={500}
                fill={AI_PURPLE}
              >
                {line.split('').map((ch, ci) => (
                  <motion.tspan
                    key={ci}
                    variants={{
                      idle: { opacity: 0 },
                      active: {
                        opacity: 1,
                        transition: {
                          delay: tourTime(
                            AI_TYPE_START + (offset + ci) * AI_CHAR_DELAY,
                          ),
                          duration: 0.01,
                        },
                      },
                      done: { opacity: 1, transition: { duration: 0.1 } },
                    }}
                  >
                    {ch === ' ' ? ' ' : ch}
                  </motion.tspan>
                ))}
              </text>
            );
          })}
        </Pop>
      </PhoneChrome>
    </motion.g>
  );
}
