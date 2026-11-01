import {
  Branch,
  Room,
  Period,
  TimetableSlot,
  Holiday,
  Notice,
  Announcement,
  CollegeSettings,
  RoomBooking,
  QuickOverride,
  UploadHistoryItem,
  Semester,
  Professor,
  Subject
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
  BRANCHES: 'collegeconnect_branches_v2',
  ROOMS: 'collegeconnect_rooms_v2',
  PERIODS: 'collegeconnect_periods_v2',
  TIMETABLE: 'collegeconnect_timetable_v2',
  HOLIDAYS: 'collegeconnect_holidays_v2',
  NOTICES: 'collegeconnect_notices_v2',
  SETTINGS: 'collegeconnect_settings_v2',
  SEMESTERS: 'collegeconnect_semesters_v2',
  PROFESSORS: 'collegeconnect_professors_v2',
  SUBJECTS: 'collegeconnect_subjects_v2',
  BOOKINGS: 'collegeconnect_bookings_v2',
  OVERRIDES: 'collegeconnect_overrides_v2',
  UPLOAD_HISTORY: 'collegeconnect_upload_history_v2',
  ADMIN_AUTH: 'collegeconnect_admin_session_v2',
  THEME: 'collegeconnect_theme_v2'
};

export const DEFAULT_SETTINGS: CollegeSettings = {
  id: 'current',
  college_name: 'College Connect Institute of Technology',
  timezone: 'Asia/Kolkata',
  academic_year: '2026-2027',
  working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  contact_address: 'Academic Ridge, Knowledge City, Bangalore, KA 560001',
  contact_phone: '+91 (080) 2450-8900',
  contact_email: 'registrar@collegeconnect.edu.in'
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

  // --- SETTINGS ---
  getSettings(): CollegeSettings {
    return this.getLocal<CollegeSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  async saveSettings(settings: CollegeSettings): Promise<void> {
    this.setLocal(STORAGE_KEYS.SETTINGS, settings);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('settings')
          .upsert({
            id: 'current',
            college_name: settings.college_name,
            logo_url: settings.logo_url || null,
            timezone: settings.timezone || 'Asia/Kolkata',
            academic_year: settings.academic_year || '2026-2027',
            working_days: settings.working_days,
            contact_address: settings.contact_address || null,
            contact_phone: settings.contact_phone || null,
            contact_email: settings.contact_email || null,
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.warn('Supabase settings update failed:', err);
      }
    }
  }

  // --- BRANCHES ---
  getBranches(): Branch[] {
    return this.getLocal<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
  }

  async saveBranches(branches: Branch[]): Promise<void> {
    this.setLocal(STORAGE_KEYS.BRANCHES, branches);
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = branches.map((b) => ({
          id: b.id,
          name: b.name,
          short_name: b.shortName || b.short_name || b.id,
          code: b.code || b.id,
          color: b.color || '#4F46E5',
          updated_at: new Date().toISOString()
        }));
        await supabase.from('branches').upsert(payload);
      } catch (err) {
        console.warn('Supabase branches upsert failed:', err);
      }
    }
  }

  // --- ROOMS (Classrooms) ---
  getRooms(): Room[] {
    return this.getLocal<Room[]>(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  }

  async saveRooms(rooms: Room[]): Promise<void> {
    this.setLocal(STORAGE_KEYS.ROOMS, rooms);
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = rooms.map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          capacity: Number(r.capacity) || 60,
          floor: Number(r.floor) || 0,
          building: r.building || 'Academic Block A',
          is_under_maintenance: Boolean(r.isMaintenance ?? r.is_under_maintenance),
          updated_at: new Date().toISOString()
        }));
        await supabase.from('classrooms').upsert(payload);
      } catch (err) {
        console.warn('Supabase classrooms upsert failed:', err);
      }
    }
  }

  // --- PERIODS ---
  getPeriods(): Period[] {
    return this.getLocal<Period[]>(STORAGE_KEYS.PERIODS, INITIAL_PERIODS);
  }

  async savePeriods(periods: Period[]): Promise<void> {
    this.setLocal(STORAGE_KEYS.PERIODS, periods);
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = periods.map((p, idx) => ({
          id: String(p.id),
          period_number: p.order || p.period_number || idx + 1,
          start_time: p.start || p.start_time,
          end_time: p.end || p.end_time,
          label: p.label,
          is_break: Boolean(p.isBreak ?? p.is_break),
          updated_at: new Date().toISOString()
        }));
        await supabase.from('periods').upsert(payload);
      } catch (err) {
        console.warn('Supabase periods upsert failed:', err);
      }
    }
  }

  // --- TIMETABLE ENTRIES ---
  getTimetable(): TimetableSlot[] {
    return this.getLocal<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE);
  }

  async saveTimetable(slots: TimetableSlot[]): Promise<void> {
    this.setLocal(STORAGE_KEYS.TIMETABLE, slots);
    if (isSupabaseConfigured && supabase) {
      try {
        const dayMap: Record<string, number> = {
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6,
          Sunday: 7
        };

        const payload = slots.map((s) => ({
          id: s.id,
          branch_id: s.branch_id || s.branch,
          semester_id: s.semester_id || 'SEM5',
          subject_id: s.subject_id || s.subject,
          professor_id: s.professor_id || s.teacher,
          classroom_id: s.classroom_id || s.roomId,
          day_of_week: s.day_of_week || dayMap[s.day] || 1,
          start_time: s.start_time || '09:00',
          end_time: s.end_time || '09:55',
          class_type: s.class_type || s.type || 'Lecture',
          is_published: s.is_published !== false,
          updated_at: new Date().toISOString()
        }));

        await supabase.from('timetable_entries').upsert(payload);
      } catch (err) {
        console.warn('Supabase timetable_entries upsert failed:', err);
      }
    }
  }

  // --- HOLIDAYS ---
  getHolidays(): Holiday[] {
    return this.getLocal<Holiday[]>(STORAGE_KEYS.HOLIDAYS, INITIAL_HOLIDAYS);
  }

  async saveHolidays(holidays: Holiday[]): Promise<void> {
    this.setLocal(STORAGE_KEYS.HOLIDAYS, holidays);
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = holidays.map((h) => ({
          id: h.id,
          start_date: h.startDate || h.start_date,
          end_date: h.endDate || h.end_date || h.startDate,
          title: h.title,
          type: h.type === 'sunday' ? 'holiday' : h.type,
          greeting: h.greeting || h.description || null,
          banner_url: h.banner_url || null,
          is_whole_college: h.is_whole_college !== false,
          updated_at: new Date().toISOString()
        }));
        await supabase.from('holidays').upsert(payload);
      } catch (err) {
        console.warn('Supabase holidays upsert failed:', err);
      }
    }
  }

  // --- NOTICES / ANNOUNCEMENTS ---
  getNotices(): Notice[] {
    return this.getLocal<Notice[]>(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
  }

  async saveNotices(notices: Notice[]): Promise<void> {
    this.setLocal(STORAGE_KEYS.NOTICES, notices);
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = notices.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.content,
          kind: n.priority === 'urgent' ? 'emergency' : 'academic',
          is_emergency: Boolean(n.is_emergency || n.priority === 'urgent'),
          closes_college: Boolean(n.closes_college),
          starts_at: n.startDate ? new Date(n.startDate).toISOString() : new Date().toISOString(),
          expires_at: n.endDate ? new Date(n.endDate).toISOString() : new Date(Date.now() + 86400000 * 30).toISOString(),
          updated_at: new Date().toISOString()
        }));
        await supabase.from('announcements').upsert(payload);
      } catch (err) {
        console.warn('Supabase announcements upsert failed:', err);
      }
    }
  }

  // --- BOOKINGS ---
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

  // --- QUICK OVERRIDES (Timetable Exceptions) ---
  getQuickOverrides(): QuickOverride[] {
    const today = new Date().toISOString().split('T')[0];
    const all = this.getLocal<QuickOverride[]>(STORAGE_KEYS.OVERRIDES, []);
    return all.filter((o) => o.date === today);
  }

  async addQuickOverride(override: Omit<QuickOverride, 'id' | 'createdAt'>): Promise<QuickOverride> {
    const full: QuickOverride = {
      ...override,
      id: 'ov-' + Date.now(),
      createdAt: Date.now()
    };
    const current = this.getLocal<QuickOverride[]>(STORAGE_KEYS.OVERRIDES, []);
    this.setLocal(STORAGE_KEYS.OVERRIDES, [full, ...current]);

    if (isSupabaseConfigured && supabase) {
      try {
        let action: 'cancelled' | 'rescheduled' | 'room_swap' = 'cancelled';
        if (override.type === 'swap_room') action = 'room_swap';
        else if (override.type === 'cancel_class') action = 'cancelled';

        if (override.targetId) {
          await supabase.from('timetable_exceptions').insert({
            id: full.id,
            timetable_entry_id: override.targetId,
            exception_date: override.date,
            action,
            new_classroom_id: override.replacementRoomId || null,
            reason: override.note || null
          });
        }
      } catch (err) {
        console.warn('Supabase exception insert failed:', err);
      }
    }

    return full;
  }

  deleteQuickOverride(id: string): void {
    const current = this.getLocal<QuickOverride[]>(STORAGE_KEYS.OVERRIDES, []);
    this.setLocal(STORAGE_KEYS.OVERRIDES, current.filter((o) => o.id !== id));
  }

  // --- UPLOAD HISTORY & SNAPSHOTS ---
  getUploadHistory(): UploadHistoryItem[] {
    return this.getLocal<UploadHistoryItem[]>(STORAGE_KEYS.UPLOAD_HISTORY, []);
  }

  async saveUploadHistory(item: UploadHistoryItem): Promise<void> {
    const current = this.getUploadHistory();
    const updated = [item, ...current].slice(0, 5);
    this.setLocal(STORAGE_KEYS.UPLOAD_HISTORY, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('upload_history').insert({
          id: item.id,
          file_name: item.fileName,
          row_counts: item.counts,
          status: 'success',
          snapshot: item.previousSnapshot ? JSON.parse(item.previousSnapshot) : null
        });
      } catch (err) {
        console.warn('Supabase upload_history record failed:', err);
      }
    }
  }

  createStateSnapshot(): string {
    return JSON.stringify({
      timetable: this.getTimetable(),
      rooms: this.getRooms(),
      holidays: this.getHolidays(),
      periods: this.getPeriods(),
      notices: this.getNotices(),
      branches: this.getBranches()
    });
  }

  restoreSnapshot(snapshotString: string): boolean {
    try {
      const data = JSON.parse(snapshotString);
      if (data.timetable) this.saveTimetable(data.timetable);
      if (data.rooms) this.saveRooms(data.rooms);
      if (data.holidays) this.saveHolidays(data.holidays);
      if (data.periods) this.savePeriods(data.periods);
      if (data.notices) this.saveNotices(data.notices);
      if (data.branches) this.saveBranches(data.branches);
      return true;
    } catch (err) {
      console.error('Failed to restore snapshot:', err);
      return false;
    }
  }

  // --- SYNC FROM SUPABASE TO LOCALSTORAGE ---
  async syncFromSupabase(): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const dayIndexToName = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      // Fetch all core datasets in parallel
      const [
        settingsRes,
        branchesRes,
        classroomsRes,
        periodsRes,
        timetableRes,
        holidaysRes,
        announcementsRes,
        exceptionsRes
      ] = await Promise.all([
        supabase.from('settings').select('*').maybeSingle(),
        supabase.from('branches').select('*'),
        supabase.from('classrooms').select('*'),
        supabase.from('periods').select('*').order('period_number', { ascending: true }),
        supabase.from('timetable_entries').select('*').eq('is_published', true),
        supabase.from('holidays').select('*'),
        supabase.from('announcements').select('*'),
        supabase.from('timetable_exceptions').select('*')
      ]);

      // 1. Settings
      if (settingsRes.data) {
        const s = settingsRes.data;
        this.setLocal(STORAGE_KEYS.SETTINGS, {
          id: s.id,
          college_name: s.college_name,
          logo_url: s.logo_url,
          timezone: s.timezone || 'Asia/Kolkata',
          academic_year: s.academic_year || '2026-2027',
          working_days: s.working_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          contact_address: s.contact_address,
          contact_phone: s.contact_phone,
          contact_email: s.contact_email
        });
      }

      // 2. Branches
      if (branchesRes.data && branchesRes.data.length > 0) {
        this.setLocal(
          STORAGE_KEYS.BRANCHES,
          branchesRes.data.map((b: any) => ({
            id: b.id,
            name: b.name,
            shortName: b.short_name || b.id,
            short_name: b.short_name || b.id,
            code: b.code || b.id,
            color: b.color || '#4F46E5',
            bgLight: 'bg-indigo-50 text-indigo-700',
            bgDark: 'dark:bg-indigo-950/60 dark:text-indigo-300',
            borderLight: 'border-indigo-200',
            borderDark: 'dark:border-indigo-800',
            textLight: 'text-indigo-600',
            textDark: 'dark:text-indigo-400'
          }))
        );
      }

      // 3. Classrooms
      if (classroomsRes.data && classroomsRes.data.length > 0) {
        this.setLocal(
          STORAGE_KEYS.ROOMS,
          classroomsRes.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            capacity: c.capacity,
            floor: c.floor,
            building: c.building,
            isMaintenance: Boolean(c.is_under_maintenance),
            is_under_maintenance: Boolean(c.is_under_maintenance)
          }))
        );
      }

      // 4. Periods
      if (periodsRes.data && periodsRes.data.length > 0) {
        this.setLocal(
          STORAGE_KEYS.PERIODS,
          periodsRes.data.map((p: any) => ({
            id: p.id,
            order: p.period_number,
            start: p.start_time?.slice(0, 5) || '09:00',
            end: p.end_time?.slice(0, 5) || '09:55',
            start_time: p.start_time,
            end_time: p.end_time,
            label: p.label,
            isBreak: Boolean(p.is_break),
            is_break: Boolean(p.is_break)
          }))
        );
      }

      // 5. Timetable
      if (timetableRes.data && timetableRes.data.length > 0) {
        this.setLocal(
          STORAGE_KEYS.TIMETABLE,
          timetableRes.data.map((t: any) => ({
            id: t.id,
            branch: t.branch_id,
            branch_id: t.branch_id,
            day: dayIndexToName[t.day_of_week] || 'Monday',
            day_of_week: t.day_of_week,
            periodId: t.id,
            subject: t.subject_id,
            subject_id: t.subject_id,
            teacher: t.professor_id,
            professor_id: t.professor_id,
            roomId: t.classroom_id,
            classroom_id: t.classroom_id,
            type: t.class_type,
            class_type: t.class_type,
            start_time: t.start_time,
            end_time: t.end_time,
            is_published: t.is_published
          }))
        );
      }

      // 6. Holidays
      if (holidaysRes.data && holidaysRes.data.length > 0) {
        this.setLocal(
          STORAGE_KEYS.HOLIDAYS,
          holidaysRes.data.map((h: any) => ({
            id: h.id,
            startDate: h.start_date,
            endDate: h.end_date,
            start_date: h.start_date,
            end_date: h.end_date,
            title: h.title,
            type: h.type,
            description: h.greeting || '',
            greeting: h.greeting || '',
            is_whole_college: h.is_whole_college
          }))
        );
      }

      // 7. Announcements / Notices
      if (announcementsRes.data && announcementsRes.data.length > 0) {
        this.setLocal(
          STORAGE_KEYS.NOTICES,
          announcementsRes.data.map((a: any) => ({
            id: a.id,
            title: a.title,
            content: a.body,
            priority: a.is_emergency ? 'urgent' : 'normal',
            startDate: a.starts_at?.split('T')[0] || '',
            endDate: a.expires_at?.split('T')[0] || '',
            active: true,
            is_emergency: a.is_emergency,
            closes_college: a.closes_college
          }))
        );
      }

      return true;
    } catch (err) {
      console.warn('Sync from Supabase caught exception:', err);
      return false;
    }
  }

  // Realtime subscription setup
  setupRealtimeSubscription(onUpdate: () => void): () => void {
    if (!isSupabaseConfigured || !supabase) return () => {};

    try {
      const channel = supabase
        .channel('collegeconnect_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable_entries' }, () => {
          this.syncFromSupabase().then(onUpdate);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable_exceptions' }, () => {
          this.syncFromSupabase().then(onUpdate);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'holidays' }, () => {
          this.syncFromSupabase().then(onUpdate);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
          this.syncFromSupabase().then(onUpdate);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'periods' }, () => {
          this.syncFromSupabase().then(onUpdate);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
          this.syncFromSupabase().then(onUpdate);
        })
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel).catch(() => {});
        }
      };
    } catch {
      return () => {};
    }
  }

  resetToDefaults(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.BRANCHES);
      localStorage.removeItem(STORAGE_KEYS.ROOMS);
      localStorage.removeItem(STORAGE_KEYS.PERIODS);
      localStorage.removeItem(STORAGE_KEYS.TIMETABLE);
      localStorage.removeItem(STORAGE_KEYS.HOLIDAYS);
      localStorage.removeItem(STORAGE_KEYS.NOTICES);
      localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
      localStorage.removeItem(STORAGE_KEYS.OVERRIDES);
      localStorage.removeItem(STORAGE_KEYS.UPLOAD_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (e) {
      console.warn('Error clearing localStorage defaults', e);
    }
  }
}

export const storageService = new StorageService();
