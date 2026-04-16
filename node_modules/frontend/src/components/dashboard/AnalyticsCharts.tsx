import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface ResolutionPoint {
  day: string;
  reported: number;
  resolved: number;
}

export interface CategoryDatum {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsChartsProps {
  trendData: ResolutionPoint[];
  categoryData: CategoryDatum[];
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
  }>;
}

const ChartTooltip = ({ active, label, payload }: ChartTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-cyan-300/20 dark:bg-deepmidnight-surface/95 dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color ?? '#6366F1' }}
              />
              <span className="font-medium text-slate-700 dark:text-slate-100">
                {item.name}
              </span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnalyticsCharts = ({
  trendData,
  categoryData,
}: AnalyticsChartsProps) => {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
      <div
        className="rounded-3xl border border-white/70 bg-white/75 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-indigo-400/20 dark:bg-deepmidnight-surface/80"
        role="img"
        aria-label="30-day issue trend area chart showing reported and resolved incidents"
      >
        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
          Resolution Trends
        </h3>
        <p className="mb-4 mt-1 text-sm text-slate-600 dark:text-slate-300">
          30-day trajectory of reported versus resolved issues.
        </p>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="reportedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.44} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.22)" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'var(--fg)' }}
                tickLine={{ stroke: 'rgba(148, 163, 184, 0.35)' }}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.35)' }}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--fg)' }}
                tickLine={{ stroke: 'rgba(148, 163, 184, 0.35)' }}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.35)' }}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(99, 102, 241, 0.35)', strokeWidth: 1 }} />
              <Legend />
              <Area
                type="monotone"
                dataKey="reported"
                stroke="#6366F1"
                fill="url(#reportedGradient)"
                strokeWidth={2.5}
                activeDot={{ r: 6 }}
                name="Reported"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#10B981"
                fill="url(#resolvedGradient)"
                strokeWidth={2.5}
                activeDot={{ r: 6 }}
                name="Resolved"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className="rounded-3xl border border-white/70 bg-white/75 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-indigo-400/20 dark:bg-deepmidnight-surface/80"
        role="img"
        aria-label="Issue category donut chart showing distribution across categories"
      >
        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
          Category Analysis
        </h3>
        <p className="mb-4 mt-1 text-sm text-slate-600 dark:text-slate-300">
          Breakdown by issue type.
        </p>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={98}
                paddingAngle={4}
                strokeWidth={0}
              >
                {categoryData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
