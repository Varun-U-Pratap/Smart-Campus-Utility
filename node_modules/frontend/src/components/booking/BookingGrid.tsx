import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { BookingStatus, Room } from '../../types/domain';
import { GlassCard } from '../ui/GlassCard';
import { SectionHeader } from '../ui/SectionHeader';
import { Skeleton } from '../ui/Skeleton';

const BOOKING_WINDOW_DAYS = 5;

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);
const dayLabel = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
});
const timeLabel = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
});

const isWithinWindow = (startsAt: string, from: Date, to: Date) => {
  const starts = new Date(startsAt);
  return starts >= from && starts <= to;
};

const compareBookings = (left: { startsAt: string }, right: { startsAt: string }) =>
  new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime();

interface BookingGridProps {
  token: string;
  isAdmin?: boolean;
}

export const BookingGrid = ({ token, isAdmin = false }: BookingGridProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buildingFilter, setBuildingFilter] = useState('ALL');
  const [floorFilter, setFloorFilter] = useState('ALL');
  const [bookingForm, setBookingForm] = useState({
    roomId: '',
    title: '',
    startsAt: '',
    endsAt: '',
  });

  const bookingWindow = useMemo(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);

    const to = new Date(from);
    to.setDate(to.getDate() + (BOOKING_WINDOW_DAYS - 1));
    to.setHours(23, 59, 59, 999);

    return {
      from,
      to,
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
    };
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest<Room[]>(
        `/bookings/grid?from=${encodeURIComponent(bookingWindow.fromIso)}&to=${encodeURIComponent(bookingWindow.toIso)}`,
        { token },
      );
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load booking grid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const pending = useMemo(
    () =>
      rooms.flatMap((room) =>
        (room.bookings ?? [])
          .filter((booking) => booking.status === 'PENDING')
          .map((booking) => ({ ...booking, roomId: room.id, roomName: room.name })),
      ),
    [rooms],
  );

  const buildingOptions = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.building))).sort(),
    [rooms],
  );

  const floorOptions = useMemo(() => {
    const filteredByBuilding =
      buildingFilter === 'ALL'
        ? rooms
        : rooms.filter((room) => room.building === buildingFilter);
    return Array.from(
      new Set(filteredByBuilding.map((room) => room.floor ?? 'N/A')),
    ).sort();
  }, [rooms, buildingFilter]);

  const selectableRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (buildingFilter !== 'ALL' && room.building !== buildingFilter) {
        return false;
      }

      const roomFloor = room.floor ?? 'N/A';
      if (floorFilter !== 'ALL' && roomFloor !== floorFilter) {
        return false;
      }

      return true;
    });
  }, [rooms, buildingFilter, floorFilter]);

  const dayBuckets = useMemo(
    () =>
      Array.from({ length: BOOKING_WINDOW_DAYS }, (_, dayOffset) => {
        const date = new Date(bookingWindow.from);
        date.setDate(date.getDate() + dayOffset);
        return {
          key: toDateKey(date),
          label: dayLabel.format(date),
        };
      }),
    [bookingWindow.from],
  );

  const roomsWithUpcomingBookings = useMemo(
    () => selectableRooms.filter((room) => (room.bookings?.length ?? 0) > 0),
    [selectableRooms],
  );

  useEffect(() => {
    if (!bookingForm.roomId) {
      return;
    }

    const stillVisible = selectableRooms.some((room) => room.id === bookingForm.roomId);
    if (!stillVisible) {
      setBookingForm((prev) => ({ ...prev, roomId: '' }));
    }
  }, [selectableRooms, bookingForm.roomId]);

  const mergeBookingIntoRooms = (
    roomId: string,
    booking: {
      id: string;
      title: string;
      startsAt: string;
      endsAt: string;
      status: BookingStatus;
    },
  ) => {
    if (!isWithinWindow(booking.startsAt, bookingWindow.from, bookingWindow.to)) {
      return;
    }

    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id !== roomId) {
          return room;
        }

        const nextBookings = [...(room.bookings ?? [])].filter((item) => item.id !== booking.id);
        nextBookings.push(booking);
        nextBookings.sort(compareBookings);

        return {
          ...room,
          bookings: nextBookings,
        };
      }),
    );
  };

  const requestBooking = async () => {
    try {
      setError(null);
      const createdBooking = await apiRequest<{
        id: string;
        roomId: string;
        title: string;
        status: BookingStatus;
        startsAt: string;
        endsAt: string;
      }>('/bookings', {
        method: 'POST',
        token,
        body: bookingForm,
      });

      mergeBookingIntoRooms(createdBooking.roomId, createdBooking);
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
        subtitle="Next 5 days schedule with clear day-wise time slots."
        icon={<CalendarDays className="h-5 w-5" />}
      />

      <p className="mb-3 text-xs text-slate-600 dark:text-slate-300">
        Showing bookings from {dayLabel.format(bookingWindow.from)} to {dayLabel.format(bookingWindow.to)}.
      </p>

      <div className="mb-2 grid gap-3 md:grid-cols-3">
        <select
          className="field"
          value={buildingFilter}
          onChange={(event) => {
            setBuildingFilter(event.target.value);
            setFloorFilter('ALL');
          }}
        >
          <option value="ALL">All buildings</option>
          {buildingOptions.map((building) => (
            <option key={building} value={building}>
              {building}
            </option>
          ))}
        </select>
        <select
          className="field"
          value={floorFilter}
          onChange={(event) => setFloorFilter(event.target.value)}
        >
          <option value="ALL">All floors</option>
          {floorOptions.map((floor) => (
            <option key={floor} value={floor}>
              {floor === 'N/A' ? 'Floor N/A' : `Floor ${floor}`}
            </option>
          ))}
        </select>
        <select
          className="field"
          value={bookingForm.roomId}
          onChange={(event) =>
            setBookingForm((prev) => ({ ...prev, roomId: event.target.value }))
          }
        >
          <option value="">Select room ({selectableRooms.length} available)</option>
          {selectableRooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.code} - {room.name} (Cap {room.capacity})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
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
          {roomsWithUpcomingBookings.map((room) => (
            <div
              key={room.id}
              className="rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-indigo-300/20 dark:bg-deepmidnight-elevated/70"
            >
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  {room.name} ({room.code})
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-300">Cap {room.capacity}</span>
              </div>

              <div className="space-y-2">
                {dayBuckets.map((day) => {
                  const dayBookings = (room.bookings ?? [])
                    .filter((booking) => toDateKey(new Date(booking.startsAt)) === day.key)
                    .sort(compareBookings);

                  if (dayBookings.length === 0) {
                    return null;
                  }

                  return (
                    <div
                      key={`${room.id}-${day.key}`}
                      className="rounded-lg border border-slate-200/80 bg-slate-50 p-2 dark:border-cyan-300/15 dark:bg-deepmidnight-surface/75"
                    >
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-cyan-300">
                        {day.label}
                      </p>
                      <div className="space-y-2">
                        {dayBookings.map((booking) => {
                          const start = new Date(booking.startsAt);
                          const end = new Date(booking.endsAt);
                          return (
                            <div
                              key={booking.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-2 py-1.5 text-xs dark:bg-deepmidnight-elevated"
                            >
                              <div>
                                <p className="font-medium text-slate-700 dark:text-slate-100">{booking.title}</p>
                                <p className="text-slate-500 dark:text-slate-300">
                                  {timeLabel.format(start)} - {timeLabel.format(end)}
                                </p>
                              </div>
                              <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200">
                                {booking.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {roomsWithUpcomingBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300/80 bg-white/70 p-4 text-sm text-slate-600 dark:border-slate-600 dark:bg-deepmidnight-elevated/70 dark:text-slate-300">
              No bookings in the next 5 days for the selected building/floor.
            </div>
          ) : null}
        </div>
      )}

      {isAdmin && pending.length > 0 ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-300/25 dark:bg-emerald-400/10">
          <h4 className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-200">
            Pending approvals ({pending.length})
          </h4>
          <div className="space-y-2">
            {pending.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white p-2 text-xs dark:border-cyan-300/15 dark:bg-deepmidnight-surface/80 dark:text-slate-100"
              >
                <span>
                  {booking.roomName}: {booking.title}
                </span>
                <button
                  onClick={() => updateStatus(booking.id, 'CONFIRMED')}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400"
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
