import { Router } from "express";
import { blockAndUnblockUser, getAllUsers } from "../controllers/admin.controller";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/users").get(verifyJWT, isAdmin, getAllUsers);
router.route("/toggle-block/:id").patch(verifyJWT, isAdmin, blockAndUnblockUser);

export default router;