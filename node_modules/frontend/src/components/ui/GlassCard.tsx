import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export const GlassCard = ({
  children,
  className,
  interactive = false,
}: GlassCardProps) => {
  return (
    <motion.div
      whileHover={interactive ? { scale: 1.01, y: -2 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={clsx(
        'rounded-2xl border border-white/60 bg-white/65 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl',
        className,
      )}
    >
      {children}
    </motion.div>
  );
};
