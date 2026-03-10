import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/DashboardLayout';
import { User, Mail, Building, Lock, Save } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [dept, setDept] = useState(user?.department || '');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/api/admin/users/${user.id}`, { name, department: dept });
      setUser(prev => ({ ...prev, name, department: dept }));
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-6">Profile</h1>

        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber to-purple flex items-center justify-center text-3xl font-bold text-white">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1 px-3 py-1 bg-amber/10 text-amber rounded-full text-xs font-medium">{user?.role}</span>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber/50 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="email" value={user?.email} disabled className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Department</label>
              <div className="relative">
                <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="text" value={dept} onChange={e => setDept(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber/50 transition-colors" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
