import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, isAdmin } from '../middleware/auth.js';
import {
  getCourses, getCourseById, getAllCoursesAdmin, createCourse, updateCourse,
  deleteCourse, togglePublish, addLesson, updateLesson, deleteLesson
} from '../controllers/courseController.js';

const router = Router();

router.get('/', getCourses);
router.get('/admin/all', authenticate, isAdmin, getAllCoursesAdmin);
router.get('/:id', getCourseById);

router.post('/', authenticate, isAdmin, [
  body('title').trim().notEmpty(),
  body('price').isNumeric(),
], createCourse);

router.put('/:id', authenticate, isAdmin, updateCourse);
router.delete('/:id', authenticate, isAdmin, deleteCourse);
router.post('/:id/publish', authenticate, isAdmin, togglePublish);

router.post('/:id/lessons', authenticate, isAdmin, [
  body('title').trim().notEmpty(),
], addLesson);

router.put('/:id/lessons/:lessonId', authenticate, isAdmin, updateLesson);
router.delete('/:id/lessons/:lessonId', authenticate, isAdmin, deleteLesson);

export default router;
