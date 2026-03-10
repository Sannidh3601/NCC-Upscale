import pool from '../db/pool.js';

export async function getCourses(req, res, next) {
  try {
    const { category, level, search, page = 1, limit = 12 } = req.query;
    let query = 'SELECT * FROM courses WHERE is_published = true';
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }
    if (level) {
      paramCount++;
      query += ` AND level = $${paramCount}`;
      params.push(level);
    }
    if (search) {
      paramCount++;
      query += ` AND (LOWER(title) LIKE $${paramCount} OR LOWER(description) LIKE $${paramCount})`;
      params.push(`%${search.toLowerCase()}%`);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    paramCount++;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(parseInt(limit));
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);
    res.json({ courses: result.rows, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
}

export async function getCourseById(req, res, next) {
  try {
    const { id } = req.params;
    const course = await pool.query('SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = $1', [id]);
    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const lessons = await pool.query('SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index', [id]);
    const enrollmentCount = await pool.query('SELECT COUNT(*) FROM enrollments WHERE course_id = $1', [id]);
    res.json({
      course: course.rows[0],
      lessons: lessons.rows,
      enrollmentCount: parseInt(enrollmentCount.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllCoursesAdmin(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name as instructor_name, 
      COUNT(DISTINCT e.id) as enrollment_count,
      COALESCE(SUM(e.amount_paid), 0) as total_revenue
      FROM courses c 
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id, u.name
      ORDER BY c.created_at DESC
    `);
    res.json({ courses: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function createCourse(req, res, next) {
  try {
    const { title, description, thumbnail_url, price, category, level } = req.body;
    const result = await pool.query(
      'INSERT INTO courses (title, description, thumbnail_url, price, category, level, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [title, description, thumbnail_url || null, price, category, level || 'beginner', req.user.id]
    );
    res.status(201).json({ course: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, thumbnail_url, price, category, level } = req.body;
    const result = await pool.query(
      'UPDATE courses SET title=COALESCE($1,title), description=COALESCE($2,description), thumbnail_url=COALESCE($3,thumbnail_url), price=COALESCE($4,price), category=COALESCE($5,category), level=COALESCE($6,level) WHERE id=$7 RETURNING *',
      [title, description, thumbnail_url, price, category, level, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ course: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    await pool.query('DELETE FROM courses WHERE id = $1', [req.params.id]);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
}

export async function togglePublish(req, res, next) {
  try {
    const result = await pool.query(
      'UPDATE courses SET is_published = NOT is_published WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ course: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function addLesson(req, res, next) {
  try {
    const { id } = req.params;
    const { title, video_url, duration_mins, order_index, is_preview } = req.body;
    const result = await pool.query(
      'INSERT INTO lessons (course_id, title, video_url, duration_mins, order_index, is_preview) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [id, title, video_url || null, duration_mins || 0, order_index || 0, is_preview || false]
    );
    res.status(201).json({ lesson: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateLesson(req, res, next) {
  try {
    const { lessonId } = req.params;
    const { title, video_url, duration_mins, order_index, is_preview } = req.body;
    const result = await pool.query(
      'UPDATE lessons SET title=COALESCE($1,title), video_url=COALESCE($2,video_url), duration_mins=COALESCE($3,duration_mins), order_index=COALESCE($4,order_index), is_preview=COALESCE($5,is_preview) WHERE id=$6 RETURNING *',
      [title, video_url, duration_mins, order_index, is_preview, lessonId]
    );
    res.json({ lesson: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteLesson(req, res, next) {
  try {
    await pool.query('DELETE FROM lessons WHERE id = $1', [req.params.lessonId]);
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    next(err);
  }
}
