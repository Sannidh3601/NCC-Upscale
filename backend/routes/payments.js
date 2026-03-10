import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { createOrder, verifyPayment, getMyPurchases } from '../controllers/paymentController.js';

const router = Router();
router.use(authenticate);

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.post('/create-order', [body('course_id').isInt()], validate, createOrder);

router.post('/verify', [
  body('razorpay_order_id').notEmpty(),
  body('razorpay_payment_id').notEmpty(),
  body('razorpay_signature').notEmpty(),
], validate, verifyPayment);

router.get('/my-purchases', getMyPurchases);

export default router;
