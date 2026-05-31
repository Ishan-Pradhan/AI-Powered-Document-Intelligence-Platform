import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import PdfParse from 'pdf-parse-new';

/**
 * Parses Excel files (.xlsx, .xls) and CSV files into semantic text rows
 */
const parseSpreadsheet = (fileBuffer: Buffer): string => {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    let fullText = '';

    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;
        // Convert sheet to JSON array of objects
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

        fullText += `--- Sheet: ${sheetName} ---\n`;
        rows.forEach((row, index) => {
            const rowString = Object.entries(row)
                .map(([header, val]) => `${header}: ${val}`)
                .join(', ');

            fullText += `Row ${index + 1}: ${rowString}\n`;
        });
        fullText += '\n';
    }

    return fullText;
};

/**
 * Extracts raw text from document file buffers based on their MIME type
 */
export const parseDocumentBuffer = async (fileBuffer: Buffer, mimeType: string): Promise<string> => {
    // 1. PDF Files
    if (mimeType === 'application/pdf') {
        const data = await PdfParse(fileBuffer);
        return data.text;
    }

    // 2. Microsoft Word DOCX Files
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const data = await mammoth.extractRawText({ buffer: fileBuffer });
        return data.value;
    }

    // 3. Tabular Excel & CSV Files
    if (
        mimeType === 'text/csv' ||
        mimeType === 'application/vnd.ms-excel' || // .xls
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ) {
        return parseSpreadsheet(fileBuffer);
    }

    // 4. Plain Text and Markdown (.txt, .md) are treated as plain text
    return fileBuffer.toString('utf-8');
};
