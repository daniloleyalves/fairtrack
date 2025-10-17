'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Flame,
  Sparkles,
  Award,
  TableProperties,
  SlidersHorizontal,
} from 'lucide-react';
import { useUserPreferences } from '@/lib/services/preferences-service';
import { Separator } from '@/components/ui/separator';

export default function UserPreferencesCard() {
  const { preferences, updatePreference } = useUserPreferences();

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex flex-col gap-3 xs:flex-row'>
          <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-primary/10'>
            <SlidersHorizontal className='size-5 text-primary' />
          </div>
          <div>
            <CardTitle>Platformerlebnis</CardTitle>
            <CardDescription>
              Passe Formular- und Gamification-Einstellungen nach deinen
              Wünschen an.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        <ContributionPreferences
          formTableView={preferences.formTableView}
          onCheckedChange={(e) => updatePreference('formTableView', e)}
        />
        <Separator />
        <UserGamificationPreferences
          enableStreaks={preferences.enableStreaks}
          enableQuests={preferences.enableQuests}
          enableAIFeedback={preferences.enableAIFeedback}
          onCheckedChange={(e, field) => updatePreference(field, e)}
        />
      </CardContent>
    </Card>
  );
}

function ContributionPreferences({
  formTableView,
  onCheckedChange,
}: {
  formTableView: 'fast' | 'wizard';
  onCheckedChange: (e: 'fast' | 'wizard') => void;
}) {
  const isFastMode = formTableView === 'fast';
  return (
    <div className='space-y-6'>
      <h3 className='mb-2 font-semibold'>Retteformular</h3>
      <div className='space-y-4'>
        {/* FormTableView Setting */}
        <div className='flex justify-between'>
          <div className='flex w-full items-start gap-3 space-y-1'>
            <TableProperties className='size-4 min-w-5 text-primary' />
            <div className='space-y-1'>
              <Label htmlFor='streaks-switch'>Tabellenansicht aktivieren</Label>
              <p className='max-w-11/12 text-xs text-muted-foreground md:max-w-3/4'>
                Zwischen Wizard- und Tabellenansicht wechseln: Tabellenansicht
                aktiviert eine schnell zu bearbeiten, tabellarische Ansicht
                statt der geführten Wizard-Ansicht.
              </p>
            </div>
          </div>
          <Switch
            id='formTableView-switch'
            checked={isFastMode}
            onCheckedChange={(e) => onCheckedChange(e ? 'fast' : 'wizard')}
          />
        </div>
      </div>
    </div>
  );
}

function UserGamificationPreferences({
  enableStreaks,
  enableQuests: _enableQuests,
  enableAIFeedback,
  onCheckedChange,
}: {
  enableStreaks: boolean;
  enableQuests: boolean;
  enableAIFeedback: boolean;
  onCheckedChange: (
    e: boolean,
    field: 'enableStreaks' | 'enableQuests' | 'enableAIFeedback',
  ) => void;
}) {
  return (
    <div className='space-y-6'>
      <h3 className='mb-2 font-semibold'>
        Motivationsmodus-Funktionen (Gamification)
      </h3>

      <div className='space-y-4'>
        {/* Streaks Setting */}
        <div className='flex justify-between'>
          <div className='flex w-full items-start gap-3 space-y-1'>
            <Flame className='size-5 min-w-5 fill-yellow-400 text-yellow-400' />
            <div className='space-y-1'>
              <Label htmlFor='streaks-switch'>Streak aktivieren</Label>
              <p className='max-w-11/12 text-xs text-muted-foreground md:max-w-3/4'>
                Regelmäßige wöchentliche Abgaben bilden eine Serie, die im
                Dashboard durch eine Flamme angezeigt wird. Bei langlaufender
                Serie kannst du Belohnungen erhalten.
              </p>
            </div>
          </div>
          <Switch
            id='streaks-switch'
            checked={enableStreaks}
            onCheckedChange={(e) => onCheckedChange(e, 'enableStreaks')}
          />
        </div>

        {/* Quests Setting */}
        <div className='relative flex justify-between'>
          <div className='absolute top-1/8 left-0 z-10 rotate-335 rounded-lg bg-destructive p-1 px-2 text-xs text-white'>
            Deaktiviert
          </div>
          {/* Main content with disabled styling */}
          <div className='flex w-full cursor-not-allowed items-start gap-3 space-y-1 opacity-50'>
            <Award className='size-5 min-w-5 fill-muted text-muted-foreground' />
            <div className='space-y-1'>
              <Label htmlFor='quests-switch' className='text-muted-foreground'>
                Quests aktivieren
              </Label>
              <p className='max-w-11/12 text-xs text-muted-foreground md:max-w-3/4'>
                Jede deiner Abgaben bringt uns gemeinsam einem Quartalsziel
                näher. Wenn du diese Funktion aktivierst, siehst du dein
                persönliches Ziel und deinen Beitrag dazu direkt im Dashboard.
                Bei einer erfolgreichen Teilnahme erhältst du ein Abzeichen.
              </p>
            </div>
          </div>
          <Switch
            id='quests-switch'
            checked={false}
            disabled={true}
            onCheckedChange={(e) => onCheckedChange(e, 'enableQuests')}
          />
        </div>

        {/* AI Feedback Setting */}
        <div className='flex justify-between'>
          <div className='flex w-full items-start gap-3 space-y-1'>
            <Sparkles className='size-5 min-w-5 text-purple-700' />
            <div className='space-y-1'>
              <Label htmlFor='ai-feedback-switch'>KI-Feedback aktivieren</Label>
              <p className='max-w-11/12 text-xs text-muted-foreground md:max-w-3/4'>
                Nach jeder Abgabe erhältst du kurzes, personalisiertes Feedback
                auf Basis deiner Aktivität.
              </p>
            </div>
          </div>
          <Switch
            id='ai-feedback-switch'
            checked={enableAIFeedback}
            onCheckedChange={(e) => onCheckedChange(e, 'enableAIFeedback')}
          />
        </div>
      </div>
    </div>
  );
}
