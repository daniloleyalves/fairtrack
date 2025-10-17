'use client';

import { FairteilerTutorialCard } from './fairteiler-tutorial-card';
import { FairteilerTutorialStepsCard } from './fairteiler-tutorial-steps-card';
import { usePathname } from 'next/navigation';
import { TutorialProvider, useTutorial } from '../context/tutorial-context';

export function FairteilerTutorialCardWrapper() {
  return (
    <TutorialProvider>
      <FairteilerTutorialCardWrapperContent />
    </TutorialProvider>
  );
}

export function FairteilerTutorialCardWrapperContent() {
  const pathname = usePathname();
  const { tutorial } = useTutorial();

  return (
    <TutorialProvider>
      <div className='flex flex-col gap-2 md:gap-0'>
        <FairteilerTutorialCard />
        {tutorial && pathname.includes('tutorial') && (
          <FairteilerTutorialStepsCard
            steps={tutorial.steps}
            tutorialId={tutorial.id}
          />
        )}
      </div>
    </TutorialProvider>
  );
}
