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
        <h2 className="font-display text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
      {icon ? <span className="text-indigo-500">{icon}</span> : null}
    </div>
  );
};
