import pool from '../db/pool.js';

export async function completeLesson(req, res, next) {
  try {
    const { lesson_id, course_id } = req.body;
    await pool.query(
      'INSERT INTO progress (user_id, lesson_id, course_id) VALUES ($1,$2,$3) ON CONFLICT (user_id, lesson_id) DO NOTHING',
      [req.user.id, lesson_id, course_id]
    );
    res.json({ message: 'Lesson marked as complete' });
  } catch (err) {
    next(err);
  }
}

export async function getCourseProgress(req, res, next) {
  try {
    const { courseId } = req.params;
    const totalLessons = await pool.query('SELECT COUNT(*) FROM lessons WHERE course_id = $1', [courseId]);
    const completedLessons = await pool.query(
      'SELECT COUNT(*) FROM progress WHERE user_id = $1 AND course_id = $2',
      [req.user.id, courseId]
    );
    const completedIds = await pool.query(
      'SELECT lesson_id FROM progress WHERE user_id = $1 AND course_id = $2',
      [req.user.id, courseId]
    );
    const total = parseInt(totalLessons.rows[0].count);
    const completed = parseInt(completedLessons.rows[0].count);
    res.json({
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      completedLessonIds: completedIds.rows.map(r => r.lesson_id),
    });
  } catch (err) {
    next(err);
  }
}

export async function getStreak(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT DISTINCT DATE(completed_at) as day 
      FROM progress 
      WHERE user_id = $1 
      ORDER BY day DESC
    `, [req.user.id]);
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < result.rows.length; i++) {
      const d = new Date(result.rows[i].day);
      d.setHours(0, 0, 0, 0);
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      expected.setHours(0, 0, 0, 0);
      if (d.getTime() === expected.getTime()) {
        streak++;
      } else if (i === 0 && d.getTime() === new Date(today.getTime() - 86400000).getTime()) {
        streak++;
      } else {
        break;
      }
    }
    res.json({ streak });
  } catch (err) {
    next(err);
  }
}
