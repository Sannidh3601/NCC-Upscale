import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { completeLesson, getCourseProgress, getStreak } from '../controllers/progressController.js';

const router = Router();
router.use(authenticate);

router.post('/complete-lesson', [
  body('lesson_id').isInt(),
  body('course_id').isInt(),
], completeLesson);

router.get('/course/:courseId', getCourseProgress);
router.get('/streak', getStreak);

export default router;
