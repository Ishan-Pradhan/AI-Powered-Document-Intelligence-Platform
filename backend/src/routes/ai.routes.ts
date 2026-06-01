import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { uploadDocument } from "../controllers/documents.controller";
import { validate } from "../middlewares/validate.middleware";
import {
    chatIdParamsSchema,
    chatWithDocumentSchema,
    messageIdParamsSchema,
    renameChatSchema,
    uploadDocumentSchema,
} from "../validations/ai.validation";
import {
    chatWithDocument,
    getUserChats,
    deleteChat,
    getUserMessages,
    deleteMessage,
    getChatMessages,
    renameChat
} from "../controllers/chats.controller";

const router = Router();

router.route('/documents/upload').post(
    verifyJWT,
    isAdmin,
    upload.single('file'),
    validate(uploadDocumentSchema),
    uploadDocument
);

// Chat & Message CRUD Routes
router.route('/chats').get(verifyJWT, getUserChats).post(verifyJWT, validate(chatWithDocumentSchema), chatWithDocument);
router.route('/chats/:chatId')
    .delete(verifyJWT, validate(chatIdParamsSchema), deleteChat)
    .patch(verifyJWT, validate(renameChatSchema), renameChat);
router.route('/chats/:chatId/messages').get(verifyJWT, validate(chatIdParamsSchema), getChatMessages);
router.route('/messages').get(verifyJWT, getUserMessages);
router.route('/messages/:messageId').delete(verifyJWT, validate(messageIdParamsSchema), deleteMessage);

export default router;
