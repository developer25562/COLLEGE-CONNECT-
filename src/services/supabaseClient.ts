import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Complete PostgreSQL + Row Level Security schema for Supabase
export const SUPABASE_SQL_SCHEMA = `-- CampusPulse Production PostgreSQL Schema & Row Level Security (RLS)
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  code TEXT NOT NULL,
  color TEXT NOT NULL,
  bg_light TEXT NOT NULL,
  bg_dark TEXT NOT NULL,
  border_light TEXT NOT NULL,
  border_dark TEXT NOT NULL,
  text_light TEXT NOT NULL,
  text_dark TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('classroom', 'lab', 'hall', 'workshop')),
  capacity INTEGER NOT NULL DEFAULT 60,
  floor INTEGER NOT NULL DEFAULT 0,
  building TEXT,
  is_maintenance BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Periods Table
CREATE TABLE IF NOT EXISTS public.periods (
  id TEXT PRIMARY KEY,
  "order" INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  label TEXT NOT NULL,
  is_break BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Timetable Slots Table
CREATE TABLE IF NOT EXISTS public.timetable (
  id TEXT PRIMARY KEY,
  branch TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  period_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher TEXT NOT NULL,
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Lecture', 'Lab', 'Tutorial')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Holidays & Vacations Table
CREATE TABLE IF NOT EXISTS public.holidays (
  id TEXT PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('holiday', 'vacation', 'exam', 'sunday')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Campus Notices Table
CREATE TABLE IF NOT EXISTS public.notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('normal', 'urgent', 'info')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Room Bookings Table
CREATE TABLE IF NOT EXISTS public.room_bookings (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  booked_by TEXT NOT NULL,
  reason TEXT NOT NULL,
  day TEXT NOT NULL,
  period_id TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;

-- 10. PUBLIC READ POLICIES (Everyone / anonymous visitors can view schedules)
CREATE POLICY "Public Read Branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Public Read Rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Public Read Periods" ON public.periods FOR SELECT USING (true);
CREATE POLICY "Public Read Timetable" ON public.timetable FOR SELECT USING (true);
CREATE POLICY "Public Read Holidays" ON public.holidays FOR SELECT USING (true);
CREATE POLICY "Public Read Notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Public Read Bookings" ON public.room_bookings FOR SELECT USING (true);

-- Allow public / teachers to book free rooms
CREATE POLICY "Public Insert Bookings" ON public.room_bookings FOR INSERT WITH CHECK (true);

-- 11. ADMIN WRITE POLICIES (Only authenticated users can insert, update, delete)
CREATE POLICY "Admin Write Branches" ON public.branches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Write Rooms" ON public.rooms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Write Periods" ON public.periods FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Write Timetable" ON public.timetable FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Write Holidays" ON public.holidays FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Write Notices" ON public.notices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Manage Bookings" ON public.room_bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 12. Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.timetable;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.holidays;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_bookings;
`;
