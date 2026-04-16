import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/domain';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!user) {
      return;
    }
    navigate(user.role === 'ADMIN' ? '/admin' : '/student', { replace: true });
  }, [navigate, user]);

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
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_1fr]">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border border-white/70 bg-white/75 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.11)] backdrop-blur-xl"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">
            Smart Campus Utility
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold leading-tight text-slate-900">
            Seamless Operations.
            <br />
            Brighter Campus Experience.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-600">
            Monitor campus issues, publish real-time updates, and manage room
            bookings through role-focused workflows.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-indigo-50 p-4">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <h2 className="mt-2 font-display text-lg font-semibold text-slate-900">
                Student View
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Report issues via wizard, track progress, and book rooms.
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="mt-2 font-display text-lg font-semibold text-slate-900">
                Admin View
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Drag-drop issue workflows, announcements, and approvals.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          onSubmit={submit}
          className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.1)] backdrop-blur-xl"
        >
          <div className="mb-4 flex gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'login'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'register'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              Register
            </button>
          </div>

          <div className="space-y-3">
            {mode === 'register' ? (
              <input
                className="field"
                placeholder="Full name"
                value={form.fullName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, fullName: event.target.value }))
                }
              />
            ) : null}

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

            {mode === 'register' ? (
              <>
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

                {form.role === 'STUDENT' ? (
                  <>
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
                  </>
                ) : (
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
                )}
              </>
            ) : null}
          </div>

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

          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </motion.form>
      </div>
    </div>
  );
};

export default AuthPage;
