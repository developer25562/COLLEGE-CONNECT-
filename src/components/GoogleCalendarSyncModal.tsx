import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Info,
  Layers,
  Link2,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  X,
  AlertTriangle,
  FolderPlus
} from 'lucide-react';
import { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { Branch, Period, TimetableSlot } from '../types';
import { downloadIcsFile, transformTimetableToIcs } from '../utils/icsGenerator';
import {
  getCalendarAccessToken,
  initCalendarAuth,
  listGoogleCalendars,
  signInWithGoogleCalendar,
  signOutGoogleCalendar,
  createDedicatedCalendar,
  syncEntriesToGoogleCalendar,
  GoogleCalendarItem
} from '../services/googleCalendarService';

interface GoogleCalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  periods: Period[];
  timetable: TimetableSlot[];
  initialBranchId?: string;
  collegeName?: string;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({
  isOpen,
  onClose,
  branches,
  periods,
  timetable,
  initialBranchId = 'CSE',
  collegeName = 'College Connect Institute of Technology',
  onShowToast
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(initialBranchId);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'direct' | 'ics'>('direct');

  // Term until date: defaults to 16 weeks ahead
  const [untilDateStr, setUntilDateStr] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 112); // ~16 weeks
    return d.toISOString().split('T')[0];
  });

  // Auth & Token state
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Calendar selection state
  const [calendars, setCalendars] = useState<GoogleCalendarItem[]>([]);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState<boolean>(false);
  const [calendarTargetMode, setCalendarTargetMode] = useState<'new' | 'existing'>('new');
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('primary');
  const [newCalendarName, setNewCalendarName] = useState<string>('');

  // Confirmation & Sync progress state
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<{
    current: number;
    total: number;
    currentItem: string;
    status: 'syncing' | 'completed' | 'error';
    error?: string;
  } | null>(null);
  const [syncSuccessResult, setSyncSuccessResult] = useState<{ count: number; calendarName: string } | null>(null);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Filter slots based on selected branch and semester
  const filteredSlots = timetable.filter((slot) => {
    if (slot.branch !== selectedBranchId && slot.branch_id !== selectedBranchId) return false;
    if (selectedSemester !== 'all' && slot.semester && slot.semester !== selectedSemester) {
      return false;
    }
    return true;
  });

  // Keep new calendar name updated with branch
  useEffect(() => {
    setNewCalendarName(`College Connect - ${selectedBranch.short_name || selectedBranch.name}`);
  }, [selectedBranch]);

  // Firebase auth state observer
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initCalendarAuth(
      (user, token) => {
        setAuthUser(user);
        setAccessToken(token);
        loadCalendars(token);
      },
      () => {
        setAuthUser(null);
        setAccessToken(null);
        setCalendars([]);
      }
    );

    // Also check current memory token
    const token = getCalendarAccessToken();
    if (token) {
      setAccessToken(token);
      loadCalendars(token);
    }

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  const loadCalendars = async (token: string) => {
    setIsLoadingCalendars(true);
    try {
      const list = await listGoogleCalendars(token);
      setCalendars(list);
      const primary = list.find((c) => c.primary);
      if (primary) {
        setSelectedCalendarId(primary.id);
      }
    } catch (err: any) {
      console.warn('Could not list user calendars:', err);
    } finally {
      setIsLoadingCalendars(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const { user, accessToken: token } = await signInWithGoogleCalendar();
      setAuthUser(user);
      setAccessToken(token);
      await loadCalendars(token);
      if (onShowToast) onShowToast(`Signed in as ${user.displayName || user.email}`, 'success');
    } catch (err: any) {
      console.error(err);
      setAuthError(err?.message || 'Google authorization failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOutGoogleCalendar();
    setAuthUser(null);
    setAccessToken(null);
    setCalendars([]);
    setSyncProgress(null);
    setSyncSuccessResult(null);
    if (onShowToast) onShowToast('Signed out of Google Calendar session', 'info');
  };

  // 1-Click .ICS Download handler
  const handleDownloadIcs = () => {
    if (filteredSlots.length === 0) {
      if (onShowToast) onShowToast('No timetable slots found for this branch', 'error');
      return;
    }

    const untilDate = new Date(untilDateStr);
    const icsString = transformTimetableToIcs(filteredSlots, periods, {
      branchName: selectedBranch.name,
      branchId: selectedBranch.id,
      semester: selectedSemester !== 'all' ? selectedSemester : undefined,
      collegeName,
      untilDate
    });

    const fileName = `CollegeConnect_${selectedBranch.id}_Timetable.ics`;
    downloadIcsFile(icsString, fileName);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    if (onShowToast) onShowToast(`Downloaded ${fileName}! Import into Google Calendar settings.`, 'success');
  };

  // Prompt the explicit user confirmation dialog required by Workspace skill
  const handleInitiateDirectSync = () => {
    if (!accessToken) {
      handleGoogleSignIn();
      return;
    }
    if (filteredSlots.length === 0) {
      if (onShowToast) onShowToast('No timetable slots found to sync', 'error');
      return;
    }
    setShowConfirmDialog(true);
  };

  // Perform confirmed Google Calendar direct sync
  const handleExecuteDirectSync = async () => {
    setShowConfirmDialog(false);
    if (!accessToken) return;

    setIsSyncing(true);
    setSyncProgress({
      current: 0,
      total: filteredSlots.length,
      currentItem: 'Preparing calendar...',
      status: 'syncing'
    });

    try {
      let targetCalendarId = selectedCalendarId;
      let targetCalendarName = calendars.find((c) => c.id === selectedCalendarId)?.summary || 'Google Calendar';

      // If user chose to create a new dedicated calendar
      if (calendarTargetMode === 'new') {
        const title = newCalendarName.trim() || `College Connect - ${selectedBranch.name}`;
        const created = await createDedicatedCalendar(
          accessToken,
          title,
          `Weekly class timetable routine for ${selectedBranch.name} at ${collegeName}`
        );
        targetCalendarId = created.id;
        targetCalendarName = created.summary;
        // Refresh calendars list in background
        loadCalendars(accessToken);
      }

      const untilDate = new Date(untilDateStr);
      const result = await syncEntriesToGoogleCalendar(
        accessToken,
        targetCalendarId,
        filteredSlots,
        periods,
        {
          branchName: selectedBranch.name,
          branchId: selectedBranch.id,
          semester: selectedSemester !== 'all' ? selectedSemester : undefined,
          untilDate
        },
        (progress) => {
          setSyncProgress(progress);
        }
      );

      setSyncSuccessResult({
        count: result.successCount,
        calendarName: targetCalendarName
      });

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 }
      });

      if (onShowToast) {
        onShowToast(`Successfully added ${result.successCount} classes to "${targetCalendarName}"!`, 'success');
      }
    } catch (err: any) {
      console.error('Direct sync failed:', err);
      setSyncProgress((prev) => ({
        current: prev?.current || 0,
        total: filteredSlots.length,
        currentItem: 'Sync halted due to error',
        status: 'error',
        error: err.message || 'Failed to sync with Google Calendar API.'
      }));
      if (onShowToast) onShowToast(`Sync error: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 via-white to-sky-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 dark:bg-indigo-400/10 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Google Calendar Timetable Sync
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live OAuth
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sync recurring lecture & lab alarms directly to your Google Calendar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Filters: Branch & Semester Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Select Branch
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Semesters</option>
                <option value="SEM1">Semester 1</option>
                <option value="SEM2">Semester 2</option>
                <option value="SEM3">Semester 3</option>
                <option value="SEM4">Semester 4</option>
                <option value="SEM5">Semester 5</option>
                <option value="SEM6">Semester 6</option>
                <option value="SEM7">Semester 7</option>
                <option value="SEM8">Semester 8</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Term End Date
              </label>
              <input
                type="date"
                value={untilDateStr}
                onChange={(e) => setUntilDateStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Slots Summary Pill */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>
                Found <strong>{filteredSlots.length} weekly classes</strong> for {selectedBranch.name}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Repeats weekly with 10-min reminders
            </span>
          </div>

          {/* Mode Tabs: Direct Sync vs .ICS Download */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'direct'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Direct Google Calendar Sync (OAuth)</span>
            </button>
            <button
              onClick={() => setActiveTab('ics')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'ics'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .ICS (Universal Import)</span>
            </button>
          </div>

          {/* Tab 1: Direct Google Calendar Sync */}
          {activeTab === 'direct' && (
            <div className="space-y-5">
              {!authUser ? (
                /* Unauthenticated State: Official Sign in with Google Button */
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 mx-auto flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Connect with Your Google Account
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                      Authorize College Connect to create recurring weekly class reminders in your Google Calendar, with permission from your account.
                    </p>
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
                      {authError}
                    </div>
                  )}

                  {/* Standard Sign in with Google Button per Workspace Guidelines */}
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isSigningIn}
                      className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                    >
                      {isSigningIn ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 48 48">
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                        </svg>
                      )}
                      <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Authenticated State */
                <div className="space-y-4">
                  {/* User Profile Card */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      {authUser.photoURL ? (
                        <img
                          src={authUser.photoURL}
                          alt={authUser.displayName || 'Google User'}
                          className="w-9 h-9 rounded-full ring-2 ring-indigo-500/20"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          {authUser.displayName?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{authUser.displayName || 'Google Calendar User'}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Connected
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{authUser.email}</div>
                      </div>
                    </div>

                    <button
                      onClick={handleGoogleSignOut}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      title="Disconnect Google account"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </div>

                  {/* Calendar Target Selection */}
                  <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Target Calendar in Google
                    </span>

                    <div className="space-y-2.5">
                      <label className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <input
                          type="radio"
                          name="calTarget"
                          checked={calendarTargetMode === 'new'}
                          onChange={() => setCalendarTargetMode('new')}
                          className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                            <FolderPlus className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Create dedicated timetable calendar (Recommended)</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Creates a separate calendar you can easily toggle on or off in Google Calendar without cluttering your personal events.
                          </p>
                          {calendarTargetMode === 'new' && (
                            <input
                              type="text"
                              value={newCalendarName}
                              onChange={(e) => setNewCalendarName(e.target.value)}
                              className="mt-2 w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                              placeholder="Calendar Name"
                            />
                          )}
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <input
                          type="radio"
                          name="calTarget"
                          checked={calendarTargetMode === 'existing'}
                          onChange={() => setCalendarTargetMode('existing')}
                          className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Add to existing calendar
                          </div>
                          {calendarTargetMode === 'existing' && (
                            <select
                              value={selectedCalendarId}
                              onChange={(e) => setSelectedCalendarId(e.target.value)}
                              disabled={isLoadingCalendars}
                              className="mt-2 w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                            >
                              {calendars.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.summary} {c.primary ? '(Primary)' : ''}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Sync Progress Indicator */}
                  {isSyncing && syncProgress && (
                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                          <span>Syncing with Google Calendar API...</span>
                        </div>
                        <span>
                          {syncProgress.current} / {syncProgress.total}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-indigo-200 dark:bg-indigo-900 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-300"
                          style={{
                            width: `${(syncProgress.current / Math.max(syncProgress.total, 1)) * 100}%`
                          }}
                        />
                      </div>
                      <p className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 truncate">
                        {syncProgress.currentItem}
                      </p>
                    </div>
                  )}

                  {/* Sync Success State */}
                  {syncSuccessResult && !isSyncing && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                          Classes Synced Successfully!
                        </h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                          Added {syncSuccessResult.count} recurring classes into{' '}
                          <strong>"{syncSuccessResult.calendarName}"</strong>.
                        </p>
                      </div>
                      <a
                        href="https://calendar.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                      >
                        <span>Open Google Calendar</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Sync Action Trigger */}
                  {!isSyncing && (
                    <button
                      onClick={handleInitiateDirectSync}
                      disabled={filteredSlots.length === 0}
                      className="w-full py-3 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Sync {filteredSlots.length} Classes to Google Calendar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Universal .ICS Download */}
          {activeTab === 'ics' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Download Universal iCalendar (.ics) File
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Generates a standard RFC 5545 calendar file that imports seamlessly into Google Calendar, Apple Calendar, Outlook, and Android.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleDownloadIcs}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .ICS File</span>
                  </button>

                  <a
                    href="https://calendar.google.com/calendar/r/settings/export"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition"
                  >
                    <span>Open Google Calendar Import</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 3-Step Instruction Guide */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-sky-500" />
                  <span>How to import into Google Calendar in 30 seconds:</span>
                </span>

                <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                  <li>
                    Click <strong>"Download .ICS File"</strong> above to save your routine.
                  </li>
                  <li>
                    Open <strong>Google Calendar</strong> &gt; click the <strong>gear icon (Settings)</strong> &gt; <strong>Import & export</strong>.
                  </li>
                  <li>
                    Select your downloaded <code className="font-mono text-indigo-500">.ics</code> file and click <strong>Import</strong>.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-1 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Official Google Calendar API &bull; Client-Side OAuth</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>

        {/* Workspace Guideline Mandatory User Confirmation Dialog */}
        <AnimatePresence>
          {showConfirmDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Confirm Google Calendar Sync
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    You are about to add <strong>{filteredSlots.length} weekly recurring classes</strong> into your Google Calendar for{' '}
                    <strong>{selectedBranch.name}</strong> until{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">{untilDateStr}</span>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Target Calendar:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {calendarTargetMode === 'new' ? newCalendarName : 'Selected Google Calendar'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Reminder Alarms:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      10 mins & 60 mins before class
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleExecuteDirectSync}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
                  >
                    Confirm & Sync
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
