import ExcelJS from 'exceljs';
import { vContribution } from '@/server/db/db-types';

export interface ExportContributionsOptions {
  data: vContribution[];
  fairteilerName?: string;
}

export async function exportContributionsToExcel({
  data,
  fairteilerName,
}: ExportContributionsOptions): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Set workbook properties
  workbook.creator = 'FairTrack';
  workbook.lastModifiedBy = 'FairTrack';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Create worksheet
  const worksheetName = fairteilerName
    ? `${fairteilerName} - Beiträge`
    : 'Alle Beiträge';
  const worksheet = workbook.addWorksheet(worksheetName);

  // Define columns with German headers matching your previous Supabase version
  const columns = [
    { header: 'Beitrags-ID', key: 'checkinId', width: 20 },
    { header: 'Datum', key: 'contributionDate', width: 15 },
    { header: 'Menge (kg)', key: 'quantity', width: 10 },
    { header: 'Titel', key: 'foodTitle', width: 25 },
    { header: 'Kühlen', key: 'foodCool', width: 10 },
    { header: 'Haltbarkeit', key: 'shelfLife', width: 15 },
    { header: 'Kategorie', key: 'categoryName', width: 20 },
    { header: 'Herkunft', key: 'originName', width: 20 },
    { header: 'Betrieb', key: 'companyName', width: 20 },
    { header: 'Betrieb (Freitext)', key: 'foodCompany', width: 20 },
    { header: 'Allergene', key: 'foodAllergens', width: 25 },
    { header: 'Kommentar', key: 'foodComment', width: 30 },
    { header: 'Foodsaver Name', key: 'contributorName', width: 20 },
    { header: 'Foodsaver Email', key: 'contributorEmail', width: 25 },
    { header: 'Fairteiler', key: 'fairteilerName', width: 20 },
  ];

  worksheet.columns = columns;

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '366092' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 25;

  // Add data rows
  data.forEach((contribution) => {
    const row = worksheet.addRow({
      checkinId: contribution.checkinId,
      contributionDate: contribution.contributionDate
        ? new Date(contribution.contributionDate).toLocaleDateString('de-DE')
        : '',
      quantity: contribution.quantity,
      foodTitle: contribution.foodTitle ?? '',
      foodCool: contribution.foodCool ? 'Ja' : 'Nein',
      shelfLife: contribution.shelfLife
        ? new Date(contribution.shelfLife).toLocaleDateString('de-DE')
        : '',
      categoryName: contribution.categoryName ?? '',
      originName: contribution.originName ?? '',
      companyName: contribution.companyName ?? '',
      foodCompany: contribution.foodCompany ?? '',
      foodAllergens: contribution.foodAllergens ?? '',
      foodComment: contribution.foodComment ?? '',
      contributorName: contribution.contributorName ?? '',
      contributorEmail: contribution.contributorEmail ?? '',
      fairteilerName: contribution.fairteilerName ?? '',
    });

    // Alternate row colors for better readability
    if (row.number % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' },
      };
    }
  });

  // Auto-fit columns and add borders
  worksheet.columns.forEach((column) => {
    if (column.eachCell) {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength =
          typeof cell.value === 'string' || typeof cell.value === 'number'
            ? cell.value.toString().length
            : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }

        // Add borders to all cells
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Set column width with some padding
      if (column.width && maxLength > column.width) {
        column.width = Math.min(maxLength + 2, 50);
      }
    }
  });

  // Add summary information at the bottom
  const summaryStartRow = worksheet.rowCount + 3;

  worksheet.getCell(`A${summaryStartRow}`).value = 'Zusammenfassung:';
  worksheet.getCell(`A${summaryStartRow}`).font = { bold: true, size: 12 };

  worksheet.getCell(`A${summaryStartRow + 1}`).value =
    `Gesamtanzahl Beiträge: ${data.length}`;
  worksheet.getCell(`A${summaryStartRow + 2}`).value =
    `Gesamtmenge: ${data.reduce((sum, item) => sum + (item.quantity || 0), 0).toFixed(2)} kg`;
  worksheet.getCell(`A${summaryStartRow + 3}`).value =
    `Exportiert am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}`;

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function generateExportFilename(fairteilerName?: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const baseName = fairteilerName
    ? `${fairteilerName}_Beiträge`
    : 'Alle_Beiträge';
  return `FairTrack_Export_${baseName}_${date}.xlsx`;
}

export function downloadExcelFile(buffer: Buffer, filename: string): void {
  const uint8Array = new Uint8Array(buffer);
  const blob = new Blob([uint8Array], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
