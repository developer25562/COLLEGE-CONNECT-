import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  DoorClosed,
  DoorOpen,
  Filter,
  Grid3X3,
  Layers,
  MapPin,
  Search,
  Sparkles,
  User,
  Users,
  Wrench,
  X
} from 'lucide-react';
import {
  DerivedRoomStatus,
  Period,
  Room,
  RoomBooking,
  RoomType,
  TimetableSlot,
  DayOfWeek
} from '../types';
import { DAYS_OF_WEEK } from '../utils/timeEngine';

interface RoomAvailabilityProps {
  roomStatuses: DerivedRoomStatus[];
  rooms: Room[];
  periods: Period[];
  timetable: TimetableSlot[];
  activeDay: DayOfWeek;
  onBookRoom: (booking: Omit<RoomBooking, 'id' | 'createdAt'>) => void;
  bookings: RoomBooking[];
}

export const RoomAvailability: React.FC<RoomAvailabilityProps> = ({
  roomStatuses,
  rooms,
  periods,
  timetable,
  activeDay,
  onBookRoom,
  bookings
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'free' | 'occupied'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'heatmap'>('cards');

  // "Find a free room for a time slot" picker state
  const [slotPickerDay, setSlotPickerDay] = useState<DayOfWeek>(activeDay);
  const [slotPickerPeriodId, setSlotPickerPeriodId] = useState<string | number>('all');

  // Booking Modal State
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [bookedByName, setBookedByName] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingPeriodId, setBookingPeriodId] = useState<string | number>(1);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState(false);

  // Teaching periods (exclude breaks for booking/picker)
  const teachingPeriods = periods.filter((p) => !p.isBreak);

  // Filter rooms
  const filteredStatuses = roomStatuses.filter((item) => {
    // Status Filter
    if (statusFilter === 'free' && item.status !== 'free') return false;
    if (statusFilter === 'occupied' && item.status !== 'occupied') return false;

    // Type Filter
    if (typeFilter !== 'all' && item.room.type !== typeFilter) return false;

    // Floor Filter
    if (floorFilter !== 'all' && String(item.room.floor) !== floorFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.room.name.toLowerCase().includes(q);
      const matchSubject = item.currentSlot?.subject.toLowerCase().includes(q);
      const matchTeacher = item.currentSlot?.teacher.toLowerCase().includes(q);
      if (!matchName && !matchSubject && !matchTeacher) return false;
    }

    // Time Slot Picker Filter (if active)
    if (slotPickerPeriodId !== 'all') {
      // Check if room is booked or has a class in this specific day + period
      const hasClass = timetable.some(
        (t) =>
          t.roomId === item.room.id &&
          t.day === slotPickerDay &&
          t.periodId === slotPickerPeriodId
      );
      const hasBooking = bookings.some(
        (b) =>
          b.roomId === item.room.id &&
          b.day === slotPickerDay &&
          b.periodId === slotPickerPeriodId
      );
      if (hasClass || hasBooking) return false; // Show only free rooms
    }

    return true;
  });

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRoom || !bookedByName.trim() || !bookingReason.trim()) return;

    onBookRoom({
      roomId: bookingRoom.id,
      bookedBy: bookedByName.trim(),
      reason: bookingReason.trim(),
      day: activeDay,
      periodId: bookingPeriodId,
      date: new Date().toISOString().split('T')[0]
    });

    setBookingSuccessMsg(true);
    setTimeout(() => {
      setBookingSuccessMsg(false);
      setBookingRoom(null);
      setBookedByName('');
      setBookingReason('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-teal-500" />
              <span>Campus Room Directory &amp; Live Occupancy</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Derived automatically from scheduled branch timetables, exams, and verified bookings
            </p>
          </div>

          {/* View Mode Toggle: Cards vs Heatmap Matrix */}
          <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm self-start">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Room Cards</span>
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'heatmap'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Day Heatmap Matrix</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Search Box */}
          <div className="lg:col-span-3 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search room, subject, prof..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Buttons: All / Free Now / Occupied */}
          <div className="lg:col-span-3 flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 py-1 text-xs font-medium rounded-lg transition ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('free')}
              className={`flex-1 py-1 text-xs font-medium rounded-lg transition ${
                statusFilter === 'free'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'
              }`}
            >
              Free Now
            </button>
            <button
              onClick={() => setStatusFilter('occupied')}
              className={`flex-1 py-1 text-xs font-medium rounded-lg transition ${
                statusFilter === 'occupied'
                  ? 'bg-rose-600 text-white shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'
              }`}
            >
              Occupied
            </button>
          </div>

          {/* Type Dropdown */}
          <div className="lg:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Room Types</option>
              <option value="classroom">Classrooms</option>
              <option value="lab">Laboratories</option>
              <option value="hall">Halls &amp; Studios</option>
              <option value="workshop">Workshops</option>
            </select>
          </div>

          {/* Floor Dropdown */}
          <div className="lg:col-span-2">
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Floors</option>
              <option value="0">Ground Floor</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
              <option value="3">3rd Floor</option>
            </select>
          </div>

          {/* Time Slot Finder Trigger / Reset */}
          <div className="lg:col-span-2 flex items-center gap-1.5">
            <select
              value={slotPickerPeriodId}
              onChange={(e) =>
                setSlotPickerPeriodId(
                  e.target.value === 'all'
                    ? 'all'
                    : isNaN(Number(e.target.value))
                    ? e.target.value
                    : Number(e.target.value)
                )
              }
              className={`w-full px-2.5 py-2 text-xs rounded-xl border outline-none font-medium transition ${
                slotPickerPeriodId !== 'all'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white'
              }`}
            >
              <option value="all">Find Slot: Any</option>
              {teachingPeriods.map((p) => (
                <option key={p.id} value={p.id}>
                  Slot: {p.label} ({p.start})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'cards' ? (
        /* Room Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredStatuses.map(({ room, status, currentSlot, currentBooking, nextFreeAt, freeUntil }) => {
              const isFree = status === 'free';
              const isOccupied = status === 'occupied';
              const isMaintenance = status === 'maintenance';
              const isClosed = status === 'closed';

              return (
                <motion.div
                  key={room.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isFree
                      ? 'bg-white dark:bg-slate-900 border-emerald-500/30 hover:border-emerald-500/60 shadow-sm hover:shadow-md'
                      : isOccupied
                      ? 'bg-white dark:bg-slate-900 border-rose-500/30 hover:border-rose-500/60 shadow-sm'
                      : isMaintenance
                      ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30'
                      : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  {/* Top Bar inside Card */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {room.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{room.building || 'Academic Wing'}</span>
                          <span>·</span>
                          <span>
                            {room.floor === 0 ? 'Ground Floor' : `Floor ${room.floor}`}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 ${
                          isFree
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : isOccupied
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : isMaintenance
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isFree
                              ? 'bg-emerald-500'
                              : isOccupied
                              ? 'bg-rose-500'
                              : isMaintenance
                              ? 'bg-amber-500'
                              : 'bg-slate-500'
                          }`}
                        />
                        {isFree
                          ? 'Free'
                          : isOccupied
                          ? 'Occupied'
                          : isMaintenance
                          ? 'Maintenance'
                          : 'Closed'}
                      </span>
                    </div>

                    {/* Meta stats: capacity and room type */}
                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800 my-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {room.capacity}
                        </span>{' '}
                        seats
                      </div>
                      <div className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
                      <div className="capitalize font-medium">{room.type}</div>
                    </div>

                    {/* Occupancy or Free Status Details */}
                    {isOccupied && currentSlot && (
                      <div className="space-y-1.5 text-xs bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-200/50 dark:border-rose-900/40">
                        <div className="font-bold text-rose-900 dark:text-rose-200 leading-tight">
                          {currentSlot.subject}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 flex items-center justify-between">
                          <span>{currentSlot.branch} · {currentSlot.teacher}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 pt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Free at {nextFreeAt}</span>
                        </div>
                      </div>
                    )}

                    {isOccupied && currentBooking && !currentSlot && (
                      <div className="space-y-1 text-xs bg-purple-50 dark:bg-purple-950/30 p-3 rounded-xl border border-purple-200 dark:border-purple-800/40">
                        <div className="font-bold text-purple-900 dark:text-purple-200">
                          Special Reservation
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          {currentBooking.reason} (by {currentBooking.bookedBy})
                        </div>
                        <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 pt-1">
                          Free at {nextFreeAt}
                        </div>
                      </div>
                    )}

                    {isFree && (
                      <div className="text-xs bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/50 dark:border-emerald-900/40 space-y-1">
                        <div className="text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Room is ready for use</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Available until: <span className="font-bold text-slate-700 dark:text-slate-200">{freeUntil}</span>
                        </div>
                      </div>
                    )}

                    {isMaintenance && (
                      <div className="text-xs text-amber-700 dark:text-amber-400 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center gap-2">
                        <Wrench className="w-4 h-4 shrink-0" />
                        <span>Equipment servicing in progress</span>
                      </div>
                    )}
                  </div>

                  {/* Action: Book Room (Only on free rooms) */}
                  {isFree && (
                    <button
                      onClick={() => setBookingRoom(room)}
                      className="mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Request / Book Room</span>
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Heatmap Matrix View (Rooms x Periods) */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="min-w-[760px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Full-Day Room Utilization Matrix ({activeDay})
              </span>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50" />
                  <span className="text-slate-500 dark:text-slate-400">Free</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/50" />
                  <span className="text-slate-500 dark:text-slate-400">Class</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/50" />
                  <span className="text-slate-500 dark:text-slate-400">Break / Maint</span>
                </div>
              </div>
            </div>

            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 w-36">
                    Room
                  </th>
                  {periods.map((p) => (
                    <th
                      key={p.id}
                      className="py-2 px-2 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400"
                    >
                      <div>{p.label}</div>
                      <div className="font-mono text-[9px] text-slate-400 font-normal">
                        {p.start}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white">
                      <div>{room.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {room.type} · Fl {room.floor}
                      </div>
                    </td>

                    {periods.map((p) => {
                      if (p.isBreak) {
                        return (
                          <td
                            key={p.id}
                            className="p-1 text-center bg-amber-500/5"
                            title={p.label}
                          >
                            <span className="text-[10px] text-amber-500 font-mono">☕</span>
                          </td>
                        );
                      }

                      if (room.isMaintenance) {
                        return (
                          <td key={p.id} className="p-1">
                            <div className="h-8 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[10px] text-amber-600 font-medium">
                              Maint
                            </div>
                          </td>
                        );
                      }

                      // Find scheduled class
                      const slot = timetable.find(
                        (s) =>
                          s.roomId === room.id &&
                          s.day === activeDay &&
                          s.periodId === p.id
                      );

                      const booking = bookings.find(
                        (b) =>
                          b.roomId === room.id &&
                          b.day === activeDay &&
                          b.periodId === p.id
                      );

                      if (slot) {
                        return (
                          <td key={p.id} className="p-1">
                            <div
                              title={`${slot.branch}: ${slot.subject} (${slot.teacher})`}
                              className="h-8 px-1.5 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 flex flex-col justify-center text-[10px] text-rose-700 dark:text-rose-300 font-medium cursor-pointer transition"
                            >
                              <span className="font-bold truncate">{slot.branch}</span>
                              <span className="truncate text-[9px] opacity-80">{slot.subject}</span>
                            </div>
                          </td>
                        );
                      }

                      if (booking) {
                        return (
                          <td key={p.id} className="p-1">
                            <div
                              title={`Reserved: ${booking.reason} by ${booking.bookedBy}`}
                              className="h-8 px-1 rounded bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-[10px] text-purple-700 dark:text-purple-300 font-medium cursor-pointer"
                            >
                              <span className="truncate">{booking.bookedBy}</span>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={p.id} className="p-1">
                          <button
                            onClick={() => {
                              setBookingRoom(room);
                              setBookingPeriodId(p.id);
                            }}
                            title={`Book ${room.name} for ${p.label}`}
                            className="w-full h-8 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-600 dark:text-emerald-400 font-bold transition"
                          >
                            Free
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Room Booking Modal */}
      {bookingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600">
                  <DoorOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Book {bookingRoom.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Reserve for extra lecture, remedial session or lab experiment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBookingRoom(null)}
                aria-label="Close"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccessMsg ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Booking Confirmed!
                </h4>
                <p className="text-xs text-slate-500">
                  {bookingRoom.name} is reserved for {activeDay}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4 my-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty / Organizer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Priya Mehta (CSE)"
                    value={bookedByName}
                    onChange={(e) => setBookedByName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purpose / Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Extra Class: Algorithms Doubt Solving"
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Day
                    </label>
                    <input
                      type="text"
                      disabled
                      value={activeDay}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Time Slot
                    </label>
                    <select
                      value={bookingPeriodId}
                      onChange={(e) =>
                        setBookingPeriodId(
                          isNaN(Number(e.target.value))
                            ? e.target.value
                            : Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {teachingPeriods.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label} ({p.start})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setBookingRoom(null)}
                    className="px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                  >
                    Confirm Reservation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
