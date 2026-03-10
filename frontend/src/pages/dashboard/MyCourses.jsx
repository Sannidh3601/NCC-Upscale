import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import DashboardLayout from '../../components/DashboardLayout';
import ProgressRing from '../../components/ProgressRing';
import { CardSkeleton } from '../../components/Skeleton';

export default function MyCourses() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/payments/my-purchases')
      .then(({ data }) => setPurchases(data.purchases))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-6">My Courses</h1>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">You haven&apos;t enrolled in any courses yet</p>
            <Link to="/courses" className="btn-primary">Browse Courses</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((p, i) => {
              const pct = parseInt(p.total_lessons) > 0
                ? Math.round((parseInt(p.completed_lessons) / parseInt(p.total_lessons)) * 100)
                : 0;
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/dashboard/learn/${p.course_id}`} className="glass-card block overflow-hidden group">
                    <div className="relative h-44 overflow-hidden">
                      <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs">{p.category}</div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold mb-3 group-hover:text-amber transition-colors">{p.title}</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">{p.completed_lessons} of {p.total_lessons} lessons</p>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber to-purple rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <ProgressRing percentage={pct} size={52} strokeWidth={4} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
