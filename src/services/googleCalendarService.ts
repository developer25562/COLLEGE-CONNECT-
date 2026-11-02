import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { DayOfWeek, Period, TimetableSlot } from '../types';
import { formatIcsLocalDate, formatIcsUtcDate, getNextDayOccurrence } from '../utils/icsGenerator';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(app);

// Configure Google Auth Provider with requested Google Calendar scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar');
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

// In-Memory Token Cache (MANDATORY: Never stored in localStorage or sessionStorage per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GoogleCalendarItem {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
}

export interface SyncProgressCallback {
  (progress: { current: number; total: number; currentItem: string; status: 'syncing' | 'completed' | 'error'; error?: string }): void;
}

/**
 * Initializes Firebase Auth state observer. Call this on app load or modal mount.
 */
export const initCalendarAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
): (() => void) => {
  return onAuthStateChanged(firebaseAuth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token expired or page refreshed, user is authenticated but needs re-auth for fresh Workspace token
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Trigger Google Sign-In with Calendar Scopes via popup
 */
export const signInWithGoogleCalendar = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Google Calendar access token was not returned from OAuth flow.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out of Google Calendar session and clear memory cache
 */
export const signOutGoogleCalendar = async (): Promise<void> => {
  await signOut(firebaseAuth);
  cachedAccessToken = null;
};

/**
 * Retrieves currently cached in-memory access token
 */
export const getCalendarAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Fetch list of user's Google Calendars
 */
export const listGoogleCalendars = async (accessToken: string): Promise<GoogleCalendarItem[]> => {
  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to fetch calendars (${response.status})`);
  }

  const data = await response.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary,
    description: item.description,
    primary: Boolean(item.primary),
    backgroundColor: item.backgroundColor
  }));
};

/**
 * Creates a dedicated secondary Google Calendar for College Connect
 */
export const createDedicatedCalendar = async (
  accessToken: string,
  summary: string,
  description: string,
  timeZone: string = 'Asia/Kolkata'
): Promise<GoogleCalendarItem> => {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary,
      description,
      timeZone
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to create calendar (${response.status})`);
  }

  const data = await response.json();
  return {
    id: data.id,
    summary: data.summary,
    description: data.description,
    primary: false
  };
};

const DAY_TO_BYDAY: Record<DayOfWeek, string> = {
  Monday: 'MO',
  Tuesday: 'TU',
  Wednesday: 'WE',
  Thursday: 'TH',
  Friday: 'FR',
  Saturday: 'SA'
};

/**
 * Bulk syncs timetable entries as recurring events to Google Calendar.
 * Note: Must be invoked only after explicit user confirmation in the UI.
 */
export const syncEntriesToGoogleCalendar = async (
  accessToken: string,
  calendarId: string,
  slots: TimetableSlot[],
  periods: Period[],
  options: {
    branchName: string;
    branchId: string;
    semester?: string;
    untilDate?: Date;
    timeZone?: string;
  },
  onProgress?: SyncProgressCallback
): Promise<{ successCount: number; errors: string[] }> => {
  const {
    branchName,
    branchId,
    semester,
    untilDate = new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000),
    timeZone = 'Asia/Kolkata'
  } = options;

  const validSlots = slots.filter((s) => s.subject && s.day && DAY_TO_BYDAY[s.day]);
  const total = validSlots.length;
  let successCount = 0;
  const errors: string[] = [];

  const untilUtc = formatIcsUtcDate(untilDate);

  for (let i = 0; i < total; i++) {
    const slot = validSlots[i];
    const period = periods.find((p) => p.id === slot.periodId || p.label === slot.periodId);
    const startTimeStr = slot.start_time || period?.start || '09:00';
    const endTimeStr = slot.end_time || period?.end || '09:55';

    const dayOccurrence = getNextDayOccurrence(slot.day, new Date());
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);

    const startDate = new Date(dayOccurrence);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(dayOccurrence);
    endDate.setHours(endH, endM, 0, 0);

    const byDay = DAY_TO_BYDAY[slot.day];

    const eventPayload = {
      summary: `${slot.subject} (${slot.type || 'Lecture'})`,
      location: slot.roomId || 'Campus Classroom',
      description: `Course: ${slot.subject}\nFaculty: ${slot.teacher || 'Faculty'}\nRoom: ${slot.roomId}\nBranch: ${branchName} (${branchId})${semester ? `\nSemester: ${semester}` : ''}\n\nSynced via College Connect`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone
      },
      recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${untilUtc}`],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 },
          { method: 'popup', minutes: 60 }
        ]
      }
    };

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        currentItem: `${slot.subject} (${slot.day})`,
        status: 'syncing'
      });
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventPayload)
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        errors.push(`Failed to sync ${slot.subject}: ${err?.error?.message || response.statusText}`);
      } else {
        successCount++;
      }
    } catch (err: any) {
      errors.push(`Network error for ${slot.subject}: ${err.message}`);
    }

    // Brief delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }

  if (onProgress) {
    onProgress({
      current: total,
      total,
      currentItem: 'All classes processed',
      status: errors.length === total ? 'error' : 'completed',
      error: errors.length > 0 ? `${errors.length} events failed to sync` : undefined
    });
  }

  return { successCount, errors };
};
