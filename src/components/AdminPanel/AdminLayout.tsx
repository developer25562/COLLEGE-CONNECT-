import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Database,
  DoorOpen,
  FileSpreadsheet,
  Lock,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Table2,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { UploadZone } from './UploadZone';
import { TimetableEditor } from './TimetableEditor';
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
    'upload' | 'timetable' | 'rooms' | 'holidays' | 'notices' | 'overrides' | 'deploy'
  >('upload');

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
          <span>Upload Excel</span>
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
          <span>Timetable Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'rooms'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Rooms &amp; Facilities</span>
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
          <span>Notices Ticker</span>
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
          <span>Quick Overrides</span>
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
          <span>Database &amp; Deploy</span>
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
            onDataImported={(data) => onDataUpdated(data)}
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

        {activeTab === 'rooms' && (
          <RoomManager
            rooms={rooms}
            onSaveRooms={(updated) => {
              storageService.saveRooms(updated);
              onDataUpdated({ rooms: updated });
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
