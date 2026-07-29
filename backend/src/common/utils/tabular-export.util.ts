import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify/sync';
import PDFDocument from 'pdfkit';

export interface ColumnDef {
  header: string;
  key: string;
  width?: number;
}

export type TabularExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface TabularExportResult {
  buffer: Buffer;
  contentType: string;
}

const CONTENT_TYPES: Record<TabularExportFormat, string> = {
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};

// Generic rows-and-columns exporter shared by the Reports module so csv/xlsx/pdf
// generation logic lives in exactly one place instead of being duplicated per report type.
export async function exportTabular(
  rows: Array<Record<string, unknown>>,
  columns: ColumnDef[],
  format: TabularExportFormat,
  title: string,
): Promise<TabularExportResult> {
  if (format === 'xlsx') {
    return {
      buffer: await buildXlsx(rows, columns, title),
      contentType: CONTENT_TYPES.xlsx,
    };
  }
  if (format === 'pdf') {
    return {
      buffer: await buildPdf(rows, columns, title),
      contentType: CONTENT_TYPES.pdf,
    };
  }
  return { buffer: buildCsv(rows, columns), contentType: CONTENT_TYPES.csv };
}

async function buildXlsx(
  rows: Array<Record<string, unknown>>,
  columns: ColumnDef[],
  title: string,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title.slice(0, 31));
  sheet.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width ?? 20,
  }));
  rows.forEach((row) => sheet.addRow(row));
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function buildCsv(
  rows: Array<Record<string, unknown>>,
  columns: ColumnDef[],
): Buffer {
  const csv = stringify(
    rows.map((row) => columns.map((c) => formatCell(row[c.key]))),
    { header: true, columns: columns.map((c) => c.header) },
  );
  return Buffer.from(csv, 'utf-8');
}

function buildPdf(
  rows: Array<Record<string, unknown>>,
  columns: ColumnDef[],
  title: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const landscape = columns.length > 5;
    const doc = new PDFDocument({
      margin: 30,
      size: 'A4',
      layout: landscape ? 'landscape' : 'portrait',
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).text(title, { align: 'left' });
    doc.moveDown();

    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidth = pageWidth / columns.length;
    const startX = doc.page.margins.left;
    const rowHeight = 20;

    const drawRow = (values: string[], y: number, isHeader: boolean) => {
      doc.fontSize(9).font(isHeader ? 'Helvetica-Bold' : 'Helvetica');
      values.forEach((value, i) => {
        doc.text(value ?? '', startX + i * colWidth, y, {
          width: colWidth - 4,
          ellipsis: true,
        });
      });
    };

    let y = doc.y;
    drawRow(
      columns.map((c) => c.header),
      y,
      true,
    );
    y += rowHeight;
    doc
      .moveTo(startX, y - 4)
      .lineTo(startX + pageWidth, y - 4)
      .stroke();

    for (const row of rows) {
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage({
          size: 'A4',
          layout: landscape ? 'landscape' : 'portrait',
          margin: 30,
        });
        y = doc.page.margins.top;
      }
      drawRow(
        columns.map((c) => formatCell(row[c.key])),
        y,
        false,
      );
      y += rowHeight;
    }

    doc.end();
  });
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }
  return JSON.stringify(value);
}
