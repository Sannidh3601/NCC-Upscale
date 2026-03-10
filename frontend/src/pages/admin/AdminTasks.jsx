import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/DashboardLayout';
import { Plus, X, MessageSquare, Calendar, Flag, User, ChevronRight } from 'lucide-react';

const priorityColors = { low: 'bg-green-500/20 text-green-400', medium: 'bg-amber/20 text-amber', high: 'bg-red-500/20 text-red-400' };
const statusOptions = ['pending', 'in_progress', 'completed'];

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [commentDrawer, setCommentDrawer] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/api/tasks');
      setTasks(data.tasks || []);
    } catch { /* */ } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/admin/users');
      const list = data.users || data || [];
      setUsers(list.filter(u => u.role === 'employee'));
    } catch { /* */ }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [fetchTasks]);

  const handleCreate = async () => {
    try {
      await api.post('/api/tasks', { ...form, assigned_to: parseInt(form.assigned_to) });
      toast.success('Task assigned!');
      setShowModal(false);
      setForm({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      toast.success('Deleted');
      fetchTasks();
    } catch { toast.error('Failed to delete'); }
  };

  const openComments = async (task) => {
    setCommentDrawer(task);
    try {
      const { data } = await api.get(`/api/tasks/${task.id}/comments`);
      setComments(data.comments || []);
    } catch { /* */ }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post(`/api/tasks/${commentDrawer.id}/comments`, { content: newComment });
      setNewComment('');
      const { data } = await api.get(`/api/tasks/${commentDrawer.id}/comments`);
      setComments(data.comments || []);
    } catch { toast.error('Failed to post comment'); }
  };

  const filtered = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold">Task Management</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary !py-2 flex items-center gap-2">
            <Plus size={16} /> Assign Task
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {['all', ...statusOptions].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-full text-sm transition-all ${filterStatus === s ? 'bg-amber text-white font-bold' : 'bg-gray-50 text-gray-500 hover:text-gray-900'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-400">No tasks found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(task => (
              <motion.div key={task.id} layout className="glass-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{task.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><User size={12} /> {task.assigned_to_name || `User #${task.assigned_to}`}</span>
                    {task.due_date && <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(task.due_date).toLocaleDateString()}</span>}
                    <span className={`px-2 py-0.5 rounded-full ${task.status === 'completed' ? 'bg-green-500/20 text-green-400' : task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-50 text-gray-500'}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button onClick={() => openComments(task)} className="p-2 hover:bg-gray-50 rounded-lg transition-colors"><MessageSquare size={16} className="text-gray-400" /></button>
                <button onClick={() => handleDelete(task.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400/40 hover:text-red-400">
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="glass-card p-6 w-full max-w-md space-y-4">
                <h2 className="font-display text-xl font-bold">Assign New Task</h2>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50" />
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50 resize-none" />
                <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber/50">
                  <option value="">Select Employee</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber/50">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber/50" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="btn-secondary !py-2">Cancel</button>
                  <button onClick={handleCreate} className="btn-primary !py-2">Assign Task</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {commentDrawer && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40" onClick={() => setCommentDrawer(null)}>
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} onClick={e => e.stopPropagation()} className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-200 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-bold">{commentDrawer.title}</h3>
                  <button onClick={() => setCommentDrawer(null)}><X size={20} /></button>
                </div>
                <p className="text-sm text-gray-500 mb-4">{commentDrawer.description}</p>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {comments.length === 0 && <p className="text-sm text-gray-300 text-center py-8">No comments yet</p>}
                  {comments.map(c => (
                    <div key={c.id} className="p-3 bg-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{c.user_name}</span>
                        <span className="text-xs text-gray-300">{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{c.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && postComment()} placeholder="Add a comment..." className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50" />
                  <button onClick={postComment} className="btn-primary !py-2 !px-4"><ChevronRight size={16} /></button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}
