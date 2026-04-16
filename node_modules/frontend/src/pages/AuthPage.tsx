import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, MoonStar, ShieldCheck, SunMedium } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/domain';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return localStorage.getItem('scu-theme') === 'deep-midnight';
  });

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'STUDENT' as Role,
    studentId: '',
    department: '',
    employeeCode: '',
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDarkMode);
    localStorage.setItem('scu-theme', isDarkMode ? 'deep-midnight' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (!user) {
      return;
    }
    navigate(user.role === 'ADMIN' ? '/admin' : '/student', { replace: true });
  }, [navigate, user]);

  const nextThemeLabel = isDarkMode ? 'Switch to Light' : 'Switch to Deep Midnight';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          role: form.role,
          studentId: form.role === 'STUDENT' ? form.studentId : undefined,
          department: form.role === 'STUDENT' ? form.department : undefined,
          employeeCode: form.role === 'ADMIN' ? form.employeeCode : undefined,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7.5rem)] max-w-6xl items-center px-4 pb-10 pt-0 sm:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative rounded-3xl border border-white/70 bg-white/75 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.11)] backdrop-blur-xl dark:border-cyan-300/25 dark:bg-[#0B1220]/95"
        >
          <button
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-xl border border-indigo-200/80 bg-white/90 px-3 py-2 text-xs font-medium text-slate-700 transition hover:scale-105 dark:border-cyan-300/25 dark:bg-deepmidnight-elevated dark:text-slate-100"
            aria-label="Toggle color theme"
          >
            {isDarkMode ? (
              <SunMedium className="h-4 w-4 text-amber-400" />
            ) : (
              <MoonStar className="h-4 w-4 text-indigo-500" />
            )}
            {nextThemeLabel}
          </button>

          <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 dark:text-cyan-300">
            Smart Campus Utility
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold leading-tight text-slate-900 dark:text-white">
            Seamless Operations.
            <br />
            Brighter Campus Experience.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-200">
            Monitor campus issues, publish real-time updates, and manage room
            bookings through role-focused workflows.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-indigo-50 p-4 dark:border dark:border-indigo-300/25 dark:bg-[#131E33]">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <h2 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Student View
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-200">
                Report issues via wizard, track progress, and book rooms.
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 dark:border dark:border-emerald-300/25 dark:bg-[#12261F]">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Admin View
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-200">
                Drag-drop issue workflows, announcements, and approvals.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.form
          layout
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: 0.08,
            layout: { duration: 0.3, ease: 'easeInOut' },
          }}
          onSubmit={submit}
          className="h-fit self-center rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:border-cyan-300/28 dark:bg-[#091327]/96"
        >
          <div className="mb-4 flex gap-2 rounded-xl bg-slate-100 p-1 dark:bg-[#0C1A34]">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'login'
                  ? 'bg-indigo-500 text-white dark:bg-cyan-600 dark:text-white'
                  : 'text-slate-700 hover:bg-white dark:text-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'register'
                  ? 'bg-indigo-500 text-white dark:bg-cyan-600 dark:text-white'
                  : 'text-slate-700 hover:bg-white dark:text-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              Register
            </button>
          </div>

          <motion.div layout className="space-y-3">
            <AnimatePresence initial={false}>
              {mode === 'register' ? (
                <motion.input
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="field"
                  placeholder="Full name"
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                />
              ) : null}
            </AnimatePresence>

            <input
              className="field"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
            />

            <input
              className="field"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
            />

            <AnimatePresence initial={false}>
              {mode === 'register' ? (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="space-y-3"
                >
                  <select
                    className="field"
                    value={form.role}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        role: event.target.value as Role,
                      }))
                    }
                  >
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Admin</option>
                  </select>

                  <AnimatePresence mode="wait" initial={false}>
                    {form.role === 'STUDENT' ? (
                      <motion.div
                        key="student-fields"
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="space-y-3"
                      >
                        <input
                          className="field"
                          placeholder="Student ID"
                          value={form.studentId}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              studentId: event.target.value,
                            }))
                          }
                        />
                        <input
                          className="field"
                          placeholder="Department"
                          value={form.department}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              department: event.target.value,
                            }))
                          }
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="admin-fields"
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <input
                          className="field"
                          placeholder="Employee code"
                          value={form.employeeCode}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              employeeCode: event.target.value,
                            }))
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>

          <button
            disabled={isSubmitting}
            className="btn-primary mt-5 w-full justify-center disabled:opacity-50"
          >
            {isSubmitting
              ? 'Processing...'
              : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
          </button>

          {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
        </motion.form>
      </div>
    </div>
  );
};

export default AuthPage;
