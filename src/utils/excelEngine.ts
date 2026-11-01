import * as XLSX from 'xlsx';
import {
  TimetableSlot,
  Room,
  Holiday,
  Period,
  Subject,
  Professor,
  Semester,
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
  subjects: Subject[];
  professors: Professor[];
  errors: ExcelValidationError[];
  warnings: ExcelValidationError[];
  sheetRowCounts: {
    timetable: number;
    rooms: number;
    holidays: number;
    periods: number;
    subjects: number;
    professors: number;
  };
}

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const VALID_BRANCHES = ['CSE', 'CSE-AI', 'Civil', 'Civil-CA', 'Mechanical'];
const VALID_ROOM_TYPES = ['classroom', 'lab', 'hall', 'workshop'];
const VALID_CLASS_TYPES = ['Lecture', 'Lab', 'Tutorial'];
const VALID_HOLIDAY_TYPES = ['holiday', 'vacation', 'exam'];

// Helper to convert time strings "HH:MM"
export function isValidTime(t: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(t.trim());
}

// Convert "09:00" to minutes for interval overlap check
function toMin(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  if (h >= 1 && h <= 6) h += 12; // Afternoon college hours
  return h * 60 + m;
}

// Intervals overlap if max(start1, start2) < min(end1, end2)
function intervalsOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  const start1 = toMin(s1);
  const end1 = toMin(e1);
  const start2 = toMin(s2);
  const end2 = toMin(e2);
  return Math.max(start1, start2) < Math.min(end1, end2);
}

// 1. Generate & download complete 6-sheet Excel Template
export function generateExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Timetable
  const timetableData = [
    {
      Branch: 'CSE',
      Semester: 'SEM5',
      Day: 'Monday',
      Start: '09:00',
      End: '09:55',
      'Subject Code': 'CS501',
      Teacher: 'Dr. Ramesh Sharma',
      Room: 'R201',
      Type: 'Lecture'
    },
    {
      Branch: 'CSE',
      Semester: 'SEM5',
      Day: 'Monday',
      Start: '09:55',
      End: '10:50',
      'Subject Code': 'CS502',
      Teacher: 'Prof. Anjali Verma',
      Room: 'R201',
      Type: 'Lecture'
    },
    {
      Branch: 'CSE-AI',
      Semester: 'SEM5',
      Day: 'Monday',
      Start: '09:00',
      End: '09:55',
      'Subject Code': 'AI501',
      Teacher: 'Dr. Arvind Rao',
      Room: 'R202',
      Type: 'Lecture'
    },
    {
      Branch: 'Civil',
      Semester: 'SEM5',
      Day: 'Monday',
      Start: '09:00',
      End: '09:55',
      'Subject Code': 'CE501',
      Teacher: 'Dr. H. P. Joshi',
      Room: 'R101',
      Type: 'Lecture'
    },
    {
      Branch: 'Mechanical',
      Semester: 'SEM5',
      Day: 'Monday',
      Start: '09:00',
      End: '09:55',
      'Subject Code': 'ME501',
      Teacher: 'Dr. V. K. Bansal',
      Room: 'R103',
      Type: 'Lecture'
    }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(timetableData), 'Timetable');

  // Sheet 2: Rooms
  const roomsData = [
    { Room: 'R101', Name: 'Room 101', Type: 'classroom', Capacity: 70, Floor: 0, Building: 'Block A', Maintenance: 'No' },
    { Room: 'R102', Name: 'Room 102', Type: 'classroom', Capacity: 70, Floor: 0, Building: 'Block A', Maintenance: 'No' },
    { Room: 'R201', Name: 'Room 201', Type: 'classroom', Capacity: 75, Floor: 1, Building: 'Block A', Maintenance: 'No' },
    { Room: 'R202', Name: 'Room 202', Type: 'classroom', Capacity: 75, Floor: 1, Building: 'Block A', Maintenance: 'No' },
    { Room: 'LAB-COMP', Name: 'Computer Lab 1', Type: 'lab', Capacity: 45, Floor: 1, Building: 'IT Centre', Maintenance: 'No' },
    { Room: 'LAB-AI', Name: 'AI & Robotics Lab', Type: 'lab', Capacity: 40, Floor: 2, Building: 'IT Centre', Maintenance: 'No' },
    { Room: 'LAB-CAD', Name: 'Civil CAD Lab', Type: 'lab', Capacity: 40, Floor: 1, Building: 'Civil Block', Maintenance: 'No' },
    { Room: 'HALL-SEM', Name: 'Seminar Hall A', Type: 'hall', Capacity: 150, Floor: 0, Building: 'Auditorium', Maintenance: 'No' }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(roomsData), 'Rooms');

  // Sheet 3: Periods
  const periodsData = [
    { Period: 1, Start: '09:00', End: '09:55', Label: 'Period 1', IsBreak: 'No' },
    { Period: 2, Start: '09:55', End: '10:50', Label: 'Period 2', IsBreak: 'No' },
    { Period: 3, Start: '10:50', End: '11:05', Label: 'Tea Break', IsBreak: 'Yes' },
    { Period: 4, Start: '11:05', End: '12:00', Label: 'Period 3', IsBreak: 'No' },
    { Period: 5, Start: '12:00', End: '12:55', Label: 'Period 4', IsBreak: 'No' },
    { Period: 6, Start: '12:55', End: '13:45', Label: 'Lunch Break', IsBreak: 'Yes' },
    { Period: 7, Start: '13:45', End: '14:40', Label: 'Period 5', IsBreak: 'No' },
    { Period: 8, Start: '14:40', End: '15:35', Label: 'Period 6', IsBreak: 'No' },
    { Period: 9, Start: '15:35', End: '16:30', Label: 'Period 7', IsBreak: 'No' }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(periodsData), 'Periods');

  // Sheet 4: Holidays
  const holidaysData = [
    { 'Start Date': '2026-11-08', 'End Date': '2026-11-13', Title: 'Diwali & New Year Vacation', Type: 'vacation', Greeting: 'Happy Diwali', 'Whole College': 'Yes' },
    { 'Start Date': '2026-11-24', 'End Date': '2026-11-24', Title: 'Guru Nanak Jayanti', Type: 'holiday', Greeting: 'Happy Guru Nanak Jayanti', 'Whole College': 'Yes' },
    { 'Start Date': '2026-12-24', 'End Date': '2027-01-02', Title: 'Winter Break', Type: 'vacation', Greeting: 'Season Greetings', 'Whole College': 'Yes' },
    { 'Start Date': '2026-11-16', 'End Date': '2026-11-21', Title: 'Mid-Semester Examinations', Type: 'exam', Greeting: 'Exams in progress', 'Whole College': 'Yes' }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(holidaysData), 'Holidays');

  // Sheet 5: Subjects
  const subjectsData = [
    { 'Subject Code': 'CS501', Name: 'Distributed Systems', Branch: 'CSE', Semester: 'SEM5' },
    { 'Subject Code': 'CS502', Name: 'Compiler Design', Branch: 'CSE', Semester: 'SEM5' },
    { 'Subject Code': 'AI501', Name: 'Deep Learning & PyTorch', Branch: 'CSE-AI', Semester: 'SEM5' },
    { 'Subject Code': 'CE501', Name: 'Structural Analysis II', Branch: 'Civil', Semester: 'SEM5' },
    { 'Subject Code': 'ME501', Name: 'Thermodynamics & Heat Transfer', Branch: 'Mechanical', Semester: 'SEM5' }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(subjectsData), 'Subjects');

  // Sheet 6: Professors
  const professorsData = [
    { ID: 'prof_sharma', Name: 'Dr. Ramesh Sharma', Email: 'r.sharma@collegeconnect.edu.in', Department: 'CSE' },
    { ID: 'prof_verma', Name: 'Prof. Anjali Verma', Email: 'a.verma@collegeconnect.edu.in', Department: 'CSE' },
    { ID: 'prof_rao', Name: 'Dr. Arvind Rao', Email: 'a.rao@collegeconnect.edu.in', Department: 'CSE-AI' },
    { ID: 'prof_joshi', Name: 'Dr. H. P. Joshi', Email: 'h.joshi@collegeconnect.edu.in', Department: 'Civil' },
    { ID: 'prof_bansal', Name: 'Dr. V. K. Bansal', Email: 'v.bansal@collegeconnect.edu.in', Department: 'Mechanical' }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(professorsData), 'Professors');

  XLSX.writeFile(wb, 'CollegeConnect_Schedule_Template.xlsx');
}

// 2. Export current active data to multi-sheet Excel
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
    Semester: s.semester || 'SEM5',
    Day: s.day,
    Start: s.start_time || '09:00',
    End: s.end_time || '09:55',
    'Subject Code': s.subject,
    Teacher: s.teacher,
    Room: s.roomId,
    Type: s.type,
    Published: s.is_published !== false ? 'Yes' : 'No'
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
    Maintenance: r.isMaintenance || r.is_under_maintenance ? 'Yes' : 'No'
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(roomsExport), 'Rooms');

  // Periods
  const periodsExport = periods.map((p) => ({
    Period: p.order,
    Start: p.start,
    End: p.end,
    Label: p.label,
    IsBreak: p.isBreak || p.is_break ? 'Yes' : 'No'
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(periodsExport), 'Periods');

  // Holidays
  const holidaysExport = holidays.map((h) => ({
    'Start Date': h.startDate || h.start_date,
    'End Date': h.endDate || h.end_date,
    Title: h.title,
    Type: h.type,
    Greeting: h.greeting || h.description || '',
    'Whole College': h.is_whole_college !== false ? 'Yes' : 'No'
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(holidaysExport), 'Holidays');

  XLSX.writeFile(wb, `CollegeConnect_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// 3. Strict Parser and Clash Validator for Excel/CSV
export async function parseAndValidateExcel(
  file: File,
  existingRooms: Room[],
  existingTimetable: TimetableSlot[] = []
): Promise<ParsedExcelData> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const errors: ExcelValidationError[] = [];
  const warnings: ExcelValidationError[] = [];

  const parsedRooms: Room[] = [];
  const parsedTimetable: TimetableSlot[] = [];
  const parsedHolidays: Holiday[] = [];
  const parsedPeriods: Period[] = [];
  const parsedSubjects: Subject[] = [];
  const parsedProfessors: Professor[] = [];

  const sheetNames = wb.SheetNames;

  // 1. Parse Rooms
  const roomSheetName = sheetNames.find((s) => s.toLowerCase().includes('room'));
  if (roomSheetName && wb.Sheets[roomSheetName]) {
    const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets[roomSheetName]);
    rows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const roomId = String(row.Room || row.id || row.RoomId || '').trim();
      const type = String(row.Type || row.type || 'classroom').trim().toLowerCase();
      const capacity = parseInt(row.Capacity || row.capacity, 10);
      const floor = parseInt(row.Floor || row.floor, 10);
      const maint = String(row.Maintenance || row.is_under_maintenance || '').toLowerCase();

      if (!roomId) {
        errors.push({
          sheet: roomSheetName,
          row: rowNum,
          column: 'Room',
          type: 'error',
          message: 'Room identifier is empty',
          hint: 'Provide a valid unique room ID (e.g. R101 or LAB-COMP)'
        });
        return;
      }

      parsedRooms.push({
        id: roomId.toUpperCase(),
        name: row.Name || roomId,
        type: (VALID_ROOM_TYPES.includes(type) ? type : 'classroom') as any,
        capacity: isNaN(capacity) ? 60 : capacity,
        floor: isNaN(floor) ? 0 : floor,
        building: row.Building || 'Academic Wing',
        isMaintenance: maint === 'yes' || maint === 'true',
        is_under_maintenance: maint === 'yes' || maint === 'true'
      });
    });
  }

  // Combined room map for reference
  const roomSet = new Set<string>();
  existingRooms.forEach((r) => roomSet.add(r.id.toLowerCase()));
  parsedRooms.forEach((r) => roomSet.add(r.id.toLowerCase()));

  // 2. Parse Periods
  const periodSheetName = sheetNames.find((s) => s.toLowerCase().includes('period'));
  if (periodSheetName && wb.Sheets[periodSheetName]) {
    const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets[periodSheetName]);
    rows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const periodOrder = parseInt(row.Period || row.period || row.order || (idx + 1), 10);
      const start = String(row.Start || row.start || '').trim();
      const end = String(row.End || row.end || '').trim();
      const label = String(row.Label || row.label || `Period ${periodOrder}`).trim();
      const isBreak = String(row.IsBreak || row.is_break || '').toLowerCase() === 'yes';

      if (!start || !end) {
        errors.push({
          sheet: periodSheetName,
          row: rowNum,
          type: 'error',
          message: 'Missing Start or End time',
          hint: 'Format must be HH:MM (e.g. 09:00)'
        });
        return;
      }

      parsedPeriods.push({
        id: `p_${periodOrder}`,
        order: periodOrder,
        start,
        end,
        label,
        isBreak,
        is_break: isBreak
      });
    });
  }

  // 3. Parse Holidays
  const holidaySheetName = sheetNames.find((s) => s.toLowerCase().includes('holiday'));
  if (holidaySheetName && wb.Sheets[holidaySheetName]) {
    const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets[holidaySheetName]);
    rows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const startDate = String(row['Start Date'] || row.StartDate || row.start || '').trim();
      const endDate = String(row['End Date'] || row.EndDate || row.end || startDate).trim();
      const title = String(row.Title || row.title || '').trim();
      const type = String(row.Type || row.type || 'holiday').trim().toLowerCase();
      const whole = String(row['Whole College'] || row.is_whole_college || 'yes').toLowerCase() !== 'no';

      if (!title || !startDate) {
        errors.push({
          sheet: holidaySheetName,
          row: rowNum,
          type: 'error',
          message: 'Missing Title or Start Date',
          hint: 'Fill in Title and Start Date (YYYY-MM-DD)'
        });
        return;
      }

      parsedHolidays.push({
        id: `hol_${Date.now()}_${idx}`,
        startDate,
        endDate: endDate || startDate,
        title,
        type: (VALID_HOLIDAY_TYPES.includes(type) ? type : 'holiday') as any,
        greeting: row.Greeting || '',
        description: row.Greeting || '',
        is_whole_college: whole
      });
    });
  }

  // 4. Parse Subjects
  const subjectSheetName = sheetNames.find((s) => s.toLowerCase().includes('subject'));
  if (subjectSheetName && wb.Sheets[subjectSheetName]) {
    const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets[subjectSheetName]);
    rows.forEach((row) => {
      const code = String(row['Subject Code'] || row.code || row.id || '').trim();
      const name = String(row.Name || row.name || code).trim();
      if (code) {
        parsedSubjects.push({
          id: code,
          code,
          name,
          branch_id: row.Branch || row.branch_id,
          semester_id: row.Semester || row.semester_id
        });
      }
    });
  }

  // 5. Parse Professors
  const profSheetName = sheetNames.find((s) => s.toLowerCase().includes('prof'));
  if (profSheetName && wb.Sheets[profSheetName]) {
    const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets[profSheetName]);
    rows.forEach((row) => {
      const name = String(row.Name || row.name || '').trim();
      const id = String(row.ID || row.id || name.toLowerCase().replace(/\s+/g, '_')).trim();
      if (name) {
        parsedProfessors.push({
          id,
          name,
          email: row.Email || row.email,
          department: row.Department || row.department
        });
      }
    });
  }

  // 6. Parse Timetable with Overlap & Clash Detection
  const timetableSheetName =
    sheetNames.find((s) => s.toLowerCase().includes('timetable') || s.toLowerCase().includes('schedule')) ||
    sheetNames[0];

  if (timetableSheetName && wb.Sheets[timetableSheetName]) {
    const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets[timetableSheetName]);

    // Clash Tracking Structures:
    // Room clash: day -> list of { rowNum, start, end, roomId, branch, subject }
    const roomBookingList: Array<{ rowNum: number; day: string; start: string; end: string; roomId: string; branch: string; subject: string }> = [];
    // Professor clash: day -> list of { rowNum, start, end, teacher, branch, roomId }
    const profBookingList: Array<{ rowNum: number; day: string; start: string; end: string; teacher: string; branch: string; roomId: string }> = [];

    rows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const branch = String(row.Branch || row.branch || '').trim();
      const semester = String(row.Semester || row.semester || 'SEM5').trim();
      const day = String(row.Day || row.day || '').trim();
      const start = String(row.Start || row.start || row.start_time || '09:00').trim();
      const end = String(row.End || row.end || row.end_time || '09:55').trim();
      const subject = String(row['Subject Code'] || row.Subject || row.subject || '').trim();
      const teacher = String(row.Teacher || row.Professor || row.teacher || '').trim();
      const roomId = String(row.Room || row.Classroom || row.room || '').trim().toUpperCase();
      const type = String(row.Type || row.type || 'Lecture').trim();

      // Required fields check
      if (!branch || !day || !subject || !roomId) {
        errors.push({
          sheet: timetableSheetName,
          row: rowNum,
          type: 'error',
          message: 'Missing required class fields',
          hint: 'Required columns: Branch, Day, Subject Code, Teacher, Room'
        });
        return;
      }

      // Check valid day
      const normDay = VALID_DAYS.find((d) => d.toLowerCase() === day.toLowerCase());
      if (!normDay) {
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

      // Check valid branch
      const normBranch = VALID_BRANCHES.find((b) => b.toLowerCase() === branch.toLowerCase()) || branch;

      // Check room recognition
      if (!roomSet.has(roomId.toLowerCase())) {
        warnings.push({
          sheet: timetableSheetName,
          row: rowNum,
          column: 'Room',
          type: 'warning',
          message: `Room "${roomId}" is not registered in the system`,
          hint: 'Add this room in the Rooms sheet or Master Data tab'
        });
      }

      // --- CLASH 1: ROOM OVERLAP ---
      const roomClash = roomBookingList.find(
        (b) =>
          b.day.toLowerCase() === normDay.toLowerCase() &&
          b.roomId.toLowerCase() === roomId.toLowerCase() &&
          intervalsOverlap(b.start, b.end, start, end)
      );

      if (roomClash) {
        errors.push({
          sheet: timetableSheetName,
          row: rowNum,
          column: 'Room',
          type: 'error',
          message: `ROOM CLASH: Room "${roomId}" is already booked by ${roomClash.branch} (${roomClash.subject}) from ${roomClash.start} to ${roomClash.end} (Row ${roomClash.rowNum})!`,
          hint: 'Two classes cannot use the same room at the same time. Assign another classroom or adjust times.'
        });
      } else {
        roomBookingList.push({ rowNum, day: normDay, start, end, roomId, branch: normBranch, subject });
      }

      // --- CLASH 2: PROFESSOR OVERLAP ---
      if (teacher && teacher.toLowerCase() !== 'tbd' && teacher.toLowerCase() !== 'industry expert') {
        const profClash = profBookingList.find(
          (p) =>
            p.day.toLowerCase() === normDay.toLowerCase() &&
            p.teacher.toLowerCase() === teacher.toLowerCase() &&
            intervalsOverlap(p.start, p.end, start, end)
        );

        if (profClash) {
          errors.push({
            sheet: timetableSheetName,
            row: rowNum,
            column: 'Teacher',
            type: 'error',
            message: `PROFESSOR CLASH: "${teacher}" is scheduled in TWO rooms simultaneously: ${profClash.roomId} (Row ${profClash.rowNum}) and ${roomId} on ${normDay} (${start}-${end})!`,
            hint: 'A professor cannot teach two overlapping classes. Reassign instructor or reschedule slot.'
          });
        } else {
          profBookingList.push({ rowNum, day: normDay, start, end, teacher, branch: normBranch, roomId });
        }
      }

      parsedTimetable.push({
        id: `slot_imp_${Date.now()}_${idx}`,
        branch: normBranch,
        branch_id: normBranch,
        semester,
        semester_id: semester,
        day: normDay as DayOfWeek,
        periodId: `p_${idx + 1}`,
        start_time: start,
        end_time: end,
        subject,
        subject_id: subject,
        teacher: teacher || 'Faculty Member',
        professor_id: teacher,
        roomId,
        classroom_id: roomId,
        type: (VALID_CLASS_TYPES.includes(type) ? type : 'Lecture') as ClassType,
        class_type: (VALID_CLASS_TYPES.includes(type) ? type : 'Lecture') as ClassType,
        is_published: true
      });
    });
  }

  return {
    timetable: parsedTimetable,
    rooms: parsedRooms,
    holidays: parsedHolidays,
    periods: parsedPeriods,
    subjects: parsedSubjects,
    professors: parsedProfessors,
    errors,
    warnings,
    sheetRowCounts: {
      timetable: parsedTimetable.length,
      rooms: parsedRooms.length,
      holidays: parsedHolidays.length,
      periods: parsedPeriods.length,
      subjects: parsedSubjects.length,
      professors: parsedProfessors.length
    }
  };
}
