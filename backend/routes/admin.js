import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { getDashboardStats, getUsers, createUser, updateUser, deleteUser } from '../controllers/adminController.js';

const router = Router();
router.use(authenticate, isAdmin);

router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getUsers);

router.post('/users', [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
], createUser);

router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
