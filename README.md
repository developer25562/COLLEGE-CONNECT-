# CampusPulse - College Schedule & Room Availability Web App

A high-performance, real-time college scheduling, classroom & lab availability tracker, and holiday calendar built with React, Vite, Tailwind CSS, Motion, and SheetJS.

---

## 🚀 Features Overview

1. **Hero / Today Live Status Banner**
   - Live College Open/Closed status pill with glowing indicator (reasons: regular hours, Sunday, gazetted holiday, Diwali vacation, exam week, or administrative emergency).
   - Live digital clock, today's date, current running period progress ring/bar, and countdown to next period.
   - Animated count-up stat cards: **Rooms Free Now**, **Classes Running Now**, and **Days Until Next Break**.

2. **Branch Timetable**
   - Segmented branch switcher: **CSE**, **CSE-AI**, **Civil**, **Civil-CA**, **Mechanical** with unique color accents.
   - Day selector (Mon–Sat) with today auto-selected.
   - Responsive layout: Grid view for desktop and vertical timeline on mobile (switchable anytime).
   - Current running period highlighted with glowing border, progress bar, dimmed past periods, and normal upcoming periods.
   - Slim, styled Tea & Lunch break rows.
   - One-click **Print Timetable** and **Download CSV / Timetable** buttons.

3. **Room Availability & Directory**
   - Live availability tracking across 16+ campus facilities (Classrooms 101–104, 201–204, 301–302, AI Lab, Computer Lab, Civil CAD Lab, Fluid Mechanics Lab, Central Workshop, Seminar Hall, Drawing Hall).
   - Dynamic badges: **Occupied** (shows branch, subject, instructor, and "Free at [time]") vs **Free** ("Free until [time]") vs **Under Maintenance**.
   - Filters: Status (All / Free Now / Occupied), Room Type, Floor, Capacity, and Search.
   - **Time-Slot Picker**: Choose any Day + Period to immediately find available rooms.
   - **Instant Room Booking**: Teachers can book free rooms for extra lectures or review sessions.
   - **Full-Day Heatmap Matrix**: Rooms $\times$ Periods matrix with color-coded slots for the entire day.

4. **Vacation & Holiday Calendar**
   - Monthly calendar with color-coded days: Gazetted Holidays (Red), Multi-day Vacations (Amber), Exams (Purple), Working Days, and Today.
   - Click any date to view detailed event cards and status.
   - Sidebar: **Upcoming Breaks** with live countdown chips.
   - Smooth month-to-month transitions.

5. **Campus Time Machine Widget**
   - Test any hour, minute, day of the week, or holiday scenario with one click (e.g. *Monday 10:15 AM active classes*, *1:15 PM lunch break*, *6:00 PM off-hours*, *Sunday*, or *Diwali break*).

6. **Admin Panel & SheetJS Excel Engine**
   - Protected Admin Portal (`/admin` or via the top navigation bar).
   - **Excel Batch Import**: Drag-and-drop `.xlsx`, `.xls`, or `.csv` files.
   - **Pre-made Excel Template Download**: Generates a 4-sheet template (`Timetable`, `Rooms`, `Holidays`, `Periods`) pre-filled with sample data.
   - **Automated Clash Detection**:
     - Detects **Room Clashes** (two classes scheduled in the same room at the same time).
     - Detects **Teacher Clashes** (same professor scheduled in two rooms simultaneously).
     - Highlights error rows in red with exact fix hints.
   - **Replace All** vs **Merge/Update** options, upload progress bar, and confetti celebration.
   - **Undo Upload**: Revert changes from the last 5 uploads using automatic state snapshots.
   - **Manual Editors**:
     - *Timetable Editor*: Click-to-edit slots with automatic free-room filtering and 1-click routine cloning to other days/branches.
     - *Room Manager*: Add/edit/delete rooms and toggle "Under Maintenance" state.
     - *Holiday Manager*: Add/edit/delete single holidays and vacation ranges.
     - *Notice Manager*: Broadcast flash announcements to the public top banner ticker.
     - *Quick Overrides*: "Mark today as holiday", "Cancel a class today", "Swap room today" (auto-expires at midnight).

---

## 🛠️ Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📝 Where to Edit Default Data

All initial/sample data is neatly organized and typed in:
- **`src/data/initialData.ts`**:
  - `INITIAL_BRANCHES`: Branch names, codes, and accent colors.
  - `INITIAL_PERIODS`: Period start/end times and break labels.
  - `INITIAL_ROOMS`: Room catalog, capacities, floors, and types.
  - `INITIAL_HOLIDAYS`: Festival dates, vacation ranges, and exam schedules.
  - `INITIAL_TIMETABLE`: Weekly class schedule for all 5 branches (Mon–Sat).
  - `INITIAL_NOTICES`: Urgent campus announcements.

---

## 🌐 Supabase Integration (Going Live)

CampusPulse works 100% offline with local caching, and seamlessly synchronizes with **Supabase PostgreSQL** for multi-user production.

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the Supabase Dashboard, open **SQL Editor** -> **New Query**.
3. Copy and run the complete SQL script provided in the Admin Portal under the **Database & Deploy** tab (or in `src/services/supabaseClient.ts`). This sets up tables, foreign keys, and Row Level Security (RLS) policies.

### Step 2: Set Environment Variables
In your `.env` file (or deployment platform settings):
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

### Step 3: Create First Admin User
1. In Supabase Dashboard, go to **Authentication** -> **Users** -> **Add User**.
2. Create an admin email and password.
3. Log in through the Admin Portal (`/admin`) using these credentials.

---

## 🚀 Deployment Instructions

### Deploy to Vercel (Free Tier)
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **Add New** -> **Project**.
3. Select your repository.
4. Settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
6. Click **Deploy**. The included `vercel.json` ensures `/admin` and deep routes work with SPA rewrites.

### Deploy to Netlify
1. Connect repository on [netlify.com](https://netlify.com).
2. Build command: `npm run build`, Publish directory: `dist`.
3. SPA routing is already pre-configured in `public/_redirects`.

### Custom Domain & HTTPS
In Vercel or Netlify settings under **Domains**, add your college domain (e.g., `schedule.yourcollege.edu`). Add a CNAME DNS record pointing to the host. SSL/HTTPS certificates are automatically issued for free.

---

## 📱 Progressive Web App (PWA)
- Fully installable on iOS (Safari Add to Home Screen) and Android / Desktop Chrome.
- Service Worker precaches static assets and application shell for instant offline access.
- Non-intrusive offline indicator when disconnected from network.
