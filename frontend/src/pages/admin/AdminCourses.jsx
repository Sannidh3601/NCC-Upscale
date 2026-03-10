import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminCourses } from '../../hooks/useCourses';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/DashboardLayout';
import { CardSkeleton } from '../../components/Skeleton';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Users, IndianRupee } from 'lucide-react';

export default function AdminCourses() {
  const { courses, loading, fetchCourses } = useAdminCourses();

  const handleTogglePublish = async (id) => {
    try {
      await api.post(`/api/courses/${id}/publish`);
      toast.success('Publish status toggled');
      fetchCourses();
    } catch {
      toast.error('Failed to toggle');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api.delete(`/api/courses/${id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold">Courses</h1>
          <Link to="/admin/courses/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Course
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="glass-card overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} alt={course.title} className="w-full h-full object-cover" />
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${course.is_published ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold mb-2">{course.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1"><Users size={14} /> {course.enrollment_count || 0}</span>
                      <span className="flex items-center gap-1"><IndianRupee size={14} /> {parseFloat(course.total_revenue || 0).toLocaleString()}</span>
                      <span className="text-amber font-semibold">₹{course.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleTogglePublish(course.id)} className="p-2 rounded-lg hover:bg-gray-50 transition-colors" title="Toggle publish">
                        {course.is_published ? <ToggleRight size={20} className="text-green-400" /> : <ToggleLeft size={20} className="text-gray-300" />}
                      </button>
                      <Link to={`/admin/courses/${course.id}/edit`} className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Edit size={16} className="text-gray-500" />
                      </Link>
                      <button onClick={() => handleDelete(course.id)} className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
