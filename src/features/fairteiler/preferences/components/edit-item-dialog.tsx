'use client';

import { useState, useEffect } from 'react';
import { CompanyWithOrigin, GenericItem } from '@server/db/db-types';
import { Button } from '@ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '@components/confirm-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';

interface EditItemDialogProps {
  item: GenericItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (item: GenericItem & { originId?: string | null }) => void;
  onDelete: (item: GenericItem) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  itemType: 'Herkunft' | 'Kategorie' | 'Betrieb';
  allOrigins?: GenericItem[];
}

export function EditItemDialog({
  item,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  itemType,
  allOrigins,
}: EditItemDialogProps) {
  const [editedName, setEditedName] = useState('');
  const [selectedOriginId, setSelectedOriginId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync editedName and selectedOriginId when dialog opens or item changes
  useEffect(() => {
    if (open && item) {
      setEditedName(item.name);
      // For companies, try to get the current origin
      if (itemType === 'Betrieb' && 'originId' in item) {
        const company = item as CompanyWithOrigin;
        setSelectedOriginId(company.originId);
      } else {
        setSelectedOriginId(null);
      }
    } else if (!open) {
      setEditedName('');
      setSelectedOriginId(null);
      setShowDeleteConfirm(false);
    }
  }, [open, item, itemType]);

  const handleUpdate = () => {
    if (!item) return;

    if (!editedName?.trim()) {
      toast.error('Der Name darf nicht leer sein.');
      return;
    }

    const updatedItem: GenericItem & { originId?: string | null } = {
      ...item,
      name: editedName.trim(),
    };

    // For companies, include the origin information
    if (itemType === 'Betrieb') {
      updatedItem.originId = selectedOriginId;
    }

    onUpdate(updatedItem);
    onOpenChange(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!item) return;
    onDelete(item);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const handleDeleteModalOpenChange = (open: boolean) => {
    setShowDeleteConfirm(open);
  };

  if (!item) return null;

  return (
    <>
      <Dialog open={open && !showDeleteConfirm} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{itemType} bearbeiten</DialogTitle>
            <DialogDescription>
              Ändere den Namen oder entferne <strong>{item.name} </strong>aus
              deinem Fairteiler.
            </DialogDescription>
          </DialogHeader>
          <div className='flex gap-4'>
            <div className='w-full space-y-2'>
              <Label htmlFor='item-name'>Name</Label>
              <Input
                id='item-name'
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder={`Name ${itemType}...`}
                disabled={isUpdating || isDeleting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUpdate();
                  }
                }}
              />
            </div>
            {itemType === 'Betrieb' && allOrigins && (
              <div className='space-y-2'>
                <Label htmlFor='origin-select'>Herkunft</Label>
                <Select
                  value={selectedOriginId ?? ''}
                  onValueChange={(value) => setSelectedOriginId(value || null)}
                  disabled={isUpdating || isDeleting}
                >
                  <SelectTrigger id='origin-select'>
                    <SelectValue placeholder='Herkunft auswählen...' />
                  </SelectTrigger>
                  <SelectContent>
                    {allOrigins.map((origin) => (
                      <SelectItem key={origin.id} value={origin.id}>
                        {origin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter className='flex-col gap-2 sm:flex-row sm:justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={handleDeleteClick}
              disabled={isUpdating || isDeleting}
              className='border-destructive text-destructive hover:bg-destructive hover:text-white sm:mr-auto'
            >
              {isDeleting ? (
                <>
                  <Loader2 className='size-4 animate-spin' />
                  Wird entfernt...
                </>
              ) : (
                <>
                  <Trash2 className='size-4' />
                  Entfernen
                </>
              )}
            </Button>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isUpdating || isDeleting}
              >
                Abbrechen
              </Button>
              <Button
                type='button'
                onClick={handleUpdate}
                disabled={isUpdating || isDeleting}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className='mr-2 size-4 animate-spin' />
                    Wird gespeichert...
                  </>
                ) : (
                  'Speichern'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={showDeleteConfirm}
        onOpenChange={handleDeleteModalOpenChange}
        title={`${itemType} entfernen?`}
        description={
          <>
            Bist du sicher, dass du {itemType} <strong>{item?.name}</strong> aus
            dem Formular und der Auswertung dieses Fairteilers entfernen
            möchtest?
          </>
        }
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
        actionTitle='Entfernen'
        actionVariant='destructive'
        useTrigger={false}
      />
    </>
  );
}
