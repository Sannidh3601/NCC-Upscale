import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/DashboardLayout';
import { CardSkeleton } from '../../components/Skeleton';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Clock, MessageSquare, AlertTriangle, ChevronRight } from 'lucide-react';

const columns = [
  { id: 'pending', title: 'Pending', color: 'border-yellow-500/50' },
  { id: 'in_progress', title: 'In Progress', color: 'border-blue-500/50' },
  { id: 'completed', title: 'Completed', color: 'border-green-500/50' },
];

const priorityColors = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function Tasks() {
  const { tasks, setTasks, loading, fetchTasks } = useTasks();
  const { user } = useAuth();
  const [commentDrawer, setCommentDrawer] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;
    const task = tasks.find(t => String(t.id) === String(taskId));
    if (!task || task.status === newStatus) return;

    setTasks(prev => prev.map(t => String(t.id) === String(taskId) ? { ...t, status: newStatus } : t));
    try {
      await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      toast.success('Task updated');
    } catch {
      fetchTasks();
      toast.error('Failed to update task');
    }
  };

  const openComments = async (task) => {
    setCommentDrawer(task);
    setLoadingComments(true);
    try {
      const { data } = await api.get(`/api/tasks/${task.id}/comments`);
      setComments(data.comments);
    } catch {}
    finally { setLoadingComments(false); }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !commentDrawer) return;
    try {
      const { data } = await api.post(`/api/tasks/${commentDrawer.id}/comments`, { comment: newComment });
      setComments(prev => [...prev, data.comment]);
      setNewComment('');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-6">My Tasks</h1>

        {loading ? (
          <div className="grid lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3"><CardSkeleton /><CardSkeleton /></div>
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid lg:grid-cols-3 gap-4">
              {columns.map(col => {
                const colTasks = tasks.filter(t => t.status === col.id);
                return (
                  <div key={col.id} id={col.id} className={`glass-card p-4 border-t-2 ${col.color} min-h-[300px]`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{col.title}</h3>
                      <span className="w-6 h-6 rounded-full bg-gray-50 text-xs flex items-center justify-center">{colTasks.length}</span>
                    </div>
                    <div className="space-y-3">
                      {colTasks.map(task => {
                        const dueDate = task.due_date ? new Date(task.due_date) : null;
                        const now = new Date();
                        const diffDays = dueDate ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)) : null;
                        return (
                          <motion.div
                            key={task.id}
                            layoutId={String(task.id)}
                            draggable
                            className="glass-card p-4 cursor-grab active:cursor-grabbing"
                            whileHover={{ scale: 1.02 }}
                            onDragStart={(e) => {
                              e.dataTransfer?.setData?.('taskId', task.id);
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm flex-1">{task.title}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs border ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                            </div>
                            {task.description && <p className="text-xs text-gray-400 mb-3">{task.description}</p>}
                            <div className="flex items-center justify-between">
                              {dueDate && (
                                <span className={`flex items-center gap-1 text-xs ${diffDays < 0 ? 'text-red-400' : diffDays <= 2 ? 'text-orange-400' : 'text-gray-400'}`}>
                                  <Clock size={12} />
                                  {diffDays < 0 ? `Overdue ${Math.abs(diffDays)}d` : `${diffDays}d left`}
                                </span>
                              )}
                              <button onClick={() => openComments(task)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber transition-colors">
                                <MessageSquare size={12} /> Comments
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </DndContext>
        )}
      </motion.div>

      <AnimatePresence>
        {commentDrawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setCommentDrawer(null)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-200 z-50 flex flex-col"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold">{commentDrawer.title}</h3>
                  <button onClick={() => setCommentDrawer(null)} className="text-gray-500 hover:text-gray-900">&times;</button>
                </div>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs border ${priorityColors[commentDrawer.priority]}`}>
                  {commentDrawer.priority}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingComments ? (
                  <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16" />)}</div>
                ) : comments.length === 0 ? (
                  <p className="text-gray-400 text-sm">No comments yet</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber to-purple flex items-center justify-center text-xs font-bold text-white">
                          {c.user_name?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{c.user_name}</span>
                        <span className="text-xs text-gray-300">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitComment()}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50"
                  />
                  <button onClick={submitComment} className="btn-primary !py-2 !px-4 text-sm">Send</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
