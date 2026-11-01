import { Branch, Room, Period, TimetableSlot, Holiday, Notice } from '../types';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'CSE',
    name: 'Computer Science & Engineering',
    shortName: 'CSE',
    code: 'CS',
    color: '#6366F1', // Indigo
    bgLight: 'bg-indigo-50 text-indigo-700',
    bgDark: 'dark:bg-indigo-950/60 dark:text-indigo-300',
    borderLight: 'border-indigo-200',
    borderDark: 'dark:border-indigo-800',
    textLight: 'text-indigo-600',
    textDark: 'dark:text-indigo-400'
  },
  {
    id: 'CSE-AI',
    name: 'CSE (Artificial Intelligence & ML)',
    shortName: 'CSE-AI',
    code: 'AI',
    color: '#8B5CF6', // Violet
    bgLight: 'bg-violet-50 text-violet-700',
    bgDark: 'dark:bg-violet-950/60 dark:text-violet-300',
    borderLight: 'border-violet-200',
    borderDark: 'dark:border-violet-800',
    textLight: 'text-violet-600',
    textDark: 'dark:text-violet-400'
  },
  {
    id: 'Civil',
    name: 'Civil Engineering',
    shortName: 'Civil',
    code: 'CE',
    color: '#D97706', // Amber
    bgLight: 'bg-amber-50 text-amber-700',
    bgDark: 'dark:bg-amber-950/60 dark:text-amber-300',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-800',
    textLight: 'text-amber-600',
    textDark: 'dark:text-amber-400'
  },
  {
    id: 'Civil-CA',
    name: 'Civil (Construction & Architecture)',
    shortName: 'Civil-CA',
    code: 'CA',
    color: '#0284C7', // Sky blue
    bgLight: 'bg-sky-50 text-sky-700',
    bgDark: 'dark:bg-sky-950/60 dark:text-sky-300',
    borderLight: 'border-sky-200',
    borderDark: 'dark:border-sky-800',
    textLight: 'text-sky-600',
    textDark: 'dark:text-sky-400'
  },
  {
    id: 'Mechanical',
    name: 'Mechanical Engineering',
    shortName: 'Mechanical',
    code: 'ME',
    color: '#059669', // Emerald
    bgLight: 'bg-emerald-50 text-emerald-700',
    bgDark: 'dark:bg-emerald-950/60 dark:text-emerald-300',
    borderLight: 'border-emerald-200',
    borderDark: 'dark:border-emerald-800',
    textLight: 'text-emerald-600',
    textDark: 'dark:text-emerald-400'
  }
];

export const INITIAL_PERIODS: Period[] = [
  { id: 1, order: 1, start: '09:00', end: '09:55', label: 'Period 1' },
  { id: 2, order: 2, start: '09:55', end: '10:50', label: 'Period 2' },
  { id: 'tea', order: 3, start: '10:50', end: '11:05', label: 'Tea Break', isBreak: true },
  { id: 3, order: 4, start: '11:05', end: '12:00', label: 'Period 3' },
  { id: 4, order: 5, start: '12:00', end: '12:55', label: 'Period 4' },
  { id: 'lunch', order: 6, start: '12:55', end: '01:45', label: 'Lunch Break', isBreak: true },
  { id: 5, order: 7, start: '01:45', end: '02:40', label: 'Period 5' },
  { id: 6, order: 8, start: '02:40', end: '03:35', label: 'Period 6' },
  { id: 7, order: 9, start: '03:35', end: '04:30', label: 'Period 7' }
];

export const INITIAL_ROOMS: Room[] = [
  { id: 'R101', name: 'Room 101', type: 'classroom', capacity: 70, floor: 0, building: 'Academic Block A' },
  { id: 'R102', name: 'Room 102', type: 'classroom', capacity: 70, floor: 0, building: 'Academic Block A' },
  { id: 'R103', name: 'Room 103', type: 'classroom', capacity: 60, floor: 0, building: 'Academic Block A' },
  { id: 'R104', name: 'Room 104', type: 'classroom', capacity: 60, floor: 0, building: 'Academic Block A' },
  { id: 'R201', name: 'Room 201', type: 'classroom', capacity: 75, floor: 1, building: 'Academic Block A' },
  { id: 'R202', name: 'Room 202', type: 'classroom', capacity: 75, floor: 1, building: 'Academic Block A' },
  { id: 'R203', name: 'Room 203', type: 'classroom', capacity: 65, floor: 1, building: 'Academic Block A' },
  { id: 'R204', name: 'Room 204', type: 'classroom', capacity: 65, floor: 1, building: 'Academic Block A' },
  { id: 'R301', name: 'Room 301', type: 'classroom', capacity: 80, floor: 2, building: 'Academic Block B' },
  { id: 'R302', name: 'Room 302', type: 'classroom', capacity: 80, floor: 2, building: 'Academic Block B' },
  { id: 'LAB-COMP', name: 'Computer Lab 1', type: 'lab', capacity: 45, floor: 1, building: 'IT Centre' },
  { id: 'LAB-AI', name: 'AI & Robotics Lab', type: 'lab', capacity: 40, floor: 2, building: 'IT Centre' },
  { id: 'LAB-CAD', name: 'Civil CAD Lab', type: 'lab', capacity: 40, floor: 1, building: 'Civil Block' },
  { id: 'LAB-FLUID', name: 'Fluid Mechanics Lab', type: 'lab', capacity: 35, floor: 0, building: 'Mech Annex' },
  { id: 'WORKSHOP', name: 'Central Workshop', type: 'workshop', capacity: 80, floor: 0, building: 'Workshop Hangar' },
  { id: 'HALL-SEM', name: 'Seminar Hall A', type: 'hall', capacity: 150, floor: 0, building: 'Auditorium Wing' },
  { id: 'HALL-DRAW', name: 'Drawing Hall', type: 'hall', capacity: 90, floor: 3, building: 'Academic Block B' }
];

export const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: 'h-diwali-2026',
    startDate: '2026-11-08',
    endDate: '2026-11-13',
    title: 'Diwali & New Year Vacation',
    type: 'vacation',
    description: 'College closed for festival of lights celebration'
  },
  {
    id: 'h-guru-nanak-2026',
    startDate: '2026-11-24',
    endDate: '2026-11-24',
    title: 'Guru Nanak Jayanti',
    type: 'holiday',
    description: 'Gazetted Holiday'
  },
  {
    id: 'h-winter-2026',
    startDate: '2026-12-24',
    endDate: '2027-01-02',
    title: 'Winter Break',
    type: 'vacation',
    description: 'End of Odd Semester Vacation'
  },
  {
    id: 'h-exam-mid-2026',
    startDate: '2026-11-16',
    endDate: '2026-11-21',
    title: 'Mid-Semester Examinations',
    type: 'exam',
    description: 'Morning & afternoon examination sessions'
  },
  {
    id: 'h-rep-day-2027',
    startDate: '2027-01-26',
    endDate: '2027-01-26',
    title: 'Republic Day',
    type: 'holiday',
    description: 'Flag hoisting ceremony at 08:30 AM'
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'n-1',
    title: 'Mid-Term Exam Seating Arrangement',
    content: 'Seating arrangements for Mid-Semester Exams (Nov 16-21) will be displayed on Block A bulletin board on Friday.',
    priority: 'urgent',
    startDate: '2026-11-01',
    endDate: '2026-11-20',
    active: true
  },
  {
    id: 'n-2',
    title: 'Annual TechFest "Invento 2026" Registrations Open',
    content: 'Students wishing to lead coding sprints or robotics demos may register through their branch coordinators by Nov 10.',
    priority: 'info',
    startDate: '2026-11-01',
    endDate: '2026-11-15',
    active: true
  }
];

// Rich, realistic weekly timetable for 5 branches Mon-Sat
export const INITIAL_TIMETABLE: TimetableSlot[] = [
  // --- MONDAY ---
  // CSE Monday
  { id: 'cs-m1', branch: 'CSE', day: 'Monday', periodId: 1, subject: 'Distributed Systems', teacher: 'Dr. Ramesh Sharma', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-m2', branch: 'CSE', day: 'Monday', periodId: 2, subject: 'Compiler Design', teacher: 'Prof. Anjali Verma', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-m3', branch: 'CSE', day: 'Monday', periodId: 3, subject: 'Database Management', teacher: 'Prof. Vikram Sen', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-m4', branch: 'CSE', day: 'Monday', periodId: 4, subject: 'Computer Networks', teacher: 'Dr. Priya Mehta', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-m5', branch: 'CSE', day: 'Monday', periodId: 5, subject: 'Advanced Networks Lab', teacher: 'Dr. Priya Mehta', roomId: 'LAB-COMP', type: 'Lab' },
  { id: 'cs-m6', branch: 'CSE', day: 'Monday', periodId: 6, subject: 'Advanced Networks Lab', teacher: 'Dr. Priya Mehta', roomId: 'LAB-COMP', type: 'Lab' },
  { id: 'cs-m7', branch: 'CSE', day: 'Monday', periodId: 7, subject: 'Technical Seminar', teacher: 'Dr. Ramesh Sharma', roomId: 'HALL-SEM', type: 'Tutorial' },

  // CSE-AI Monday
  { id: 'ai-m1', branch: 'CSE-AI', day: 'Monday', periodId: 1, subject: 'Deep Learning & PyTorch', teacher: 'Dr. Arvind Rao', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-m2', branch: 'CSE-AI', day: 'Monday', periodId: 2, subject: 'Natural Language Processing', teacher: 'Prof. Sneha Gupta', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-m3', branch: 'CSE-AI', day: 'Monday', periodId: 3, subject: 'Mathematics for ML', teacher: 'Dr. K. Srinivas', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-m4', branch: 'CSE-AI', day: 'Monday', periodId: 4, subject: 'Reinforcement Learning', teacher: 'Dr. Arvind Rao', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-m5', branch: 'CSE-AI', day: 'Monday', periodId: 5, subject: 'Computer Vision Lab', teacher: 'Prof. Sneha Gupta', roomId: 'LAB-AI', type: 'Lab' },
  { id: 'ai-m6', branch: 'CSE-AI', day: 'Monday', periodId: 6, subject: 'Computer Vision Lab', teacher: 'Prof. Sneha Gupta', roomId: 'LAB-AI', type: 'Lab' },
  { id: 'ai-m7', branch: 'CSE-AI', day: 'Monday', periodId: 7, subject: 'AI Ethics & Fairness', teacher: 'Dr. K. Srinivas', roomId: 'R202', type: 'Tutorial' },

  // Civil Monday
  { id: 'ce-m1', branch: 'Civil', day: 'Monday', periodId: 1, subject: 'Structural Analysis II', teacher: 'Dr. H. P. Joshi', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-m2', branch: 'Civil', day: 'Monday', periodId: 2, subject: 'Geotechnical Engineering', teacher: 'Prof. M. K. Roy', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-m3', branch: 'Civil', day: 'Monday', periodId: 3, subject: 'Fluid Mechanics', teacher: 'Dr. S. Nair', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-m4', branch: 'Civil', day: 'Monday', periodId: 4, subject: 'Surveying Fieldwork', teacher: 'Prof. M. K. Roy', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-m5', branch: 'Civil', day: 'Monday', periodId: 5, subject: 'Fluid Mechanics Lab', teacher: 'Dr. S. Nair', roomId: 'LAB-FLUID', type: 'Lab' },
  { id: 'ce-m6', branch: 'Civil', day: 'Monday', periodId: 6, subject: 'Fluid Mechanics Lab', teacher: 'Dr. S. Nair', roomId: 'LAB-FLUID', type: 'Lab' },
  { id: 'ce-m7', branch: 'Civil', day: 'Monday', periodId: 7, subject: 'Concrete Technology', teacher: 'Dr. H. P. Joshi', roomId: 'R101', type: 'Tutorial' },

  // Civil-CA Monday
  { id: 'ca-m1', branch: 'Civil-CA', day: 'Monday', periodId: 1, subject: 'BIM & 3D Modeling', teacher: 'Prof. Tanvi Desai', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ca-m2', branch: 'Civil-CA', day: 'Monday', periodId: 2, subject: 'BIM & 3D Modeling', teacher: 'Prof. Tanvi Desai', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ca-m3', branch: 'Civil-CA', day: 'Monday', periodId: 3, subject: 'Architectural Design Studio', teacher: 'Ar. Rajesh Pillai', roomId: 'HALL-DRAW', type: 'Lecture' },
  { id: 'ca-m4', branch: 'Civil-CA', day: 'Monday', periodId: 4, subject: 'Construction Economics', teacher: 'Prof. Tanvi Desai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-m5', branch: 'Civil-CA', day: 'Monday', periodId: 5, subject: 'Urban Planning Fundamentals', teacher: 'Ar. Rajesh Pillai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-m6', branch: 'Civil-CA', day: 'Monday', periodId: 6, subject: 'Project Scheduling (Primavera)', teacher: 'Prof. Tanvi Desai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-m7', branch: 'Civil-CA', day: 'Monday', periodId: 7, subject: 'Site Management Tutorial', teacher: 'Ar. Rajesh Pillai', roomId: 'R102', type: 'Tutorial' },

  // Mechanical Monday
  { id: 'me-m1', branch: 'Mechanical', day: 'Monday', periodId: 1, subject: 'Thermodynamics & Heat Transfer', teacher: 'Dr. V. K. Bansal', roomId: 'R103', type: 'Lecture' },
  { id: 'me-m2', branch: 'Mechanical', day: 'Monday', periodId: 2, subject: 'Kinematics of Machinery', teacher: 'Prof. R. G. Patil', roomId: 'R103', type: 'Lecture' },
  { id: 'me-m3', branch: 'Mechanical', day: 'Monday', periodId: 3, subject: 'Manufacturing Processes', teacher: 'Dr. Alok Pandey', roomId: 'R103', type: 'Lecture' },
  { id: 'me-m4', branch: 'Mechanical', day: 'Monday', periodId: 4, subject: 'Strength of Materials', teacher: 'Dr. V. K. Bansal', roomId: 'R103', type: 'Lecture' },
  { id: 'me-m5', branch: 'Mechanical', day: 'Monday', periodId: 5, subject: 'Machining & Fitting Workshop', teacher: 'Dr. Alok Pandey', roomId: 'WORKSHOP', type: 'Lab' },
  { id: 'me-m6', branch: 'Mechanical', day: 'Monday', periodId: 6, subject: 'Machining & Fitting Workshop', teacher: 'Dr. Alok Pandey', roomId: 'WORKSHOP', type: 'Lab' },
  { id: 'me-m7', branch: 'Mechanical', day: 'Monday', periodId: 7, subject: 'Applied Mechanics Tutorial', teacher: 'Prof. R. G. Patil', roomId: 'R103', type: 'Tutorial' },

  // --- TUESDAY ---
  // CSE Tuesday
  { id: 'cs-t1', branch: 'CSE', day: 'Tuesday', periodId: 1, subject: 'Cloud Computing & DevOps', teacher: 'Dr. Ramesh Sharma', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-t2', branch: 'CSE', day: 'Tuesday', periodId: 2, subject: 'Compiler Design', teacher: 'Prof. Anjali Verma', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-t3', branch: 'CSE', day: 'Tuesday', periodId: 3, subject: 'Compiler Design Lab', teacher: 'Prof. Anjali Verma', roomId: 'LAB-COMP', type: 'Lab' },
  { id: 'cs-t4', branch: 'CSE', day: 'Tuesday', periodId: 4, subject: 'Compiler Design Lab', teacher: 'Prof. Anjali Verma', roomId: 'LAB-COMP', type: 'Lab' },
  { id: 'cs-t5', branch: 'CSE', day: 'Tuesday', periodId: 5, subject: 'Database Management', teacher: 'Prof. Vikram Sen', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-t6', branch: 'CSE', day: 'Tuesday', periodId: 6, subject: 'Operating Systems Internals', teacher: 'Dr. Priya Mehta', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-t7', branch: 'CSE', day: 'Tuesday', periodId: 7, subject: 'Algorithms Problem Solving', teacher: 'Prof. Vikram Sen', roomId: 'R201', type: 'Tutorial' },

  // CSE-AI Tuesday
  { id: 'ai-t1', branch: 'CSE-AI', day: 'Tuesday', periodId: 1, subject: 'NLP with Transformers', teacher: 'Prof. Sneha Gupta', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-t2', branch: 'CSE-AI', day: 'Tuesday', periodId: 2, subject: 'Deep Learning & PyTorch', teacher: 'Dr. Arvind Rao', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-t3', branch: 'CSE-AI', day: 'Tuesday', periodId: 3, subject: 'Deep Learning Lab', teacher: 'Dr. Arvind Rao', roomId: 'LAB-AI', type: 'Lab' },
  { id: 'ai-t4', branch: 'CSE-AI', day: 'Tuesday', periodId: 4, subject: 'Deep Learning Lab', teacher: 'Dr. Arvind Rao', roomId: 'LAB-AI', type: 'Lab' },
  { id: 'ai-t5', branch: 'CSE-AI', day: 'Tuesday', periodId: 5, subject: 'Data Engineering & Pipelines', teacher: 'Dr. K. Srinivas', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-t6', branch: 'CSE-AI', day: 'Tuesday', periodId: 6, subject: 'Autonomous Systems & ROS', teacher: 'Dr. Arvind Rao', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-t7', branch: 'CSE-AI', day: 'Tuesday', periodId: 7, subject: 'Research Reading Group', teacher: 'Prof. Sneha Gupta', roomId: 'R202', type: 'Tutorial' },

  // Civil Tuesday
  { id: 'ce-t1', branch: 'Civil', day: 'Tuesday', periodId: 1, subject: 'Environmental Engineering', teacher: 'Prof. M. K. Roy', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-t2', branch: 'Civil', day: 'Tuesday', periodId: 2, subject: 'Structural Analysis II', teacher: 'Dr. H. P. Joshi', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-t3', branch: 'Civil', day: 'Tuesday', periodId: 3, subject: 'Transportation Systems', teacher: 'Dr. S. Nair', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-t4', branch: 'Civil', day: 'Tuesday', periodId: 4, subject: 'Geotechnical Engineering', teacher: 'Prof. M. K. Roy', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-t5', branch: 'Civil', day: 'Tuesday', periodId: 5, subject: 'Structural Drafting', teacher: 'Dr. H. P. Joshi', roomId: 'HALL-DRAW', type: 'Lecture' },
  { id: 'ce-t6', branch: 'Civil', day: 'Tuesday', periodId: 6, subject: 'Hydraulics Modeling', teacher: 'Dr. S. Nair', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-t7', branch: 'Civil', day: 'Tuesday', periodId: 7, subject: 'Material Testing Seminar', teacher: 'Prof. M. K. Roy', roomId: 'R101', type: 'Tutorial' },

  // Civil-CA Tuesday
  { id: 'ca-t1', branch: 'Civil-CA', day: 'Tuesday', periodId: 1, subject: 'Building Information Modeling', teacher: 'Prof. Tanvi Desai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-t2', branch: 'Civil-CA', day: 'Tuesday', periodId: 2, subject: 'Sustainable Architecture', teacher: 'Ar. Rajesh Pillai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-t3', branch: 'Civil-CA', day: 'Tuesday', periodId: 3, subject: 'CAD Drafting Studio', teacher: 'Prof. Tanvi Desai', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ca-t4', branch: 'Civil-CA', day: 'Tuesday', periodId: 4, subject: 'CAD Drafting Studio', teacher: 'Prof. Tanvi Desai', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ca-t5', branch: 'Civil-CA', day: 'Tuesday', periodId: 5, subject: 'Construction Safety & Laws', teacher: 'Ar. Rajesh Pillai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-t6', branch: 'Civil-CA', day: 'Tuesday', periodId: 6, subject: 'HVAC & MEP Integration', teacher: 'Prof. Tanvi Desai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-t7', branch: 'Civil-CA', day: 'Tuesday', periodId: 7, subject: 'Studio Review', teacher: 'Ar. Rajesh Pillai', roomId: 'HALL-DRAW', type: 'Tutorial' },

  // Mechanical Tuesday
  { id: 'me-t1', branch: 'Mechanical', day: 'Tuesday', periodId: 1, subject: 'IC Engines & Gas Turbines', teacher: 'Dr. V. K. Bansal', roomId: 'R103', type: 'Lecture' },
  { id: 'me-t2', branch: 'Mechanical', day: 'Tuesday', periodId: 2, subject: 'Fluid Machinery', teacher: 'Prof. R. G. Patil', roomId: 'R103', type: 'Lecture' },
  { id: 'me-t3', branch: 'Mechanical', day: 'Tuesday', periodId: 3, subject: 'Fluid Machinery Lab', teacher: 'Prof. R. G. Patil', roomId: 'LAB-FLUID', type: 'Lab' },
  { id: 'me-t4', branch: 'Mechanical', day: 'Tuesday', periodId: 4, subject: 'Fluid Machinery Lab', teacher: 'Prof. R. G. Patil', roomId: 'LAB-FLUID', type: 'Lab' },
  { id: 'me-t5', branch: 'Mechanical', day: 'Tuesday', periodId: 5, subject: 'Design of Machine Elements', teacher: 'Dr. Alok Pandey', roomId: 'R103', type: 'Lecture' },
  { id: 'me-t6', branch: 'Mechanical', day: 'Tuesday', periodId: 6, subject: 'CAD/CAM Solid Modeling', teacher: 'Dr. V. K. Bansal', roomId: 'R103', type: 'Lecture' },
  { id: 'me-t7', branch: 'Mechanical', day: 'Tuesday', periodId: 7, subject: 'Thermal Calculations', teacher: 'Dr. V. K. Bansal', roomId: 'R103', type: 'Tutorial' },

  // --- WEDNESDAY ---
  { id: 'cs-w1', branch: 'CSE', day: 'Wednesday', periodId: 1, subject: 'Object Oriented Software Eng', teacher: 'Prof. Vikram Sen', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-w2', branch: 'CSE', day: 'Wednesday', periodId: 2, subject: 'Computer Networks', teacher: 'Dr. Priya Mehta', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-w3', branch: 'CSE', day: 'Wednesday', periodId: 3, subject: 'Algorithms & Complexity', teacher: 'Dr. Ramesh Sharma', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-w4', branch: 'CSE', day: 'Wednesday', periodId: 4, subject: 'Web Technologies', teacher: 'Prof. Anjali Verma', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-w5', branch: 'CSE', day: 'Wednesday', periodId: 5, subject: 'Database Lab', teacher: 'Prof. Vikram Sen', roomId: 'LAB-COMP', type: 'Lab' },
  { id: 'cs-w6', branch: 'CSE', day: 'Wednesday', periodId: 6, subject: 'Database Lab', teacher: 'Prof. Vikram Sen', roomId: 'LAB-COMP', type: 'Lab' },
  { id: 'cs-w7', branch: 'CSE', day: 'Wednesday', periodId: 7, subject: 'Open Source Mentorship', teacher: 'Prof. Anjali Verma', roomId: 'R201', type: 'Tutorial' },

  { id: 'ai-w1', branch: 'CSE-AI', day: 'Wednesday', periodId: 1, subject: 'Probabilistic Graphical Models', teacher: 'Dr. K. Srinivas', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-w2', branch: 'CSE-AI', day: 'Wednesday', periodId: 2, subject: 'Deep Learning & PyTorch', teacher: 'Dr. Arvind Rao', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-w3', branch: 'CSE-AI', day: 'Wednesday', periodId: 3, subject: 'Edge AI & TinyML', teacher: 'Prof. Sneha Gupta', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-w4', branch: 'CSE-AI', day: 'Wednesday', periodId: 4, subject: 'Big Data with Spark', teacher: 'Dr. K. Srinivas', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-w5', branch: 'CSE-AI', day: 'Wednesday', periodId: 5, subject: 'Generative AI Lab', teacher: 'Dr. Arvind Rao', roomId: 'LAB-AI', type: 'Lab' },
  { id: 'ai-w6', branch: 'CSE-AI', day: 'Wednesday', periodId: 6, subject: 'Generative AI Lab', teacher: 'Dr. Arvind Rao', roomId: 'LAB-AI', type: 'Lab' },
  { id: 'ai-w7', branch: 'CSE-AI', day: 'Wednesday', periodId: 7, subject: 'ML Model Deployment', teacher: 'Prof. Sneha Gupta', roomId: 'R202', type: 'Tutorial' },

  { id: 'ce-w1', branch: 'Civil', day: 'Wednesday', periodId: 1, subject: 'Design of Steel Structures', teacher: 'Dr. H. P. Joshi', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-w2', branch: 'Civil', day: 'Wednesday', periodId: 2, subject: 'Hydrology & Water Resources', teacher: 'Dr. S. Nair', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-w3', branch: 'Civil', day: 'Wednesday', periodId: 3, subject: 'Surveying Lab', teacher: 'Prof. M. K. Roy', roomId: 'R101', type: 'Lab' },
  { id: 'ce-w4', branch: 'Civil', day: 'Wednesday', periodId: 4, subject: 'Surveying Lab', teacher: 'Prof. M. K. Roy', roomId: 'R101', type: 'Lab' },
  { id: 'ce-w5', branch: 'Civil', day: 'Wednesday', periodId: 5, subject: 'Highway Engineering', teacher: 'Dr. S. Nair', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-w6', branch: 'Civil', day: 'Wednesday', periodId: 6, subject: 'Geotechnical Lab', teacher: 'Prof. M. K. Roy', roomId: 'R104', type: 'Lab' },
  { id: 'ce-w7', branch: 'Civil', day: 'Wednesday', periodId: 7, subject: 'Structural Tutorial', teacher: 'Dr. H. P. Joshi', roomId: 'R101', type: 'Tutorial' },

  { id: 'ca-w1', branch: 'Civil-CA', day: 'Wednesday', periodId: 1, subject: 'Landscape Architecture', teacher: 'Ar. Rajesh Pillai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-w2', branch: 'Civil-CA', day: 'Wednesday', periodId: 2, subject: 'Structural Detailing with Revit', teacher: 'Prof. Tanvi Desai', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ca-w3', branch: 'Civil-CA', day: 'Wednesday', periodId: 3, subject: 'Structural Detailing with Revit', teacher: 'Prof. Tanvi Desai', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ca-w4', branch: 'Civil-CA', day: 'Wednesday', periodId: 4, subject: 'Acoustics & Lighting Design', teacher: 'Ar. Rajesh Pillai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-w5', branch: 'Civil-CA', day: 'Wednesday', periodId: 5, subject: 'Cost Estimation & Tendering', teacher: 'Prof. Tanvi Desai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-w6', branch: 'Civil-CA', day: 'Wednesday', periodId: 6, subject: 'Building Services Engineering', teacher: 'Prof. Tanvi Desai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-w7', branch: 'Civil-CA', day: 'Wednesday', periodId: 7, subject: 'Portfolio Drafting Review', teacher: 'Ar. Rajesh Pillai', roomId: 'HALL-DRAW', type: 'Tutorial' },

  { id: 'me-w1', branch: 'Mechanical', day: 'Wednesday', periodId: 1, subject: 'Finite Element Analysis', teacher: 'Prof. R. G. Patil', roomId: 'R103', type: 'Lecture' },
  { id: 'me-w2', branch: 'Mechanical', day: 'Wednesday', periodId: 2, subject: 'Refrigeration & Air Conditioning', teacher: 'Dr. V. K. Bansal', roomId: 'R103', type: 'Lecture' },
  { id: 'me-w3', branch: 'Mechanical', day: 'Wednesday', periodId: 3, subject: 'Welding & Casting Workshop', teacher: 'Dr. Alok Pandey', roomId: 'WORKSHOP', type: 'Lab' },
  { id: 'me-w4', branch: 'Mechanical', day: 'Wednesday', periodId: 4, subject: 'Welding & Casting Workshop', teacher: 'Dr. Alok Pandey', roomId: 'WORKSHOP', type: 'Lab' },
  { id: 'me-w5', branch: 'Mechanical', day: 'Wednesday', periodId: 5, subject: 'Metrology & Quality Control', teacher: 'Prof. R. G. Patil', roomId: 'R103', type: 'Lecture' },
  { id: 'me-w6', branch: 'Mechanical', day: 'Wednesday', periodId: 6, subject: 'Mechatronics & PLC', teacher: 'Dr. Alok Pandey', roomId: 'R103', type: 'Lecture' },
  { id: 'me-w7', branch: 'Mechanical', day: 'Wednesday', periodId: 7, subject: 'FEM Tutorial Session', teacher: 'Prof. R. G. Patil', roomId: 'R103', type: 'Tutorial' },

  // --- THURSDAY ---
  { id: 'cs-th1', branch: 'CSE', day: 'Thursday', periodId: 1, subject: 'Information Security', teacher: 'Dr. Priya Mehta', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-th2', branch: 'CSE', day: 'Thursday', periodId: 2, subject: 'Distributed Systems', teacher: 'Dr. Ramesh Sharma', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-th3', branch: 'CSE', day: 'Thursday', periodId: 3, subject: 'Cloud & DevOps Lab', teacher: 'Dr. Ramesh Sharma', roomId: 'LAB-COMP', type: 'Lab' },
  { id: 'cs-th4', branch: 'CSE', day: 'Thursday', periodId: 4, subject: 'Cloud & DevOps Lab', teacher: 'Dr. Ramesh Sharma', roomId: 'LAB-COMP', type: 'Lab' },
  { id: 'cs-th5', branch: 'CSE', day: 'Thursday', periodId: 5, subject: 'Design Patterns', teacher: 'Prof. Vikram Sen', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-th6', branch: 'CSE', day: 'Thursday', periodId: 6, subject: 'Microprocessors & Embedded', teacher: 'Prof. Anjali Verma', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-th7', branch: 'CSE', day: 'Thursday', periodId: 7, subject: 'Capstone Project Review', teacher: 'Dr. Priya Mehta', roomId: 'R201', type: 'Tutorial' },

  { id: 'ai-th1', branch: 'CSE-AI', day: 'Thursday', periodId: 1, subject: 'Autonomous Robotics', teacher: 'Dr. Arvind Rao', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-th2', branch: 'CSE-AI', day: 'Thursday', periodId: 2, subject: 'Deep Learning & PyTorch', teacher: 'Dr. Arvind Rao', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-th3', branch: 'CSE-AI', day: 'Thursday', periodId: 3, subject: 'Robotics & ROS Lab', teacher: 'Dr. Arvind Rao', roomId: 'LAB-AI', type: 'Lab' },
  { id: 'ai-th4', branch: 'CSE-AI', day: 'Thursday', periodId: 4, subject: 'Robotics & ROS Lab', teacher: 'Dr. Arvind Rao', roomId: 'LAB-AI', type: 'Lab' },
  { id: 'ai-th5', branch: 'CSE-AI', day: 'Thursday', periodId: 5, subject: 'Cloud AI Services', teacher: 'Prof. Sneha Gupta', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-th6', branch: 'CSE-AI', day: 'Thursday', periodId: 6, subject: 'Time Series & Forecasting', teacher: 'Dr. K. Srinivas', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-th7', branch: 'CSE-AI', day: 'Thursday', periodId: 7, subject: 'AI Capstone Guidance', teacher: 'Dr. K. Srinivas', roomId: 'R202', type: 'Tutorial' },

  { id: 'ce-th1', branch: 'Civil', day: 'Thursday', periodId: 1, subject: 'Prestressed Concrete', teacher: 'Dr. H. P. Joshi', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-th2', branch: 'Civil', day: 'Thursday', periodId: 2, subject: 'Earthquake Resistant Structures', teacher: 'Dr. H. P. Joshi', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-th3', branch: 'Civil', day: 'Thursday', periodId: 3, subject: 'Hydraulics & Dams', teacher: 'Dr. S. Nair', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-th4', branch: 'Civil', day: 'Thursday', periodId: 4, subject: 'Transportation Systems', teacher: 'Dr. S. Nair', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-th5', branch: 'Civil', day: 'Thursday', periodId: 5, subject: 'Concrete Testing Lab', teacher: 'Prof. M. K. Roy', roomId: 'R104', type: 'Lab' },
  { id: 'ce-th6', branch: 'Civil', day: 'Thursday', periodId: 6, subject: 'Concrete Testing Lab', teacher: 'Prof. M. K. Roy', roomId: 'R104', type: 'Lab' },
  { id: 'ce-th7', branch: 'Civil', day: 'Thursday', periodId: 7, subject: 'Structural Case Studies', teacher: 'Dr. H. P. Joshi', roomId: 'R101', type: 'Tutorial' },

  { id: 'ca-th1', branch: 'Civil-CA', day: 'Thursday', periodId: 1, subject: 'Heritage Conservation', teacher: 'Ar. Rajesh Pillai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-th2', branch: 'Civil-CA', day: 'Thursday', periodId: 2, subject: 'Structural Steel Modeling', teacher: 'Prof. Tanvi Desai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-th3', branch: 'Civil-CA', day: 'Thursday', periodId: 3, subject: 'GIS & Mapping Lab', teacher: 'Prof. Tanvi Desai', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ca-th4', branch: 'Civil-CA', day: 'Thursday', periodId: 4, subject: 'GIS & Mapping Lab', teacher: 'Prof. Tanvi Desai', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ca-th5', branch: 'Civil-CA', day: 'Thursday', periodId: 5, subject: 'Green Building Ratings (LEED)', teacher: 'Ar. Rajesh Pillai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-th6', branch: 'Civil-CA', day: 'Thursday', periodId: 6, subject: 'Construction Equipment Mgmt', teacher: 'Prof. Tanvi Desai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-th7', branch: 'Civil-CA', day: 'Thursday', periodId: 7, subject: 'Design Critique', teacher: 'Ar. Rajesh Pillai', roomId: 'R102', type: 'Tutorial' },

  { id: 'me-th1', branch: 'Mechanical', day: 'Thursday', periodId: 1, subject: 'Automobile Engineering', teacher: 'Dr. V. K. Bansal', roomId: 'R103', type: 'Lecture' },
  { id: 'me-th2', branch: 'Mechanical', day: 'Thursday', periodId: 2, subject: 'Operations Research', teacher: 'Prof. R. G. Patil', roomId: 'R103', type: 'Lecture' },
  { id: 'me-th3', branch: 'Mechanical', day: 'Thursday', periodId: 3, subject: 'Heat Transfer Lab', teacher: 'Dr. V. K. Bansal', roomId: 'LAB-FLUID', type: 'Lab' },
  { id: 'me-th4', branch: 'Mechanical', day: 'Thursday', periodId: 4, subject: 'Heat Transfer Lab', teacher: 'Dr. V. K. Bansal', roomId: 'LAB-FLUID', type: 'Lab' },
  { id: 'me-th5', branch: 'Mechanical', day: 'Thursday', periodId: 5, subject: 'CNC Machining Workshop', teacher: 'Dr. Alok Pandey', roomId: 'WORKSHOP', type: 'Lab' },
  { id: 'me-th6', branch: 'Mechanical', day: 'Thursday', periodId: 6, subject: 'CNC Machining Workshop', teacher: 'Dr. Alok Pandey', roomId: 'WORKSHOP', type: 'Lab' },
  { id: 'me-th7', branch: 'Mechanical', day: 'Thursday', periodId: 7, subject: 'Thermal Design Review', teacher: 'Dr. V. K. Bansal', roomId: 'R103', type: 'Tutorial' },

  // --- FRIDAY ---
  { id: 'cs-f1', branch: 'CSE', day: 'Friday', periodId: 1, subject: 'Compiler Design', teacher: 'Prof. Anjali Verma', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-f2', branch: 'CSE', day: 'Friday', periodId: 2, subject: 'Computer Networks', teacher: 'Dr. Priya Mehta', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-f3', branch: 'CSE', day: 'Friday', periodId: 3, subject: 'Open Source Systems', teacher: 'Prof. Vikram Sen', roomId: 'R201', type: 'Lecture' },
  { id: 'cs-f4', branch: 'CSE', day: 'Friday', periodId: 4, subject: 'Web Technologies Lab', teacher: 'Prof. Anjali Verma', roomId: 'LAB-COMP', type: 'Lab' },
  { id: 'cs-f5', branch: 'CSE', day: 'Friday', periodId: 5, subject: 'Web Technologies Lab', teacher: 'Prof. Anjali Verma', roomId: 'LAB-COMP', type: 'Lab' },
  { id: 'cs-f6', branch: 'CSE', day: 'Friday', periodId: 6, subject: 'Guest Lecture Series', teacher: 'Industry Expert', roomId: 'HALL-SEM', type: 'Lecture' },
  { id: 'cs-f7', branch: 'CSE', day: 'Friday', periodId: 7, subject: 'Student Innovation Club', teacher: 'Dr. Ramesh Sharma', roomId: 'R201', type: 'Tutorial' },

  { id: 'ai-f1', branch: 'CSE-AI', day: 'Friday', periodId: 1, subject: 'Reinforcement Learning', teacher: 'Dr. Arvind Rao', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-f2', branch: 'CSE-AI', day: 'Friday', periodId: 2, subject: 'Natural Language Processing', teacher: 'Prof. Sneha Gupta', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-f3', branch: 'CSE-AI', day: 'Friday', periodId: 3, subject: 'AI in Healthcare & Finance', teacher: 'Dr. K. Srinivas', roomId: 'R202', type: 'Lecture' },
  { id: 'ai-f4', branch: 'CSE-AI', day: 'Friday', periodId: 4, subject: 'Prompt Engineering & LLMs', teacher: 'Prof. Sneha Gupta', roomId: 'LAB-AI', type: 'Lab' },
  { id: 'ai-f5', branch: 'CSE-AI', day: 'Friday', periodId: 5, subject: 'Prompt Engineering & LLMs', teacher: 'Prof. Sneha Gupta', roomId: 'LAB-AI', type: 'Lab' },
  { id: 'ai-f6', branch: 'CSE-AI', day: 'Friday', periodId: 6, subject: 'Guest Lecture Series', teacher: 'Industry Expert', roomId: 'HALL-SEM', type: 'Lecture' },
  { id: 'ai-f7', branch: 'CSE-AI', day: 'Friday', periodId: 7, subject: 'Kaggle Hackathon Prep', teacher: 'Dr. Arvind Rao', roomId: 'R202', type: 'Tutorial' },

  { id: 'ce-f1', branch: 'Civil', day: 'Friday', periodId: 1, subject: 'Geotechnical Engineering', teacher: 'Prof. M. K. Roy', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-f2', branch: 'Civil', day: 'Friday', periodId: 2, subject: 'Bridge Engineering', teacher: 'Dr. H. P. Joshi', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-f3', branch: 'Civil', day: 'Friday', periodId: 3, subject: 'Environmental Lab', teacher: 'Prof. M. K. Roy', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ce-f4', branch: 'Civil', day: 'Friday', periodId: 4, subject: 'Environmental Lab', teacher: 'Prof. M. K. Roy', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ce-f5', branch: 'Civil', day: 'Friday', periodId: 5, subject: 'Disaster Management', teacher: 'Dr. S. Nair', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-f6', branch: 'Civil', day: 'Friday', periodId: 6, subject: 'Guest Lecture Series', teacher: 'Industry Expert', roomId: 'HALL-SEM', type: 'Lecture' },
  { id: 'ce-f7', branch: 'Civil', day: 'Friday', periodId: 7, subject: 'Fieldwork Presentation', teacher: 'Prof. M. K. Roy', roomId: 'R101', type: 'Tutorial' },

  { id: 'ca-f1', branch: 'Civil-CA', day: 'Friday', periodId: 1, subject: 'Interior Architecture', teacher: 'Ar. Rajesh Pillai', roomId: 'HALL-DRAW', type: 'Lecture' },
  { id: 'ca-f2', branch: 'Civil-CA', day: 'Friday', periodId: 2, subject: 'Smart City Planning', teacher: 'Prof. Tanvi Desai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-f3', branch: 'Civil-CA', day: 'Friday', periodId: 3, subject: 'Revit Architecture Studio', teacher: 'Prof. Tanvi Desai', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ca-f4', branch: 'Civil-CA', day: 'Friday', periodId: 4, subject: 'Revit Architecture Studio', teacher: 'Prof. Tanvi Desai', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ca-f5', branch: 'Civil-CA', day: 'Friday', periodId: 5, subject: 'Building Materials Science', teacher: 'Ar. Rajesh Pillai', roomId: 'R102', type: 'Lecture' },
  { id: 'ca-f6', branch: 'Civil-CA', day: 'Friday', periodId: 6, subject: 'Guest Lecture Series', teacher: 'Industry Expert', roomId: 'HALL-SEM', type: 'Lecture' },
  { id: 'ca-f7', branch: 'Civil-CA', day: 'Friday', periodId: 7, subject: 'Design Portfolio Showcase', teacher: 'Ar. Rajesh Pillai', roomId: 'HALL-DRAW', type: 'Tutorial' },

  { id: 'me-f1', branch: 'Mechanical', day: 'Friday', periodId: 1, subject: 'Mechanical Vibrations', teacher: 'Prof. R. G. Patil', roomId: 'R103', type: 'Lecture' },
  { id: 'me-f2', branch: 'Mechanical', day: 'Friday', periodId: 2, subject: 'Robotics & Automation', teacher: 'Dr. Alok Pandey', roomId: 'R103', type: 'Lecture' },
  { id: 'me-f3', branch: 'Mechanical', day: 'Friday', periodId: 3, subject: 'Design of Jigs & Fixtures', teacher: 'Prof. R. G. Patil', roomId: 'HALL-DRAW', type: 'Lecture' },
  { id: 'me-f4', branch: 'Mechanical', day: 'Friday', periodId: 4, subject: 'Solar Energy Systems', teacher: 'Dr. V. K. Bansal', roomId: 'R103', type: 'Lecture' },
  { id: 'me-f5', branch: 'Mechanical', day: 'Friday', periodId: 5, subject: 'Advanced CAD Modeling Lab', teacher: 'Dr. Alok Pandey', roomId: 'R103', type: 'Lab' },
  { id: 'me-f6', branch: 'Mechanical', day: 'Friday', periodId: 6, subject: 'Guest Lecture Series', teacher: 'Industry Expert', roomId: 'HALL-SEM', type: 'Lecture' },
  { id: 'me-f7', branch: 'Mechanical', day: 'Friday', periodId: 7, subject: 'Formula SAE Workshop', teacher: 'Prof. R. G. Patil', roomId: 'WORKSHOP', type: 'Tutorial' },

  // --- SATURDAY (Half Day / Project & Seminars) ---
  { id: 'cs-s1', branch: 'CSE', day: 'Saturday', periodId: 1, subject: 'Competitive Programming', teacher: 'Dr. Ramesh Sharma', roomId: 'LAB-COMP', type: 'Lab' },
  { id: 'cs-s2', branch: 'CSE', day: 'Saturday', periodId: 2, subject: 'Competitive Programming', teacher: 'Dr. Ramesh Sharma', roomId: 'LAB-COMP', type: 'Lab' },
  { id: 'cs-s3', branch: 'CSE', day: 'Saturday', periodId: 3, subject: 'Minor Project Evaluation', teacher: 'Prof. Anjali Verma', roomId: 'R201', type: 'Tutorial' },
  { id: 'cs-s4', branch: 'CSE', day: 'Saturday', periodId: 4, subject: 'Club Activities & Colloquium', teacher: 'Prof. Vikram Sen', roomId: 'HALL-SEM', type: 'Lecture' },

  { id: 'ai-s1', branch: 'CSE-AI', day: 'Saturday', periodId: 1, subject: 'AI Project Sprints', teacher: 'Dr. Arvind Rao', roomId: 'LAB-AI', type: 'Lab' },
  { id: 'ai-s2', branch: 'CSE-AI', day: 'Saturday', periodId: 2, subject: 'AI Project Sprints', teacher: 'Dr. Arvind Rao', roomId: 'LAB-AI', type: 'Lab' },
  { id: 'ai-s3', branch: 'CSE-AI', day: 'Saturday', periodId: 3, subject: 'Deep Tech Paper Discussion', teacher: 'Prof. Sneha Gupta', roomId: 'R202', type: 'Tutorial' },
  { id: 'ai-s4', branch: 'CSE-AI', day: 'Saturday', periodId: 4, subject: 'Club Activities & Colloquium', teacher: 'Dr. K. Srinivas', roomId: 'HALL-SEM', type: 'Lecture' },

  { id: 'ce-s1', branch: 'Civil', day: 'Saturday', periodId: 1, subject: 'Site Visit Prep & Planning', teacher: 'Prof. M. K. Roy', roomId: 'R101', type: 'Lecture' },
  { id: 'ce-s2', branch: 'Civil', day: 'Saturday', periodId: 2, subject: 'Software Modeling Session', teacher: 'Dr. H. P. Joshi', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ce-s3', branch: 'Civil', day: 'Saturday', periodId: 3, subject: 'Software Modeling Session', teacher: 'Dr. H. P. Joshi', roomId: 'LAB-CAD', type: 'Lab' },
  { id: 'ce-s4', branch: 'Civil', day: 'Saturday', periodId: 4, subject: 'Club Activities & Colloquium', teacher: 'Dr. S. Nair', roomId: 'HALL-SEM', type: 'Lecture' },

  { id: 'ca-s1', branch: 'Civil-CA', day: 'Saturday', periodId: 1, subject: 'Architectural Model Making', teacher: 'Ar. Rajesh Pillai', roomId: 'HALL-DRAW', type: 'Lab' },
  { id: 'ca-s2', branch: 'Civil-CA', day: 'Saturday', periodId: 2, subject: 'Architectural Model Making', teacher: 'Ar. Rajesh Pillai', roomId: 'HALL-DRAW', type: 'Lab' },
  { id: 'ca-s3', branch: 'Civil-CA', day: 'Saturday', periodId: 3, subject: 'Virtual Reality in Architecture', teacher: 'Prof. Tanvi Desai', roomId: 'LAB-CAD', type: 'Lecture' },
  { id: 'ca-s4', branch: 'Civil-CA', day: 'Saturday', periodId: 4, subject: 'Club Activities & Colloquium', teacher: 'Ar. Rajesh Pillai', roomId: 'HALL-SEM', type: 'Lecture' },

  { id: 'me-s1', branch: 'Mechanical', day: 'Saturday', periodId: 1, subject: 'Vehicle Dynamics Sprints', teacher: 'Dr. Alok Pandey', roomId: 'WORKSHOP', type: 'Lab' },
  { id: 'me-s2', branch: 'Mechanical', day: 'Saturday', periodId: 2, subject: 'Vehicle Dynamics Sprints', teacher: 'Dr. Alok Pandey', roomId: 'WORKSHOP', type: 'Lab' },
  { id: 'me-s3', branch: 'Mechanical', day: 'Saturday', periodId: 3, subject: 'Industry Case Studies', teacher: 'Prof. R. G. Patil', roomId: 'R103', type: 'Lecture' },
  { id: 'me-s4', branch: 'Mechanical', day: 'Saturday', periodId: 4, subject: 'Club Activities & Colloquium', teacher: 'Dr. V. K. Bansal', roomId: 'HALL-SEM', type: 'Lecture' }
];
