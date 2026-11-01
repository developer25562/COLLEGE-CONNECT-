export type BranchId = 'CSE' | 'CSE-AI' | 'Civil' | 'Civil-CA' | 'Mechanical';

export interface Branch {
  id: BranchId;
  name: string;
  shortName: string;
  code: string;
  color: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textLight: string;
  textDark: string;
}

export type RoomType = 'classroom' | 'lab' | 'hall' | 'workshop';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  floor: number | string;
  building?: string;
  isMaintenance?: boolean;
}

export interface Period {
  id: number | string;
  order: number;
  start: string; // "09:00"
  end: string;   // "09:55"
  label: string; // "Period 1" or "Lunch Break"
  isBreak?: boolean;
}

export type ClassType = 'Lecture' | 'Lab' | 'Tutorial';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableSlot {
  id: string;
  branch: BranchId;
  day: DayOfWeek;
  periodId: number | string;
  subject: string;
  teacher: string;
  roomId: string;
  type: ClassType;
  notes?: string;
}

export type HolidayType = 'holiday' | 'vacation' | 'exam' | 'sunday';

export interface Holiday {
  id: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  title: string;
  type: HolidayType;
  description?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'urgent' | 'info';
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface RoomBooking {
  id: string;
  roomId: string;
  bookedBy: string;
  reason: string;
  day: DayOfWeek;
  periodId: number | string;
  date: string;
  createdAt: number;
}

export interface QuickOverride {
  id: string;
  type: 'mark_holiday' | 'cancel_class' | 'swap_room';
  date: string;
  targetId?: string; // timetable slot id or room id
  replacementRoomId?: string;
  note?: string;
  createdAt: number;
}

export interface DerivedRoomStatus {
  room: Room;
  status: 'occupied' | 'free' | 'maintenance' | 'closed';
  currentSlot?: TimetableSlot;
  currentBooking?: RoomBooking;
  nextFreeAt?: string;
  freeUntil?: string;
  upcomingSlots: TimetableSlot[];
}

export interface ExcelValidationError {
  sheet: string;
  row: number;
  column?: string;
  type: 'error' | 'warning';
  message: string;
  hint: string;
}

export interface UploadHistoryItem {
  id: string;
  fileName: string;
  timestamp: number;
  mode: 'replace' | 'merge';
  counts: {
    timetable: number;
    rooms: number;
    holidays: number;
    periods: number;
  };
  previousSnapshot?: string; // serialized state for undo
}
