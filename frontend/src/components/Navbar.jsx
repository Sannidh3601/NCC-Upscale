import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, Menu, X, LogOut, User, BookOpen, LayoutDashboard, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { notifications, unreadCount, markRead } = useNotifications();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber to-purple flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold">NCC Upscale</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/courses" className={`text-sm font-medium transition-colors ${isActive('/courses') ? 'text-amber' : 'text-gray-600 hover:text-gray-900'}`}>
              Courses
            </Link>
            {!user && (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">
                  Get Started
                </Link>
              </>
            )}
            {user && (
              <>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className={`text-sm font-medium transition-colors ${(location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')) ? 'text-amber' : 'text-gray-600 hover:text-gray-900'}`}>
                  {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </Link>

                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markRead(); }}
                    className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Bell size={20} className={unreadCount > 0 ? 'text-amber animate-bounce' : 'text-gray-600'} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 glass-card p-4 max-h-96 overflow-y-auto"
                      >
                        <h3 className="font-semibold mb-3">Notifications</h3>
                        {notifications.length === 0 ? (
                          <p className="text-sm text-gray-500">No notifications</p>
                        ) : (
                          notifications.slice(0, 10).map(n => (
                            <div key={n.id} className={`p-3 rounded-lg mb-2 text-sm ${n.is_read ? 'bg-gray-100' : 'bg-amber/10 border border-amber/20'}`}>
                              <p>{n.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber to-purple flex items-center justify-center text-sm font-bold text-white">
                      {user.name?.charAt(0)}
                    </div>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 glass-card p-2"
                      >
                        <div className="px-3 py-2 border-b border-gray-200 mb-2">
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors" onClick={() => setProfileOpen(false)}>
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <Link to="/dashboard/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors" onClick={() => setProfileOpen(false)}>
                          <User size={16} /> Profile
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors w-full text-red-400">
                          <LogOut size={16} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-3 bg-white/95">
              <Link to="/courses" className="block py-2 text-sm" onClick={() => setMenuOpen(false)}>Courses</Link>
              {!user ? (
                <>
                  <Link to="/login" className="block py-2 text-sm" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="block btn-primary text-center text-sm" onClick={() => setMenuOpen(false)}>Get Started</Link>
                </>
              ) : (
                <>
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="block py-2 text-sm" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block py-2 text-sm text-red-400">Logout</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
