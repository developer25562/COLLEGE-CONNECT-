import * as XLSX from 'xlsx';
import {
  TimetableSlot,
  Room,
  Holiday,
  Period,
  BranchId,
  DayOfWeek,
  ClassType,
  HolidayType,
  ExcelValidationError
} from '../types';

export interface ParsedExcelData {
  timetable: TimetableSlot[];
  rooms: Room[];
  holidays: Holiday[];
  periods: Period[];
  errors: ExcelValidationError[];
  warnings: ExcelValidationError[];
  sheetRowCounts: {
    timetable: number;
    rooms: number;
    holidays: number;
    periods: number;
  };
}

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const VALID_BRANCHES = ['CSE', 'CSE-AI', 'Civil', 'Civil-CA', 'Mechanical'];
const VALID_ROOM_TYPES = ['classroom', 'lab', 'hall', 'workshop'];
const VALID_CLASS_TYPES = ['Lecture', 'Lab', 'Tutorial'];
const VALID_HOLIDAY_TYPES = ['holiday', 'vacation', 'exam', 'sunday'];

// Generate and trigger download of template Excel file
export function generateExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  // 1. Timetable Sheet
  const timetableData = [
    {
      Branch: 'CSE',
      Day: 'Monday',
      Period: '1',
      Start: '09:00',
      End: '09:55',
      Subject: 'Distributed Systems',
      Teacher: 'Dr. Ramesh Sharma',
      Room: 'R201',
      Type: 'Lecture'
    },
    {
      Branch: 'CSE',
      Day: 'Monday',
      Period: '2',
      Start: '09:55',
      End: '10:50',
      Subject: 'Compiler Design',
      Teacher: 'Prof. Anjali Verma',
      Room: 'R201',
      Type: 'Lecture'
    },
    {
      Branch: 'CSE-AI',
      Day: 'Monday',
      Period: '1',
      Start: '09:00',
      End: '09:55',
      Subject: 'Deep Learning & PyTorch',
      Teacher: 'Dr. Arvind Rao',
      Room: 'R202',
      Type: 'Lecture'
    },
    {
      Branch: 'Civil',
      Day: 'Monday',
      Period: '1',
      Start: '09:00',
      End: '09:55',
      Subject: 'Structural Analysis II',
      Teacher: 'Dr. H. P. Joshi',
      Room: 'R101',
      Type: 'Lecture'
    },
    {
      Branch: 'Mechanical',
      Day: 'Monday',
      Period: '1',
      Start: '09:00',
      End: '09:55',
      Subject: 'Thermodynamics & Heat Transfer',
      Teacher: 'Dr. V. K. Bansal',
      Room: 'R103',
      Type: 'Lecture'
    }
  ];
  const wsTimetable = XLSX.utils.json_to_sheet(timetableData);
  XLSX.utils.book_append_sheet(wb, wsTimetable, 'Timetable');

  // 2. Rooms Sheet
  const roomsData = [
    { Room: 'R101', Type: 'classroom', Capacity: 70, Floor: 0 },
    { Room: 'R102', Type: 'classroom', Capacity: 70, Floor: 0 },
    { Room: 'R201', Type: 'classroom', Capacity: 75, Floor: 1 },
    { Room: 'R202', Type: 'classroom', Capacity: 75, Floor: 1 },
    { Room: 'LAB-COMP', Type: 'lab', Capacity: 45, Floor: 1 },
    { Room: 'LAB-AI', Type: 'lab', Capacity: 40, Floor: 2 },
    { Room: 'WORKSHOP', Type: 'workshop', Capacity: 80, Floor: 0 },
    { Room: 'HALL-SEM', Type: 'hall', Capacity: 150, Floor: 0 }
  ];
  const wsRooms = XLSX.utils.json_to_sheet(roomsData);
  XLSX.utils.book_append_sheet(wb, wsRooms, 'Rooms');

  // 3. Holidays Sheet
  const holidaysData = [
    {
      'Start Date': '2026-11-08',
      'End Date': '2026-11-13',
      Title: 'Diwali & New Year Vacation',
      Type: 'vacation'
    },
    {
      'Start Date': '2026-11-24',
      'End Date': '2026-11-24',
      Title: 'Guru Nanak Jayanti',
      Type: 'holiday'
    },
    {
      'Start Date': '2026-12-24',
      'End Date': '2027-01-02',
      Title: 'Winter Break',
      Type: 'vacation'
    }
  ];
  const wsHolidays = XLSX.utils.json_to_sheet(holidaysData);
  XLSX.utils.book_append_sheet(wb, wsHolidays, 'Holidays');

  // 4. Periods Sheet
  const periodsData = [
    { Period: '1', Start: '09:00', End: '09:55', Label: 'Period 1' },
    { Period: '2', Start: '09:55', End: '10:50', Label: 'Period 2' },
    { Period: 'tea', Start: '10:50', End: '11:05', Label: 'Tea Break' },
    { Period: '3', Start: '11:05', End: '12:00', Label: 'Period 3' },
    { Period: '4', Start: '12:00', End: '12:55', Label: 'Period 4' },
    { Period: 'lunch', Start: '12:55', End: '01:45', Label: 'Lunch Break' },
    { Period: '5', Start: '01:45', End: '02:40', Label: 'Period 5' },
    { Period: '6', Start: '02:40', End: '03:35', Label: 'Period 6' },
    { Period: '7', Start: '03:35', End: '04:30', Label: 'Period 7' }
  ];
  const wsPeriods = XLSX.utils.json_to_sheet(periodsData);
  XLSX.utils.book_append_sheet(wb, wsPeriods, 'Periods');

  // Write and download
  XLSX.writeFile(wb, 'CampusPulse_Schedule_Template.xlsx');
}

// Export current application data to Excel
export function exportCurrentDataToExcel(
  timetable: TimetableSlot[],
  rooms: Room[],
  holidays: Holiday[],
  periods: Period[]
): void {
  const wb = XLSX.utils.book_new();

  // Timetable
  const timetableExport = timetable.map((s) => ({
    Branch: s.branch,
    Day: s.day,
    Period: s.periodId,
    Subject: s.subject,
    Teacher: s.teacher,
    Room: s.roomId,
    Type: s.type,
    Notes: s.notes || ''
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(timetableExport), 'Timetable');

  // Rooms
  const roomsExport = rooms.map((r) => ({
    Room: r.id,
    Name: r.name,
    Type: r.type,
    Capacity: r.capacity,
    Floor: r.floor,
    Building: r.building || '',
    UnderMaintenance: r.isMaintenance ? 'Yes' : 'No'
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(roomsExport), 'Rooms');

  // Holidays
  const holidaysExport = holidays.map((h) => ({
    'Start Date': h.startDate,
    'End Date': h.endDate,
    Title: h.title,
    Type: h.type,
    Description: h.description || ''
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(holidaysExport), 'Holidays');

  // Periods
  const periodsExport = periods.map((p) => ({
    Period: p.id,
    Start: p.start,
    End: p.end,
    Label: p.label,
    IsBreak: p.isBreak ? 'Yes' : 'No'
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(periodsExport), 'Periods');

  XLSX.writeFile(wb, `CampusPulse_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Parse and strictly validate uploaded Excel file
export async function parseAndValidateExcel(
  file: File,
  existingRooms: Room[]
): Promise<ParsedExcelData> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const errors: ExcelValidationError[] = [];
  const warnings: ExcelValidationError[] = [];

  const parsedRooms: Room[] = [];
  const parsedTimetable: TimetableSlot[] = [];
  const parsedHolidays: Holiday[] = [];
  const parsedPeriods: Period[] = [];

  const sheetNames = wb.SheetNames;

  // 1. Process Rooms Sheet (if present)
  const roomSheetName = sheetNames.find((s) => s.toLowerCase().includes('room'));
  if (roomSheetName) {
    const rawRows = XLSX.utils.sheet_to_json<any>(wb.Sheets[roomSheetName]);
    rawRows.forEach((row, idx) => {
      const rowNum = idx + 2; // 1-based, accounting for header row
      const roomId = String(row.Room || row.id || row.RoomId || '').trim();
      const type = String(row.Type || row.type || 'classroom').trim().toLowerCase();
      const capacity = parseInt(row.Capacity || row.capacity, 10);
      const floor = parseInt(row.Floor || row.floor, 10);

      if (!roomId) {
        errors.push({
          sheet: roomSheetName,
          row: rowNum,
          column: 'Room',
          type: 'error',
          message: 'Room identifier is empty',
          hint: 'Provide a unique room ID such as R101 or LAB-COMP'
        });
        return;
      }

      if (!VALID_ROOM_TYPES.includes(type)) {
        warnings.push({
          sheet: roomSheetName,
          row: rowNum,
          column: 'Type',
          type: 'warning',
          message: `Unknown room type "${type}"`,
          hint: 'Valid types are: classroom, lab, hall, workshop. Defaulting to classroom.'
        });
      }

      parsedRooms.push({
        id: roomId,
        name: row.Name || roomId,
        type: (VALID_ROOM_TYPES.includes(type) ? type : 'classroom') as any,
        capacity: isNaN(capacity) ? 60 : capacity,
        floor: isNaN(floor) ? 0 : floor,
        building: row.Building || 'Academic Wing'
      });
    });
  }

  // Combined rooms catalog for foreign key checks
  const availableRoomsMap = new Map<string, boolean>();
  existingRooms.forEach((r) => availableRoomsMap.set(r.id.toLowerCase(), true));
  parsedRooms.forEach((r) => availableRoomsMap.set(r.id.toLowerCase(), true));

  // 2. Process Periods Sheet (if present)
  const periodSheetName = sheetNames.find((s) => s.toLowerCase().includes('period'));
  if (periodSheetName) {
    const rawRows = XLSX.utils.sheet_to_json<any>(wb.Sheets[periodSheetName]);
    rawRows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const periodId = String(row.Period || row.id || '').trim();
      const start = String(row.Start || row.start || '').trim();
      const end = String(row.End || row.end || '').trim();
      const label = String(row.Label || row.label || `Period ${periodId}`).trim();

      if (!periodId || !start || !end) {
        errors.push({
          sheet: periodSheetName,
          row: rowNum,
          type: 'error',
          message: 'Period row missing Period ID, Start, or End time',
          hint: 'Ensure Period, Start (e.g. 09:00), and End (e.g. 09:55) are provided'
        });
        return;
      }

      parsedPeriods.push({
        id: isNaN(Number(periodId)) ? periodId : Number(periodId),
        order: idx + 1,
        start,
        end,
        label,
        isBreak: label.toLowerCase().includes('break') || label.toLowerCase().includes('lunch')
      });
    });
  }

  // 3. Process Holidays Sheet (if present)
  const holidaySheetName = sheetNames.find((s) => s.toLowerCase().includes('holiday'));
  if (holidaySheetName) {
    const rawRows = XLSX.utils.sheet_to_json<any>(wb.Sheets[holidaySheetName]);
    rawRows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const startDate = String(row['Start Date'] || row.StartDate || row.start || '').trim();
      const endDate = String(row['End Date'] || row.EndDate || row.end || startDate).trim();
      const title = String(row.Title || row.title || '').trim();
      const type = String(row.Type || row.type || 'holiday').trim().toLowerCase();

      if (!title || !startDate) {
        errors.push({
          sheet: holidaySheetName,
          row: rowNum,
          type: 'error',
          message: 'Holiday missing Title or Start Date',
          hint: 'Ensure Start Date (YYYY-MM-DD) and Title are filled'
        });
        return;
      }

      // Simple regex for YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate)) {
        errors.push({
          sheet: holidaySheetName,
          row: rowNum,
          column: 'Start Date',
          type: 'error',
          message: `Invalid date format "${startDate}"`,
          hint: 'Date must be in YYYY-MM-DD format (e.g. 2026-11-08)'
        });
      }

      parsedHolidays.push({
        id: `h-import-${Date.now()}-${idx}`,
        startDate,
        endDate: endDate || startDate,
        title,
        type: (VALID_HOLIDAY_TYPES.includes(type) ? type : 'holiday') as HolidayType,
        description: row.Description || ''
      });
    });
  }

  // 4. Process Timetable Sheet (Core)
  const timetableSheetName = sheetNames.find((s) => s.toLowerCase().includes('timetable') || s.toLowerCase().includes('schedule')) || sheetNames[0];
  if (timetableSheetName && wb.Sheets[timetableSheetName]) {
    const rawRows = XLSX.utils.sheet_to_json<any>(wb.Sheets[timetableSheetName]);

    // Tracking structures for CLASH DETECTION
    // Key for room clash: `${day}__${periodId}__${roomId.toLowerCase()}`
    const roomOccupancyMap = new Map<string, { rowNum: number; branch: string; subject: string }>();
    // Key for teacher clash: `${day}__${periodId}__${teacher.toLowerCase()}`
    const teacherScheduleMap = new Map<string, { rowNum: number; branch: string; room: string }>();

    rawRows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const branch = String(row.Branch || row.branch || '').trim();
      const day = String(row.Day || row.day || '').trim();
      const periodIdRaw = String(row.Period || row.period || row.periodId || '').trim();
      const periodId = isNaN(Number(periodIdRaw)) ? periodIdRaw : Number(periodIdRaw);
      const subject = String(row.Subject || row.subject || '').trim();
      const teacher = String(row.Teacher || row.teacher || '').trim();
      const roomId = String(row.Room || row.room || row.RoomId || '').trim();
      const type = String(row.Type || row.type || 'Lecture').trim();

      // Check required fields
      if (!branch || !day || !periodIdRaw || !subject || !roomId) {
        errors.push({
          sheet: timetableSheetName,
          row: rowNum,
          type: 'error',
          message: 'Missing required class fields',
          hint: 'Every row requires: Branch, Day, Period, Subject, and Room'
        });
        return;
      }

      // Check Day
      const normalizedDay = VALID_DAYS.find((d) => d.toLowerCase() === day.toLowerCase());
      if (!normalizedDay) {
        errors.push({
          sheet: timetableSheetName,
          row: rowNum,
          column: 'Day',
          type: 'error',
          message: `Invalid day "${day}"`,
          hint: 'Day must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday'
        });
        return;
      }

      // Check Branch
      const normalizedBranch = VALID_BRANCHES.find((b) => b.toLowerCase() === branch.toLowerCase()) as BranchId | undefined;
      if (!normalizedBranch) {
        errors.push({
          sheet: timetableSheetName,
          row: rowNum,
          column: 'Branch',
          type: 'error',
          message: `Unknown branch "${branch}"`,
          hint: 'Valid branches are: CSE, CSE-AI, Civil, Civil-CA, Mechanical'
        });
        return;
      }

      // Check Room existence
      if (!availableRoomsMap.has(roomId.toLowerCase())) {
        warnings.push({
          sheet: timetableSheetName,
          row: rowNum,
          column: 'Room',
          type: 'warning',
          message: `Room "${roomId}" is not in the recognized rooms list`,
          hint: 'Will register room automatically or verify spelling'
        });
      }

      // --- CRITICAL CLASH DETECTION 1: ROOM CLASH ---
      const roomKey = `${normalizedDay}__${periodId}__${roomId.toLowerCase()}`;
      if (roomOccupancyMap.has(roomKey)) {
        const existing = roomOccupancyMap.get(roomKey)!;
        errors.push({
          sheet: timetableSheetName,
          row: rowNum,
          column: 'Room',
          type: 'error',
          message: `ROOM CLASH: Room "${roomId}" is ALREADY assigned to ${existing.branch} (${existing.subject}) at Period ${periodId} on ${normalizedDay} (Row ${existing.rowNum})!`,
          hint: `Two classes cannot share the same room at the same time. Assign another room or change period.`
        });
      } else {
        roomOccupancyMap.set(roomKey, { rowNum, branch: normalizedBranch, subject });
      }

      // --- CRITICAL CLASH DETECTION 2: TEACHER CLASH ---
      if (teacher && teacher.toLowerCase() !== 'tbd' && teacher.toLowerCase() !== 'industry expert') {
        const teacherKey = `${normalizedDay}__${periodId}__${teacher.toLowerCase()}`;
        if (teacherScheduleMap.has(teacherKey)) {
          const existing = teacherScheduleMap.get(teacherKey)!;
          errors.push({
            sheet: timetableSheetName,
            row: rowNum,
            column: 'Teacher',
            type: 'error',
            message: `TEACHER CLASH: "${teacher}" is scheduled in TWO rooms at the same time: ${existing.room} (Row ${existing.rowNum}) and ${roomId} on ${normalizedDay} Period ${periodId}!`,
            hint: `A professor cannot teach two simultaneous classes. Reassign teacher or reschedule slot.`
          });
        } else {
          teacherScheduleMap.set(teacherKey, { rowNum, branch: normalizedBranch, room: roomId });
        }
      }

      parsedTimetable.push({
        id: `slot-imp-${Date.now()}-${idx}`,
        branch: normalizedBranch,
        day: normalizedDay as DayOfWeek,
        periodId,
        subject,
        teacher: teacher || 'Faculty Member',
        roomId,
        type: (VALID_CLASS_TYPES.includes(type) ? type : 'Lecture') as ClassType,
        notes: row.Notes || ''
      });
    });
  }

  return {
    timetable: parsedTimetable,
    rooms: parsedRooms,
    holidays: parsedHolidays,
    periods: parsedPeriods,
    errors,
    warnings,
    sheetRowCounts: {
      timetable: parsedTimetable.length,
      rooms: parsedRooms.length,
      holidays: parsedHolidays.length,
      periods: parsedPeriods.length
    }
  };
}
