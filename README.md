# College Connect - Routine & Room Availability Dashboard

A production-grade, real-time college routine, classroom & lab availability tracker, and holiday calendar web application built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase (PostgreSQL + RLS)**.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Run full automated test suite (13 unit & integration tests)
npm test

# 4. Build for production
npm run build
```

Open `http://localhost:3000` in your web browser.

---

## 🗄️ Supabase Database Setup (Idempotent 1-File Migration)

College Connect features a complete, database-enforced relational schema with strict Row Level Security (RLS) policies.

### Step 1: Run the Schema Migration in Supabase
1. Open your project dashboard at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** -> **New Query**.
3. Open `supabase/migrations/001_schema.sql` (or click **"Copy Migration SQL"** in the app's **Setup Checker** / **Database SQL** tab).
4. Paste the entire file into the SQL Editor and click **Run**.
5. The script is **100% idempotent** (`CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `CREATE OR REPLACE FUNCTION`); running it multiple times is safe and will never corrupt or duplicate data.

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

### Step 3: Create Your First Admin User
All new sign-ups are automatically assigned the `student` role by database trigger. Roles cannot be escalated from client forms.

1. Sign up or log into the app via the Admin sign-in modal.
2. In the Supabase **SQL Editor**, run the following single command to promote your account:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@EXAMPLE.COM');
```
3. Return to the app and click **"Re-check database"** in the Setup Checker. You will be immediately granted full administrative privileges.

---

## 🛡️ Built-in Setup Checker

If environment variables are missing, tables have not yet been migrated, or a logged-in user lacks admin privileges, the app presents a full-page diagnostic UI (`/admin`):
- Lists which required tables are present vs missing.
- **1-Click "Copy Complete Migration SQL"** to copy `001_schema.sql` to your clipboard.
- Pre-fills your account's email in the admin promotion SQL snippet.
- **"Re-check database"** button probes the tables and automatically transitions into the admin portal once ready.

---

## 📋 Admin Panel (8 Dedicated Tabs)

1. **Upload**:
   - Download the official **6-sheet Excel template** (`Timetable`, `Rooms`, `Periods`, `Holidays`, `Subjects`, `Professors`).
   - Drag & drop `.xlsx`, `.xls`, or `.csv` files.
   - Interval-overlap clash detection: identifies conflicting room bookings and professor double-bookings.
   - **Replace All** vs **Merge/Append** modes.
   - **PDF/Image OCR Notice**: Experimental warning guiding coordinators to use the verified 6-sheet template for 100% reliable scheduling.
2. **Timetable**:
   - Filter by Branch, Day of Week, and Semester (`SEM1` through `SEM8`).
   - Conflict prevention: blocks room clashes and professor overlap.
   - **Draft vs Live** status badges and a 1-click **"Publish All Drafts"** action.
   - **1-Click Routine Clone**: Copy routine from any day/branch to another with one tap.
3. **Rooms & Master Data**:
   - Manage Classrooms & Labs with capacities, floors, and "Under Maintenance" toggle.
   - Manage Branches (CSE, CSE-AI, Civil, Civil-CA, Mechanical) and their colors.
   - Manage Faculty & Professors catalog and course subjects.
4. **Periods**:
   - Configure custom period timings, labels, and break slots (Tea & Lunch breaks).
5. **Holidays & Vacation**:
   - Schedule single holidays or multi-day vacation ranges (e.g. Diwali break).
   - Scope: Whole College or Branch-specific (e.g., Mechanical Workshop tour).
6. **Notices**:
   - Broadcast ticker notices to the campus header.
   - **Emergency Closure Toggle**: When activated, immediately overrides routine and marks the entire college as CLOSED campus-wide with an emergency alert banner.
7. **Settings**:
   - College name, logo, `Asia/Kolkata` timezone, academic year, contact details, and working days.
8. **Upload History**:
   - Inspect the last 5 uploads with row counts, file names, and timestamps.
   - **1-Click Undo**: Revert changes from any recent upload by restoring database snapshots.

---

## 🎓 Public Student & Faculty Experience

- **Hero / Today Banner**: Real-time status pill (**College is OPEN** / **College is CLOSED**), live clock, period progress bar, next period countdown, and stat cards.
- **Scheduled Status Disclaimer**: `Scheduled status based on published timetable, not sensor-verified physical occupancy.`
- **Branch Timetable**: Responsive desktop grid & mobile timeline view with glowing current period indicator.
- **Room Availability**: Real-time room cards (**Occupied** with branch, teacher, free-at time vs **Free** with free-until time), time slot picker, and full-day heatmap matrix.
- **Vacation & Holiday Calendar**: Color-coded monthly view with countdowns.
- **Time Machine Modal**: Test any time, period, holiday, or off-hours scenario with one click.
- **Offline PWA Support**: Full offline capability via service worker and local storage cache.

---

## 🧪 Testing

The test suite (`tests/schedule.test.ts`) verifies:
1. Status across all periods, breaks, off-hours, and midnight boundaries.
2. Multi-day vacations and branch-specific holiday scoping.
3. Immediate emergency closure overriding active schedules.
4. Room and professor interval conflict detection.
5. Room availability derivation.

Run tests:
```bash
npm test
```
