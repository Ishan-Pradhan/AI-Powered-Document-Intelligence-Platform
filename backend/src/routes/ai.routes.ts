import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { uploadDocument } from "../controllers/documents.controller";
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

router.route('/documents/upload').post(verifyJWT, isAdmin, upload.single('file'), uploadDocument);

// Chat & Message CRUD Routes
router.route('/chats').get(verifyJWT, getUserChats).post(verifyJWT, chatWithDocument);
router.route('/chats/:chatId').delete(verifyJWT, deleteChat).patch(verifyJWT, renameChat);
router.route('/chats/:chatId/messages').get(verifyJWT, getChatMessages);
router.route('/messages').get(verifyJWT, getUserMessages);
router.route('/messages/:messageId').delete(verifyJWT, deleteMessage);

export default router;
