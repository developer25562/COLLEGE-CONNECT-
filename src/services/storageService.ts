import {
  Branch,
  Room,
  Period,
  TimetableSlot,
  Holiday,
  Notice,
  RoomBooking,
  QuickOverride,
  UploadHistoryItem
} from '../types';
import {
  INITIAL_BRANCHES,
  INITIAL_ROOMS,
  INITIAL_PERIODS,
  INITIAL_TIMETABLE,
  INITIAL_HOLIDAYS,
  INITIAL_NOTICES
} from '../data/initialData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  BRANCHES: 'campuspulse_branches_v1',
  ROOMS: 'campuspulse_rooms_v1',
  PERIODS: 'campuspulse_periods_v1',
  TIMETABLE: 'campuspulse_timetable_v1',
  HOLIDAYS: 'campuspulse_holidays_v1',
  NOTICES: 'campuspulse_notices_v1',
  BOOKINGS: 'campuspulse_bookings_v1',
  OVERRIDES: 'campuspulse_overrides_v1',
  UPLOAD_HISTORY: 'campuspulse_upload_history_v1',
  ADMIN_AUTH: 'campuspulse_admin_session_v1',
  THEME: 'campuspulse_theme_v1'
};

class StorageService {
  private getLocal<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }

  private setLocal<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to save ${key} to localStorage:`, err);
    }
  }

  // Branches
  getBranches(): Branch[] {
    return this.getLocal<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
  }

  saveBranches(branches: Branch[]): void {
    this.setLocal(STORAGE_KEYS.BRANCHES, branches);
  }

  // Rooms
  getRooms(): Room[] {
    return this.getLocal<Room[]>(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  }

  saveRooms(rooms: Room[]): void {
    this.setLocal(STORAGE_KEYS.ROOMS, rooms);
  }

  // Periods
  getPeriods(): Period[] {
    return this.getLocal<Period[]>(STORAGE_KEYS.PERIODS, INITIAL_PERIODS);
  }

  savePeriods(periods: Period[]): void {
    this.setLocal(STORAGE_KEYS.PERIODS, periods);
  }

  // Timetable
  getTimetable(): TimetableSlot[] {
    return this.getLocal<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE);
  }

  saveTimetable(slots: TimetableSlot[]): void {
    this.setLocal(STORAGE_KEYS.TIMETABLE, slots);
  }

  // Holidays
  getHolidays(): Holiday[] {
    return this.getLocal<Holiday[]>(STORAGE_KEYS.HOLIDAYS, INITIAL_HOLIDAYS);
  }

  saveHolidays(holidays: Holiday[]): void {
    this.setLocal(STORAGE_KEYS.HOLIDAYS, holidays);
  }

  // Notices
  getNotices(): Notice[] {
    return this.getLocal<Notice[]>(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
  }

  saveNotices(notices: Notice[]): void {
    this.setLocal(STORAGE_KEYS.NOTICES, notices);
  }

  // Bookings
  getBookings(): RoomBooking[] {
    return this.getLocal<RoomBooking[]>(STORAGE_KEYS.BOOKINGS, []);
  }

  saveBookings(bookings: RoomBooking[]): void {
    this.setLocal(STORAGE_KEYS.BOOKINGS, bookings);
  }

  addBooking(booking: Omit<RoomBooking, 'id' | 'createdAt'>): RoomBooking {
    const fullBooking: RoomBooking = {
      ...booking,
      id: 'bk-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: Date.now()
    };
    const current = this.getBookings();
    const updated = [fullBooking, ...current];
    this.saveBookings(updated);
    return fullBooking;
  }

  deleteBooking(id: string): void {
    const current = this.getBookings();
    this.saveBookings(current.filter((b) => b.id !== id));
  }

  // Quick Overrides (Auto-expires after midnight)
  getQuickOverrides(): QuickOverride[] {
    const today = new Date().toISOString().split('T')[0];
    const all = this.getLocal<QuickOverride[]>(STORAGE_KEYS.OVERRIDES, []);
    // Only return today's active overrides
    return all.filter((o) => o.date === today);
  }

  addQuickOverride(override: Omit<QuickOverride, 'id' | 'createdAt'>): QuickOverride {
    const full: QuickOverride = {
      ...override,
      id: 'ov-' + Date.now(),
      createdAt: Date.now()
    };
    const current = this.getLocal<QuickOverride[]>(STORAGE_KEYS.OVERRIDES, []);
    this.setLocal(STORAGE_KEYS.OVERRIDES, [full, ...current]);
    return full;
  }

  deleteQuickOverride(id: string): void {
    const current = this.getLocal<QuickOverride[]>(STORAGE_KEYS.OVERRIDES, []);
    this.setLocal(STORAGE_KEYS.OVERRIDES, current.filter((o) => o.id !== id));
  }

  // Upload History & Snapshots
  getUploadHistory(): UploadHistoryItem[] {
    return this.getLocal<UploadHistoryItem[]>(STORAGE_KEYS.UPLOAD_HISTORY, []);
  }

  saveUploadHistory(item: UploadHistoryItem): void {
    const current = this.getUploadHistory();
    // Keep max 5 history entries
    const updated = [item, ...current].slice(0, 5);
    this.setLocal(STORAGE_KEYS.UPLOAD_HISTORY, updated);
  }

  createStateSnapshot(): string {
    return JSON.stringify({
      timetable: this.getTimetable(),
      rooms: this.getRooms(),
      holidays: this.getHolidays(),
      periods: this.getPeriods()
    });
  }

  restoreSnapshot(snapshotString: string): boolean {
    try {
      const data = JSON.parse(snapshotString);
      if (data.timetable) this.saveTimetable(data.timetable);
      if (data.rooms) this.saveRooms(data.rooms);
      if (data.holidays) this.saveHolidays(data.holidays);
      if (data.periods) this.savePeriods(data.periods);
      return true;
    } catch (err) {
      console.error('Failed to restore snapshot:', err);
      return false;
    }
  }

  // Reset all data to factory demo defaults
  resetToDefaults(): void {
    this.saveBranches(INITIAL_BRANCHES);
    this.saveRooms(INITIAL_ROOMS);
    this.savePeriods(INITIAL_PERIODS);
    this.saveTimetable(INITIAL_TIMETABLE);
    this.saveHolidays(INITIAL_HOLIDAYS);
    this.saveNotices(INITIAL_NOTICES);
    this.saveBookings([]);
    this.setLocal(STORAGE_KEYS.OVERRIDES, []);
  }

  // Try sync with Supabase if online and configured
  async syncFromSupabase(): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const [roomsRes, timetableRes, holidaysRes, noticesRes] = await Promise.all([
        supabase.from('rooms').select('*'),
        supabase.from('timetable').select('*'),
        supabase.from('holidays').select('*'),
        supabase.from('notices').select('*')
      ]);

      if (roomsRes.data && roomsRes.data.length > 0) {
        this.saveRooms(
          roomsRes.data.map((r: any) => ({
            id: r.id,
            name: r.name,
            type: r.type,
            capacity: r.capacity,
            floor: r.floor,
            building: r.building,
            isMaintenance: r.is_maintenance
          }))
        );
      }

      if (timetableRes.data && timetableRes.data.length > 0) {
        this.saveTimetable(
          timetableRes.data.map((t: any) => ({
            id: t.id,
            branch: t.branch,
            day: t.day,
            periodId: isNaN(Number(t.period_id)) ? t.period_id : Number(t.period_id),
            subject: t.subject,
            teacher: t.teacher,
            roomId: t.room_id,
            type: t.type,
            notes: t.notes
          }))
        );
      }

      if (holidaysRes.data && holidaysRes.data.length > 0) {
        this.saveHolidays(
          holidaysRes.data.map((h: any) => ({
            id: h.id,
            startDate: h.start_date,
            endDate: h.end_date,
            title: h.title,
            type: h.type,
            description: h.description
          }))
        );
      }

      if (noticesRes.data && noticesRes.data.length > 0) {
        this.saveNotices(
          noticesRes.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            priority: n.priority,
            startDate: n.start_date,
            endDate: n.end_date,
            active: n.active
          }))
        );
      }

      return true;
    } catch (err) {
      console.warn('Supabase sync skipped/failed, using cached local data:', err);
      return false;
    }
  }
}

export const storageService = new StorageService();
