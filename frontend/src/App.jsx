import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import GatePage from './pages/GatePage';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/Login';
import Register from './pages/Register';

import Overview from './pages/dashboard/Overview';
import MyCourses from './pages/dashboard/MyCourses';
import LearnCourse from './pages/dashboard/LearnCourse';
import Tasks from './pages/dashboard/Tasks';
import Profile from './pages/dashboard/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import CourseWizard from './pages/admin/CourseWizard';
import AdminTasks from './pages/admin/AdminTasks';

export default function App() {
  const { user, loading } = useAuth();
  const gatePassed = typeof window !== 'undefined' && localStorage.getItem('gatePassed') === 'true';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-amber/30 border-t-amber rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {gatePassed && <Navbar />}
      <Toaster position="top-right" toastOptions={{ style: { background: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } }} />
      <Routes>
        {/* gated entry */}
        {!gatePassed && <Route path="/gate" element={<GatePage />} />}
        {!gatePassed && <Route path="*" element={<Navigate to="/gate" replace />} />}

        {gatePassed && (
          <>
            <Route path="/" element={user?.role === 'admin' ? <Navigate to="/admin" /> : <Landing />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

            <Route path="/dashboard" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
            <Route path="/dashboard/courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
            <Route path="/dashboard/learn/:id" element={<ProtectedRoute><LearnCourse /></ProtectedRoute>} />
            <Route path="/dashboard/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute adminOnly><AdminCourses /></ProtectedRoute>} />
            <Route path="/admin/courses/new" element={<ProtectedRoute adminOnly><CourseWizard /></ProtectedRoute>} />
            <Route path="/admin/courses/:id/edit" element={<ProtectedRoute adminOnly><CourseWizard /></ProtectedRoute>} />
            <Route path="/admin/tasks" element={<ProtectedRoute adminOnly><AdminTasks /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </>
  );
}
