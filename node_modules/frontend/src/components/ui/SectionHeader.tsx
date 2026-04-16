import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
}

export const SectionHeader = ({ title, subtitle, icon }: SectionHeaderProps) => {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>
      {icon ? <span className="text-indigo-500 dark:text-cyan-300">{icon}</span> : null}
    </div>
  );
};
