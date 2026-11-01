import {
  Period,
  Room,
  TimetableSlot,
  RoomBooking,
  Holiday,
  QuickOverride,
  DerivedRoomStatus,
  DayOfWeek
} from '../types';

// Convert "09:00" or "01:45" or "13:45" to minutes from midnight
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;

  // If time is 01:00 - 05:00 and represents afternoon college hours (periods 5, 6, 7)
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

export interface CollegeStatus {
  isOpen: boolean;
  reason?: string;
  badgeType: 'open' | 'closed' | 'holiday' | 'exam' | 'sunday';
  activePeriod?: Period;
  periodProgressPct: number;
  nextPeriod?: Period;
  secondsUntilNextPeriod: number;
  currentTimeString: string;
}

export function evaluateCollegeStatus(
  simulatedDate: Date,
  periods: Period[],
  holidays: Holiday[],
  quickOverrides: QuickOverride[]
): CollegeStatus {
  const dayName = getDayName(simulatedDate);
  const dateStr = simulatedDate.toISOString().split('T')[0];
  const currentMinutes = simulatedDate.getHours() * 60 + simulatedDate.getMinutes();
  const currentSecs = simulatedDate.getSeconds();
  const currentTimeString = minutesToTimeString(currentMinutes);

  // 1. Check quick overrides (e.g. admin marked today as holiday)
  const holidayOverride = quickOverrides.find((o) => o.type === 'mark_holiday');
  if (holidayOverride) {
    return {
      isOpen: false,
      reason: holidayOverride.note || 'Special Holiday Declared Today',
      badgeType: 'holiday',
      periodProgressPct: 0,
      secondsUntilNextPeriod: 0,
      currentTimeString
    };
  }

  // 2. Check Sunday
  if (dayName === 'Sunday') {
    return {
      isOpen: false,
      reason: 'Sunday – Campus Closed',
      badgeType: 'sunday',
      periodProgressPct: 0,
      secondsUntilNextPeriod: 0,
      currentTimeString
    };
  }

  // 3. Check Scheduled Holidays / Vacations / Exams
  for (const h of holidays) {
    if (dateStr >= h.startDate && dateStr <= h.endDate) {
      if (h.type === 'holiday') {
        return {
          isOpen: false,
          reason: `${h.title}`,
          badgeType: 'holiday',
          periodProgressPct: 0,
          secondsUntilNextPeriod: 0,
          currentTimeString
        };
      }
      if (h.type === 'vacation') {
        return {
          isOpen: false,
          reason: `${h.title}`,
          badgeType: 'holiday',
          periodProgressPct: 0,
          secondsUntilNextPeriod: 0,
          currentTimeString
        };
      }
      if (h.type === 'exam') {
        // Exam days are open
        return {
          isOpen: true,
          reason: `${h.title}`,
          badgeType: 'exam',
          periodProgressPct: 50,
          secondsUntilNextPeriod: 0,
          currentTimeString
        };
      }
    }
  }

  // 4. College Hours: 08:30 AM (510 mins) to 05:00 PM (1020 mins)
  const collegeStartMin = 8 * 60 + 30; // 8:30 AM
  const collegeEndMin = 17 * 60;       // 5:00 PM

  if (currentMinutes < collegeStartMin) {
    return {
      isOpen: false,
      reason: 'Before Hours – Opens at 08:30 AM',
      badgeType: 'closed',
      periodProgressPct: 0,
      secondsUntilNextPeriod: (collegeStartMin - currentMinutes) * 60 - currentSecs,
      currentTimeString
    };
  }

  if (currentMinutes >= collegeEndMin) {
    return {
      isOpen: false,
      reason: 'College Closed for the Day (After Hours)',
      badgeType: 'closed',
      periodProgressPct: 0,
      secondsUntilNextPeriod: 0,
      currentTimeString
    };
  }

  // 5. Find current running period or break
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

    if (currentMinutes >= pStartMin && currentMinutes < pEndMin) {
      activePeriod = p;
      const totalPeriodSecs = (pEndMin - pStartMin) * 60;
      const elapsedSecs = (currentMinutes - pStartMin) * 60 + currentSecs;
      periodProgressPct = Math.min(100, Math.max(0, Math.round((elapsedSecs / totalPeriodSecs) * 100)));
      
      // Next period
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
    reason: activePeriod ? (activePeriod.isBreak ? activePeriod.label : `${activePeriod.label} Running`) : 'Between Classes',
    badgeType: 'open',
    activePeriod,
    periodProgressPct,
    nextPeriod,
    secondsUntilNextPeriod: Math.max(0, secondsUntilNextPeriod),
    currentTimeString
  };
}

// Calculate days until next holiday
export function getDaysUntilNextHoliday(currentDate: Date, holidays: Holiday[]): { days: number; title: string } | null {
  const todayStr = currentDate.toISOString().split('T')[0];
  const upcoming = holidays
    .filter((h) => h.startDate >= todayStr && h.type !== 'exam')
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const targetDate = new Date(next.startDate);
  const diffTime = targetDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return {
    days: Math.max(0, diffDays),
    title: next.title
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

  // Find active period index
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
    if (room.isMaintenance) {
      return {
        room,
        status: 'maintenance',
        upcomingSlots: []
      };
    }

    // 2. If college is closed
    if (!isOpen) {
      return {
        room,
        status: 'closed',
        upcomingSlots: []
      };
    }

    // If day is not a teaching day (e.g. Sunday)
    if (!DAYS_OF_WEEK.includes(activeDay as DayOfWeek)) {
      return {
        room,
        status: 'closed',
        upcomingSlots: []
      };
    }

    // All slots today for this room
    const todaySlots = timetable.filter(
      (slot) => slot.roomId === room.id && slot.day === activeDay
    );

    // Bookings today for this room
    const todayBookings = bookings.filter(
      (b) => b.roomId === room.id && b.day === activeDay
    );

    // If we are during an active period
    let currentSlot: TimetableSlot | undefined;
    let currentBooking: RoomBooking | undefined;

    if (activePeriod) {
      currentSlot = todaySlots.find((s) => s.periodId === activePeriod!.id);
      currentBooking = todayBookings.find((b) => b.periodId === activePeriod!.id);
    }

    // Filter upcoming slots for remainder of today
    const upcomingSlots = todaySlots.filter((slot) => {
      const p = sortedPeriods.find((per) => per.id === slot.periodId);
      if (!p) return false;
      return timeStringToMinutes(p.start) > currentMinutes;
    }).sort((a, b) => {
      const pa = sortedPeriods.find((per) => per.id === a.periodId);
      const pb = sortedPeriods.find((per) => per.id === b.periodId);
      return (pa ? timeStringToMinutes(pa.start) : 0) - (pb ? timeStringToMinutes(pb.start) : 0);
    });

    if (currentSlot || currentBooking) {
      // Find when it becomes free (could be consecutive periods, e.g. 2-hour lab)
      let freeAt = activePeriod ? activePeriod.end : 'End of period';
      if (activePeriodIndex >= 0) {
        let checkIdx = activePeriodIndex + 1;
        while (checkIdx < sortedPeriods.length) {
          const nextP = sortedPeriods[checkIdx];
          const hasConsecutiveClass = todaySlots.some((s) => s.periodId === nextP.id);
          const hasConsecutiveBooking = todayBookings.some((b) => b.periodId === nextP.id);
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
        currentBooking,
        nextFreeAt: freeAt,
        upcomingSlots
      };
    }

    // Room is Free! Calculate free until when
    let freeUntil = 'End of Day (04:30 PM)';
    if (upcomingSlots.length > 0) {
      const nextSlot = upcomingSlots[0];
      const p = sortedPeriods.find((per) => per.id === nextSlot.periodId);
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
