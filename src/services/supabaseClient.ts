import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Import the raw schema for 1-click clipboard copying in SetupChecker and SupabaseDeployGuide
// @ts-ignore
import rawSchema from '../../supabase/migrations/001_schema.sql?raw';
export const SUPABASE_SQL_SCHEMA: string = rawSchema || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

export const REQUIRED_TABLES = [
  'settings',
  'branches',
  'semesters',
  'professors',
  'subjects',
  'classrooms',
  'periods',
  'timetable_entries',
  'timetable_exceptions',
  'holidays',
  'holiday_branches',
  'announcements',
  'upload_history',
  'profiles'
];

export interface SetupStatus {
  isConfigured: boolean;
  missingEnvVars: string[];
  missingTables: string[];
  checkedTables: string[];
  isReady: boolean;
  error?: string;
  currentUser?: User | null;
  currentProfile?: UserProfile | null;
  isAdmin: boolean;
}

export async function checkDatabaseSetup(): Promise<SetupStatus> {
  const missingEnvVars: string[] = [];
  if (!supabaseUrl || supabaseUrl.trim() === '' || supabaseUrl.includes('your-project')) {
    missingEnvVars.push('VITE_SUPABASE_URL');
  }
  if (!supabaseAnonKey || supabaseAnonKey.trim() === '' || supabaseAnonKey.includes('your-anon')) {
    missingEnvVars.push('VITE_SUPABASE_ANON_KEY');
  }

  if (missingEnvVars.length > 0 || !supabase) {
    return {
      isConfigured: false,
      missingEnvVars,
      missingTables: REQUIRED_TABLES,
      checkedTables: [],
      isReady: false,
      isAdmin: false
    };
  }

  const missingTables: string[] = [];
  const checkedTables: string[] = [];
  let probeError: string | undefined;

  // Probe each required table concurrently
  await Promise.all(
    REQUIRED_TABLES.map(async (table) => {
      try {
        const { error } = await supabase!
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1);

        if (error) {
          // Check for PostgREST / Postgres "relation does not exist" or permission issue
          const msg = (error.message || '').toLowerCase();
          const details = (error.details || '').toLowerCase();
          if (
            error.code === '42P01' ||
            msg.includes('does not exist') ||
            details.includes('does not exist') ||
            msg.includes('relation') ||
            error.code === 'PGRST205'
          ) {
            missingTables.push(table);
          } else {
            // Table might exist but is empty or restricted
            checkedTables.push(table);
          }
        } else {
          checkedTables.push(table);
        }
      } catch (err: any) {
        probeError = err.message;
        missingTables.push(table);
      }
    })
  );

  // Check auth and current profile role
  let currentUser: User | null = null;
  let currentProfile: UserProfile | null = null;
  let isAdmin = false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        currentProfile = profile as UserProfile;
        isAdmin = profile.role === 'admin';
      }
    }
  } catch {
    // Auth check error handled gracefully
  }

  const isReady = missingTables.length === 0;

  return {
    isConfigured: true,
    missingEnvVars: [],
    missingTables,
    checkedTables,
    isReady,
    error: probeError,
    currentUser,
    currentProfile,
    isAdmin
  };
}
