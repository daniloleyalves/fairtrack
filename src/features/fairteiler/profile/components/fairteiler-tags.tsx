'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { cn } from '@/lib/utils';
import { Tag } from '@/server/db/db-types';
import { v4 as uuidv4 } from 'uuid';

interface FairteilerTagsProps {
  tags: Tag[];
  onAddTag: (tag: Tag) => void;
  onRemoveTag: (tag: Tag) => void;
  className?: string;
}

export function FairteilerTags({
  tags,
  onAddTag,
  onRemoveTag,
  className,
}: FairteilerTagsProps) {
  const [newTagName, setNewTagName] = useState('');

  const handleAddTag = () => {
    if (
      newTagName.trim() &&
      !tags.some((tag) => tag.name.toLowerCase() === newTagName.toLowerCase())
    ) {
      const newTag: Tag = {
        id: uuidv4(),
        name: newTagName.trim(),
        fairteilerId: '',
      };
      onAddTag(newTag);
      setNewTagName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    } else if (e.key === 'Escape') {
      setNewTagName('');
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          Tags
        </CardTitle>
      </CardHeader>

      <CardContent className='flex flex-col gap-6'>
        <div className='w-1/2'>
          {tags.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              Noch keine Tags hinzugefügt. Tags helfen dabei, den Fairteiler zu
              kategorisieren.
            </p>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {tags.map((tag) => (
                <Badge key={tag.id} className='flex items-center gap-1 pr-1'>
                  {tag.name}
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='size-4 p-0 hover:bg-white/30 hover:text-white'
                    onClick={() => onRemoveTag(tag)}
                  >
                    <X className='size-3' />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='new-tag'>Neuer Tag</Label>
          <div className='flex gap-2'>
            <Input
              id='new-tag'
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder='Tag-Name eingeben...'
            />
            <Button
              type='button'
              size='sm'
              onClick={handleAddTag}
              disabled={!newTagName.trim()}
            >
              Hinzufügen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
