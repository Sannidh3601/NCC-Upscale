import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourse } from '../../hooks/useCourses';
import { useProgress } from '../../hooks/useProgress';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { CardSkeleton } from '../../components/Skeleton';
import ProgressRing from '../../components/ProgressRing';
import { Play, CheckCircle, Circle, Download, Award } from 'lucide-react';

export default function LearnCourse() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { course, lessons, loading: courseLoading } = useCourse(courseId);
  const { progress, fetchProgress } = useProgress(courseId);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [showCert, setShowCert] = useState(false);

  useEffect(() => {
    if (lessons.length > 0 && !activeLesson) {
      const firstIncomplete = lessons.find(l => !progress.completedLessonIds.includes(l.id));
      setActiveLesson(firstIncomplete || lessons[0]);
    }
  }, [lessons, progress.completedLessonIds]);

  const handleComplete = async () => {
    if (!activeLesson) return;
    setCompleting(true);
    try {
      await api.post('/api/progress/complete-lesson', {
        lesson_id: activeLesson.id,
        course_id: parseInt(courseId),
      });
      toast.success('Lesson completed!');
      await fetchProgress();
      const idx = lessons.findIndex(l => l.id === activeLesson.id);
      if (idx < lessons.length - 1) {
        setActiveLesson(lessons[idx + 1]);
      }
    } catch {
      toast.error('Failed to mark lesson complete');
    } finally {
      setCompleting(false);
    }
  };

  const isAllComplete = progress.percentage === 100 && progress.total > 0;

  useEffect(() => {
    if (isAllComplete) {
      confetti({ particleCount: 150, spread: 60, origin: { y: 0.6 } });
    }
  }, [isAllComplete]);

  const downloadCertificate = async () => {
    setShowCert(true);
    setTimeout(async () => {
      const el = document.getElementById('certificate');
      if (el) {
        const canvas = await html2canvas(el, { backgroundColor: '#0D0D0D', scale: 2 });
        const link = document.createElement('a');
        link.download = `${course.title}-certificate.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
      setShowCert(false);
    }, 500);
  };

  if (courseLoading) {
    return <div className="min-h-screen pt-20 px-4"><CardSkeleton /></div>;
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="flex flex-col lg:flex-row">
        <aside className="lg:w-80 lg:fixed lg:left-0 lg:top-16 lg:bottom-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-display text-lg font-bold mb-2">{course?.title}</h2>
            <div className="flex items-center gap-3">
              <ProgressRing percentage={progress.percentage} size={48} strokeWidth={4} />
              <div>
                <p className="text-sm font-medium">{progress.completed}/{progress.total} lessons</p>
                <p className="text-xs text-gray-400">{progress.percentage}% complete</p>
              </div>
            </div>
          </div>
          <nav className="p-2">
            {lessons.map((lesson, i) => {
              const isCompleted = progress.completedLessonIds.includes(lesson.id);
              const isActive = activeLesson?.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-left transition-all ${isActive ? 'bg-amber/10 text-amber' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                  {isCompleted ? (
                    <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle size={18} className="text-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{i + 1}. {lesson.title}</p>
                    <p className="text-xs text-gray-300">{lesson.duration_mins} min</p>
                  </div>
                </button>
              );
            })}
          </nav>
          {isAllComplete && (
            <div className="p-4 border-t border-gray-200">
              <button onClick={downloadCertificate} className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                <Download size={16} /> Download Certificate
              </button>
            </div>
          )}
        </aside>

        <main className="flex-1 lg:ml-80 p-4 lg:p-8">
          {activeLesson && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={activeLesson.id}>
              <div className="mb-6">
                <video
                  controls
                  className="w-full rounded-xl bg-black aspect-video"
                  src={activeLesson.video_url}
                  key={activeLesson.id}
                >
                  <track kind="captions" />
                </video>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">{activeLesson.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">{activeLesson.duration_mins} minutes</p>
                </div>
                {!progress.completedLessonIds.includes(activeLesson.id) && (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    {completing ? 'Marking...' : 'Mark Complete'}
                  </button>
                )}
                {progress.completedLessonIds.includes(activeLesson.id) && (
                  <span className="flex items-center gap-2 text-green-400 font-medium">
                    <CheckCircle size={18} /> Completed
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {showCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div id="certificate" className="bg-white border-2 border-amber p-16 text-center" style={{ width: 800, height: 560 }}>
            <div className="border-2 border-amber/30 p-12 h-full flex flex-col items-center justify-center">
              <Award size={48} className="text-amber mb-4" />
              <h2 className="font-display text-lg text-amber mb-2">CERTIFICATE OF COMPLETION</h2>
              <h1 className="font-display text-4xl font-bold mb-4">NCC Upscale</h1>
              <p className="text-gray-500 mb-6">This is to certify that</p>
              <p className="font-display text-3xl font-bold gradient-text mb-6">{user?.name}</p>
              <p className="text-gray-500 mb-2">has successfully completed the course</p>
              <p className="font-display text-2xl font-semibold text-amber mb-8">{course?.title}</p>
              <p className="text-sm text-gray-400">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
