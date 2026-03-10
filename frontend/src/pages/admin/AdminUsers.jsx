import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import DashboardLayout from '../../components/DashboardLayout';
import { TableSkeleton } from '../../components/Skeleton';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', department: '' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/users');
      setUsers(data.users);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ name: '', email: '', password: '', role: 'employee', department: '' });
    setModal('add');
  };

  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role, department: user.department || '' });
    setModal(user.id);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/api/admin/users', form);
        toast.success('User created');
      } else {
        const { password, ...rest } = form;
        await api.put(`/api/admin/users/${modal}`, rest);
        toast.success('User updated');
      }
      setModal(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold">Users</h1>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Employee
          </button>
        </div>

        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50"
          />
        </div>

        {loading ? <TableSkeleton rows={5} cols={5} /> : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Role</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Department</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber to-purple flex items-center justify-center text-xs font-bold text-white">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-medium text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple/10 text-purple' : 'bg-amber/10 text-amber'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{u.department || '-'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-gray-50 transition-colors"><Edit size={16} className="text-gray-500" /></button>
                          <button onClick={() => handleDelete(u.id)} className="p-2 rounded-lg hover:bg-gray-50 transition-colors"><Trash2 size={16} className="text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {modal !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="glass-card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold">{modal === 'add' ? 'Add Employee' : 'Edit User'}</h3>
                  <button onClick={() => setModal(null)}><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50" />
                  <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50" />
                  {modal === 'add' && (
                    <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50" />
                  )}
                  <input type="text" placeholder="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50" />
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber/50">
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button onClick={handleSave} disabled={saving} className="btn-primary w-full disabled:opacity-50">
                    {saving ? 'Saving...' : modal === 'add' ? 'Create User' : 'Update User'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
