'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { exportElementAsImage } from '../chart-image-export';

interface DownloadButtonProps {
  elementRef: React.RefObject<HTMLElement | null>;
  filename: string;
  className?: string;
}

export function DownloadButton({
  elementRef,
  filename,
  className,
}: DownloadButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!elementRef.current) return;

    setIsExporting(true);
    try {
      await exportElementAsImage(elementRef.current, filename);
    } catch (error) {
      console.error('Failed to export image:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant='outline'
      size='icon'
      onClick={handleDownload}
      disabled={isExporting}
      className={cn('size-8', className)}
      title='Als Bild herunterladen'
    >
      {isExporting ? (
        <Loader2 className='size-4 animate-spin' />
      ) : (
        <Download className='size-4' />
      )}
    </Button>
  );
}
