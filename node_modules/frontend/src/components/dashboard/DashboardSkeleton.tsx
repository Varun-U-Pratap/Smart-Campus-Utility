import { motion } from 'framer-motion';

const ShimmerBar = ({ className }: { className: string }) => (
  <div className={`relative overflow-hidden rounded-xl bg-slate-200/80 dark:bg-slate-800/70 ${className}`}>
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-indigo-200/20"
      animate={{ x: ['0%', '220%'] }}
      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.45, ease: 'linear' }}
    />
  </div>
);

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-5" aria-label="Loading dashboard data" role="status">
      <ShimmerBar className="h-24 w-full rounded-3xl" />

      <div className="grid gap-4 md:grid-cols-3">
        <ShimmerBar className="h-36" />
        <ShimmerBar className="h-36" />
        <ShimmerBar className="h-36" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <ShimmerBar className="h-[340px]" />
        <ShimmerBar className="h-[340px]" />
      </div>
    </div>
  );
};
