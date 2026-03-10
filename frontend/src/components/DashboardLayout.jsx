import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, BookOpen, ClipboardList, User,
  Users, GraduationCap, BarChart3, ListTodo
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  const employeeLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/dashboard/tasks', icon: ClipboardList, label: 'Tasks' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/courses', icon: GraduationCap, label: 'Courses' },
    { to: '/admin/tasks', icon: ListTodo, label: 'Tasks' },
  ];

  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  return (
    <div className="min-h-screen pt-16 flex">
      <aside className="hidden lg:flex w-64 fixed left-0 top-16 bottom-0 flex-col bg-white border-r border-gray-200 p-4">
        <div className="mb-6 px-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            {user?.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
          </p>
        </div>
        <nav className="space-y-1 flex-1">
          {links.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-amber/10 text-amber' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                <link.icon size={18} />
                {link.label}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-amber rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          {links.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${active ? 'text-amber' : 'text-gray-500'}`}
              >
                <link.icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
