import {
  Period,
  Room,
  TimetableSlot,
  RoomBooking,
  Holiday,
  QuickOverride,
  DerivedRoomStatus,
  DayOfWeek,
  Notice
} from '../types';

export const SCHEDULED_STATUS_DISCLAIMER = 'Scheduled status based on published timetable, not sensor-verified physical occupancy.';

// Convert "09:00" or "01:45" or "13:45" to minutes from midnight
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;

  // If time is 01:00 - 06:00 and represents afternoon college hours (periods 5, 6, 7)
  if (hours >= 1 && hours <= 6) {
    hours += 12;
  }

  return hours * 60 + minutes;
}

export function minutesToTimeString(minutes: number): string {
  let hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hrs >= 12 ? 'PM' : 'AM';
  if (hrs > 12) hrs -= 12;
  if (hrs === 0) hrs = 12;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export function getDayName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Convert a Date to the college's configured timezone (defaults to Asia/Kolkata)
export function getCollegeZonedTime(
  sourceDate: Date = new Date(),
  timeZone: string = 'Asia/Kolkata'
): {
  date: Date;
  dateStr: string;
  dayName: string;
  currentMinutes: number;
  currentSecs: number;
  timeString: string;
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(sourceDate);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || '00';

    const y = parseInt(get('year'), 10);
    const m = parseInt(get('month'), 10) - 1;
    const d = parseInt(get('day'), 10);
    const hr = parseInt(get('hour'), 10) % 24;
    const min = parseInt(get('minute'), 10);
    const sec = parseInt(get('second'), 10);

    const zonedDate = new Date(y, m, d, hr, min, sec);
    const dateStr = `${y}-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const dayName = getDayName(zonedDate);
    const currentMinutes = hr * 60 + min;

    return {
      date: zonedDate,
      dateStr,
      dayName,
      currentMinutes,
      currentSecs: sec,
      timeString: minutesToTimeString(currentMinutes)
    };
  } catch {
    // Fallback to local system time if timezone identifier is invalid
    const dateStr = sourceDate.toISOString().split('T')[0];
    const hr = sourceDate.getHours();
    const min = sourceDate.getMinutes();
    const currentMinutes = hr * 60 + min;
    return {
      date: sourceDate,
      dateStr,
      dayName: getDayName(sourceDate),
      currentMinutes,
      currentSecs: sourceDate.getSeconds(),
      timeString: minutesToTimeString(currentMinutes)
    };
  }
}

export interface CollegeStatus {
  isOpen: boolean;
  reason?: string;
  badgeType: 'open' | 'closed' | 'holiday' | 'exam' | 'sunday' | 'emergency';
  activePeriod?: Period;
  periodProgressPct: number;
  nextPeriod?: Period;
  secondsUntilNextPeriod: number;
  currentTimeString: string;
  greeting?: string;
  nextWorkingDay?: string;
  isEmergencyClosure?: boolean;
  isEmergency?: boolean;
}

// Find next working day (skips Sundays & all-college holidays)
export function getNextWorkingDay(fromZonedDate: Date, holidays: Holiday[]): string {
  const check = new Date(fromZonedDate);
  for (let i = 1; i <= 30; i++) {
    check.setDate(check.getDate() + 1);
    const day = getDayName(check);
    if (day === 'Sunday') continue;

    const str = `${check.getFullYear()}-${(check.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${check.getDate().toString().padStart(2, '0')}`;

    const isHoliday = holidays.some((h) => {
      const isWhole = h.is_whole_college !== false;
      const s = h.start_date || h.startDate;
      const e = h.end_date || h.endDate || s;
      return isWhole && str >= s && str <= e && h.type !== 'exam';
    });

    if (!isHoliday) {
      return check.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  }
  return 'Next Monday';
}

export function evaluateCollegeStatus(
  simulatedDate: Date,
  periods: Period[],
  holidays: Holiday[] = [],
  quickOverrides: QuickOverride[] = [],
  notices: Notice[] = [],
  timeZone: string = 'Asia/Kolkata',
  targetBranchId?: string
): CollegeStatus {
  const zoned = getCollegeZonedTime(simulatedDate, timeZone);
  const { dateStr, dayName, currentMinutes, currentSecs, timeString } = zoned;

  // 1. Check Emergency Closure Announcements
  const emergencyCloseNotice = notices.find(
    (n) => n.active && (n.closes_college || (n.is_emergency && n.priority === 'urgent'))
  );
  if (emergencyCloseNotice) {
    return {
      isOpen: false,
      reason: `Emergency Closure: ${emergencyCloseNotice.title}`,
      badgeType: 'emergency',
      periodProgressPct: 0,
      secondsUntilNextPeriod: 0,
      currentTimeString: timeString,
      isEmergencyClosure: true,
      isEmergency: true,
      nextWorkingDay: getNextWorkingDay(zoned.date, holidays)
    };
  }

  // 2. Check quick overrides (e.g. admin marked today as holiday)
  const holidayOverride = quickOverrides.find((o) => o.type === 'mark_holiday');
  if (holidayOverride) {
    return {
      isOpen: false,
      reason: holidayOverride.note || 'Special Holiday Declared Today',
      badgeType: 'holiday',
      periodProgressPct: 0,
      secondsUntilNextPeriod: 0,
      currentTimeString: timeString,
      nextWorkingDay: getNextWorkingDay(zoned.date, holidays)
    };
  }

  // 3. Check Sunday
  if (dayName === 'Sunday') {
    return {
      isOpen: false,
      reason: 'Sunday – Weekly Off',
      badgeType: 'sunday',
      periodProgressPct: 0,
      secondsUntilNextPeriod: 0,
      currentTimeString: timeString,
      nextWorkingDay: getNextWorkingDay(zoned.date, holidays)
    };
  }

  // 4. Check Scheduled Holidays / Vacations / Exams (multi-day inclusive)
  for (const h of holidays) {
    const s = h.start_date || h.startDate;
    const e = h.end_date || h.endDate || s;
    const isWhole = h.is_whole_college !== false;

    // If branch specific, only apply if targetBranchId is matched or undefined
    const affectsBranch =
      isWhole ||
      !targetBranchId ||
      !h.branches ||
      h.branches.length === 0 ||
      h.branches.includes(targetBranchId);

    if (dateStr >= s && dateStr <= e && affectsBranch) {
      if (h.type === 'holiday' || h.type === 'vacation') {
        return {
          isOpen: false,
          reason: `${h.title}`,
          greeting: h.greeting || h.description,
          badgeType: 'holiday',
          periodProgressPct: 0,
          secondsUntilNextPeriod: 0,
          currentTimeString: timeString,
          nextWorkingDay: getNextWorkingDay(zoned.date, holidays)
        };
      }
      if (h.type === 'exam') {
        return {
          isOpen: true,
          reason: `${h.title} in Progress`,
          greeting: h.greeting || 'Examinations in progress - quiet hours in effect',
          badgeType: 'exam',
          periodProgressPct: 50,
          secondsUntilNextPeriod: 0,
          currentTimeString: timeString
        };
      }
    }
  }

  // 5. College Operating Hours: 08:30 AM (510 mins) to 05:00 PM (1020 mins)
  const collegeStartMin = 8 * 60 + 30; // 08:30 AM
  const collegeEndMin = 17 * 60;       // 05:00 PM

  if (currentMinutes < collegeStartMin) {
    return {
      isOpen: false,
      reason: 'Before Hours – Opens at 08:30 AM',
      badgeType: 'closed',
      periodProgressPct: 0,
      secondsUntilNextPeriod: (collegeStartMin - currentMinutes) * 60 - currentSecs,
      currentTimeString: timeString
    };
  }

  if (currentMinutes >= collegeEndMin) {
    return {
      isOpen: false,
      reason: 'College Closed for the Day (After Hours)',
      badgeType: 'closed',
      periodProgressPct: 0,
      secondsUntilNextPeriod: 0,
      currentTimeString: timeString,
      nextWorkingDay: getNextWorkingDay(zoned.date, holidays)
    };
  }

  // 6. Find current running period or break
  let activePeriod: Period | undefined;
  let periodProgressPct = 0;
  let nextPeriod: Period | undefined;
  let secondsUntilNextPeriod = 0;

  const sortedPeriods = [...periods].sort(
    (a, b) => timeStringToMinutes(a.start) - timeStringToMinutes(b.start)
  );

  for (let i = 0; i < sortedPeriods.length; i++) {
    const p = sortedPeriods[i];
    const pStartMin = timeStringToMinutes(p.start);
    const pEndMin = timeStringToMinutes(p.end);

    // [start, end) rule: Class occupies until exactly end time
    if (currentMinutes >= pStartMin && currentMinutes < pEndMin) {
      activePeriod = p;
      const totalPeriodSecs = (pEndMin - pStartMin) * 60;
      const elapsedSecs = (currentMinutes - pStartMin) * 60 + currentSecs;
      periodProgressPct = Math.min(100, Math.max(0, Math.round((elapsedSecs / totalPeriodSecs) * 100)));
      
      if (i + 1 < sortedPeriods.length) {
        nextPeriod = sortedPeriods[i + 1];
        secondsUntilNextPeriod = totalPeriodSecs - elapsedSecs;
      }
      break;
    } else if (currentMinutes < pStartMin) {
      if (!nextPeriod) {
        nextPeriod = p;
        secondsUntilNextPeriod = (pStartMin - currentMinutes) * 60 - currentSecs;
      }
    }
  }

  return {
    isOpen: true,
    reason: activePeriod
      ? activePeriod.isBreak || activePeriod.is_break
        ? activePeriod.label
        : `${activePeriod.label} Running`
      : 'Between Classes',
    badgeType: 'open',
    activePeriod,
    periodProgressPct,
    nextPeriod,
    secondsUntilNextPeriod: Math.max(0, secondsUntilNextPeriod),
    currentTimeString: timeString
  };
}

// Calculate days until next holiday
export function getDaysUntilNextHoliday(
  currentDate: Date,
  holidays: Holiday[],
  timeZone: string = 'Asia/Kolkata'
): { days: number; title: string; greeting?: string } | null {
  const zoned = getCollegeZonedTime(currentDate, timeZone);
  const todayStr = zoned.dateStr;

  const upcoming = holidays
    .filter((h) => {
      const s = h.start_date || h.startDate;
      return s >= todayStr && h.type !== 'exam';
    })
    .sort((a, b) => (a.start_date || a.startDate).localeCompare(b.start_date || b.startDate));

  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const nextStart = next.start_date || next.startDate;
  const targetDate = new Date(nextStart);
  const diffTime = targetDate.getTime() - zoned.date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    days: Math.max(0, diffDays),
    title: next.title,
    greeting: next.greeting || next.description
  };
}

// Derive availability of all rooms right now
export function deriveAllRoomStatuses(
  rooms: Room[],
  timetable: TimetableSlot[],
  bookings: RoomBooking[],
  periods: Period[],
  activeDay: DayOfWeek | string,
  currentMinutes: number,
  isOpen: boolean
): DerivedRoomStatus[] {
  const sortedPeriods = [...periods].sort(
    (a, b) => timeStringToMinutes(a.start) - timeStringToMinutes(b.start)
  );

  let activePeriodIndex = -1;
  let activePeriod: Period | undefined;
  for (let i = 0; i < sortedPeriods.length; i++) {
    const p = sortedPeriods[i];
    const s = timeStringToMinutes(p.start);
    const e = timeStringToMinutes(p.end);
    if (currentMinutes >= s && currentMinutes < e) {
      activePeriod = p;
      activePeriodIndex = i;
      break;
    }
  }

  return rooms.map((room) => {
    // 1. Maintenance
    if (room.isMaintenance || room.is_under_maintenance) {
      return {
        room,
        status: 'maintenance',
        upcomingSlots: []
      };
    }

    // 2. If college is closed (e.g. holiday or outside hours)
    if (!isOpen) {
      return {
        room,
        status: 'closed',
        upcomingSlots: []
      };
    }

    if (!DAYS_OF_WEEK.includes(activeDay as DayOfWeek)) {
      return {
        room,
        status: 'closed',
        upcomingSlots: []
      };
    }

    // Filter slots today for this room
    const todaySlots = timetable.filter(
      (slot) => (slot.roomId === room.id || slot.classroom_id === room.id) && slot.day === activeDay
    );

    const todayBookings = bookings.filter(
      (b) => b.roomId === room.id && b.day === activeDay
    );

    let currentSlot: TimetableSlot | undefined;
    let currentBooking: RoomBooking | undefined;

    if (activePeriod) {
      currentSlot = todaySlots.find(
        (s) =>
          String(s.periodId) === String(activePeriod!.id) ||
          (s.start_time && s.start_time.slice(0, 5) === activePeriod!.start)
      );
      currentBooking = todayBookings.find((b) => String(b.periodId) === String(activePeriod!.id));
    }

    const upcomingSlots = todaySlots.filter((slot) => {
      const p = sortedPeriods.find(
        (per) =>
          String(per.id) === String(slot.periodId) ||
          (slot.start_time && per.start === slot.start_time.slice(0, 5))
      );
      if (!p) return false;
      return timeStringToMinutes(p.start) > currentMinutes;
    }).sort((a, b) => {
      const pa = sortedPeriods.find((per) => String(per.id) === String(a.periodId));
      const pb = sortedPeriods.find((per) => String(per.id) === String(b.periodId));
      return (pa ? timeStringToMinutes(pa.start) : 0) - (pb ? timeStringToMinutes(pb.start) : 0);
    });

    if (currentSlot || currentBooking) {
      let freeAt = activePeriod ? activePeriod.end : 'End of period';
      if (activePeriodIndex >= 0) {
        let checkIdx = activePeriodIndex + 1;
        while (checkIdx < sortedPeriods.length) {
          const nextP = sortedPeriods[checkIdx];
          const hasConsecutiveClass = todaySlots.some(
            (s) =>
              String(s.periodId) === String(nextP.id) ||
              (s.start_time && s.start_time.slice(0, 5) === nextP.start)
          );
          const hasConsecutiveBooking = todayBookings.some((b) => String(b.periodId) === String(nextP.id));
          if (hasConsecutiveClass || hasConsecutiveBooking) {
            freeAt = nextP.end;
            checkIdx++;
          } else {
            break;
          }
        }
      }

      return {
        room,
        status: 'occupied',
        currentSlot,
        currentClass: currentSlot,
        currentBooking,
        nextFreeAt: freeAt,
        upcomingSlots
      };
    }

    let freeUntil = 'End of Day (04:30 PM)';
    if (upcomingSlots.length > 0) {
      const nextSlot = upcomingSlots[0];
      const p = sortedPeriods.find(
        (per) => per.id === nextSlot.periodId || (nextSlot.start_time && per.start === nextSlot.start_time.slice(0, 5))
      );
      if (p) {
        freeUntil = p.start;
      }
    }

    return {
      room,
      status: 'free',
      freeUntil,
      upcomingSlots
    };
  });
}
