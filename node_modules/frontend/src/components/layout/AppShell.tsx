import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, CalendarClock, ClipboardList, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';

interface AppShellProps {
  children: ReactNode;
  title: string;
}

const navByRole = {
  STUDENT: [{ label: 'Dashboard', to: '/student', icon: ClipboardList }],
  ADMIN: [{ label: 'Dashboard', to: '/admin', icon: CalendarClock }],
};

export const AppShell = ({ children, title }: AppShellProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-[0_12px_35px_rgba(2,6,23,0.08)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-500">
              Smart Campus Utility
            </p>
            <h1 className="font-display text-2xl font-semibold text-slate-900">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-xl bg-emerald-50 p-2 text-emerald-600 transition hover:scale-105 hover:bg-emerald-100">
              <Bell className="h-4 w-4" />
            </button>
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
              {user.fullName} ({user.role})
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:scale-105"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <nav className="mt-4 flex gap-2">
          {navByRole[user.role].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-indigo-500 text-white shadow-[0_10px_25px_rgba(99,102,241,0.35)]'
                    : 'bg-white text-slate-700 hover:bg-indigo-50',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {children}
    </div>
  );
};
