'use client';

import { Button } from '@/components/ui/button';
import { exportContributionsAction } from '@/server/actions';
import {
  exportContributionsToExcel,
  generateExportFilename,
  downloadExcelFile,
} from '@/lib/excel-export';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ReportFilters } from '@/features/statistics/types';

interface ExportButtonProps {
  filters: ReportFilters;
  scope: 'fairteiler' | 'platform';
  className?: string;
}

export function ExportButton({ filters, scope, className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const dateRange =
        filters.dateRange?.from && filters.dateRange?.to
          ? { from: filters.dateRange.from, to: filters.dateRange.to }
          : undefined;

      const result = await exportContributionsAction({
        dateRange,
        scope,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (!result.data?.length) {
        const errorMessage =
          scope === 'fairteiler'
            ? 'Keine Fairteiler-Daten zum Exportieren gefunden'
            : 'Keine Plattform-Daten zum Exportieren gefunden';
        toast.error(errorMessage);
        return;
      }

      const fairteilerName =
        scope === 'fairteiler' ? result.data[0].fairteilerName : undefined;

      const buffer = await exportContributionsToExcel({
        data: result.data,
        fairteilerName,
      });

      const filename = generateExportFilename(fairteilerName);
      downloadExcelFile(buffer, filename);

      const successMessage =
        scope === 'fairteiler'
          ? 'Fairteiler Excel-Export erfolgreich heruntergeladen!'
          : 'Plattform Excel-Export erfolgreich heruntergeladen!';
      toast.success(successMessage);
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage =
        scope === 'fairteiler'
          ? 'Fehler beim Exportieren der Fairteiler-Daten'
          : 'Fehler beim Exportieren der Plattform-Daten';
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const buttonText =
    scope === 'fairteiler' ? 'Excel Export' : 'Plattform Excel Export';
  const loadingText = 'Exportiere...';

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant='tertiary'
      className={`gap-2 ${className ?? ''}`}
    >
      {isExporting ? (
        <Loader2 className='size-4 animate-spin' />
      ) : (
        <Download className='size-4' />
      )}
      {isExporting ? loadingText : buttonText}
    </Button>
  );
}
