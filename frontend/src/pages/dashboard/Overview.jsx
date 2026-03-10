import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useStreak } from '../../hooks/useProgress';
import { useTasks } from '../../hooks/useTasks';
import api from '../../utils/api';
import DashboardLayout from '../../components/DashboardLayout';
import ProgressRing from '../../components/ProgressRing';
import { StatSkeleton, CardSkeleton } from '../../components/Skeleton';
import { BookOpen, ClipboardList, Award, Flame, ArrowRight, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const streak = useStreak();
  const { tasks } = useTasks();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/payments/my-purchases')
      .then(({ data }) => setPurchases(data.purchases))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedCourses = purchases.filter(p => parseInt(p.total_lessons) > 0 && parseInt(p.completed_lessons) === parseInt(p.total_lessons));

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500">Here&apos;s your learning overview</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />) : (
            <>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Enrolled Courses</span>
                  <BookOpen size={18} className="text-amber" />
                </div>
                <p className="text-3xl font-bold">{purchases.length}</p>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Pending Tasks</span>
                  <ClipboardList size={18} className="text-purple" />
                </div>
                <p className="text-3xl font-bold">{pendingTasks.length}</p>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Completed</span>
                  <Award size={18} className="text-green-400" />
                </div>
                <p className="text-3xl font-bold">{completedCourses.length}</p>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Learning Streak</span>
                  <Flame size={18} className="text-orange-500" />
                </div>
                <p className="text-3xl font-bold flex items-center gap-2">
                  {streak} <span className="text-lg">🔥</span>
                </p>
              </div>
            </>
          )}
        </div>

        {purchases.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Continue Learning</h2>
              <Link to="/dashboard/courses" className="text-amber text-sm flex items-center gap-1 hover:underline">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />) :
                purchases.slice(0, 3).map(p => {
                  const pct = parseInt(p.total_lessons) > 0
                    ? Math.round((parseInt(p.completed_lessons) / parseInt(p.total_lessons)) * 100)
                    : 0;
                  return (
                    <Link key={p.id} to={`/dashboard/learn/${p.course_id}`} className="glass-card overflow-hidden group">
                      <div className="relative h-36 overflow-hidden">
                        <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <h3 className="font-semibold text-sm mb-1 group-hover:text-amber transition-colors">{p.title}</h3>
                          <p className="text-xs text-gray-400">{p.completed_lessons}/{p.total_lessons} lessons</p>
                        </div>
                        <ProgressRing percentage={pct} size={56} strokeWidth={4} />
                      </div>
                    </Link>
                  );
                })
              }
            </div>
          </div>
        )}

        {pendingTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Upcoming Deadlines</h2>
              <Link to="/dashboard/tasks" className="text-amber text-sm flex items-center gap-1 hover:underline">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-2">
              {pendingTasks.slice(0, 5).map(task => {
                const dueDate = new Date(task.due_date);
                const now = new Date();
                const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                const isOverdue = diffDays < 0;
                return (
                  <div key={task.id} className="glass-card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{task.priority} priority</p>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-400' : diffDays <= 2 ? 'text-orange-400' : 'text-green-400'}`}>
                      <Clock size={14} />
                      {isOverdue ? `Overdue by ${Math.abs(diffDays)}d` : `Due in ${diffDays}d`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
