import { useState } from 'react';
import { BellPlus } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { KanbanBoard } from '../components/issues/KanbanBoard';
import { AnnouncementsFeed } from '../components/announcements/AnnouncementsFeed';
import { BookingGrid } from '../components/booking/BookingGrid';
import { AnalyticsDashboard } from '../components/dashboard/AnalyticsDashboard';
import { GlassCard } from '../components/ui/GlassCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/api';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [announcement, setAnnouncement] = useState({
    title: '',
    body: '',
    category: 'GENERAL',
    isSticky: false,
    tags: '',
  });

  if (!token) {
    return null;
  }

  const publish = async () => {
    try {
      setIsPublishing(true);
      setPublishError(null);
      await apiRequest('/announcements', {
        method: 'POST',
        token,
        body: {
          title: announcement.title,
          body: announcement.body,
          category: announcement.category,
          isSticky: announcement.isSticky,
          publishNow: true,
          tags: announcement.tags
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        },
      });
      setAnnouncement({
        title: '',
        body: '',
        category: 'GENERAL',
        isSticky: false,
        tags: '',
      });
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Publish failed.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AppShell title="Admin Operations Dashboard">
      <AnalyticsDashboard token={token} />

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <KanbanBoard token={token} />

        <GlassCard interactive>
          <SectionHeader
            title="Broadcast Announcement"
            subtitle="Publish sticky and categorized notices in real-time."
            icon={<BellPlus className="h-5 w-5" />}
          />

          <div className="space-y-3">
            <input
              className="field"
              placeholder="Announcement title"
              value={announcement.title}
              onChange={(event) =>
                setAnnouncement((prev) => ({ ...prev, title: event.target.value }))
              }
            />
            <textarea
              className="field min-h-24"
              placeholder="Announcement body"
              value={announcement.body}
              onChange={(event) =>
                setAnnouncement((prev) => ({ ...prev, body: event.target.value }))
              }
            />
            <div className="grid gap-3 md:grid-cols-2">
              <select
                className="field"
                value={announcement.category}
                onChange={(event) =>
                  setAnnouncement((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
              >
                <option value="GENERAL">General</option>
                <option value="ACADEMIC">Academic</option>
                <option value="EVENT">Event</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
              <input
                className="field"
                placeholder="tags (comma-separated)"
                value={announcement.tags}
                onChange={(event) =>
                  setAnnouncement((prev) => ({ ...prev, tags: event.target.value }))
                }
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={announcement.isSticky}
                onChange={(event) =>
                  setAnnouncement((prev) => ({
                    ...prev,
                    isSticky: event.target.checked,
                  }))
                }
              />
              Mark as sticky notification
            </label>
          </div>

          <button
            className="btn-primary mt-4"
            disabled={isPublishing}
            onClick={publish}
          >
            {isPublishing ? 'Publishing...' : 'Publish Announcement'}
          </button>

          {publishError ? (
            <p className="mt-3 text-sm text-rose-600">{publishError}</p>
          ) : null}
        </GlassCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <AnnouncementsFeed token={token} />
        <BookingGrid token={token} isAdmin />
      </section>
    </AppShell>
  );
};

export default AdminDashboard;
