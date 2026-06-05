import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import PdfParse from 'pdf-parse-new';

/**
 * Safety limit for uploaded files (adjust as needed)
 */
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * Clean PDF text for better chunking + embeddings
 */
const cleanText = (text: string): string => {
  return text
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Parses Excel (.xlsx, .xls) files into structured text
 */
const parseSpreadsheet = (fileBuffer: Buffer): string => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  let fullText = '';

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      defval: '',
      raw: false,
    });

    fullText += `\n=== SHEET: ${sheetName} ===\n`;

    rows.forEach((row, i) => {
      const rowString = Object.entries(row)
        .map(([key, value]) => `${String(key).trim()}: ${String(value).trim()}`)
        .join(' | ');

      fullText += `Row ${i + 1}: ${rowString}\n`;
    });

    fullText += '\n';
  }

  return fullText.trim();
};

/**
 * Parses CSV specifically (better than generic XLSX fallback)
 */
const parseCSV = (fileBuffer: Buffer): string => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    return '';
  }
  const sheetNames = workbook.SheetNames;

  const firstSheetName = sheetNames?.[0];

  if (typeof firstSheetName !== 'string') {
    return '';
  }

  const sheet = workbook.Sheets[firstSheetName];

  if (!sheet) return '';

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: '',
    raw: false,
  });

  return rows
    .map((row, i) => {
      const rowString = Object.entries(row)
        .map(([k, v]) => `${String(k)}: ${String(v ?? '')}`)
        .join(' | ');

      return `Row ${i + 1}: ${rowString}`;
    })
    .join('\n');
};
/**
 * Extracts text from different document types
 */
export const parseDocumentBuffer = async (
  fileBuffer: Buffer,
  mimeType: string,
): Promise<string> => {
  // 🔒 File size guard
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new Error('File too large. Max allowed size is 20MB.');
  }

  /**
   * 1. PDF
   */
  if (mimeType === 'application/pdf') {
    const data = await PdfParse(fileBuffer);
    return cleanText(data.text);
  }

  /**
   * 2. DOCX (Word)
   */
  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const data = await mammoth.extractRawText({ buffer: fileBuffer });

    return cleanText(
      data.value
        .replace(/\r/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim(),
    );
  }

  /**
   * 3. Excel / XLSX
   */
  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel'
  ) {
    return parseSpreadsheet(fileBuffer);
  }

  /**
   * 4. CSV
   */
  if (mimeType === 'text/csv') {
    return parseCSV(fileBuffer);
  }

  /**
   * 5. TXT / MD fallback
   */
  return cleanText(fileBuffer.toString('utf-8'));
};
