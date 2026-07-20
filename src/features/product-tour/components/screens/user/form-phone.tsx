import { ArrowLeft, Check, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORY_ICONS } from '../../../assets';
import {
  FONT_DISPLAY,
  FONT_SANS,
  PhoneChrome,
  Pop,
  SvgButton,
  SvgCard,
} from '../../svg-primitives';

const STEP_DURATION = 12;
const t = (seconds: number) => seconds / STEP_DURATION;

const TILE = { w: 112, h: 70, xs: [33, 155], ys: [195, 285] };
const COMPANY_TILE = { w: 112, h: 60, xs: [33, 155], ys: [226, 296] };

const ORIGINS = ['Supermarkt', 'Bäckerei', 'Gastronomie', 'Haushalt'];
const COMPANIES = [
  'Golden Crust Bakery',
  'Metro Fresh Markets',
  'Sunshine Organic Farm',
  'Bella Vista Restaurant',
];
const CATEGORIES = [
  { label: 'Backwaren', icon: CATEGORY_ICONS.backwaren },
  { label: 'Obst', icon: CATEGORY_ICONS.obst },
  { label: 'Gemüse', icon: CATEGORY_ICONS.gemuese },
  { label: 'Milchprodukte', icon: CATEGORY_ICONS.milchprodukte },
];

function fadeAt(delay: number) {
  return {
    idle: { opacity: 0 },
    active: { opacity: 1, transition: { delay, duration: 0.3 } },
    done: { opacity: 1, transition: { duration: 0.2 } },
  };
}

function phaseVariants(inAt: number, outAt?: number) {
  return {
    idle: { opacity: 0, x: inAt > 0 ? 24 : 0 },
    active: {
      opacity: outAt
        ? inAt > 0
          ? [0, 0, 1, 1, 0]
          : [0, 1, 1, 0]
        : [0, 0, 1, 1],
      x: outAt
        ? inAt > 0
          ? [24, 24, 0, 0, -24]
          : [0, 0, 0, -24]
        : [24, 24, 0, 0],
      transition: {
        duration: STEP_DURATION,
        times: outAt
          ? inAt > 0
            ? [0, t(inAt), t(inAt + 0.4), t(outAt), t(outAt + 0.4)]
            : [0, t(0.7), t(outAt), t(outAt + 0.4)]
          : [0, t(inAt), t(inAt + 0.4), 1],
      },
    },
    done: {
      opacity: outAt ? 0 : 1,
      x: outAt ? -24 : 0,
      transition: { duration: 0.2 },
    },
  };
}

function WizardTitle({ title }: { title: string }) {
  return (
    <g>
      <text
        x={35}
        y={164}
        fontFamily={FONT_SANS}
        fontSize={16}
        fontWeight={700}
        fill='var(--foreground)'
      >
        {title}
      </text>
      <line
        x1={35}
        y1={178}
        x2={265}
        y2={178}
        stroke='var(--border)'
        strokeWidth={1.5}
      />
    </g>
  );
}

export function FormPhone({ state }: { state: string }) {
  return (
    <motion.g initial='idle' animate={state}>
      <PhoneChrome>
        <Pop delay={0.15} dy={-6}>
          <path
            d='M0 38 A38 38 0 0 1 38 0 H262 A38 38 0 0 1 300 38 V96 A12 12 0 0 1 288 108 H12 A12 12 0 0 1 0 96 Z'
            fill='var(--card)'
            stroke='var(--border)'
            strokeWidth={1.5}
          />
          <ArrowLeft
            x={18}
            y={52}
            width={18}
            height={18}
            color='var(--foreground)'
          />
          <text
            x={150}
            y={64}
            textAnchor='middle'
            fontFamily={FONT_DISPLAY}
            fontSize={17}
            fill='var(--foreground)'
          >
            Lebensmittel abgeben
          </text>
          <rect
            x={90}
            y={76}
            width={120}
            height={20}
            rx={10}
            fill='var(--primary)'
            opacity={0.12}
          />
          <Check x={102} y={80} width={12} height={12} color='var(--primary)' />
          <text
            x={158}
            y={90}
            textAnchor='middle'
            fontFamily={FONT_SANS}
            fontSize={10}
            fontWeight={600}
            fill='var(--primary)'
          >
            Standort OK
          </text>
        </Pop>

        <Pop delay={0.4}>
          <SvgCard x={15} y={130} w={270} h={380} rx={16} />

          {/* Phase A — Herkunft */}
          <motion.g variants={phaseVariants(0, 2.4)}>
            <WizardTitle title='Herkunft' />
            {ORIGINS.map((label, i) => {
              const x = TILE.xs[i % 2];
              const y = TILE.ys[Math.floor(i / 2)];
              return (
                <g key={label}>
                  <rect
                    x={x}
                    y={y}
                    width={TILE.w}
                    height={TILE.h}
                    rx={12}
                    fill='var(--card)'
                    stroke='var(--border)'
                    strokeWidth={1.5}
                  />
                  <text
                    x={x + TILE.w / 2}
                    y={y + TILE.h / 2 + 4}
                    textAnchor='middle'
                    fontFamily={FONT_SANS}
                    fontSize={11.5}
                    fontWeight={600}
                    fill='var(--foreground)'
                  >
                    {label}
                  </text>
                </g>
              );
            })}
            <motion.g variants={fadeAt(1.85)}>
              <rect
                x={TILE.xs[0]}
                y={TILE.ys[0]}
                width={TILE.w}
                height={TILE.h}
                rx={12}
                fill='var(--primary)'
              />
              <text
                x={TILE.xs[0] + TILE.w / 2}
                y={TILE.ys[0] + TILE.h / 2 + 4}
                textAnchor='middle'
                fontFamily={FONT_SANS}
                fontSize={11.5}
                fontWeight={600}
                fill='var(--primary-foreground)'
              >
                Supermarkt
              </text>
            </motion.g>
          </motion.g>

          {/* Phase B — Betrieb */}
          <motion.g variants={phaseVariants(2.8, 5.2)}>
            <WizardTitle title='Betrieb' />
            <rect
              x={35}
              y={188}
              width={230}
              height={26}
              rx={13}
              fill='var(--muted)'
            />
            <Search
              x={45}
              y={194}
              width={14}
              height={14}
              color='var(--muted-foreground)'
            />
            <text
              x={66}
              y={205}
              fontFamily={FONT_SANS}
              fontSize={10}
              fill='var(--muted-foreground)'
            >
              Suchen...
            </text>
            {COMPANIES.map((label, i) => {
              const x = COMPANY_TILE.xs[i % 2];
              const y = COMPANY_TILE.ys[Math.floor(i / 2)];
              return (
                <g key={label}>
                  <rect
                    x={x}
                    y={y}
                    width={COMPANY_TILE.w}
                    height={COMPANY_TILE.h}
                    rx={12}
                    fill='var(--card)'
                    stroke='var(--border)'
                    strokeWidth={1.5}
                  />
                  <text
                    x={x + COMPANY_TILE.w / 2}
                    y={y + COMPANY_TILE.h / 2 + 3.5}
                    textAnchor='middle'
                    fontFamily={FONT_SANS}
                    fontSize={9}
                    fontWeight={600}
                    fill='var(--foreground)'
                  >
                    {label}
                  </text>
                </g>
              );
            })}
            <motion.g variants={fadeAt(4.25)}>
              <rect
                x={COMPANY_TILE.xs[0]}
                y={COMPANY_TILE.ys[0]}
                width={COMPANY_TILE.w}
                height={COMPANY_TILE.h}
                rx={12}
                fill='var(--primary)'
              />
              <text
                x={COMPANY_TILE.xs[0] + COMPANY_TILE.w / 2}
                y={COMPANY_TILE.ys[0] + COMPANY_TILE.h / 2 + 3.5}
                textAnchor='middle'
                fontFamily={FONT_SANS}
                fontSize={9}
                fontWeight={600}
                fill='var(--primary-foreground)'
              >
                Golden Crust Bakery
              </text>
            </motion.g>
          </motion.g>

          {/* Phase C — Kategorien */}
          <motion.g variants={phaseVariants(5.6)}>
            <WizardTitle title='Kategorien' />
            {CATEGORIES.map((cat, i) => {
              const x = TILE.xs[i % 2];
              const y = TILE.ys[Math.floor(i / 2)];
              return (
                <g key={cat.label}>
                  <rect
                    x={x}
                    y={y}
                    width={TILE.w}
                    height={TILE.h}
                    rx={12}
                    fill='var(--card)'
                    stroke='var(--border)'
                    strokeWidth={1.5}
                  />
                  <image
                    href={cat.icon}
                    x={x + TILE.w / 2 - 16}
                    y={y + 7}
                    width={32}
                    height={32}
                    preserveAspectRatio='xMidYMid meet'
                  />
                  <text
                    x={x + TILE.w / 2}
                    y={y + 55}
                    textAnchor='middle'
                    fontFamily={FONT_SANS}
                    fontSize={9}
                    fontWeight={600}
                    fill='var(--foreground)'
                  >
                    {cat.label}
                  </text>
                </g>
              );
            })}
            <motion.rect
              x={TILE.xs[0]}
              y={TILE.ys[0]}
              width={TILE.w}
              height={TILE.h}
              rx={12}
              fill='none'
              stroke='var(--primary)'
              strokeWidth={3}
              variants={fadeAt(6.7)}
            />
            <motion.g
              variants={{
                idle: { opacity: 0, y: -5 },
                active: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: 9.8, duration: 0.35, ease: 'backOut' },
                },
                done: { opacity: 1, y: 0, transition: { duration: 0.2 } },
              }}
            >
              <rect
                x={TILE.xs[0] + TILE.w / 2 - 26}
                y={TILE.ys[0] + TILE.h - 8}
                width={52}
                height={20}
                rx={10}
                fill='var(--primary)'
              />
              <text
                x={TILE.xs[0] + TILE.w / 2}
                y={TILE.ys[0] + TILE.h + 6}
                textAnchor='middle'
                fontFamily={FONT_SANS}
                fontSize={10}
                fontWeight={700}
                fill='var(--primary-foreground)'
              >
                2,5 kg
              </text>
            </motion.g>
          </motion.g>

          {/* Footer */}
          <line
            x1={15}
            y1={460}
            x2={285}
            y2={460}
            stroke='var(--border)'
            strokeWidth={1.5}
          />
          <text
            x={35}
            y={488}
            fontFamily={FONT_SANS}
            fontSize={11}
            fontWeight={600}
            fill='var(--muted-foreground)'
          >
            Abbrechen
          </text>
          <motion.g
            variants={{
              idle: { opacity: 1 },
              active: {
                opacity: [1, 1, 0],
                transition: {
                  duration: STEP_DURATION,
                  times: [0, t(5.5), t(5.8)],
                },
              },
              done: { opacity: 0, transition: { duration: 0.2 } },
            }}
          >
            <SvgButton
              x={170}
              y={470}
              w={100}
              h={28}
              variant='muted'
              fontSize={11}
              label='Weiter'
            />
          </motion.g>
          <motion.g
            variants={{
              idle: { opacity: 0 },
              active: {
                opacity: [0, 0, 1],
                transition: {
                  duration: STEP_DURATION,
                  times: [0, t(5.7), t(6.0)],
                },
              },
              done: { opacity: 1, transition: { duration: 0.2 } },
            }}
          >
            <SvgButton
              x={170}
              y={470}
              w={100}
              h={28}
              fontSize={11}
              label='Speichern'
            />
          </motion.g>

          {/* quantity details modal */}
          <motion.g
            variants={{
              idle: { opacity: 0 },
              active: {
                opacity: [0, 0, 1, 1, 0],
                transition: {
                  duration: STEP_DURATION,
                  times: [0, t(6.9), t(7.15), t(9.6), t(9.85)],
                },
              },
              done: { opacity: 0, transition: { duration: 0.2 } },
            }}
          >
            <rect
              width={300}
              height={620}
              rx={38}
              fill='var(--foreground)'
              opacity={0.35}
            />
            <SvgCard x={30} y={190} w={240} h={230} rx={14} />
            <image
              href={CATEGORY_ICONS.backwaren}
              x={101}
              y={206}
              width={22}
              height={22}
              preserveAspectRatio='xMidYMid meet'
            />
            <text
              x={165}
              y={222}
              textAnchor='middle'
              fontFamily={FONT_SANS}
              fontSize={13}
              fontWeight={700}
              fill='var(--foreground)'
            >
              Backwaren
            </text>
            <text
              x={150}
              y={246}
              textAnchor='middle'
              fontFamily={FONT_SANS}
              fontSize={8.5}
              fill='var(--muted-foreground)'
            >
              Bitte gib eine möglichst genaue Menge
            </text>
            <text
              x={150}
              y={258}
              textAnchor='middle'
              fontFamily={FONT_SANS}
              fontSize={8.5}
              fill='var(--muted-foreground)'
            >
              des Lebensmittels an.
            </text>
            <text
              x={150}
              y={282}
              textAnchor='middle'
              fontFamily={FONT_SANS}
              fontSize={9}
              fontWeight={600}
              fill='var(--foreground)'
            >
              Wie viel hast du gerettet? (Kilogramm)
            </text>
            <rect
              x={60}
              y={292}
              width={34}
              height={32}
              rx={8}
              fill='var(--card)'
              stroke='var(--border)'
              strokeWidth={1.5}
            />
            <text
              x={77}
              y={308}
              textAnchor='middle'
              dominantBaseline='central'
              fontFamily={FONT_SANS}
              fontSize={15}
              fontWeight={600}
              fill='var(--foreground)'
            >
              −
            </text>
            <rect
              x={104}
              y={292}
              width={92}
              height={32}
              rx={8}
              fill='var(--card)'
              stroke='var(--border)'
              strokeWidth={1.5}
            />
            {[
              { value: '0', from: 0, to: 7.7 },
              { value: '1,0', from: 7.7, to: 8.4 },
              { value: '2,5', from: 8.4, to: 0 },
            ].map((v) => (
              <motion.text
                key={v.value}
                x={150}
                y={308}
                textAnchor='middle'
                dominantBaseline='central'
                fontFamily={FONT_SANS}
                fontSize={13}
                fontWeight={700}
                fill='var(--foreground)'
                variants={{
                  idle: { opacity: v.from === 0 ? 1 : 0 },
                  active: {
                    opacity:
                      v.from === 0
                        ? [1, 1, 0]
                        : v.to > 0
                          ? [0, 0, 1, 1, 0]
                          : [0, 0, 1],
                    transition: {
                      duration: STEP_DURATION,
                      times:
                        v.from === 0
                          ? [0, t(v.to), t(v.to + 0.05)]
                          : v.to > 0
                            ? [
                                0,
                                t(v.from),
                                t(v.from + 0.05),
                                t(v.to),
                                t(v.to + 0.05),
                              ]
                            : [0, t(v.from), t(v.from + 0.05)],
                    },
                  },
                  done: {
                    opacity: v.to === 0 ? 1 : 0,
                    transition: { duration: 0.2 },
                  },
                }}
              >
                {v.value}
              </motion.text>
            ))}
            <rect
              x={206}
              y={292}
              width={34}
              height={32}
              rx={8}
              fill='var(--card)'
              stroke='var(--border)'
              strokeWidth={1.5}
            />
            <text
              x={223}
              y={308}
              textAnchor='middle'
              dominantBaseline='central'
              fontFamily={FONT_SANS}
              fontSize={15}
              fontWeight={600}
              fill='var(--foreground)'
            >
              +
            </text>
            <SvgButton
              x={44}
              y={372}
              w={100}
              h={30}
              variant='outline'
              fontSize={11}
              label='Abbrechen'
            />
            <SvgButton
              x={156}
              y={372}
              w={100}
              h={30}
              fontSize={11}
              label='Okay'
            />
          </motion.g>
        </Pop>
      </PhoneChrome>
    </motion.g>
  );
}
