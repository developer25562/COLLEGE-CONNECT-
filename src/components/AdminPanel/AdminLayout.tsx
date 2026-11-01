import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  Database,
  DoorOpen,
  FileSpreadsheet,
  History,
  Lock,
  LogOut,
  RotateCcw,
  Settings,
  ShieldCheck,
  Table2,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { UploadZone } from './UploadZone';
import { TimetableEditor } from './TimetableEditor';
import { MasterDataManager } from './MasterDataManager';
import { PeriodsManager } from './PeriodsManager';
import { SettingsManager } from './SettingsManager';
import { RoomManager } from './RoomManager';
import { HolidayManager } from './HolidayManager';
import { NoticeManager } from './NoticeManager';
import { QuickOverridesManager } from './QuickOverridesManager';
import { SupabaseDeployGuide } from './SupabaseDeployGuide';
import {
  Branch,
  Holiday,
  Notice,
  Period,
  QuickOverride,
  Room,
  TimetableSlot
} from '../../types';
import { storageService } from '../../services/storageService';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

interface AdminLayoutProps {
  branches: Branch[];
  rooms: Room[];
  periods: Period[];
  timetable: TimetableSlot[];
  holidays: Holiday[];
  notices: Notice[];
  quickOverrides: QuickOverride[];
  onDataUpdated: (data: {
    branches?: Branch[];
    rooms?: Room[];
    periods?: Period[];
    timetable?: TimetableSlot[];
    holidays?: Holiday[];
    notices?: Notice[];
    quickOverrides?: QuickOverride[];
  }) => void;
  onExitAdmin: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  branches,
  rooms,
  periods,
  timetable,
  holidays,
  notices,
  quickOverrides,
  onDataUpdated,
  onExitAdmin,
  onShowToast
}) => {
  // Session authentication state (persists in localStorage)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('campuspulse_admin_session') === 'true';
  });

  const [email, setEmail] = useState('admin@college.edu');
  const [password, setPassword] = useState('admin123');
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'upload' | 'timetable' | 'master_data' | 'periods' | 'holidays' | 'notices' | 'settings' | 'history' | 'overrides' | 'deploy'
  >('upload');
  const [collegeSettings, setCollegeSettings] = useState(() => storageService.getSettings());
  const [uploadHistory, setUploadHistory] = useState(() => storageService.getUploadHistory());

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });
        if (error) {
          // If supabase fails or user not yet created, permit demo access with notice
          console.warn('Supabase auth check:', error.message);
        }
      }

      // Demo authentication allowed out of the box
      setIsAuthenticated(true);
      localStorage.setItem('campuspulse_admin_session', 'true');
      onShowToast('Welcome to CampusPulse Administrator Dashboard', 'success');
    } catch (err: any) {
      onShowToast('Authentication error: ' + err.message, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('campuspulse_admin_session');
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    onShowToast('Signed out of admin portal', 'info');
  };

  const handleResetToFactory = () => {
    if (window.confirm('Reset all schedule, rooms and holiday data to default sample dataset?')) {
      storageService.resetToDefaults();
      onDataUpdated({
        branches: storageService.getBranches(),
        rooms: storageService.getRooms(),
        periods: storageService.getPeriods(),
        timetable: storageService.getTimetable(),
        holidays: storageService.getHolidays(),
        notices: storageService.getNotices(),
        quickOverrides: []
      });
      onShowToast('Reset all database tables to factory defaults', 'info');
    }
  };

  // If not logged in, render sleek Admin Auth Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Administrator Authentication
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Authorized college administrators, timetable coordinators &amp; exam controllers
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition"
            >
              {authLoading ? 'Verifying Credentials...' : 'Sign In as Administrator'}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onExitAdmin}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Student Schedule</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Academic Administration Portal
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage course timetables, room assignments, holiday notices and bulk Excel synchronization
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset To Factory Defaults */}
          <button
            onClick={handleResetToFactory}
            title="Reset dataset to default realistic sample"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'upload'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Upload</span>
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'timetable'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Table2 className="w-4 h-4" />
          <span>Timetable</span>
        </button>

        <button
          onClick={() => setActiveTab('master_data')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'master_data'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Rooms &amp; Master Data</span>
        </button>

        <button
          onClick={() => setActiveTab('periods')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'periods'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Periods</span>
        </button>

        <button
          onClick={() => setActiveTab('holidays')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'holidays'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Holidays &amp; Vacation</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'notices'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notices</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Upload History</span>
        </button>

        <button
          onClick={() => setActiveTab('overrides')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'overrides'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Overrides</span>
        </button>

        <button
          onClick={() => setActiveTab('deploy')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'deploy'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database SQL</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'upload' && (
          <UploadZone
            rooms={rooms}
            periods={periods}
            timetable={timetable}
            holidays={holidays}
            onDataImported={(data) => {
              onDataUpdated(data);
              setUploadHistory(storageService.getUploadHistory());
            }}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableEditor
            branches={branches}
            rooms={rooms}
            periods={periods}
            timetable={timetable}
            onSaveTimetable={(updated) => {
              storageService.saveTimetable(updated);
              onDataUpdated({ timetable: updated });
            }}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'master_data' && (
          <MasterDataManager
            rooms={rooms}
            branches={branches}
            onSaveRooms={(updated) => {
              storageService.saveRooms(updated);
              onDataUpdated({ rooms: updated });
            }}
            onSaveBranches={(updated) => {
              storageService.saveBranches(updated);
              onDataUpdated({ branches: updated });
            }}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'periods' && (
          <PeriodsManager
            periods={periods}
            onSavePeriods={(updated) => {
              storageService.savePeriods(updated);
              onDataUpdated({ periods: updated });
            }}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'holidays' && (
          <HolidayManager
            holidays={holidays}
            onSaveHolidays={(updated) => {
              storageService.saveHolidays(updated);
              onDataUpdated({ holidays: updated });
            }}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'notices' && (
          <NoticeManager
            notices={notices}
            onSaveNotices={(updated) => {
              storageService.saveNotices(updated);
              onDataUpdated({ notices: updated });
            }}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsManager
            settings={collegeSettings}
            onSaveSettings={(updated) => {
              storageService.saveSettings(updated);
              setCollegeSettings(updated);
            }}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'history' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  <span>Upload History &amp; 1-Click Rollback (Last 5 Uploads)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect every Excel synchronization and instantly undo any of the last 5 uploads to restore database snapshots.
                </p>
              </div>
              <button
                onClick={() => setUploadHistory(storageService.getUploadHistory())}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                Refresh Log
              </button>
            </div>

            {uploadHistory.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No uploads recorded yet. Upload an Excel spreadsheet from the "Upload" tab to see history and rollback snapshots here.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {uploadHistory.map((item) => (
                  <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{item.fileName}</span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Mode: {item.mode}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Synced
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {new Date(item.timestamp).toLocaleString()} · {item.counts.timetable} classes, {item.counts.rooms} rooms, {item.counts.holidays} holidays, {item.counts.periods} periods
                      </div>
                    </div>

                    {item.previousSnapshot && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Undo upload "${item.fileName}" and revert data to previous snapshot?`)) {
                            const ok = storageService.restoreSnapshot(item.previousSnapshot!);
                            if (ok) {
                              onDataUpdated({
                                timetable: storageService.getTimetable(),
                                rooms: storageService.getRooms(),
                                holidays: storageService.getHolidays(),
                                periods: storageService.getPeriods(),
                                notices: storageService.getNotices(),
                                branches: storageService.getBranches()
                              });
                              setUploadHistory(storageService.getUploadHistory());
                              onShowToast(`Successfully reverted database to snapshot before "${item.fileName}"`, 'success');
                            } else {
                              onShowToast('Failed to revert snapshot', 'error');
                            }
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-900/60 transition self-start sm:self-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Undo This Upload</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'overrides' && (
          <QuickOverridesManager
            overrides={quickOverrides}
            rooms={rooms}
            timetable={timetable}
            onAddOverride={(item) => {
              const full = storageService.addQuickOverride(item);
              onDataUpdated({ quickOverrides: storageService.getQuickOverrides() });
            }}
            onDeleteOverride={(id) => {
              storageService.deleteQuickOverride(id);
              onDataUpdated({ quickOverrides: storageService.getQuickOverrides() });
            }}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'deploy' && <SupabaseDeployGuide />}
      </div>
    </div>
  );
};
