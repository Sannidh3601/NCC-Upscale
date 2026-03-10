import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, BookOpen, ArrowRight, Building } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password, department);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-bg items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple/10 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-amber to-purple flex items-center justify-center">
            <BookOpen size={36} className="text-white" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">Start Learning Today</h2>
          <p className="text-gray-500 text-lg">&ldquo;An investment in knowledge pays the best interest.&rdquo;</p>
          <p className="text-amber mt-4 font-semibold">— Benjamin Franklin</p>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber to-purple flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold">NCC Upscale</span>
          </div>

          <h1 className="font-display text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-500 mb-8">Begin your learning journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50 transition-colors" placeholder="John Doe" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50 transition-colors" placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Department</label>
              <div className="relative">
                <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50 transition-colors" placeholder="Engineering" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber/50 transition-colors" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Creating account...' : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link to="/login" className="text-amber hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
