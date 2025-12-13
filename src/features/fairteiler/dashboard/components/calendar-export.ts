import ExcelJS from 'exceljs';

interface CalendarDataPoint {
  value: string;
  quantity: number;
}

export interface ExportCalendarOptions {
  data: CalendarDataPoint[];
  title?: string;
  unit?: string;
}

export async function exportCalendarToExcel({
  data,
  title = 'Kalender Daten',
  unit = 'kg',
}: ExportCalendarOptions): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'FairTrack';
  workbook.lastModifiedBy = 'FairTrack';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet(title);

  const columns = [
    { header: 'Datum', key: 'date', width: 15 },
    { header: `Menge (${unit})`, key: 'quantity', width: 15 },
  ];

  worksheet.columns = columns;

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '366092' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 25;

  data.forEach((item) => {
    const row = worksheet.addRow({
      date: new Date(item.value).toLocaleDateString('de-DE'),
      quantity: item.quantity,
    });

    if (row.number % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' },
      };
    }
  });

  worksheet.columns.forEach((column) => {
    if (column.eachCell) {
      column.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }
  });

  const summaryStartRow = worksheet.rowCount + 3;

  worksheet.getCell(`A${summaryStartRow}`).value = 'Zusammenfassung:';
  worksheet.getCell(`A${summaryStartRow}`).font = { bold: true, size: 12 };

  worksheet.getCell(`A${summaryStartRow + 1}`).value =
    `Anzahl Tage mit Beiträgen: ${data.length}`;
  worksheet.getCell(`A${summaryStartRow + 2}`).value =
    `Gesamtmenge: ${data.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)} ${unit}`;
  worksheet.getCell(`A${summaryStartRow + 3}`).value =
    `Exportiert am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}`;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function generateCalendarExportFilename(title?: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const baseName = title ? `${title}_Kalender` : 'Kalender';
  return `FairTrack_${baseName}_${date}.xlsx`;
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
