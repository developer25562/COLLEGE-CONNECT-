import { DayOfWeek, Period, TimetableSlot } from '../types';
import { timeStringToMinutes } from './timeEngine';

export interface IcsExportOptions {
  branchName: string;
  branchId: string;
  semester?: string;
  collegeName?: string;
  timezone?: string;
  startDate?: Date;
  untilDate?: Date;
}

// Map day name to iCalendar RRULE day abbreviation
const DAY_TO_ICS_BYDAY: Record<DayOfWeek, string> = {
  Monday: 'MO',
  Tuesday: 'TU',
  Wednesday: 'WE',
  Thursday: 'TH',
  Friday: 'FR',
  Saturday: 'SA'
};

// Map day name to JS Date day index (0 = Sun, 1 = Mon, ..., 6 = Sat)
const DAY_TO_JS_DAY_INDEX: Record<DayOfWeek, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

/**
 * Format Date to UTC timestamp for ICS: YYYYMMDDTHHMMSSZ
 */
export function formatIcsUtcDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Format local Date and Time to ICS local format: YYYYMMDDTHHMMSS
 */
export function formatIcsLocalDate(date: Date, timeStr: string): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  
  const [hh, mm] = timeStr.split(':').map((s) => parseInt(s, 10));
  const hours = pad(isNaN(hh) ? 9 : hh);
  const minutes = pad(isNaN(mm) ? 0 : mm);
  return `${year}${month}${day}T${hours}${minutes}00`;
}

/**
 * Escape text according to RFC 5545 section 3.3.11
 */
export function escapeIcsText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Find the next upcoming occurrence of a specific weekday on or after a reference date
 */
export function getNextDayOccurrence(dayName: DayOfWeek, referenceDate: Date = new Date()): Date {
  const targetDay = DAY_TO_JS_DAY_INDEX[dayName];
  const result = new Date(referenceDate);
  result.setHours(0, 0, 0, 0);

  const currentDay = result.getDay();
  let diff = targetDay - currentDay;
  if (diff < 0) {
    diff += 7;
  }
  result.setDate(result.getDate() + diff);
  return result;
}

/**
 * Transforms timetable entries into standard iCalendar (.ics) format.
 * Generates weekly recurring VEVENTs with RFC 5545 compliant RRULEs.
 */
export function transformTimetableToIcs(
  entries: TimetableSlot[],
  periods: Period[],
  options: IcsExportOptions
): string {
  const {
    branchName,
    branchId,
    semester,
    collegeName = 'College Connect Institute of Technology',
    timezone = 'Asia/Kolkata',
    startDate = new Date(),
    untilDate
  } = options;

  // Default semester end date: 16 weeks into the future or end of current academic term
  const targetUntilDate = untilDate || new Date(startDate.getTime() + 16 * 7 * 24 * 60 * 60 * 1000);
  const untilFormatted = formatIcsUtcDate(targetUntilDate);

  const calName = `${branchName || branchId}${semester ? ` - ${semester}` : ''} Class Timetable`;
  const calDescription = `Official class routine for ${branchName || branchId} at ${collegeName}`;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//College Connect//Class Schedule 2.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calName)}`,
    `X-WR-CALDESC:${escapeIcsText(calDescription)}`,
    `X-WR-TIMEZONE:${timezone}`,
    // Standard VTIMEZONE component for Asia/Kolkata
    'BEGIN:VTIMEZONE',
    `TZID:${timezone}`,
    'X-LIC-LOCATION:Asia/Kolkata',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0530',
    'TZOFFSETTO:+0530',
    'TZNAME:IST',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE'
  ];

  const nowFormatted = formatIcsUtcDate(new Date());

  // Filter entries to published ones or valid slots
  const validEntries = entries.filter((e) => e && e.subject && e.day && DAY_TO_ICS_BYDAY[e.day]);

  validEntries.forEach((slot, index) => {
    // Find associated period timings if start_time / end_time are not on slot
    const period = periods.find((p) => p.id === slot.periodId || p.label === slot.periodId);
    const startTimeStr = slot.start_time || period?.start || '09:00';
    const endTimeStr = slot.end_time || period?.end || '09:55';

    const dayName = slot.day;
    const firstOccurrence = getNextDayOccurrence(dayName, startDate);
    const byDay = DAY_TO_ICS_BYDAY[dayName];

    const dtStart = formatIcsLocalDate(firstOccurrence, startTimeStr);
    const dtEnd = formatIcsLocalDate(firstOccurrence, endTimeStr);

    const uid = `tte-${slot.id || `slot-${index}`}-${branchId}-${dayName}@collegeconnect.edu.in`;
    const summary = `${slot.subject} (${slot.type || slot.class_type || 'Lecture'})`;
    const location = slot.roomId || slot.classroom_id || 'Classroom';
    const teacher = slot.teacher || slot.professor_id || 'Faculty';

    const description = [
      `Course: ${slot.subject}`,
      `Type: ${slot.type || slot.class_type || 'Lecture'}`,
      `Faculty: ${teacher}`,
      `Room: ${location}`,
      `Branch: ${branchName} (${branchId})`,
      slot.semester ? `Semester: ${slot.semester}` : null,
      slot.notes ? `Notes: ${slot.notes}` : null,
      `Exported from College Connect Routine Dashboard`
    ]
      .filter(Boolean)
      .join('\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowFormatted}`,
      `CREATED:${nowFormatted}`,
      `LAST-MODIFIED:${nowFormatted}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `LOCATION:${escapeIcsText(location)}`,
      `DTSTART;TZID=${timezone}:${dtStart}`,
      `DTEND;TZID=${timezone}:${dtEnd}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${untilFormatted}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Class starting in 10 minutes',
      'TRIGGER:-PT10M',
      'END:VALARM',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Triggers a client-side download of an .ics file
 */
export function downloadIcsFile(icsContent: string, fileName: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName.endsWith('.ics') ? fileName : `${fileName}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates a direct Google Calendar Web URL to add a single class/event
 */
export function generateGoogleCalendarTemplateUrl(
  slot: TimetableSlot,
  period: Period | undefined,
  options: {
    branchName?: string;
    targetDate?: Date;
    timezone?: string;
  }
): string {
  const { branchName = 'College Routine', targetDate = new Date() } = options;
  const startTimeStr = slot.start_time || period?.start || '09:00';
  const endTimeStr = slot.end_time || period?.end || '09:55';

  const dayOccurrence = getNextDayOccurrence(slot.day, targetDate);
  const [startH, startM] = startTimeStr.split(':').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);

  const startObj = new Date(dayOccurrence);
  startObj.setHours(startH, startM, 0, 0);

  const endObj = new Date(dayOccurrence);
  endObj.setHours(endH, endM, 0, 0);

  const title = encodeURIComponent(`${slot.subject} (${slot.type || 'Class'})`);
  const dates = `${formatIcsUtcDate(startObj)}/${formatIcsUtcDate(endObj)}`;
  const details = encodeURIComponent(
    `Subject: ${slot.subject}\nTeacher: ${slot.teacher}\nRoom: ${slot.roomId}\nBranch: ${branchName}`
  );
  const location = encodeURIComponent(slot.roomId || 'Campus');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&recur=RRULE:FREQ=WEEKLY;BYDAY=${DAY_TO_ICS_BYDAY[slot.day]}`;
}
