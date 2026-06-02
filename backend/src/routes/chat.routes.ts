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

router
  .route('/documents/upload')
  .post(
    verifyJWT,
    isAdmin,
    upload.single('file'),
    validate(uploadDocumentSchema),
    uploadDocument,
  );

router.route('/documents').get(verifyJWT, isAdmin, getAllDocuments);

router
  .route('/documents/:documentId')
  .delete(verifyJWT, isAdmin, deleteDocument);

// Chat & Message CRUD Routes
router
  .route('/chats')
  .get(verifyJWT, getUserChats)
  .post(verifyJWT, validate(chatWithDocumentSchema), chatWithDocument);
router
  .route('/chats/:chatId')
  .delete(verifyJWT, validate(chatIdParamsSchema), deleteChat)
  .patch(verifyJWT, validate(renameChatSchema), renameChat);
router
  .route('/chats/:chatId/messages')
  .get(verifyJWT, validate(chatIdParamsSchema), getChatMessages);
router.route('/messages').get(verifyJWT, getUserMessages);

export default router;
