'use client';

import { Button } from '@components/ui/button';
import { Checkbox } from '@components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { ScrollArea } from '@components/ui/scroll-area';
import { Textarea } from '@components/ui/textarea';
import type { ContributionItem } from '@features/contribution/models/contribution';
import {
  MessageSquareText,
  Store,
  Tag,
  Thermometer,
  Wheat,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface OptionalInfoModalProps {
  contribution: ContributionItem | null;
  onSave: (contribution: ContributionItem) => void;
  onClose: () => void;
}

export function OptionalInfoModal({
  contribution,
  onSave,
  onClose,
}: OptionalInfoModalProps) {
  // Internal state for the form fields
  const [title, setTitle] = useState('');
  const [cool, setCool] = useState(false);
  const [company, setCompany] = useState('');
  const [allergens, setAllergens] = useState('');
  const [comment, setComment] = useState('');

  // When a new contribution is passed, populate the internal form state
  useEffect(() => {
    if (contribution) {
      setTitle(contribution.title ?? '');
      setCool(contribution.cool ?? false);
      setCompany(contribution.company ?? '');
      setAllergens(contribution.allergens ?? '');
      setComment(contribution.comment ?? '');
    }
  }, [contribution]);

  const handleSave = () => {
    if (!contribution) {
      return;
    }

    // Create the updated contribution object from internal state
    const updatedContribution = {
      ...contribution,
      title,
      cool,
      company,
      allergens,
      comment,
    };
    onSave(updatedContribution);
  };

  const isOpen = !!contribution;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className='w-full text-center'>
          <DialogTitle className='text-center text-2xl'>
            Optionale Informationen
          </DialogTitle>
          <DialogDescription className='text-center'>
            Hier können weitere Informationen zur Abgabe vermerkt werden.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[80vh]'>
          <div className='my-8 flex w-full flex-col gap-8 px-2'>
            {/* Title Field */}
            <div className='flex w-full flex-col gap-2'>
              <Label className='flex items-center gap-2'>
                <Tag className='size-4' /> Lebensmittelname
              </Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            {/* Cool Field */}
            <div className='flex items-center gap-4'>
              <Checkbox
                size='36px'
                checked={cool}
                onCheckedChange={(c) => setCool(!!c)}
              />
              <Label className='flex items-center gap-2'>
                <Thermometer className='size-4' /> In den Kühlschrank?
              </Label>
            </div>
            {/* Company Field */}
            <div className='flex w-full flex-col gap-2'>
              <Label className='flex items-center gap-2'>
                <Store className='size-4' /> Betrieb
              </Label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            {/* Allergens Field */}
            <div className='flex w-full flex-col gap-2'>
              <Label className='flex items-center gap-2'>
                <Wheat className='size-4' /> Allergene und Inhaltsstoffe
              </Label>
              <Input
                value={allergens}
                onChange={(e) => setAllergens(e.target.value)}
              />
            </div>
            {/* Comment Field */}
            <div className='flex w-full flex-col gap-2'>
              <Label className='flex items-center gap-2'>
                <MessageSquareText className='size-4' /> Kommentar
              </Label>
              <Textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <div className='my-4 flex w-full justify-center'>
            <Button
              className='w-1/2'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSave();
              }}
            >
              Okay
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
