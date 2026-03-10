import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/DashboardLayout';
import { ChevronRight, ChevronLeft, Plus, Trash2, GripVertical, Check } from 'lucide-react';

const categories = ['Tech', 'Design', 'Business', 'Marketing', 'Data Science', 'Leadership'];
const levels = ['beginner', 'intermediate', 'advanced'];

export default function CourseWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', category: 'Tech', price: '', level: 'beginner',
    thumbnail_url: '', is_published: false,
  });
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/courses/${id}`).then(({ data }) => {
        const c = data.course;
        setForm({
          title: c.title, description: c.description || '', category: c.category,
          price: String(c.price), level: c.level, thumbnail_url: c.thumbnail_url || '',
          is_published: c.is_published,
        });
        setLessons(data.lessons.map(l => ({
          id: l.id, title: l.title, video_url: l.video_url || '',
          duration_mins: String(l.duration_mins), is_preview: l.is_preview, existing: true,
        })));
      });
    }
  }, [id, isEdit]);

  const addLesson = () => {
    setLessons(prev => [...prev, { title: '', video_url: '', duration_mins: '10', is_preview: false }]);
  };

  const updateLesson = (idx, field, value) => {
    setLessons(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const removeLesson = (idx) => {
    setLessons(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let courseId = id;
      if (isEdit) {
        await api.put(`/api/courses/${id}`, {
          ...form,
          price: parseFloat(form.price),
        });
      } else {
        const { data } = await api.post('/api/courses', {
          ...form,
          price: parseFloat(form.price),
        });
        courseId = data.course.id;
      }

      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const payload = {
          title: lesson.title,
          video_url: lesson.video_url,
          duration_mins: parseInt(lesson.duration_mins) || 0,
          order_index: i,
          is_preview: lesson.is_preview,
        };
        if (lesson.existing && lesson.id) {
          await api.put(`/api/courses/${courseId}/lessons/${lesson.id}`, payload);
        } else if (!lesson.existing) {
          await api.post(`/api/courses/${courseId}/lessons`, payload);
        }
      }

      if (form.is_published) {
        const courseData = await api.get(`/api/courses/${courseId}`);
        if (!courseData.data.course.is_published) {
          await api.post(`/api/courses/${courseId}/publish`);
        }
      }

      toast.success(isEdit ? 'Course updated!' : 'Course created!');
      navigate('/admin/courses');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Lessons' },
    { num: 3, label: 'Thumbnail' },
    { num: 4, label: 'Review' },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-6">{isEdit ? 'Edit Course' : 'Create Course'}</h1>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => setStep(s.num)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s.num ? 'bg-amber text-white' : 'bg-gray-50 text-gray-300'}`}
              >
                {step > s.num ? <Check size={16} /> : s.num}
              </button>
              <span className={`ml-2 text-sm hidden sm:inline ${step >= s.num ? 'text-gray-900' : 'text-gray-300'}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > s.num ? 'bg-amber' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card p-6 max-w-3xl">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Course Title</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50" placeholder="e.g., Full-Stack Web Development" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50 resize-none" placeholder="Course description..." />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber/50">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Level</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber/50">
                    {levels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Price (₹)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber/50" placeholder="4999" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Lessons</h3>
                <button onClick={addLesson} className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-1"><Plus size={14} /> Add Lesson</button>
              </div>
              {lessons.length === 0 && <p className="text-gray-400 text-sm py-8 text-center">No lessons added yet. Click &quot;Add Lesson&quot; to start.</p>}
              {lessons.map((lesson, i) => (
                <div key={i} className="p-4 bg-gray-100 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical size={16} className="text-gray-200" />
                      <span className="text-sm font-medium text-gray-500">Lesson {i + 1}</span>
                    </div>
                    <button onClick={() => removeLesson(i)}><Trash2 size={14} className="text-red-400" /></button>
                  </div>
                  <input type="text" value={lesson.title} onChange={e => updateLesson(i, 'title', e.target.value)} placeholder="Lesson title" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={lesson.video_url} onChange={e => updateLesson(i, 'video_url', e.target.value)} placeholder="Video URL" className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50" />
                    <input type="number" value={lesson.duration_mins} onChange={e => updateLesson(i, 'duration_mins', e.target.value)} placeholder="Duration (mins)" className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                    <input type="checkbox" checked={lesson.is_preview} onChange={e => updateLesson(i, 'is_preview', e.target.checked)} className="rounded" />
                    Free preview
                  </label>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Thumbnail URL</label>
                <input type="text" value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50" placeholder="https://images.unsplash.com/..." />
              </div>
              {form.thumbnail_url && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img src={form.thumbnail_url} alt="Thumbnail preview" className="w-full h-48 object-cover" />
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Review</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Title:</span> <span className="font-medium">{form.title}</span></div>
                <div><span className="text-gray-400">Category:</span> <span className="font-medium">{form.category}</span></div>
                <div><span className="text-gray-400">Level:</span> <span className="font-medium">{form.level}</span></div>
                <div><span className="text-gray-400">Price:</span> <span className="font-medium">₹{form.price}</span></div>
                <div><span className="text-gray-400">Lessons:</span> <span className="font-medium">{lessons.length}</span></div>
              </div>
              <p className="text-sm text-gray-500">{form.description}</p>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="rounded" />
                Publish immediately
              </label>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="btn-secondary !py-2 flex items-center gap-1 disabled:opacity-30">
              <ChevronLeft size={16} /> Previous
            </button>
            {step < 4 ? (
              <button onClick={() => setStep(s => Math.min(4, s + 1))} className="btn-primary !py-2 flex items-center gap-1">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSave} disabled={saving} className="btn-primary !py-2 disabled:opacity-50">
                {saving ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
