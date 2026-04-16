import { memo, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Columns3, GripVertical } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Issue, IssueStatus } from '../../types/domain';
import { GlassCard } from '../ui/GlassCard';
import { SectionHeader } from '../ui/SectionHeader';
import { ISSUE_COLUMNS, groupIssuesByStatus } from './kanban.util';

interface KanbanBoardProps {
  token: string;
}

const IssueCard = memo(({ issue }: { issue: Issue }) => {
  return (
    <motion.article
      layout
      whileHover={{ scale: 1.015 }}
      className="cursor-grab rounded-xl border border-white/70 bg-white/85 p-3 shadow-sm dark:border-indigo-300/20 dark:bg-deepmidnight-elevated/85"
      draggable
      data-issue-id={issue.id}
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-indigo-500 dark:text-cyan-300">
        {issue.ticketNo}
      </p>
      <h4 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{issue.title}</h4>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <span>{issue.category}</span>
        <span>{issue.priority}</span>
      </div>
    </motion.article>
  );
});

IssueCard.displayName = 'IssueCard';

export const KanbanBoard = ({ token }: KanbanBoardProps) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiRequest<Issue[]>('/issues', { token });
      setIssues(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const grouped = useMemo(() => groupIssuesByStatus(issues), [issues]);

  const onDrop = async (nextStatus: IssueStatus) => {
    if (!draggingId) {
      return;
    }

    const current = issues.find((issue) => issue.id === draggingId);
    if (!current || current.status === nextStatus) {
      setDraggingId(null);
      return;
    }

    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === draggingId ? { ...issue, status: nextStatus } : issue,
      ),
    );

    try {
      await apiRequest(`/issues/${draggingId}/status`, {
        method: 'PATCH',
        token,
        body: { status: nextStatus },
      });
    } catch {
      await load();
    } finally {
      setDraggingId(null);
    }
  };

  return (
    <GlassCard>
      <SectionHeader
        title="Issue Kanban"
        subtitle="Drag cards across OPEN, IN_PROGRESS, and RESOLVED lanes."
        icon={<Columns3 className="h-5 w-5" />}
      />

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-300">Loading board...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {ISSUE_COLUMNS.map((status) => (
            <section
              key={status}
              className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-300/20 dark:bg-indigo-500/5"
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onDrop(status)}
            >
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-cyan-300">
                {status.replace('_', ' ')}
              </h3>
              <motion.div layout className="space-y-3">
                {grouped[status].map((issue) => (
                  <div
                    key={issue.id}
                    onDragStart={(event) => {
                      setDraggingId(issue.id);
                      event.dataTransfer.setData('text/plain', issue.id);
                    }}
                    className="group"
                  >
                    <div className="mb-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-300">
                      <GripVertical className="h-3 w-3" /> drag
                    </div>
                    <IssueCard issue={issue} />
                  </div>
                ))}
              </motion.div>
            </section>
          ))}
        </div>
      )}

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </GlassCard>
  );
};
