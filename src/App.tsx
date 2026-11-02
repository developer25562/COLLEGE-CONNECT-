import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  WifiOff,
  X
} from 'lucide-react';
import {
  Branch,
  DayOfWeek,
  Holiday,
  Notice,
  Period,
  QuickOverride,
  Room,
  RoomBooking,
  TimetableSlot
} from './types';
import { storageService } from './services/storageService';
import {
  DAYS_OF_WEEK,
  deriveAllRoomStatuses,
  evaluateCollegeStatus,
  getDayName,
  getDaysUntilNextHoliday,
  timeStringToMinutes
} from './utils/timeEngine';
import { TopNav } from './components/TopNav';
import { NoticeTicker } from './components/NoticeTicker';
import { HeroBanner } from './components/HeroBanner';
import { TimeMachineModal } from './components/TimeMachineModal';
import { BranchTimetable } from './components/BranchTimetable';
import { RoomAvailability } from './components/RoomAvailability';
import { HolidayCalendar } from './components/HolidayCalendar';
import { AdminLayout } from './components/AdminPanel/AdminLayout';
import { SetupChecker } from './components/SetupChecker';
import { checkDatabaseSetup, SetupStatus, isSupabaseConfigured } from './services/supabaseClient';

export default function App() {
  // Theme state: defaults to dark mode per design guidelines
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('campuspulse_theme');
    if (saved) return saved === 'dark';
    return true; // Default dark
  });

  // Core Data State
  const [branches, setBranches] = useState<Branch[]>(() => storageService.getBranches());
  const [rooms, setRooms] = useState<Room[]>(() => storageService.getRooms());
  const [periods, setPeriods] = useState<Period[]>(() => storageService.getPeriods());
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => storageService.getTimetable());
  const [holidays, setHolidays] = useState<Holiday[]>(() => storageService.getHolidays());
  const [notices, setNotices] = useState<Notice[]>(() => storageService.getNotices());
  const [bookings, setBookings] = useState<RoomBooking[]>(() => storageService.getBookings());
  const [quickOverrides, setQuickOverrides] = useState<QuickOverride[]>(() => storageService.getQuickOverrides());

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'today' | 'timetable' | 'rooms' | 'calendar' | 'admin'>(() => {
    if (window.location.pathname === '/admin') return 'admin';
    return 'today';
  });

  // Clock & Time Machine State
  const [isSimulated, setIsSimulated] = useState(false);
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date());
  const [showTimeMachine, setShowTimeMachine] = useState(false);

  // Setup Checker state for Supabase database validation
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [isCheckingSetup, setIsCheckingSetup] = useState(false);
  const [bypassSetupChecker, setBypassSetupChecker] = useState(false);

  const runDatabaseProbe = async () => {
    setIsCheckingSetup(true);
    try {
      const res = await checkDatabaseSetup();
      setSetupStatus(res);
      if (res.isReady) {
        setBypassSetupChecker(true);
      }
    } catch {
      // Handled gracefully
    } finally {
      setIsCheckingSetup(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin' && isSupabaseConfigured) {
      runDatabaseProbe();
    }
  }, [activeTab]);

  // Online / Offline Detection
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Toast System
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; type: 'success' | 'error' | 'info' }>>([]);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 't-' + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Sync theme with HTML document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('campuspulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('campuspulse_theme', 'light');
    }
  }, [darkMode]);

  // Online status listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Try background sync with Supabase if online
    storageService.syncFromSupabase().catch(() => {});

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Live Clock Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSimulated) {
        setSimulatedDate(new Date());
      } else {
        // Advance simulated time by 1 second
        setSimulatedDate((prev) => new Date(prev.getTime() + 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulated]);

  // Derive Current Day of Week for Timetable
  const currentDayName = getDayName(simulatedDate);
  const [activeDay, setActiveDay] = useState<DayOfWeek>(() => {
    if (DAYS_OF_WEEK.includes(currentDayName as DayOfWeek)) {
      return currentDayName as DayOfWeek;
    }
    return 'Monday';
  });

  // When simulated day changes, auto-select if Mon–Sat
  useEffect(() => {
    if (DAYS_OF_WEEK.includes(currentDayName as DayOfWeek)) {
      setActiveDay(currentDayName as DayOfWeek);
    }
  }, [currentDayName]);

  // College status evaluation
  const collegeStatus = evaluateCollegeStatus(
    simulatedDate,
    periods,
    holidays,
    quickOverrides
  );

  const currentMinutes = simulatedDate.getHours() * 60 + simulatedDate.getMinutes();

  // Next Holiday Info
  const nextHolidayInfo = getDaysUntilNextHoliday(simulatedDate, holidays);

  // Derived Room Availability
  const derivedRooms = deriveAllRoomStatuses(
    rooms,
    timetable,
    bookings,
    periods,
    activeDay,
    currentMinutes,
    collegeStatus.isOpen
  );

  // Statistics
  const roomsFreeCount = derivedRooms.filter((r) => r.status === 'free').length;

  const currentActivePeriod = collegeStatus.activePeriod;
  const classesRunningCount =
    collegeStatus.isOpen && currentActivePeriod && !currentActivePeriod.isBreak
      ? timetable.filter(
          (s) => s.day === activeDay && s.periodId === currentActivePeriod.id
        ).length
      : 0;

  // Add Room Booking Handler
  const handleBookRoom = (booking: Omit<RoomBooking, 'id' | 'createdAt'>) => {
    const newBooking = storageService.addBooking(booking);
    setBookings(storageService.getBookings());
    showToast(`Room ${booking.roomId} booked successfully!`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Urgent Broadcast Notice Ticker */}
      <NoticeTicker notices={notices} />

      {/* Top Navbar */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isSimulated={isSimulated}
        onOpenTimeMachine={() => setShowTimeMachine(true)}
      />

      {/* Offline Mode Indicator */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active — Viewing verified cached timetable &amp; room data.</span>
        </div>
      )}

      {/* Simulated Time Notice Banner */}
      {isSimulated && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>
                <strong>Simulated Time Active:</strong> Showing {currentDayName},{' '}
                {simulatedDate.toLocaleTimeString()} ({simulatedDate.toLocaleDateString()})
              </span>
            </div>
            <button
              onClick={() => {
                setIsSimulated(false);
                setSimulatedDate(new Date());
                showToast('Reset to real system clock', 'info');
              }}
              className="font-bold underline hover:opacity-80"
            >
              Reset to Real Time
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 mb-16 md:mb-6">
        {/* TAB 1: TODAY DASHBOARD */}
        {activeTab === 'today' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero / Today Banner */}
            <HeroBanner
              status={collegeStatus}
              simulatedDate={simulatedDate}
              roomsFreeCount={roomsFreeCount}
              classesRunningCount={classesRunningCount}
              nextHolidayInfo={nextHolidayInfo}
              onExploreRooms={() => setActiveTab('rooms')}
              onExploreTimetable={() => setActiveTab('timetable')}
              periods={periods}
            />

            {/* Quick Glimpse: Today's Routine Across Branches */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Today's Academic Routine ({activeDay})</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live schedule for all 5 engineering branches with active lecture status
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('timetable')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline self-start"
                >
                  View Full Week Schedule →
                </button>
              </div>

              <BranchTimetable
                branches={branches}
                periods={periods}
                timetable={timetable}
                activeDay={activeDay}
                setActiveDay={setActiveDay}
                activePeriod={collegeStatus.activePeriod}
                currentMinutes={currentMinutes}
                isOpen={collegeStatus.isOpen}
                onShowToast={showToast}
              />
            </div>
          </div>
        )}

        {/* TAB 2: BRANCH TIMETABLE */}
        {activeTab === 'timetable' && (
          <div className="animate-fade-in space-y-4">
            <BranchTimetable
              branches={branches}
              periods={periods}
              timetable={timetable}
              activeDay={activeDay}
              setActiveDay={setActiveDay}
              activePeriod={collegeStatus.activePeriod}
              currentMinutes={currentMinutes}
              isOpen={collegeStatus.isOpen}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* TAB 3: ROOM AVAILABILITY */}
        {activeTab === 'rooms' && (
          <div className="animate-fade-in space-y-4">
            <RoomAvailability
              roomStatuses={derivedRooms}
              rooms={rooms}
              periods={periods}
              timetable={timetable}
              activeDay={activeDay}
              onBookRoom={handleBookRoom}
              bookings={bookings}
            />
          </div>
        )}

        {/* TAB 4: VACATION & HOLIDAY CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="animate-fade-in space-y-4">
            <HolidayCalendar
              holidays={holidays}
              currentDate={simulatedDate}
            />
          </div>
        )}

        {/* TAB 5: ADMIN PORTAL */}
        {activeTab === 'admin' && (
          <div className="animate-fade-in">
            {isSupabaseConfigured && setupStatus && (!setupStatus.isReady || (setupStatus.currentUser && !setupStatus.isAdmin)) && !bypassSetupChecker ? (
              <SetupChecker
                status={setupStatus}
                onRefresh={runDatabaseProbe}
                onProceedDemo={() => setBypassSetupChecker(true)}
                isChecking={isCheckingSetup}
              />
            ) : (
              <AdminLayout
                branches={branches}
                rooms={rooms}
                periods={periods}
                timetable={timetable}
                holidays={holidays}
                notices={notices}
                quickOverrides={quickOverrides}
                onDataUpdated={(updated) => {
                  if (updated.branches) setBranches(updated.branches);
                  if (updated.rooms) setRooms(updated.rooms);
                  if (updated.periods) setPeriods(updated.periods);
                  if (updated.timetable) setTimetable(updated.timetable);
                  if (updated.holidays) setHolidays(updated.holidays);
                  if (updated.notices) setNotices(updated.notices);
                  if (updated.quickOverrides) setQuickOverrides(updated.quickOverrides);
                }}
                onExitAdmin={() => setActiveTab('today')}
                onShowToast={showToast}
              />
            )}
          </div>
        )}
      </main>

      {/* Time Machine Modal */}
      <TimeMachineModal
        isOpen={showTimeMachine}
        onClose={() => setShowTimeMachine(false)}
        simulatedDate={simulatedDate}
        onUpdateSimulatedDate={(d) => {
          setIsSimulated(true);
          setSimulatedDate(d);
          showToast(`Jumped to ${getDayName(d)}, ${d.toLocaleTimeString()}`, 'info');
        }}
        onResetToRealTime={() => {
          setIsSimulated(false);
          setSimulatedDate(new Date());
          showToast('Reset to real clock', 'info');
        }}
        isSimulated={isSimulated}
      />

      {/* Toast Notifications Overlay */}
      <div className="fixed bottom-16 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`p-3.5 rounded-2xl shadow-xl border pointer-events-auto flex items-start gap-3 backdrop-blur-lg ${
                t.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                  : t.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                  : 'bg-slate-900/90 border-indigo-500/50 text-slate-100'
              }`}
            >
              {t.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : t.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-semibold leading-relaxed">{t.msg}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 py-6 text-center text-xs text-slate-500 dark:text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            CampusPulse Academic Management System · Real-time schedule &amp; room allocation
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-indigo-500 transition font-medium"
            >
              Admin Portal
            </button>
            <span>·</span>
            <button
              onClick={() => setShowTimeMachine(true)}
              className="hover:text-indigo-500 transition font-medium"
            >
              Time Machine
            </button>
            <span>·</span>
            <span>Version 2.4 PWA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
