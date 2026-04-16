import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CalendarCheck2, Newspaper } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/api';
import { Issue } from '../types/domain';
import { IssueWizard } from '../components/issues/IssueWizard';
import { AnnouncementsFeed } from '../components/announcements/AnnouncementsFeed';
import { BookingGrid } from '../components/booking/BookingGrid';

const StudentDashboard = () => {
  const { token } = useAuth();
  const [myIssues, setMyIssues] = useState<Issue[]>([]);

  const loadIssues = async () => {
    if (!token) {
      return;
    }

    try {
      const result = await apiRequest<Issue[]>('/issues/mine', { token });
      setMyIssues(result);
    } catch {
      setMyIssues([]);
    }
  };

  useEffect(() => {
    void loadIssues();
  }, [token]);

  const stats = useMemo(
    () => [
      {
        label: 'Open Reports',
        value: myIssues.filter((issue) => issue.status === 'OPEN').length,
        icon: AlertCircle,
        color: 'text-rose-500',
      },
      {
        label: 'Resolved',
        value: myIssues.filter((issue) => issue.status === 'RESOLVED').length,
        icon: CalendarCheck2,
        color: 'text-emerald-500',
      },
      {
        label: 'Announcements',
        value: 24,
        icon: Newspaper,
        color: 'text-indigo-500',
      },
    ],
    [myIssues],
  );

  if (!token) {
    return null;
  }

  return (
    <AppShell title="Student Dashboard">
      <motion.section
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
        className="mb-6 grid gap-4 md:grid-cols-3"
      >
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            >
              <GlassCard interactive className="h-full">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-300">{item.label}</p>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {item.value}
                </p>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.section>

      <section className="grid gap-5 lg:grid-cols-2">
        <IssueWizard token={token} onSubmitted={loadIssues} />
        <AnnouncementsFeed token={token} />
      </section>

      <section className="mt-5">
        <BookingGrid token={token} />
      </section>
    </AppShell>
  );
};

export default StudentDashboard;
