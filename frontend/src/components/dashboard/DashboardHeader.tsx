import { Activity } from 'lucide-react';

export const DashboardHeader = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:border-indigo-400/20 dark:bg-deepmidnight-surface/75 dark:shadow-[0_25px_60px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(99,102,241,0.2),transparent_35%),radial-gradient(circle_at_88%_72%,rgba(16,185,129,0.2),transparent_38%)] dark:bg-[radial-gradient(circle_at_12%_12%,rgba(99,102,241,0.35),transparent_38%),radial-gradient(circle_at_86%_78%,rgba(16,185,129,0.28),transparent_45%)]" />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500 dark:text-indigo-300">
            Campus Pulse
          </p>
          <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl">
            Admin Health Dashboard
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Live health telemetry for incident flow, service quality, and student trust.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <Activity className="h-4 w-4" />
            Systems Stable
          </div>
        </div>
      </div>
    </div>
  );
};
