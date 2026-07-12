'use client';

import { FairteilerTutorialCard } from './fairteiler-tutorial-card';
import { FairteilerTutorialStepsCard } from './fairteiler-tutorial-steps-card';
import { TutorialCardSkeleton } from './tutorial-card-skeleton';
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
  const { tutorial, isPending, error } = useTutorial();

  if (isPending) {
    return <TutorialCardSkeleton />;
  }

  if (error) {
    throw error;
  }

  return (
    <div className='flex flex-col gap-2 md:gap-0'>
      <FairteilerTutorialCard />
      {tutorial && pathname.includes('tutorial') && (
        <FairteilerTutorialStepsCard
          steps={tutorial.steps}
          tutorialId={tutorial.id}
        />
      )}
    </div>
  );
}
