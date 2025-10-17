import { useIsMobile } from '@/lib/hooks/use-devices';
import { Button } from '@ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@ui/drawer';
import { Dialog, DialogContent } from '@ui/dialog';
import { Dispatch, SetStateAction } from 'react';

export function ContributionInfos({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const isMobile = useIsMobile();
  return (
    <>
      {isMobile ? (
        <Drawer open={open}>
          <DrawerContent className='mx-auto px-8'>
            <ContributionInfosContent />
            <div className='my-8 flex w-full justify-center'>
              <Button className='w-1/2' onClick={() => setOpen(false)}>
                Alles klar
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open}>
          <DialogContent className='mx-auto max-w-lg overflow-y-auto py-2'>
            <ContributionInfosContent />
            <div className='my-8 flex w-full justify-center'>
              <Button className='w-1/2' onClick={() => setOpen(false)}>
                Alles klar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function ContributionInfosContent() {
  return (
    <>
      <DrawerHeader>
        <DrawerTitle className='text-center font-londrina text-3xl tracking-wider'>
          NICHT ERLAUBTE LEBENSMITTEL
        </DrawerTitle>
        <DrawerDescription className='text-center'>
          Folgende Lebensmittel dürfen wir aus hygienetechnischen Gründen nicht
          annehmen:
        </DrawerDescription>
      </DrawerHeader>
      <ul className='my-8 list-disc space-y-4 pr-6 pl-10 text-sm text-muted-foreground marker:text-tertiary md:my-0'>
        <li>
          Keine Brühwurstprodukte nach Ablauf des MHDs (z.B. Wurststreifen für
          Salat, Wiener, Mortadella, Lyoner, Leberkäse)
        </li>
        <li>Keine Lebensmittel mit Verbrauchsdatum</li>
        <li>
          Keine rohen Eier oder frisch zubereitete Speisen mit rohen Eiern (z.B.
          Mousse au Chocolat von einem Restaurant)
        </li>
        <li>Kein gekochter Reis</li>
        <li>Keine selbstzubereiteten Speisen</li>
      </ul>
    </>
  );
}
