import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Calendar,
  Clock,
  Coffee,
  Download,
  LayoutGrid,
  List,
  MapPin,
  Printer,
  Sparkles,
  User
} from 'lucide-react';
import { Branch, BranchId, DayOfWeek, Period, TimetableSlot } from '../types';
import { DAYS_OF_WEEK, timeStringToMinutes } from '../utils/timeEngine';

interface BranchTimetableProps {
  branches: Branch[];
  periods: Period[];
  timetable: TimetableSlot[];
  activeDay: DayOfWeek;
  setActiveDay: (day: DayOfWeek) => void;
  activePeriod?: Period;
  currentMinutes: number;
  isOpen: boolean;
}

export const BranchTimetable: React.FC<BranchTimetableProps> = ({
  branches,
  periods,
  timetable,
  activeDay,
  setActiveDay,
  activePeriod,
  currentMinutes,
  isOpen
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState<BranchId>('CSE');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Filter slots for active branch and day
  const branchSlots = timetable.filter(
    (slot) => slot.branch === selectedBranchId && slot.day === activeDay
  );

  const sortedPeriods = [...periods].sort(
    (a, b) => timeStringToMinutes(a.start) - timeStringToMinutes(b.start)
  );

  // Print timetable handler
  const handlePrint = () => {
    window.print();
  };

  // Export CSV
  const handleDownloadCSV = () => {
    const headers = ['Branch', 'Day', 'Period', 'Time', 'Subject', 'Teacher', 'Room', 'Type'];
    const rows = sortedPeriods.map((p) => {
      if (p.isBreak) {
        return [selectedBranch.name, activeDay, p.label, `${p.start} - ${p.end}`, 'BREAK', '-', '-', '-'];
      }
      const slot = branchSlots.find((s) => s.periodId === p.id);
      return [
        selectedBranch.name,
        activeDay,
        p.label,
        `${p.start} - ${p.end}`,
        slot ? slot.subject : 'Free / Self Study',
        slot ? slot.teacher : '-',
        slot ? slot.roomId : '-',
        slot ? slot.type : '-'
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedBranch.id}_Timetable_${activeDay}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Branch Switcher & Actions */}
      <div className="flex flex-col gap-4">
        {/* Branch Tabs (Sliding Indicator & Custom Accent Colors) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {branches.map((branch) => {
            const isSelected = branch.id === selectedBranchId;
            return (
              <button
                key={branch.id}
                onClick={() => setSelectedBranchId(branch.id)}
                className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'text-white shadow-lg'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
                style={{
                  backgroundColor: isSelected ? branch.color : undefined
                }}
              >
                <span>{branch.name}</span>
                <span className="text-[11px] opacity-80 px-1.5 py-0.5 rounded bg-black/20">
                  {branch.code}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-bar: Day Selector & View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Day Selector Mon–Sat */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = day === activeDay;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {day.slice(0, 3)}
                  <span className="hidden sm:inline">{day.slice(3)}</span>
                </button>
              );
            })}
          </div>

          {/* View Toggles & Export Actions */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={`p-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                title="Timeline View"
                className={`p-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Print Friendly Button */}
            <button
              onClick={handlePrint}
              title="Print Routine"
              className="p-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download CSV */}
            <button
              onClick={handleDownloadCSV}
              title="Download Timetable"
              className="p-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Routine Display: Grid or Vertical Timeline */}
      <div className="print-area">
        {/* Printable Header */}
        <div className="hidden print:block mb-4 text-center">
          <h2 className="text-xl font-bold">{selectedBranch.name} ({selectedBranch.shortName})</h2>
          <p className="text-sm text-gray-600">{activeDay} Daily Schedule</p>
        </div>

        {viewMode === 'grid' ? (
          /* Desktop / Responsive Grid Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedPeriods.map((period) => {
              const slot = branchSlots.find((s) => s.periodId === period.id);
              const pStartMin = timeStringToMinutes(period.start);
              const pEndMin = timeStringToMinutes(period.end);

              const isCurrent =
                isOpen &&
                activePeriod?.id === period.id &&
                currentMinutes >= pStartMin &&
                currentMinutes < pEndMin;
              const isPast = isOpen && currentMinutes >= pEndMin;

              if (period.isBreak) {
                return (
                  <div
                    key={period.id}
                    className="col-span-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                      <Coffee className="w-4 h-4" />
                      <span className="font-bold text-xs uppercase tracking-wider">
                        {period.label}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums text-xs font-medium text-amber-700 dark:text-amber-300">
                      {period.start} - {period.end}
                    </span>
                  </div>
                );
              }

              return (
                <motion.div
                  key={period.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl shadow-indigo-500/10'
                      : isPast
                      ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-65'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Top Bar inside card */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400">
                          {period.label}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Now
                          </span>
                        )}
                      </div>

                      {slot && (
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            slot.type === 'Lab'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                              : slot.type === 'Tutorial'
                              ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                              : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          }`}
                        >
                          {slot.type}
                        </span>
                      )}
                    </div>

                    <div className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{period.start} - {period.end}</span>
                    </div>

                    {slot ? (
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {slot.subject}
                        </h4>
                        <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{slot.teacher}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {slot.roomId}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                        No Class Scheduled (Self Study / Library)
                      </div>
                    )}
                  </div>

                  {/* Highlight bar for current period */}
                  {isCurrent && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                        <span>Period Ending Soon</span>
                        <span className="font-mono font-bold">{period.end}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Timeline Vertical View */
          <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-200 dark:border-indigo-900/60 space-y-6 my-2">
            {sortedPeriods.map((period) => {
              const slot = branchSlots.find((s) => s.periodId === period.id);
              const pStartMin = timeStringToMinutes(period.start);
              const pEndMin = timeStringToMinutes(period.end);

              const isCurrent =
                isOpen &&
                activePeriod?.id === period.id &&
                currentMinutes >= pStartMin &&
                currentMinutes < pEndMin;
              const isPast = isOpen && currentMinutes >= pEndMin;

              if (period.isBreak) {
                return (
                  <div key={period.id} className="relative">
                    <div className="absolute -left-[31px] sm:-left-[39px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-500 border-4 border-white dark:border-slate-950" />
                    <div className="py-2 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase">
                        <Coffee className="w-4 h-4" />
                        <span>{period.label}</span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {period.start} - {period.end}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={period.id} className="relative">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full border-4 border-white dark:border-slate-950 transition-colors ${
                      isCurrent
                        ? 'bg-emerald-500 ring-4 ring-emerald-500/30'
                        : isPast
                        ? 'bg-slate-400 dark:bg-slate-600'
                        : 'bg-indigo-600'
                    }`}
                  />

                  <div
                    className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                      isCurrent
                        ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                        : isPast
                        ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          {period.label} ({period.start} - {period.end})
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            Current Class
                          </span>
                        )}
                      </div>

                      {slot && (
                        <span className="inline-block self-start text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {slot.type}
                        </span>
                      )}
                    </div>

                    {slot ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {slot.subject}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Instructor: {slot.teacher}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{slot.roomId}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">
                        Free period / No scheduled class
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
