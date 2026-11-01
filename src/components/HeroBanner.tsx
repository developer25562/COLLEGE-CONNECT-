import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  DoorOpen,
  BookOpen,
  Palmtree,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CollegeStatus, minutesToTimeString, SCHEDULED_STATUS_DISCLAIMER } from '../utils/timeEngine';
import { Period } from '../types';

interface HeroBannerProps {
  status: CollegeStatus;
  simulatedDate: Date;
  roomsFreeCount: number;
  classesRunningCount: number;
  nextHolidayInfo: { days: number; title: string } | null;
  onExploreRooms: () => void;
  onExploreTimetable: () => void;
  periods: Period[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  status,
  simulatedDate,
  roomsFreeCount,
  classesRunningCount,
  nextHolidayInfo,
  onExploreRooms,
  onExploreTimetable
}) => {
  // Format formatted countdown mm:ss
  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '00:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedDate = simulatedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 lg:p-10 shadow-2xl border border-indigo-900/40">
      {/* Background Soft Blobs */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-8">
        {/* Top Header Row: College Status Pill + Live Clock */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900/50 pb-6">
          {/* Big Animated Status Pill */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-semibold tracking-wide shadow-lg ${
                status.isOpen
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10'
                  : status.badgeType === 'holiday'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-amber-500/10'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-rose-500/10'
              }`}
            >
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    status.isOpen
                      ? 'bg-emerald-400'
                      : status.badgeType === 'holiday'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    status.isOpen
                      ? 'bg-emerald-500'
                      : status.badgeType === 'holiday'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              </span>
              <span className="font-bold">
                {status.isOpen ? 'College is OPEN' : 'College is CLOSED'}
              </span>
              {status.reason && (
                <span className="hidden sm:inline font-normal text-xs text-slate-300 border-l border-white/20 pl-2">
                  {status.reason}
                </span>
              )}
            </motion.div>
          </div>

          {/* Live Tabular Clock & Date */}
          <div className="flex items-center gap-4 text-slate-300">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-slate-200">
                {formattedDate}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="text-sm sm:text-base font-mono font-bold text-white tabular-nums tracking-wider">
                {status.currentTimeString}
              </span>
            </div>
          </div>
        </div>

        {/* Center Section: Current Period Spotlight & Countdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>Academic Schedule Status</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              {status.isOpen ? (
                status.activePeriod ? (
                  <span>
                    Currently in{' '}
                    <span className="bg-gradient-to-r from-teal-300 to-indigo-300 bg-clip-text text-transparent">
                      {status.activePeriod.label}
                    </span>{' '}
                    ({status.activePeriod.start} - {status.activePeriod.end})
                  </span>
                ) : (
                  <span>Campus Open · Academic Shift Active</span>
                )
              ) : (
                <span>
                  Campus Standby · {status.reason || 'Closed for the day'}
                </span>
              )}
            </h1>

            {status.isOpen && status.activePeriod && (
              <div className="mt-2 space-y-2 max-w-lg">
                <div className="flex justify-between items-center text-xs font-medium text-slate-300">
                  <span>Period Progress</span>
                  <span className="font-mono tabular-nums font-semibold text-teal-300">
                    {status.periodProgressPct}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-400 to-indigo-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${status.periodProgressPct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {/* Next Period Countdown */}
            {status.isOpen && status.nextPeriod && (
              <div className="flex items-center gap-2 text-sm text-slate-300 mt-1">
                <span>Next up:</span>
                <span className="font-semibold text-white">
                  {status.nextPeriod.label} ({status.nextPeriod.start})
                </span>
                <span className="text-xs text-slate-400">starts in</span>
                <span className="font-mono tabular-nums text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  {formatCountdown(status.secondsUntilNextPeriod)}
                </span>
              </div>
            )}
          </div>

          {/* Quick CTA Pill Link */}
          <div className="lg:col-span-5 flex flex-wrap gap-3 lg:justify-end">
            <button
              onClick={onExploreRooms}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Find Free Room Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onExploreTimetable}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 border border-white/15 transition-all hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Branch Routine</span>
            </button>
          </div>
        </div>

        {/* Bottom Stat Cards (Animated Count-Up) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Stat 1: Rooms Free Now */}
          <div
            onClick={onExploreRooms}
            className="cursor-pointer group rounded-2xl bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/60 p-4 transition-all hover:border-teal-500/40"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Rooms Free Now
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <DoorOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {roomsFreeCount}
              </span>
              <span className="text-xs text-slate-400">available for booking</span>
            </div>
          </div>

          {/* Stat 2: Classes Running Now */}
          <div
            onClick={onExploreTimetable}
            className="cursor-pointer group rounded-2xl bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/60 p-4 transition-all hover:border-indigo-500/40"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Classes Running Now
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {classesRunningCount}
              </span>
              <span className="text-xs text-slate-400">across 5 branches</span>
            </div>
          </div>

          {/* Stat 3: Days Until Next Holiday */}
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Next Campus Break
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Palmtree className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {nextHolidayInfo ? nextHolidayInfo.days : 0}
              </span>
              <span className="text-xs text-slate-400 truncate max-w-[150px]">
                {nextHolidayInfo ? `days (${nextHolidayInfo.title})` : 'No upcoming breaks'}
              </span>
            </div>
          </div>
        </div>

        {/* Scheduled Status Disclaimer Banner */}
        <div className="pt-3 border-t border-indigo-900/40 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>{SCHEDULED_STATUS_DISCLAIMER}</span>
          <span className="font-mono text-[10px] text-indigo-400/80">Timezone: Asia/Kolkata (IST)</span>
        </div>
      </div>
    </div>
  );
};
