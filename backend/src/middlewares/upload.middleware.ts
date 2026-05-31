import multer from 'multer';
import { Request } from 'express';

// Allowed MIME types for document uploads
const ALLOWED_MIME_TYPES = [
    'application/pdf',                                                                      // .pdf
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',             // .docx
    'text/plain',                                                                           // .txt
    'text/markdown',                                                                        // .md
    'text/csv',                                                                             // .csv
    'application/vnd.ms-excel',                                                            // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',                  // .xlsx
];

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: PDF, DOCX, TXT, MD, CSV, XLS, XLSX`));
    }
};

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter,
});
