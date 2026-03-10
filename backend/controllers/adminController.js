import pool from '../db/pool.js';
import bcrypt from 'bcryptjs';

export async function getDashboardStats(req, res, next) {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['employee']);
    const coursesCount = await pool.query('SELECT COUNT(*) FROM courses WHERE is_published = true');
    const tasksTotal = await pool.query('SELECT COUNT(*) FROM task_assignments');
    const tasksCompleted = await pool.query("SELECT COUNT(*) FROM task_assignments WHERE status = 'completed'");
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenue = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'captured' AND created_at >= $1",
      [firstOfMonth.toISOString()]
    );
    const totalRevenue = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'captured'"
    );
    const recentActivity = await pool.query(
      'SELECT u.name, e.purchased_at as date, c.title as course_title FROM enrollments e JOIN users u ON e.user_id = u.id JOIN courses c ON e.course_id = c.id ORDER BY e.purchased_at DESC LIMIT 10'
    );
    const monthlyRevenue = await pool.query(`
      SELECT DATE_TRUNC('month', created_at) as month, COALESCE(SUM(amount), 0) as total
      FROM payments WHERE status = 'captured' AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);
    const topCourses = await pool.query(`
      SELECT c.id, c.title, c.price, COUNT(e.id) as enrollments, 
      COALESCE(SUM(e.amount_paid), 0) as revenue
      FROM courses c LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.is_published = true
      GROUP BY c.id ORDER BY enrollments DESC LIMIT 5
    `);

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      activeCourses: parseInt(coursesCount.rows[0].count),
      taskCompletionRate: tasksTotal.rows[0].count > 0
        ? Math.round((parseInt(tasksCompleted.rows[0].count) / parseInt(tasksTotal.rows[0].count)) * 100)
        : 0,
      revenueThisMonth: parseFloat(revenue.rows[0].total),
      totalRevenue: parseFloat(totalRevenue.rows[0].total),
      recentActivity: recentActivity.rows,
      monthlyRevenue: monthlyRevenue.rows,
      topCourses: topCourses.rows,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, department, avatar_url, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role, department } = req.body;
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, department) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role, department, created_at',
      [name, email, hash, role || 'employee', department || null]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, role, department } = req.body;
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), role = COALESCE($3, role), department = COALESCE($4, department) WHERE id = $5 RETURNING id, name, email, role, department, avatar_url, created_at',
      [name, email, role, department, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}
