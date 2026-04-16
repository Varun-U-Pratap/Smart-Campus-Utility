import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { apiRequest } from '../../lib/api';
import { createRealtimeClient } from '../../lib/realtime';
import { Announcement } from '../../types/domain';
import { GlassCard } from '../ui/GlassCard';
import { SectionHeader } from '../ui/SectionHeader';
import { Skeleton } from '../ui/Skeleton';

interface AnnouncementsFeedProps {
  token: string;
}

const AnnouncementItem = memo(
  ({ item, onRead }: { item: Announcement; onRead: (id: string) => void }) => {
    return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="rounded-xl border border-white/70 bg-white/85 p-4 shadow-sm dark:border-cyan-300/20 dark:bg-deepmidnight-elevated/85"
      >
        <div className="flex flex-wrap items-center gap-2">
          {item.isSticky ? (
            <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:bg-amber-400/20 dark:text-amber-200">
              Sticky
            </span>
          ) : null}
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:bg-cyan-400/15 dark:text-cyan-200">
            {item.category}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-300">by {item.author.fullName}</span>
        </div>

        <h4 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{item.title}</h4>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.body}</p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {item.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200"
              >
                #{tag.name}
              </span>
            ))}
          </div>
          <button onClick={() => onRead(item.id)} className="btn-muted text-xs">
            Mark read
          </button>
        </div>
      </motion.article>
    );
  },
);

AnnouncementItem.displayName = 'AnnouncementItem';

export const AnnouncementsFeed = ({ token }: AnnouncementsFeedProps) => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');

  const load = useCallback(async (nextCategory?: string) => {
    try {
      setLoading(true);
      setError(null);
      const query = nextCategory ? `?category=${nextCategory}` : '';
      const result = await apiRequest<Announcement[]>(`/announcements/feed${query}`, {
        token,
      });
      setItems(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load(category || undefined);
  }, [category, load]);

  useEffect(() => {
    const socket: Socket = createRealtimeClient(token);
    socket.on('announcement.published', (payload: unknown) => {
      const item = payload as Announcement;
      setItems((prev) => {
        if (prev.some((announcement) => announcement.id === item.id)) {
          return prev;
        }
        return [item, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const sticky = useMemo(() => items.filter((item) => item.isSticky), [items]);

  const markRead = async (id: string) => {
    try {
      await apiRequest(`/announcements/${id}/read`, {
        method: 'POST',
        token,
      });
    } catch {
      // Read status is best-effort and should not block feed interactions.
    }
  };

  return (
    <GlassCard interactive>
      <SectionHeader
        title="Announcements"
        subtitle="Real-time campus news with sticky priorities and tags."
        icon={<Megaphone className="h-5 w-5" />}
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <select
          className="field max-w-48"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">All categories</option>
          <option value="GENERAL">General</option>
          <option value="ACADEMIC">Academic</option>
          <option value="EVENT">Event</option>
          <option value="EMERGENCY">Emergency</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </div>

      {sticky.length > 0 ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-800 dark:border-amber-300/20 dark:bg-[#1A1B1F] dark:text-amber-200">
          <p className="font-semibold">Priority Notice</p>
          <p>{sticky[0]?.title}</p>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <AnnouncementItem key={item.id} item={item} onRead={markRead} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
    </GlassCard>
  );
};
