import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, GaugeCircle, Smile, Timer } from 'lucide-react';
import { AnalyticsCharts, type CategoryDatum, type ResolutionPoint } from './AnalyticsCharts';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSkeleton } from './DashboardSkeleton';
import { StatCard } from './StatCard';
import { apiRequest } from '../../lib/api';
import type { Issue } from '../../types/domain';

const DAY_SPAN = 30;

interface AnalyticsDashboardProps {
  token: string;
}

const colorByCategory: Record<string, string> = {
  NETWORK: '#6366F1',
  PLUMBING: '#10B981',
  ELECTRICAL: '#F59E0B',
  CLEANLINESS: '#0EA5E9',
  SECURITY: '#F43F5E',
  OTHER: '#8B5CF6',
};

const formatCategory = (category: string) => {
  if (category === 'NETWORK') {
    return 'Wi-Fi';
  }

  return category
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

type KpiKey = 'active' | 'mttr' | 'satisfaction';

const buildTrendData = (issues: Issue[]): ResolutionPoint[] => {
  const now = new Date();
  const points = Array.from({ length: DAY_SPAN }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(now.getDate() - (DAY_SPAN - 1 - index));

    return {
      key: date.toISOString().slice(0, 10),
      day: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      reported: 0,
      resolved: 0,
    };
  });

  const indexByDay = new Map(points.map((point, index) => [point.key, index]));

  for (const issue of issues) {
    const createdKey = new Date(issue.createdAt).toISOString().slice(0, 10);
    const createdIndex = indexByDay.get(createdKey);
    if (createdIndex !== undefined) {
      points[createdIndex].reported += 1;
    }

    if (issue.resolvedAt) {
      const resolvedKey = new Date(issue.resolvedAt).toISOString().slice(0, 10);
      const resolvedIndex = indexByDay.get(resolvedKey);
      if (resolvedIndex !== undefined) {
        points[resolvedIndex].resolved += 1;
      }
    }
  }

  return points.map(({ key: _key, ...point }) => point);
};

const buildCategoryData = (issues: Issue[]): CategoryDatum[] => {
  const counts = new Map<string, number>();
  for (const issue of issues) {
    counts.set(issue.category, (counts.get(issue.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, value]) => ({
      name: formatCategory(category),
      value,
      color: colorByCategory[category] ?? '#94A3B8',
    }));
};

const calcMttrHours = (issues: Issue[]) => {
  const resolved = issues.filter((issue) => issue.resolvedAt);
  if (resolved.length === 0) {
    return 0;
  }

  const totalHours = resolved.reduce((sum, issue) => {
    const opened = new Date(issue.openedAt ?? issue.createdAt).getTime();
    const resolvedAt = new Date(issue.resolvedAt as string).getTime();
    return sum + Math.max(0, resolvedAt - opened) / (1000 * 60 * 60);
  }, 0);

  return totalHours / resolved.length;
};

const calcSatisfaction = (issues: Issue[]) => {
  const resolved = issues.filter((issue) => issue.resolvedAt);
  if (resolved.length === 0) {
    return 0;
  }

  const within48Hours = resolved.filter((issue) => {
    const opened = new Date(issue.openedAt ?? issue.createdAt).getTime();
    const resolvedAt = new Date(issue.resolvedAt as string).getTime();
    return resolvedAt - opened <= 48 * 60 * 60 * 1000;
  }).length;

  return (within48Hours / resolved.length) * 100;
};

export const AnalyticsDashboard = ({ token }: AnalyticsDashboardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKpi, setSelectedKpi] = useState<KpiKey>('active');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await apiRequest<Issue[]>('/issues', { token });
        setIssues(data);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Could not load analytics data.');
        setIssues([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAnalytics();
  }, [token]);

  const trendData = useMemo(() => buildTrendData(issues), [issues]);
  const categoryData = useMemo(() => buildCategoryData(issues), [issues]);

  const activeIssues = useMemo(
    () => issues.filter((issue) => issue.status === 'OPEN' || issue.status === 'IN_PROGRESS'),
    [issues],
  );

  const highPriorityIssues = useMemo(
    () =>
      activeIssues
        .filter((issue) => issue.priority === 'HIGH' || issue.priority === 'CRITICAL')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [activeIssues],
  );

  const mttrHours = useMemo(() => calcMttrHours(issues), [issues]);
  const satisfaction = useMemo(() => calcSatisfaction(issues), [issues]);

  const kpiDetails = {
    active: {
      title: 'Total Active Issues',
      value: String(activeIssues.length),
      hint: `${highPriorityIssues.length} high-priority incidents need urgent action`,
      description:
        'Active incidents represent unresolved operational load across campus facilities and support services.',
    },
    mttr: {
      title: 'Mean Time to Resolve (MTTR)',
      value: `${mttrHours.toFixed(1)} hrs`,
      hint: `${issues.filter((issue) => issue.resolvedAt).length} incidents resolved in dataset`,
      description:
        'MTTR is computed from issue open timestamp to resolved timestamp for all closed incidents.',
    },
    satisfaction: {
      title: 'Student Satisfaction Rating',
      value: `${satisfaction.toFixed(1)}%`,
      hint: 'Share of resolved tickets closed within 48 hours',
      description:
        'Satisfaction index is derived from fast-close resolution performance as a service-quality proxy.',
    },
  } as const;

  const detail = kpiDetails[selectedKpi];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <section className="space-y-5">
      <DashboardHeader />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          id="active"
          title={kpiDetails.active.title}
          value={kpiDetails.active.value}
          hint={kpiDetails.active.hint}
          icon={<AlertTriangle className="h-5 w-5" />}
          accent="indigo"
          isActive={selectedKpi === 'active'}
          onSelect={(id) => setSelectedKpi(id as KpiKey)}
          highPriority
        />
        <StatCard
          id="mttr"
          title={kpiDetails.mttr.title}
          value={kpiDetails.mttr.value}
          hint={kpiDetails.mttr.hint}
          icon={<Timer className="h-5 w-5" />}
          accent="emerald"
          isActive={selectedKpi === 'mttr'}
          onSelect={(id) => setSelectedKpi(id as KpiKey)}
        />
        <StatCard
          id="satisfaction"
          title={kpiDetails.satisfaction.title}
          value={kpiDetails.satisfaction.value}
          hint={kpiDetails.satisfaction.hint}
          icon={<Smile className="h-5 w-5" />}
          accent="amber"
          isActive={selectedKpi === 'satisfaction'}
          onSelect={(id) => setSelectedKpi(id as KpiKey)}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedKpi}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-indigo-400/20 dark:bg-deepmidnight-surface/80"
        >
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-indigo-500/15 p-2 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-300">
              <GaugeCircle className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                {detail.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{detail.description}</p>
            </div>
          </div>

          {selectedKpi === 'active' ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {highPriorityIssues.length === 0 ? (
                <div
                  className="animate-priorityPulse rounded-xl border border-rose-200/70 bg-rose-50/80 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200"
                >
                  No high-priority active issues.
                </div>
              ) : (
                highPriorityIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="animate-priorityPulse rounded-xl border border-rose-200/70 bg-rose-50/80 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200"
                  >
                    {issue.ticketNo}: {issue.title}
                  </div>
                ))
              )}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {loadError ? (
        <p className="text-sm text-rose-600">{loadError}</p>
      ) : null}

      <AnalyticsCharts trendData={trendData} categoryData={categoryData} />
    </section>
  );
};
