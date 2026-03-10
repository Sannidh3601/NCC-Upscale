import pool from './pool.js';
import bcrypt from 'bcryptjs';

export async function seedDB() {
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@ncc-upscale.com']);
    if (existing.rows.length > 0) {
      console.log('Seed data already exists, skipping');
      return;
    }

    const adminHash = await bcrypt.hash('Admin@123', 12);
    const empHash = await bcrypt.hash('Employee@123', 12);

    const adminResult = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, department) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['Admin User', 'admin@ncc-upscale.com', adminHash, 'admin', 'Management']
    );
    const adminId = adminResult.rows[0].id;

    const employees = [
      { name: 'Sarah Mitchell', email: 'sarah@ncc-upscale.com', dept: 'Engineering' },
      { name: 'James Rodriguez', email: 'james@ncc-upscale.com', dept: 'Design' },
      { name: 'Priya Sharma', email: 'priya@ncc-upscale.com', dept: 'Marketing' },
      { name: 'David Chen', email: 'david@ncc-upscale.com', dept: 'Data Science' },
      { name: 'Emily Watson', email: 'emily@ncc-upscale.com', dept: 'Business Development' },
    ];

    const empIds = [];
    for (const emp of employees) {
      const r = await pool.query(
        'INSERT INTO users (name, email, password_hash, role, department) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [emp.name, emp.email, empHash, 'employee', emp.dept]
      );
      empIds.push(r.rows[0].id);
    }

    const courses = [
      { title: 'Full-Stack Web Development Mastery', description: 'Master modern web development with React, Node.js, and PostgreSQL. Build production-ready applications from scratch.', price: 4999, category: 'Tech', level: 'intermediate', thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800' },
      { title: 'UI/UX Design Fundamentals', description: 'Learn the principles of great design. From wireframing to prototyping, create stunning user experiences.', price: 3499, category: 'Design', level: 'beginner', thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800' },
      { title: 'Strategic Business Leadership', description: 'Develop leadership skills that drive organizational success. Learn strategic thinking and team management.', price: 5999, category: 'Business', level: 'advanced', thumbnail_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800' },
      { title: 'Digital Marketing Excellence', description: 'Master SEO, social media marketing, email campaigns, and analytics to grow any business online.', price: 2999, category: 'Marketing', level: 'beginner', thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800' },
      { title: 'Data Science with Python', description: 'From data analysis to machine learning. Learn pandas, scikit-learn, and TensorFlow for real-world projects.', price: 5499, category: 'Data Science', level: 'intermediate', thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800' },
      { title: 'Executive Leadership Program', description: 'Transform your leadership approach. Build high-performing teams and drive innovation at scale.', price: 7999, category: 'Leadership', level: 'advanced', thumbnail_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800' },
    ];

    const courseIds = [];
    for (const c of courses) {
      const r = await pool.query(
        'INSERT INTO courses (title, description, thumbnail_url, price, category, level, is_published, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
        [c.title, c.description, c.thumbnail_url, c.price, c.category, c.level, true, adminId]
      );
      courseIds.push(r.rows[0].id);
    }

    const lessonTemplates = [
      ['Introduction & Setup', 'Core Concepts', 'Hands-on Practice', 'Advanced Techniques', 'Final Project'],
      ['Getting Started', 'Design Principles', 'Wireframing', 'Prototyping', 'Portfolio Review'],
      ['Leadership Foundations', 'Strategic Planning', 'Team Dynamics', 'Change Management', 'Case Studies'],
      ['Marketing Basics', 'SEO Mastery', 'Social Media Strategy', 'Analytics Deep Dive', 'Campaign Launch'],
      ['Python Basics', 'Data Wrangling', 'Visualization', 'Machine Learning', 'Capstone Project'],
      ['Executive Mindset', 'Vision & Strategy', 'Organizational Design', 'Innovation Culture', 'Transformation Lab'],
    ];

    for (let i = 0; i < courseIds.length; i++) {
      for (let j = 0; j < lessonTemplates[i].length; j++) {
        await pool.query(
          'INSERT INTO lessons (course_id, title, video_url, duration_mins, order_index, is_preview) VALUES ($1,$2,$3,$4,$5,$6)',
          [courseIds[i], lessonTemplates[i][j], 'https://www.w3schools.com/html/mov_bbb.mp4', 15 + j * 5, j, j === 0]
        );
      }
    }

    const statuses = ['pending', 'in_progress', 'completed'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const taskTitles = [
      'Complete onboarding documentation',
      'Review Q4 performance metrics',
      'Prepare presentation for client meeting',
      'Update team wiki pages',
      'Submit expense reports',
      'Attend compliance training',
      'Code review for feature branch',
      'Draft proposal for new initiative',
      'Organize team building event',
      'Update project timeline',
      'Conduct user interviews',
      'Analyze competitor reports',
      'Refactor authentication module',
      'Create marketing collateral',
      'Set up monitoring dashboards',
    ];

    let taskIdx = 0;
    for (const empId of empIds) {
      for (let t = 0; t < 3; t++) {
        const daysOffset = Math.floor(Math.random() * 14) - 3;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysOffset);
        await pool.query(
          'INSERT INTO task_assignments (assigned_by, assigned_to, title, description, priority, status, due_date) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [adminId, empId, taskTitles[taskIdx % taskTitles.length], 'Please complete this task by the due date.', priorities[taskIdx % 4], statuses[taskIdx % 3], dueDate.toISOString()]
        );
        taskIdx++;
      }
    }

    for (let i = 0; i < 3; i++) {
      await pool.query(
        'INSERT INTO enrollments (user_id, course_id, payment_id, amount_paid) VALUES ($1,$2,$3,$4)',
        [empIds[i], courseIds[i], `pay_seed_${i}`, courses[i].price]
      );
      await pool.query(
        'INSERT INTO payments (user_id, course_id, razorpay_order_id, razorpay_payment_id, amount, status) VALUES ($1,$2,$3,$4,$5,$6)',
        [empIds[i], courseIds[i], `order_seed_${i}`, `pay_seed_${i}`, courses[i].price, 'captured']
      );
    }

    for (const empId of empIds) {
      await pool.query(
        'INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,$3)',
        [empId, 'Welcome to NCC Upscale! Start your learning journey today.', 'info']
      );
    }

    console.log('Seed data inserted successfully');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}
