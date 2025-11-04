'use client';

import { Button } from '@components/ui/button';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@components/ui/carousel';
import { Dialog, DialogContent, DialogFooter } from '@components/ui/dialog';
import { GenericItem } from '@server/db/db-types';
import {
  createContributionItem,
  type ContributionItem,
} from '@features/contribution/models/contribution';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ContributionDetailsModal } from './contribution-details-modal';
import { OptionalInfoModal } from './optional-infos-modal';
import { CategoryStep } from './steps/category-step';
import { CompanyStep } from './steps/company-step';
import { OptionalInfoStep } from './steps/optional-info-step';
import { OriginStep } from './steps/origin-step';

interface ContributionWizardContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (contributions: ContributionItem[]) => void;
  formOptions: {
    fairteilerOrigins: GenericItem[];
    fairteilerCategories: (GenericItem & { image: string })[];
    fairteilerCompanies: (GenericItem & { originId: string })[];
  };
}

export function ContributionWizard({
  open,
  onOpenChange,
  onSave,
  formOptions,
}: ContributionWizardContentProps) {
  // --- SWR DATA FETCHING  ---

  // --- WIZARD STATE ---
  const [preliminaryFormData, setPreliminaryFormData] = useState<
    ContributionItem[]
  >([]);
  const [chosenOriginId, setChosenOriginId] = useState<string>('');
  const [companySelection, setCompanySelection] = useState<{
    id: string | null;
    name: string;
  }>({ id: null, name: '' });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingOptionalInfoId, setEditingOptionalInfoId] = useState<
    string | null
  >(null);

  // --- CAROUSEL STATE ---
  const [api, setApi] = useState<CarouselApi>();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!api) return;
    setCurrentPage(api.selectedScrollSnap());
    const handleSelect = () => setCurrentPage(api.selectedScrollSnap());
    api.on('select', handleSelect);
    return () => {
      api.off('select', handleSelect);
    };
  }, [api]);

  // Reset scroll position when step changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  // --- EVENT HANDLERS ---
  const handleOriginSelect = (originId: string) => {
    setChosenOriginId(originId);
    api?.scrollNext();
  };

  const handleCompanySelect = (selection: {
    id: string | null;
    name: string;
  }) => {
    setCompanySelection(selection);
    if (selection.id) {
      api?.scrollNext();
    }
  };

  const handleCategorySelect = (category: GenericItem & { image: string }) => {
    if (!chosenOriginId) {
      toast.info('Bitte wähle zuerst eine Herkunft und einen Betrieb aus.');
      api?.scrollTo(0);
      return;
    }
    setEditingCategoryId(category.id);
  };

  const handleSaveAndClose = () => {
    if (preliminaryFormData.length === 0) {
      toast.error('Bitte füge mindestens ein Lebensmittel hinzu.');
      return;
    }
    onSave(preliminaryFormData);
    setPreliminaryFormData([]);
    setChosenOriginId('');
    setCompanySelection({ id: '', name: '' });
    api?.scrollTo(0, true);
    onOpenChange(false);
  };

  // --- Modal Handlers ---
  const handleDetailsSave = (updatedContribution: ContributionItem) => {
    const exists = preliminaryFormData.some(
      (c) => c.categoryId === updatedContribution.categoryId,
    );

    if (exists) {
      setPreliminaryFormData((prev) =>
        prev.map((c) =>
          c.categoryId === updatedContribution.categoryId
            ? updatedContribution
            : c,
        ),
      );
    } else {
      setPreliminaryFormData((prev) => [...prev, updatedContribution]);
    }

    setEditingCategoryId(null);
  };

  const handleDetailsRemove = (categoryId: string) => {
    setPreliminaryFormData((prev) =>
      prev.filter((c) => c.categoryId !== categoryId),
    );

    setEditingCategoryId(null);
  };

  const handleDetailsClose = () => {
    setEditingCategoryId(null);
  };

  const handleEditOptionalInfo = (categoryId: string) =>
    setEditingOptionalInfoId(categoryId);

  const handleSaveOptionalInfo = (updatedContribution: ContributionItem) => {
    setPreliminaryFormData((prev) =>
      prev.map((c) =>
        c.categoryId === updatedContribution.categoryId
          ? updatedContribution
          : c,
      ),
    );
    setEditingOptionalInfoId(null);
  };

  const handleCloseOptionalInfo = () => setEditingOptionalInfoId(null);

  // --- DERIVED STATE GETTERS ---
  const getActiveContribution = () => {
    if (!editingCategoryId) return null;
    const category = formOptions.fairteilerCategories.find(
      (c) => c.id === editingCategoryId,
    );
    if (!category) return null;
    const existingContribution = preliminaryFormData.find(
      (c) => c.categoryId === editingCategoryId,
    );
    if (existingContribution) return { ...existingContribution, category };
    const newContribution = createContributionItem();
    return {
      ...newContribution,
      title: category.name,
      categoryId: category.id,
      originId: chosenOriginId,
      companyId: companySelection.id,
      company: companySelection.name,
      category: category,
    };
  };

  const getActiveOptionalContribution = () => {
    if (!editingOptionalInfoId) return null;
    return (
      preliminaryFormData.find((c) => c.categoryId === editingOptionalInfoId) ??
      null
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className='top-4 flex max-h-[calc(100vh-8rem)] translate-y-0 flex-col p-0 sm:top-1/2 sm:max-w-xl sm:-translate-y-1/2'
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          <div
            ref={scrollContainerRef}
            className='m-2 min-h-0 flex-1 overflow-y-auto px-2'
          >
            <Carousel setApi={setApi} opts={{ watchDrag: false, duration: 20 }}>
              <CarouselContent className='px-1'>
                <CarouselItem>
                  <OriginStep
                    origins={formOptions.fairteilerOrigins}
                    selectedOriginId={chosenOriginId}
                    onSelect={handleOriginSelect}
                  />
                </CarouselItem>
                <CarouselItem>
                  <CompanyStep
                    companies={formOptions.fairteilerCompanies}
                    origins={formOptions.fairteilerOrigins}
                    selection={companySelection}
                    onSelect={handleCompanySelect}
                  />
                </CarouselItem>
                <CarouselItem>
                  <CategoryStep
                    categories={formOptions.fairteilerCategories}
                    contributions={preliminaryFormData}
                    onSelectCategory={handleCategorySelect}
                  />
                </CarouselItem>
                <CarouselItem>
                  <OptionalInfoStep
                    contributions={preliminaryFormData}
                    categories={formOptions.fairteilerCategories}
                    onEditInfo={handleEditOptionalInfo}
                  />
                </CarouselItem>
              </CarouselContent>
            </Carousel>
          </div>
          <DialogFooter className='z-50 flex w-full flex-col border-t px-6 py-4'>
            <Button
              onClick={() => {
                setPreliminaryFormData([]);
                setChosenOriginId('');
                setCompanySelection({ id: null, name: '' });
                onOpenChange(false);
              }}
              variant='outline'
              className='w-full'
            >
              Abbrechen
            </Button>
            <div className='flex w-full flex-row justify-between gap-2'>
              <Button
                variant='secondary'
                onClick={() => api?.scrollPrev()}
                className={cn(
                  currentPage <= 0 && 'pointer-events-none opacity-0',
                )}
              >
                <ChevronLeft className='size-4' /> Zurück
              </Button>
              {currentPage < 3 ? (
                <Button
                  onClick={() => api?.scrollNext()}
                  className={cn(
                    ((currentPage === 0 && !chosenOriginId) ||
                      (currentPage === 1 &&
                        !companySelection.id &&
                        !companySelection.name) ||
                      (currentPage === 2 &&
                        preliminaryFormData.length === 0)) &&
                      'pointer-events-none opacity-0',
                  )}
                >
                  Weiter <ChevronRight className='size-4' />
                </Button>
              ) : (
                <Button type='button' onClick={handleSaveAndClose}>
                  <Save className='size-4' /> Speichern
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <ContributionDetailsModal
        contribution={getActiveContribution()}
        onSave={handleDetailsSave}
        onRemove={handleDetailsRemove}
        onClose={handleDetailsClose}
      />
      <OptionalInfoModal
        contribution={getActiveOptionalContribution()}
        onSave={handleSaveOptionalInfo}
        onClose={handleCloseOptionalInfo}
      />
    </>
  );
}
