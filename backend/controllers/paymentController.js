import Razorpay from 'razorpay';
import crypto from 'crypto';
import pool from '../db/pool.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createOrder(req, res, next) {
  try {
    const { course_id } = req.body;
    const course = await pool.query('SELECT * FROM courses WHERE id = $1', [course_id]);
    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const existing = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [req.user.id, course_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }
    const amount = Math.round(course.rows[0].price * 100);
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${req.user.id}_${course_id}_${Date.now()}`,
    });
    await pool.query(
      'INSERT INTO payments (user_id, course_id, razorpay_order_id, amount, status) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, course_id, order.id, course.rows[0].price, 'created']
    );
    res.json({ order_id: order.id, amount, currency: 'INR', course: course.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, course_id } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }
    await pool.query(
      "UPDATE payments SET razorpay_payment_id = $1, status = 'captured' WHERE razorpay_order_id = $2",
      [razorpay_payment_id, razorpay_order_id]
    );
    const payment = await pool.query('SELECT * FROM payments WHERE razorpay_order_id = $1', [razorpay_order_id]);
    const paymentRow = payment.rows[0];
    await pool.query(
      'INSERT INTO enrollments (user_id, course_id, payment_id, amount_paid) VALUES ($1,$2,$3,$4) ON CONFLICT (user_id, course_id) DO NOTHING',
      [req.user.id, paymentRow.course_id, razorpay_payment_id, paymentRow.amount]
    );
    await pool.query(
      'INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,$3)',
      [req.user.id, 'Payment successful! You are now enrolled.', 'success']
    );
    res.json({ message: 'Payment verified and enrolled successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getMyPurchases(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT e.*, c.title, c.thumbnail_url, c.category, c.level, c.description,
      (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons,
      (SELECT COUNT(*) FROM progress WHERE user_id = $1 AND course_id = c.id) as completed_lessons
      FROM enrollments e 
      JOIN courses c ON e.course_id = c.id 
      WHERE e.user_id = $1 
      ORDER BY e.purchased_at DESC
    `, [req.user.id]);
    res.json({ purchases: result.rows });
  } catch (err) {
    next(err);
  }
}
