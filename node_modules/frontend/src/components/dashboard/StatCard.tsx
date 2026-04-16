import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface StatCardProps {
  id: string;
  title: string;
  value: string;
  hint: string;
  icon: ReactNode;
  accent: 'indigo' | 'emerald' | 'amber';
  isActive: boolean;
  onSelect: (id: string) => void;
  highPriority?: boolean;
}

const accentClass: Record<StatCardProps['accent'], string> = {
  indigo:
    'from-indigo-500/90 to-indigo-600/90 shadow-[0_12px_35px_rgba(99,102,241,0.38)] dark:shadow-[0_12px_35px_rgba(99,102,241,0.5)]',
  emerald:
    'from-emerald-500/90 to-emerald-600/90 shadow-[0_12px_35px_rgba(16,185,129,0.35)] dark:shadow-[0_12px_35px_rgba(16,185,129,0.5)]',
  amber:
    'from-amber-400/90 to-orange-500/90 shadow-[0_12px_35px_rgba(249,115,22,0.35)] dark:shadow-[0_12px_35px_rgba(249,115,22,0.45)]',
};

export const StatCard = ({
  id,
  title,
  value,
  hint,
  icon,
  accent,
  isActive,
  onSelect,
  highPriority = false,
}: StatCardProps) => {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(id)}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.99 }}
      className={clsx(
        'relative h-full w-full overflow-hidden rounded-2xl border border-white/70 bg-white/70 p-4 text-left backdrop-blur-xl transition dark:border-indigo-400/20 dark:bg-deepmidnight-elevated/80',
        isActive &&
          'ring-2 ring-indigo-300/70 shadow-[0_16px_35px_rgba(99,102,241,0.22)] dark:ring-cyan-300/45 dark:shadow-[0_16px_40px_rgba(34,211,238,0.18)]',
        highPriority && !isActive && 'animate-priorityPulse',
      )}
    >
      <span
        className={clsx(
          'absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r',
          accentClass[accent],
        )}
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{hint}</p>
        </div>

        <span
          className={clsx(
            'rounded-xl bg-gradient-to-br p-2.5 text-white',
            accent === 'indigo' && 'from-indigo-500 to-indigo-700',
            accent === 'emerald' && 'from-emerald-500 to-emerald-700',
            accent === 'amber' && 'from-amber-400 to-orange-500',
          )}
        >
          {icon}
        </span>
      </div>
    </motion.button>
  );
};
