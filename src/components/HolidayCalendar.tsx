import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Info,
  Palmtree,
  Sparkles,
  Sun
} from 'lucide-react';
import { Holiday, HolidayType } from '../types';

interface HolidayCalendarProps {
  holidays: Holiday[];
  currentDate: Date;
}

export const HolidayCalendar: React.FC<HolidayCalendarProps> = ({
  holidays,
  currentDate
}) => {
  const [viewDate, setViewDate] = useState<Date>(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  );
  const [selectedDateEvents, setSelectedDateEvents] = useState<{
    dateStr: string;
    events: Holiday[];
  } | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Calculate days in month
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleResetToCurrentMonth = () => {
    setViewDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  };

  // Helper to find events on a given day
  const getEventsForDay = (dayNum: number): Holiday[] => {
    const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum
      .toString()
      .padStart(2, '0')}`;
    return holidays.filter(
      (h) => formattedDate >= h.startDate && formattedDate <= h.endDate
    );
  };

  // Filter upcoming holidays for sidebar
  const todayStr = currentDate.toISOString().split('T')[0];
  const upcomingHolidays = holidays
    .filter((h) => h.endDate >= todayStr)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-500" />
            <span>Academic Calendar &amp; Vacation Schedule</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Color-coded holiday ranges, gazetted festivals, semester exam weeks &amp; term breaks
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToCurrentMonth}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
          >
            Today
          </button>
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[130px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Matrix (Left) + Upcoming Holidays Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid (8 cols on lg) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
          {/* Day Names Row */}
          <div className="grid grid-cols-7 gap-1 text-center pb-3 border-b border-slate-100 dark:border-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <span
                key={d}
                className={`text-xs font-bold uppercase tracking-wider ${
                  i === 0 ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Month Days Matrix */}
          <div className="grid grid-cols-7 gap-1.5 pt-3">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[64px] sm:min-h-[82px] rounded-xl p-1 bg-slate-50/40 dark:bg-slate-900/20" />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayOfWeekIndex = (firstDayOfWeek + i) % 7;
              const isSunday = dayOfWeekIndex === 0;

              const dayDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum
                .toString()
                .padStart(2, '0')}`;
              const isToday = dayDateStr === todayStr;

              const events = getEventsForDay(dayNum);
              const holiday = events.find((e) => e.type === 'holiday');
              const vacation = events.find((e) => e.type === 'vacation');
              const exam = events.find((e) => e.type === 'exam');

              return (
                <div
                  key={dayNum}
                  onClick={() =>
                    setSelectedDateEvents({
                      dateStr: dayDateStr,
                      events: isSunday
                        ? [
                            {
                              id: `sun-${dayDateStr}`,
                              startDate: dayDateStr,
                              endDate: dayDateStr,
                              title: 'Sunday (Weekly Off)',
                              type: 'sunday'
                            },
                            ...events
                          ]
                        : events
                    })
                  }
                  className={`min-h-[64px] sm:min-h-[82px] rounded-xl p-1.5 sm:p-2 border transition-all cursor-pointer flex flex-col justify-between ${
                    isToday
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30 font-bold'
                      : holiday
                      ? 'border-rose-400/40 bg-rose-500/10 hover:bg-rose-500/15'
                      : vacation
                      ? 'border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/15'
                      : exam
                      ? 'border-purple-400/40 bg-purple-500/10 hover:bg-purple-500/15'
                      : isSunday
                      ? 'border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 opacity-70'
                      : 'border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : isSunday
                          ? 'text-rose-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </div>

                  {/* Tiny Event Badges */}
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {holiday && (
                      <div className="text-[9px] sm:text-[10px] font-semibold text-rose-700 dark:text-rose-300 truncate bg-rose-500/15 px-1 rounded">
                        {holiday.title}
                      </div>
                    )}
                    {vacation && !holiday && (
                      <div className="text-[9px] sm:text-[10px] font-semibold text-amber-700 dark:text-amber-300 truncate bg-amber-500/15 px-1 rounded">
                        {vacation.title}
                      </div>
                    )}
                    {exam && !holiday && !vacation && (
                      <div className="text-[9px] sm:text-[10px] font-semibold text-purple-700 dark:text-purple-300 truncate bg-purple-500/15 px-1 rounded">
                        {exam.title}
                      </div>
                    )}
                    {isSunday && events.length === 0 && (
                      <div className="text-[9px] text-slate-400 truncate hidden sm:block">
                        Sunday
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/60" />
              <span className="text-slate-600 dark:text-slate-400">Gazetted Holiday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/60" />
              <span className="text-slate-600 dark:text-slate-400">Vacation Break</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500/60" />
              <span className="text-slate-600 dark:text-slate-400">Exams</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500/20 border border-indigo-500" />
              <span className="text-slate-600 dark:text-slate-400">Today</span>
            </div>
          </div>
        </div>

        {/* Sidebar: Upcoming Holidays with Countdown Chips (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Palmtree className="w-4 h-4 text-amber-500" />
              <span>Upcoming Breaks &amp; Holidays</span>
            </h3>

            {upcomingHolidays.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No upcoming holidays scheduled</p>
            ) : (
              <div className="space-y-3">
                {upcomingHolidays.slice(0, 6).map((item) => {
                  const target = new Date(item.startDate);
                  const diff = Math.ceil(
                    (target.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </h4>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {item.startDate}
                            {item.endDate !== item.startDate && ` to ${item.endDate}`}
                          </div>
                        </div>

                        {/* Countdown Chip */}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-tight shrink-0 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          {diff <= 0 ? 'Today / Active' : `in ${diff} days`}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          {item.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Date Card (When user clicks a day) */}
          {selectedDateEvents && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  Selected Date: {selectedDateEvents.dateStr}
                </span>
                <button
                  onClick={() => setSelectedDateEvents(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {selectedDateEvents.events.length === 0 ? (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Standard college working day. All regular periods &amp; labs are in session.
                </p>
              ) : (
                <div className="space-y-2 mt-2">
                  {selectedDateEvents.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900"
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {ev.title}
                      </div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 capitalize">
                        Type: {ev.type}
                      </div>
                      {ev.description && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {ev.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
