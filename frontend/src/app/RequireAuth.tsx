import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Role } from '../types/domain';
import { useAuth } from '../hooks/useAuth';

interface RequireAuthProps {
  roles?: Role[];
}

export const RequireAuth = ({
  roles,
  children,
}: PropsWithChildren<RequireAuthProps>) => {
  const { user, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <div className="p-6 text-slate-600">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace />;
  }

  return <>{children}</>;
};
