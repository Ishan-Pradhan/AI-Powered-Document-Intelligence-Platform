import { Router } from 'express';
import {
  blockAndUnblockUser,
  getAllUsers,
  getUserStats,
} from '../controllers/admin.controller';
import { isAdmin, verifyJWT } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { toggleBlockUserSchema } from '../validations/ai.validation';

const router = Router();

router.route('/users').get(verifyJWT, isAdmin, getAllUsers);
router.route('/stats').get(verifyJWT, isAdmin, getUserStats);

router
  .route('/toggle-block/:id')
  .patch(
    verifyJWT,
    isAdmin,
    validate(toggleBlockUserSchema),
    blockAndUnblockUser,
  );

export default router;
