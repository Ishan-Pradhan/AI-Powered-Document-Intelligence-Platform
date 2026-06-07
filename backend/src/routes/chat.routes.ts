import { Router } from 'express';
import { isAdmin, verifyJWT } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  deleteDocument,
  getAllDocuments,
  uploadDocument,
} from '../controllers/documents.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  chatIdParamsSchema,
  chatWithDocumentSchema,
  deleteDocumentSchema,
  documentQuerySchema,
  messageQuerySchema,
  renameChatSchema,
  uploadDocumentSchema,
} from '../validations/ai.validation';
import {
  chatWithDocument,
  getUserChats,
  deleteChat,
  getUserMessages,
  getChatMessages,
  renameChat,
} from '../controllers/chats.controller';

const router = Router();

// ─────────────────────────────────────────────────────────────
// DOCUMENTS (admin only)
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /chat/documents/upload:
 *   post:
 *     tags: [Documents]
 *     summary: Upload and process a document (admin only)
 *     description: |
 *       Accepts a multipart file (PDF, DOCX, TXT, CSV, XLSX, XLS), parses it,
 *       splits it into chunks, generates embeddings and stores everything in the
 *       database. The document is immediately ready for RAG queries.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The document file to upload
 *               title:
 *                 type: string
 *                 description: Optional display title (defaults to filename)
 *                 example: Product Manual v2
 *     responses:
 *       201:
 *         description: Document processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 documentId: { type: string, format: uuid }
 *       400:
 *         description: No file uploaded or unsupported file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Document processing failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route('/documents/upload')
  .post(
    verifyJWT,
    isAdmin,
    upload.single('file'),
    validate(uploadDocumentSchema),
    uploadDocument,
  );

/**
 * @swagger
 * /chat/documents:
 *   get:
 *     tags: [Documents]
 *     summary: List all documents (admin only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Filter documents by title / filename
 *     responses:
 *       200:
 *         description: Paginated list of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Document'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route('/documents')
  .get(verifyJWT, isAdmin, validate(documentQuerySchema), getAllDocuments);

/**
 * @swagger
 * /chat/documents/{documentId}:
 *   delete:
 *     tags: [Documents]
 *     summary: Delete a document (admin only)
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Document ID missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route('/documents/:documentId')
  .delete(verifyJWT, isAdmin, validate(deleteDocumentSchema), deleteDocument);

// ─────────────────────────────────────────────────────────────
// CHATS
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /chat/chats:
 *   get:
 *     tags: [Chat]
 *     summary: List all chats for the current user
 *     responses:
 *       200:
 *         description: User chats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags: [Chat]
 *     summary: Send a chat message (RAG)
 *     description: |
 *       Sends a user message. If `chatId` is omitted a new chat is created.
 *       Optionally scopes retrieval to a specific document via `documentId`.
 *       Returns the AI-generated answer along with source chunks used.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 example: What is the return policy?
 *               chatId:
 *                 type: string
 *                 format: uuid
 *                 description: Existing chat to continue (omit to start a new one)
 *               documentId:
 *                 type: string
 *                 format: uuid
 *                 description: Restrict RAG retrieval to this document
 *     responses:
 *       200:
 *         description: AI answer generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 chatId: { type: string, format: uuid }
 *                 answer: { type: string }
 *                 sourcesUsed:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatSource'
 *       400:
 *         description: Message is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route('/chats')
  .get(verifyJWT, getUserChats)
  .post(verifyJWT, validate(chatWithDocumentSchema), chatWithDocument);

/**
 * @swagger
 * /chat/chats/{chatId}:
 *   delete:
 *     tags: [Chat]
 *     summary: Delete a chat and all its messages
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Chat deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Chat does not belong to the current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     tags: [Chat]
 *     summary: Rename a chat
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Refund policy discussion
 *     responses:
 *       200:
 *         description: Chat renamed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Title is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route('/chats/:chatId')
  .delete(verifyJWT, validate(chatIdParamsSchema), deleteChat)
  .patch(verifyJWT, validate(renameChatSchema), renameChat);

/**
 * @swagger
 * /chat/chats/{chatId}/messages:
 *   get:
 *     tags: [Chat]
 *     summary: Get all messages in a chat
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Chat messages retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Chat does not belong to the current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route('/chats/:chatId/messages')
  .get(verifyJWT, validate(chatIdParamsSchema), getChatMessages);

/**
 * @swagger
 * /chat/messages:
 *   get:
 *     tags: [Chat]
 *     summary: Get all messages sent by the current user (across all chats)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: User messages retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route('/messages')
  .get(verifyJWT, validate(messageQuerySchema), getUserMessages);

export default router;
