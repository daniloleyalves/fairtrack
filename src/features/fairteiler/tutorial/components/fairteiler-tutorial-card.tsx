'use client';

import { ConfirmModal } from '@components/confirm-modal';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card';
import { BookOpen, Edit, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { FairteilerTutorialWithSteps } from '@/server/db/db-types';
import { toast } from 'sonner';
import { formatDate } from 'date-fns';
import { TutorialFormData } from '../schemas/fairteiler-tutorial-schema';
import { useIsMobile } from '@/lib/hooks/use-devices';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TutorialForm } from '../forms/tutorial-form';
import { useTutorial } from '../context/tutorial-context';
import { v4 as uuidv4 } from 'uuid';

export function FairteilerTutorialCard() {
  const pathname = usePathname();
  const {
    tutorial,
    state,
    addTutorial,
    removeTutorial,
    toggleTutorialActive,
    showTutorialForm,
  } = useTutorial();

  const confirmRemove = async () => {
    if (!tutorial || !tutorial.id) {
      toast.error(
        'Beim löschen der Anleitung ist ein Fehler unterlaufen. Bitte versuche es erneut.',
      );
      return;
    }
    await removeTutorial({ id: tutorial.id });
  };

  const handleOnAddTutorial = async (data: TutorialFormData) => {
    const newTutorial = { id: uuidv4(), ...data };
    showTutorialForm(false);
    await addTutorial(newTutorial);
  };

  const handleToggleActive = async (tutorial: FairteilerTutorialWithSteps) => {
    await toggleTutorialActive(tutorial);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex flex-col gap-3 xs:flex-row'>
            <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-primary/10'>
              <BookOpen className='size-5 text-primary' />
            </div>
            <div>
              <CardTitle> Fairteiler-Anleitung</CardTitle>
              <CardDescription>
                Verwalte eine personalisierte Schritt-für-Schritt Anleitung für
                deine Fairteilernutzer. Das Tutorial wird vor dem Retteformular
                angezeigt und kann übersprungen werden.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {tutorial ? (
          <CardContent>
            <div className='space-y-4'>
              <div className='flex flex-col items-start justify-between gap-4 sm:flex-row'>
                <div className='space-y-1'>
                  <div className='flex items-start gap-2'>
                    <h3 className='font-medium'>{tutorial.title}</h3>
                    <Badge
                      variant={tutorial.isActive ? 'tertiary' : 'secondary'}
                    >
                      {tutorial.isActive ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  {tutorial.steps && (
                    <p className='text-xs'>
                      {tutorial.steps.length} Schritt
                      {tutorial.steps.length !== 1 && 'e'}
                    </p>
                  )}
                  {tutorial.updatedAt && (
                    <p className='text-xs text-muted-foreground'>
                      Zuletzt bearbeitet:{' '}
                      {formatDate(tutorial.updatedAt, 'dd.MM.yyyy')}
                    </p>
                  )}
                </div>
                <div className='flex gap-2'>
                  {!pathname.includes('tutorial') && (
                    <Button asChild>
                      <Link href='/hub/fairteiler/preferences/tutorial'>
                        {!tutorial.steps?.length ? (
                          <>
                            <Plus className='size-4' />
                            Schritte hinzufügen
                          </>
                        ) : (
                          <>
                            <Edit className='size-4' />
                            Schritte bearbeiten
                          </>
                        )}
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => handleToggleActive(tutorial)}
                  >
                    {tutorial.isActive ? (
                      <EyeOff className='size-4' />
                    ) : (
                      <Eye className='size-4' />
                    )}
                  </Button>

                  <ConfirmModal
                    onConfirm={confirmRemove}
                    title='Tutorial löschen'
                    description={
                      <>
                        Möchtest du das Tutorial "
                        <strong>{tutorial?.title}</strong>" wirklich löschen?
                        Diese Aktion kann nicht rückgängig gemacht werden.
                      </>
                    }
                    actionTitle='Löschen'
                    actionVariant='destructive'
                    triggerVariant='outline'
                    triggerSize='icon'
                  >
                    <Trash2 className='size-4' />
                  </ConfirmModal>
                </div>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <div className='py-8 text-center'>
              <BookOpen className='mx-auto mb-4 size-12 text-muted-foreground' />
              <h3 className='mb-2 font-medium'>Kein Tutorial erstellt</h3>
              <Button onClick={() => showTutorialForm(true)}>
                <Plus className='size-4' />
                Tutorial erstellen
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      <AddTutorialModal
        open={state.showTutorialForm}
        onOpenChange={showTutorialForm}
        onAddTutorial={handleOnAddTutorial}
      />
    </>
  );
}

function AddTutorialModal({
  open,
  onOpenChange,
  onAddTutorial,
}: {
  open: boolean;
  onOpenChange: (e: boolean) => void;
  onAddTutorial: (data: TutorialFormData) => void;
}) {
  const isMobile = useIsMobile();
  if (!isMobile) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Neue Anleitung erstellen</AlertDialogTitle>
            <AlertDialogDescription>
              Benenne zunächst die Anleitung, um anschließend mit der Erstellung
              der einzelnen Schritte fortzufahren
            </AlertDialogDescription>
          </AlertDialogHeader>
          <TutorialForm onSuccess={(data) => onAddTutorial(data)} isModalView />
          <AlertDialogCancel className='mx-4'>Abbrechen</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='px-8'>
        <DrawerHeader className='text-left'>
          <DrawerTitle>Neue Anleitung erstellen</DrawerTitle>
          <DrawerDescription>
            Benenne zunächst die Anleitung, um anschließend mit der Erstellung
            der einzelnen Schritte fortzufahren
          </DrawerDescription>
        </DrawerHeader>
        <TutorialForm onSuccess={(data) => onAddTutorial(data)} isModalView />
        <DrawerFooter className='pt-2'>
          <DrawerClose asChild>
            <Button variant='outline'>Abbrechen</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
