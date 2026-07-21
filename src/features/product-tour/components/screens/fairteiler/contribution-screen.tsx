import { ChevronDown, MoreHorizontal, Plus, Send, User } from 'lucide-react';
import { motion } from 'motion/react';
import {
  FONT_SANS,
  Pop,
  SvgButton,
  SvgCard,
  tourTime,
} from '../../svg-primitives';
import { FairteilerChrome } from './fairteiler-chrome';

const STEP_DURATION = 7.7;
const t = (seconds: number) => seconds / STEP_DURATION;

function between(from: number, to: number) {
  return {
    idle: { opacity: 0 },
    active: {
      opacity: to > 0 ? [0, 0, 1, 1, 0] : [0, 0, 1],
      transition:
        to > 0
          ? {
              duration: tourTime(STEP_DURATION),
              times: [0, t(from), t(from + 0.2), t(to), t(to + 0.2)],
            }
          : {
              duration: tourTime(STEP_DURATION),
              times: [0, t(from), t(from + 0.2)],
            },
    },
    done: { opacity: to > 0 ? 0 : 1, transition: { duration: 0.2 } },
  };
}

function appearAt(from: number) {
  return between(from, 0);
}

const PROFILES = [
  { name: 'Mitarbeitende', role: 'Mitarbeiter' },
  { name: 'Gastzugang', role: 'Gast' },
];

const CELLS = [
  {
    x: 240,
    w: 150,
    placeholder: 'Kategorie auswählen',
    value: 'Backwaren',
    fillAt: 4.8,
  },
  {
    x: 405,
    w: 140,
    placeholder: 'Herkunft auswählen',
    value: 'Supermarkt',
    fillAt: 5.4,
  },
  {
    x: 555,
    w: 140,
    placeholder: 'Betrieb auswählen',
    value: 'Golden Crust Bakery',
    fillAt: 6.0,
  },
  { x: 705, w: 70, placeholder: '0', value: '2,5', fillAt: 6.6 },
];

export function FairteilerContributionScreen({ state }: { state: string }) {
  return (
    <motion.g initial='idle' animate={state}>
      <FairteilerChrome active='form' title='Retteformular' bannerH={220} />

      {/* AccessViewSelector trigger */}
      <Pop delay={0.3} dy={4}>
        <SvgButton
          x={640}
          y={50}
          w={200}
          h={34}
          variant='card'
          fontSize={12}
          icon={User}
          trailingIcon={ChevronDown}
          shadow
        >
          <motion.text
            x={678}
            y={71}
            fontFamily={FONT_SANS}
            fontSize={12}
            fontWeight={600}
            fill='var(--foreground)'
            variants={between(0, 2.9)}
          >
            Für mich selbst
          </motion.text>
          <motion.text
            x={678}
            y={71}
            fontFamily={FONT_SANS}
            fontSize={12}
            fontWeight={600}
            fill='var(--foreground)'
            variants={appearAt(2.9)}
          >
            Mitarbeitende
          </motion.text>
        </SvgButton>
      </Pop>

      {/* table card */}
      <Pop delay={0.5}>
        <SvgCard x={220} y={130} w={660} h={320} rx={12} />
        {['Kategorie', 'Herkunft', 'Betrieb', 'Menge (kg)'].map((col, i) => (
          <text
            key={col}
            x={[240, 405, 555, 705][i]}
            y={165}
            fontFamily={FONT_SANS}
            fontSize={12}
            fontWeight={700}
            fill='var(--muted-foreground)'
          >
            {col}
          </text>
        ))}
        <line
          x1={220}
          y1={178}
          x2={880}
          y2={178}
          stroke='var(--border)'
          strokeWidth={1.5}
        />

        {/* empty state, until row appears */}
        <motion.text
          x={550}
          y={250}
          textAnchor='middle'
          fontFamily={FONT_SANS}
          fontSize={13}
          fill='var(--muted-foreground)'
          variants={between(0, 4.0)}
        >
          Bitte trage jedes Lebensmittel einzeln ein.
        </motion.text>

        {/* the inline row */}
        <motion.g variants={appearAt(4.0)}>
          {CELLS.map((cell) => (
            <g key={cell.x}>
              <rect
                x={cell.x}
                y={190}
                width={cell.w}
                height={30}
                rx={8}
                fill='var(--card)'
                stroke='var(--border)'
                strokeWidth={1.5}
              />
              <motion.text
                x={cell.x + 12}
                y={210}
                fontFamily={FONT_SANS}
                fontSize={11}
                fill='var(--muted-foreground)'
                variants={between(0, cell.fillAt)}
              >
                {cell.placeholder}
              </motion.text>
              <motion.text
                x={cell.x + 12}
                y={210}
                fontFamily={FONT_SANS}
                fontSize={11}
                fontWeight={600}
                fill='var(--foreground)'
                variants={appearAt(cell.fillAt)}
              >
                {cell.value}
              </motion.text>
            </g>
          ))}
          <MoreHorizontal
            x={840}
            y={197}
            width={16}
            height={16}
            color='var(--muted-foreground)'
          />
        </motion.g>

        {/* FAB */}
        <circle cx={550} cy={380} r={22} fill='var(--primary)' />
        <Plus
          x={539}
          y={369}
          width={22}
          height={22}
          color='var(--primary-foreground)'
        />
      </Pop>

      {/* footer: switch + submit */}
      <Pop delay={0.65} dy={4}>
        <rect
          x={240}
          y={478}
          width={40}
          height={22}
          rx={11}
          fill='var(--primary)'
        />
        <circle cx={269} cy={489} r={8} fill='var(--primary-foreground)' />
        <text
          x={292}
          y={493}
          fontFamily={FONT_SANS}
          fontSize={12}
          fontWeight={600}
          fill='var(--foreground)'
        >
          Schnelle Ansicht
        </text>
        <SvgButton
          x={760}
          y={470}
          w={115}
          h={36}
          fontSize={13}
          icon={Send}
          label='Absenden'
        />
      </Pop>

      {/* profile dropdown */}
      <motion.g variants={between(1.7, 2.9)}>
        <SvgCard x={640} y={90} w={210} h={150} rx={12} />
        <text
          x={654}
          y={112}
          fontFamily={FONT_SANS}
          fontSize={10}
          fontWeight={600}
          fill='var(--muted-foreground)'
        >
          Beitrag einreichen als
        </text>
        <line
          x1={640}
          y1={120}
          x2={850}
          y2={120}
          stroke='var(--border)'
          strokeWidth={1}
        />
        {PROFILES.map((profile, i) => (
          <g key={profile.name}>
            {i === 0 ? (
              <motion.rect
                x={646}
                y={126}
                width={198}
                height={28}
                rx={6}
                fill='var(--muted)'
                variants={appearAt(2.65)}
              />
            ) : null}
            <text
              x={654}
              y={144 + i * 30}
              fontFamily={FONT_SANS}
              fontSize={12}
              fontWeight={600}
              fill='var(--foreground)'
            >
              {profile.name}
            </text>
            <rect
              x={776}
              y={130 + i * 30}
              width={68}
              height={18}
              rx={9}
              fill='var(--secondary)'
            />
            <text
              x={810}
              y={143 + i * 30}
              textAnchor='middle'
              fontFamily={FONT_SANS}
              fontSize={9}
              fontWeight={600}
              fill='var(--secondary-foreground)'
            >
              {profile.role}
            </text>
          </g>
        ))}
        <line
          x1={640}
          y1={192}
          x2={850}
          y2={192}
          stroke='var(--border)'
          strokeWidth={1}
        />
        <text
          x={654}
          y={218}
          fontFamily={FONT_SANS}
          fontSize={12}
          fontWeight={700}
          fill='var(--foreground)'
        >
          Für mich selbst
        </text>
      </motion.g>
    </motion.g>
  );
}
