import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { RequireAuth } from './RequireAuth';
import { useAuth } from '../hooks/useAuth';

const AuthPage = lazy(() => import('../pages/AuthPage'));
const StudentDashboard = lazy(() => import('../pages/StudentDashboard'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));

const PageFrame = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export const AppRouter = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <Suspense fallback={<div className="p-8 text-slate-600">Loading view...</div>}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/student') : '/auth'} replace />}
          />
          <Route
            path="/auth"
            element={
              <PageFrame>
                <AuthPage />
              </PageFrame>
            }
          />
          <Route
            path="/student"
            element={
              <RequireAuth roles={['STUDENT']}>
                <PageFrame>
                  <StudentDashboard />
                </PageFrame>
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth roles={['ADMIN']}>
                <PageFrame>
                  <AdminDashboard />
                </PageFrame>
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};
