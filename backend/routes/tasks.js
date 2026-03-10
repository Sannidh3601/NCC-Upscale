import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { getTasks, createTask, updateTask, deleteTask, addComment, getComments } from '../controllers/taskController.js';

const router = Router();
router.use(authenticate);

router.get('/', getTasks);

router.post('/', isAdmin, [
  body('assigned_to').isInt(),
  body('title').trim().notEmpty(),
], createTask);

router.put('/:id', updateTask);
router.delete('/:id', isAdmin, deleteTask);
router.post('/:id/comments', [body('comment').trim().notEmpty()], addComment);
router.get('/:id/comments', getComments);

export default router;
