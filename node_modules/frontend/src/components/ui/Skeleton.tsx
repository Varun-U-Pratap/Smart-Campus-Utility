import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
        className,
      )}
    />
  );
};
