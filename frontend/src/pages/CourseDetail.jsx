import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCourse } from '../hooks/useCourses';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton } from '../components/Skeleton';
import api from '../utils/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Play, Clock, Users, Star, ChevronDown, ChevronUp, Lock, CheckCircle, BookOpen, Award } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { course, lessons, enrollmentCount, loading } = useCourse(id);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [paying, setPaying] = useState(false);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setPaying(true);
    try {
      const { data } = await api.post('/api/payments/create-order', { course_id: parseInt(id) });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'NCC Upscale',
        description: course.title,
        order_id: data.order_id,
        handler: async (response) => {
          try {
            await api.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              course_id: parseInt(id),
            });
            confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
            toast.success('Enrollment successful! Start learning now.');
            setTimeout(() => navigate('/dashboard/courses'), 2000);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#F59E0B' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
        <CardSkeleton />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen pt-24 px-4 text-center">
        <p className="text-gray-500 text-lg">Course not found</p>
      </div>
    );
  }

  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration_mins || 0), 0);

  return (
    <div className="min-h-screen pt-20">
      <div className="relative">
        <div className="absolute inset-0 h-96 bg-gradient-to-b from-amber/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-amber/10 text-amber rounded-full text-sm">{course.category}</span>
                  <span className="px-3 py-1 bg-purple/10 text-purple rounded-full text-sm">{course.level}</span>
                </div>
                <h1 className="font-display text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-gray-500 text-lg mb-6">{course.description}</p>
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
                  <span className="flex items-center gap-2"><Users size={16} /> {enrollmentCount} enrolled</span>
                  <span className="flex items-center gap-2"><BookOpen size={16} /> {lessons.length} lessons</span>
                  <span className="flex items-center gap-2"><Clock size={16} /> {totalDuration} mins</span>
                  <span className="flex items-center gap-2"><Star size={16} className="text-amber fill-amber" /> 4.8 rating</span>
                </div>
                {course.instructor_name && (
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber to-purple flex items-center justify-center font-bold text-white">
                      {course.instructor_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{course.instructor_name}</p>
                      <p className="text-sm text-gray-400">Instructor</p>
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="font-display text-2xl font-bold mb-4">Curriculum</h2>
                <div className="space-y-2">
                  {lessons.map((lesson, i) => (
                    <div key={lesson.id} className="glass-card overflow-hidden">
                      <button
                        onClick={() => setExpandedLesson(expandedLesson === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm font-semibold text-gray-500">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-medium">{lesson.title}</p>
                            <p className="text-sm text-gray-400">{lesson.duration_mins} mins</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.is_preview ? (
                            <span className="px-2 py-1 text-xs bg-amber/10 text-amber rounded">Preview</span>
                          ) : (
                            <Lock size={14} className="text-gray-300" />
                          )}
                          {expandedLesson === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>
                      {expandedLesson === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="px-4 pb-4"
                        >
                          {lesson.is_preview ? (
                            <video controls className="w-full rounded-lg" src={lesson.video_url}>
                              <track kind="captions" />
                            </video>
                          ) : (
                            <p className="text-sm text-gray-400">Enroll to access this lesson</p>
                          )}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24">
                <div className="glass-card overflow-hidden">
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-52 object-cover" />
                  <div className="p-6">
                    <div className="text-4xl font-bold text-amber mb-4">₹{course.price}</div>
                    <button
                      onClick={handleEnroll}
                      disabled={paying}
                      className="btn-primary w-full text-center flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {paying ? 'Processing...' : <><Play size={18} /> Enroll Now</>}
                    </button>
                    <div className="mt-6 space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <CheckCircle size={16} className="text-green-400" /> Full lifetime access
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <CheckCircle size={16} className="text-green-400" /> Certificate of completion
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <CheckCircle size={16} className="text-green-400" /> {lessons.length} detailed lessons
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Award size={16} className="text-green-400" /> Industry recognized
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
