import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, CalendarClock, ClipboardList, LogOut, MoonStar, SunMedium } from 'lucide-react';
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return localStorage.getItem('scu-theme') === 'deep-midnight';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDarkMode);
    localStorage.setItem('scu-theme', isDarkMode ? 'deep-midnight' : 'light');
  }, [isDarkMode]);

  const nextThemeLabel = isDarkMode ? 'Switch to Light' : 'Switch to Deep Midnight';

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <header className="mb-6 rounded-2xl border border-white/70 bg-white/72 p-4 shadow-[0_12px_35px_rgba(2,6,23,0.08)] backdrop-blur-xl dark:border-cyan-300/20 dark:bg-deepmidnight-surface/88 dark:shadow-[0_22px_45px_rgba(0,0,0,0.55)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-500 dark:text-cyan-300">
              Smart Campus Utility
            </p>
            <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-xl bg-emerald-50 p-2 text-emerald-700 transition hover:scale-105 hover:bg-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-200 dark:hover:bg-emerald-400/25">
              <Bell className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200/80 bg-white/92 px-3 py-2 text-sm font-medium text-slate-700 transition hover:scale-105 dark:border-cyan-300/25 dark:bg-deepmidnight-elevated dark:text-slate-100 dark:hover:border-cyan-200/45"
              aria-label="Toggle color theme"
            >
              {isDarkMode ? (
                <SunMedium className="h-4 w-4 text-amber-400" />
              ) : (
                <MoonStar className="h-4 w-4 text-indigo-500" />
              )}
              {nextThemeLabel}
            </button>

            <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-deepmidnight-elevated dark:text-slate-200">
              {user.fullName} ({user.role})
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:scale-105 dark:bg-cyan-600 dark:hover:bg-cyan-500"
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
                    ? 'bg-indigo-500 text-white shadow-[0_10px_25px_rgba(99,102,241,0.35)] dark:bg-cyan-500 dark:text-slate-950 dark:shadow-[0_10px_30px_rgba(34,211,238,0.35)]'
                    : 'bg-white text-slate-700 hover:bg-indigo-50 dark:bg-deepmidnight-elevated dark:text-slate-200 dark:hover:bg-cyan-400/15',
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
