import React from 'react';
import { Clock, SlidersHorizontal, Sun, Moon, Download, GraduationCap, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface TopNavProps {
  activeTab: 'today' | 'timetable' | 'rooms' | 'calendar' | 'admin';
  setActiveTab: (tab: 'today' | 'timetable' | 'rooms' | 'calendar' | 'admin') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isSimulated: boolean;
  onOpenTimeMachine: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  isSimulated,
  onOpenTimeMachine
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Clean single-line display) */}
        <div 
          onClick={() => setActiveTab('today')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              College Connect
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5">
              Institute Schedule &amp; Routine
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line, quiet hover, no pill clutter) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('today')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              activeTab === 'today'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Today
            {activeTab === 'today' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              activeTab === 'timetable'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Timetable
            {activeTab === 'timetable' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              activeTab === 'rooms'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Room Availability
            {activeTab === 'rooms' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              activeTab === 'calendar'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Holidays &amp; Breaks
            {activeTab === 'calendar' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`whitespace-nowrap flex items-center gap-1.5 transition-colors relative py-1 ${
              activeTab === 'admin'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
            Admin Portal
            {activeTab === 'admin' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Functional Utilities & Action Area */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Time Machine / Live Testing Widget Trigger */}
          <button
            onClick={onOpenTimeMachine}
            title="Time Machine: Test any day, period, or vacation"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              isSimulated
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isSimulated ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline">
              {isSimulated ? 'Simulated Time' : 'Time Machine'}
            </span>
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
          </button>

          {/* In-App PWA Install Button (If Installable) */}
          {isInstallable && (
            <button
              onClick={install}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 py-2 px-3 flex justify-around items-center no-print shadow-xl">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'today'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Today</span>
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'timetable'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className="font-bold text-xs">#</span>
          <span>Routine</span>
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'rooms'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className="font-bold text-xs">[R]</span>
          <span>Rooms</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'calendar'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className="font-bold text-xs">CAL</span>
          <span>Breaks</span>
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'admin'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
};
