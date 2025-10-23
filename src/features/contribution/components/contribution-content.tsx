'use client';

import { Button } from '@/components/ui/button';
import { Dispatch, SetStateAction, useState } from 'react';
import { ContributionForm } from './form/contribution-form';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { BlurFade } from '@/components/magicui/blur-fade';
import ContributionTable from './contribution-table';
import { ContributionInfos } from './contribution-infos';
import { usePathname } from 'next/navigation';
import {
  FAIRTEILER_DASHBOARD_KEY,
  USER_DASHBOARD_KEY,
} from '@/lib/config/api-routes';
import { useContribution } from '../context/contribution-context';
import { useIsMobile } from '@/lib/hooks/use-devices';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TutorialCarousel } from '../tutorial/components/tutorial-carousel';
import {
  FairteilerTutorialWithSteps,
  FairteilerWithMembers,
} from '@/server/db/db-types';
import {
  ACCESS_VIEW_ROLES,
  MemberRolesEnum,
} from '@/lib/auth/auth-permissions';
import { AccessViewSelector } from './access-view-selector';
import { useSubmissionSelection } from '../hooks/use-submission-selection';

export function ContributionContent() {
  const isMobile = useIsMobile();
  const [openContributionInstructions, setOpenContributionInstructions] =
    useState(false);
  const [openContributionInfos, setOpenContributionInfos] = useState(false);

  const { fairteiler, tutorial, user } = useContribution();
  const fairteilerWithMembers = fairteiler as FairteilerWithMembers;

  // Get current user's member record
  const currentMemberRecord = fairteilerWithMembers?.members.find(
    (member) => member.user.id === user?.id,
  );
  const isOwner = currentMemberRecord?.role === MemberRolesEnum.OWNER;

  // Get access views (employee/guest roles that are not disabled)
  const accessViews = (fairteilerWithMembers?.members || []).filter(
    (member) =>
      ACCESS_VIEW_ROLES.has(member.role as MemberRolesEnum) &&
      member.role !== 'disabled',
  );

  // Manage submission selection with localStorage
  const [selectedAccessViewId, setSelectedAccessViewId] =
    useSubmissionSelection(fairteiler.id);

  const pathname = usePathname();
  const isUserContext = pathname.includes('/hub/user/');
  // const isFairteilerContext = pathname.includes('/hub/fairteiler/');

  const defaultConfig = () => {
    if (isUserContext) {
      return {
        fairteilerId: fairteiler.id,
        successRedirect: '/hub/user/contribution/success',
        revalidatePaths: ['/hub/user/dashboard'],
        cacheKeys: [USER_DASHBOARD_KEY],
        context: 'user' as const,
        submitAsAccessViewId: isOwner ? selectedAccessViewId : undefined,
      };
    } else {
      return {
        fairteilerId: fairteiler.id,
        successRedirect: '/hub/fairteiler/contribution/success',
        revalidatePaths: ['/hub/fairteiler/dashboard'],
        cacheKeys: [FAIRTEILER_DASHBOARD_KEY, USER_DASHBOARD_KEY],
        context: 'fairteiler' as const,
        submitAsAccessViewId: isOwner ? selectedAccessViewId : undefined,
      };
    }
  };

  return (
    <>
      <div className='mx-2 mt-8 mb-64 flex flex-col gap-3 sm:mx-8'>
        <div className='mb-4 flex flex-col items-center gap-2 text-center text-white lg:flex-row lg:justify-between lg:text-start'>
          <h2 className='font-londrina text-4xl font-bold tracking-wider'>
            Retteformular
          </h2>

          <div className='mt-2 flex flex-wrap gap-2 self-center md:mt-0 lg:self-start'>
            {/* Access View Selector - Only for owners with access views */}
            {isOwner && accessViews.length > 0 && (
              <AccessViewSelector
                accessViews={accessViews}
                selectedAccessViewId={selectedAccessViewId}
                onSelectionChange={setSelectedAccessViewId}
              />
            )}

            {tutorial?.steps &&
              tutorial.steps.length > 0 &&
              tutorial.isActive && (
                <Button
                  variant='tertiary'
                  onClick={() => setOpenContributionInstructions(true)}
                >
                  <HelpCircle className='size-5' />
                  <span
                    className={
                      isMobile && !(!isOwner || accessViews.length === 0)
                        ? 'sr-only'
                        : undefined
                    }
                  >
                    Anleitung
                  </span>
                </Button>
              )}
            <Button
              variant='tertiary'
              onClick={() => setOpenContributionInfos(true)}
            >
              <AlertCircle className='size-5 rounded-full bg-tertiary text-white' />
              <span className='hidden md:block'>
                Nicht erlaubte Lebensmittel
              </span>
            </Button>
          </div>
        </div>
        <ContributionForm config={defaultConfig()}>
          <BlurFade duration={0.2}>
            <ContributionTable />
          </BlurFade>
        </ContributionForm>
      </div>
      <ContributionInstructions
        open={openContributionInstructions}
        setOpen={setOpenContributionInstructions}
        tutorial={tutorial}
      />
      <ContributionInfos
        open={openContributionInfos}
        setOpen={setOpenContributionInfos}
      />
    </>
  );
}

function ContributionInstructions({
  open,
  setOpen,
  tutorial,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  tutorial: FairteilerTutorialWithSteps | undefined;
}) {
  const isMobile = useIsMobile();

  // Only show if tutorial exists and is active (button is already conditionally rendered)
  if (!tutorial?.steps || tutorial.steps.length === 0 || !tutorial.isActive) {
    return null;
  }

  return (
    <>
      {isMobile ? (
        <Drawer open={open}>
          <DrawerContent className='mx-auto px-8'>
            <DrawerHeader>
              <DrawerTitle className='text-center font-londrina text-3xl tracking-wider'>
                {tutorial.title.toUpperCase()}
              </DrawerTitle>
            </DrawerHeader>
            <div className='mb-4'>
              <TutorialCarousel
                steps={tutorial.steps}
                onComplete={() => setOpen(false)}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open}>
          <DialogContent className='sm:max-w-xl'>
            <DrawerHeader>
              <DrawerTitle className='text-center font-londrina text-3xl tracking-wider'>
                {tutorial.title.toUpperCase()}
              </DrawerTitle>
            </DrawerHeader>
            <div className='mb-4'>
              <TutorialCarousel
                steps={tutorial.steps}
                onComplete={() => setOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
