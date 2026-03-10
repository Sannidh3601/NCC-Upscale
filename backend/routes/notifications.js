import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getNotifications, markRead } from '../controllers/notificationController.js';

const router = Router();
router.use(authenticate);

router.get('/', getNotifications);
router.put('/mark-read', markRead);

export default router;
