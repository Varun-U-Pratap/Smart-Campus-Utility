import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { BookingStatus, Room } from '../../types/domain';
import { GlassCard } from '../ui/GlassCard';
import { SectionHeader } from '../ui/SectionHeader';
import { Skeleton } from '../ui/Skeleton';

interface BookingGridProps {
  token: string;
  isAdmin?: boolean;
}

export const BookingGrid = ({ token, isAdmin = false }: BookingGridProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({
    roomId: '',
    title: '',
    startsAt: '',
    endsAt: '',
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest<Room[]>('/bookings/grid', { token });
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load booking grid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const pending = useMemo(
    () =>
      rooms.flatMap((room) =>
        (room.bookings ?? [])
          .filter((booking) => booking.status === 'PENDING')
          .map((booking) => ({ ...booking, roomId: room.id, roomName: room.name })),
      ),
    [rooms],
  );

  const requestBooking = async () => {
    try {
      setError(null);
      await apiRequest('/bookings', {
        method: 'POST',
        token,
        body: bookingForm,
      });
      setBookingForm({ roomId: '', title: '', startsAt: '', endsAt: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking request failed.');
    }
  };

  const updateStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await apiRequest(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        token,
        body: { status },
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed.');
    }
  };

  return (
    <GlassCard interactive>
      <SectionHeader
        title="Room Availability"
        subtitle="Visual booking matrix with live pending/confirmed states."
        icon={<CalendarDays className="h-5 w-5" />}
      />

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <select
          className="field"
          value={bookingForm.roomId}
          onChange={(event) =>
            setBookingForm((prev) => ({ ...prev, roomId: event.target.value }))
          }
        >
          <option value="">Select room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        <input
          className="field"
          placeholder="Booking title"
          value={bookingForm.title}
          onChange={(event) =>
            setBookingForm((prev) => ({ ...prev, title: event.target.value }))
          }
        />
        <input
          className="field"
          type="datetime-local"
          value={bookingForm.startsAt}
          onChange={(event) =>
            setBookingForm((prev) => ({ ...prev, startsAt: event.target.value }))
          }
        />
        <input
          className="field"
          type="datetime-local"
          value={bookingForm.endsAt}
          onChange={(event) =>
            setBookingForm((prev) => ({ ...prev, endsAt: event.target.value }))
          }
        />
      </div>

      <button onClick={requestBooking} className="btn-primary mb-5">
        Request Booking
      </button>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="rounded-xl border border-slate-200 bg-white/80 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold text-slate-900">
                  {room.name} ({room.code})
                </h4>
                <span className="text-xs text-slate-500">Cap {room.capacity}</span>
              </div>

              <div className="space-y-2">
                {(room.bookings ?? []).length === 0 ? (
                  <p className="text-xs text-slate-500">No upcoming bookings.</p>
                ) : (
                  room.bookings?.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-2 text-xs"
                    >
                      <div>
                        <p className="font-medium text-slate-700">{booking.title}</p>
                        <p className="text-slate-500">
                          {new Date(booking.startsAt).toLocaleString()} -{' '}
                          {new Date(booking.endsAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-700">
                        {booking.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && pending.length > 0 ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
          <h4 className="mb-2 text-sm font-semibold text-emerald-700">
            Pending approvals ({pending.length})
          </h4>
          <div className="space-y-2">
            {pending.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg bg-white p-2 text-xs"
              >
                <span>
                  {booking.roomName}: {booking.title}
                </span>
                <button
                  onClick={() => updateStatus(booking.id, 'CONFIRMED')}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1 text-white"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Confirm
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </GlassCard>
  );
};
