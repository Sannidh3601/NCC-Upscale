import pool from '../db/pool.js';

export async function getTasks(req, res, next) {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query(`
        SELECT t.*, u1.name as assigned_by_name, u2.name as assigned_to_name, u2.department
        FROM task_assignments t 
        LEFT JOIN users u1 ON t.assigned_by = u1.id
        LEFT JOIN users u2 ON t.assigned_to = u2.id
        ORDER BY t.created_at DESC
      `);
    } else {
      result = await pool.query(`
        SELECT t.*, u1.name as assigned_by_name, u2.name as assigned_to_name
        FROM task_assignments t 
        LEFT JOIN users u1 ON t.assigned_by = u1.id
        LEFT JOIN users u2 ON t.assigned_to = u2.id
        WHERE t.assigned_to = $1
        ORDER BY t.created_at DESC
      `, [req.user.id]);
    }
    res.json({ tasks: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const { assigned_to, title, description, priority, due_date } = req.body;
    const result = await pool.query(
      'INSERT INTO task_assignments (assigned_by, assigned_to, title, description, priority, due_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.user.id, assigned_to, title, description || null, priority || 'medium', due_date || null]
    );
    await pool.query(
      'INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,$3)',
      [assigned_to, `New task assigned: ${title}`, 'task']
    );
    const task = await pool.query(`
      SELECT t.*, u1.name as assigned_by_name, u2.name as assigned_to_name
      FROM task_assignments t 
      LEFT JOIN users u1 ON t.assigned_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = $1
    `, [result.rows[0].id]);
    res.status(201).json({ task: task.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, priority, status, due_date } = req.body;
    const result = await pool.query(
      'UPDATE task_assignments SET title=COALESCE($1,title), description=COALESCE($2,description), priority=COALESCE($3,priority), status=COALESCE($4,status), due_date=COALESCE($5,due_date) WHERE id=$6 RETURNING *',
      [title, description, priority, status, due_date, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const task = await pool.query(`
      SELECT t.*, u1.name as assigned_by_name, u2.name as assigned_to_name
      FROM task_assignments t 
      LEFT JOIN users u1 ON t.assigned_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = $1
    `, [id]);
    res.json({ task: task.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    await pool.query('DELETE FROM task_assignments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}

export async function addComment(req, res, next) {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const result = await pool.query(
      'INSERT INTO task_comments (task_id, user_id, comment) VALUES ($1,$2,$3) RETURNING *',
      [id, req.user.id, comment]
    );
    const full = await pool.query(
      'SELECT tc.*, u.name as user_name FROM task_comments tc JOIN users u ON tc.user_id = u.id WHERE tc.id = $1',
      [result.rows[0].id]
    );
    res.status(201).json({ comment: full.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function getComments(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT tc.*, u.name as user_name FROM task_comments tc JOIN users u ON tc.user_id = u.id WHERE tc.task_id = $1 ORDER BY tc.created_at ASC',
      [req.params.id]
    );
    res.json({ comments: result.rows });
  } catch (err) {
    next(err);
  }
}
