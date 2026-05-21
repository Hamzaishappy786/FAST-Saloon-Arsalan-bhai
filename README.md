# ✂️ NUCES Salon — FAST CFD Campus Hostel Booking App

A real-time salon booking web app built as a parting gift for ~500 students and teachers at FAST NUCES, CFD Campus hostel salon.

**Tech Stack:** React + Vite + Tailwind CSS + Supabase + Vercel

---

## Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project** — name it `nuces-salon`
3. Choose a region close to Pakistan (e.g. Singapore)
4. Wait for provisioning (~2 minutes)

### 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor → New Query**
2. Paste the contents of [`supabase_schema.sql`](./supabase_schema.sql) and click **Run**
3. Then paste [`supabase_seed.sql`](./supabase_seed.sql) and run that too

This creates all tables, RLS policies, the auto-profile trigger, enables Realtime, and inserts 2 barbers + 7 days of slots.

### 3. Set Environment Variables

```bash
cp .env.example .env
```

Fill in your Supabase credentials (from **Project Settings → API**):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Install & Run Locally

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy** — done!

The `vercel.json` already handles SPA routing.

---

## Setting the First Admin

After signing up with your account, run this SQL in Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'your-email@example.com'
);
```

Reload the app — you'll now see the **Admin** link in the navbar and have access to `/admin`.

---

## Features

| Feature | Details |
|---|---|
| Auth | Email/password signup + login via Supabase Auth |
| Roles | Student, Teacher, Admin, Barber |
| Dashboard | Live slot feed, next appointment, quick stats |
| Booking | 4-step wizard: date → barber → slot → confirm |
| My Bookings | Upcoming/past tabs, cancel (>30 min before) |
| Admin Panel | Today's schedule, slot generation, barber management |
| Realtime | Slots turn red instantly when booked by someone else |
| Responsive | Optimized for desktop, works on mobile |

---

## Supabase Free Tier & 500 Users

The app is designed to stay within Supabase's free tier:
- All queries are indexed (primary keys, `slot_date`, `user_id`)
- Realtime subscriptions are scoped per date/barber (not global)
- No polling — pure event-driven updates

---

## Project Structure

```
nuces-salon/
├── src/
│   ├── components/
│   │   ├── ui/           # Button, Card, Badge, Dialog, Tabs, Avatar, Skeleton
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── BookingCalendar.jsx
│   │   ├── SlotGrid.jsx
│   │   └── AppointmentCard.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── BookAppointment.jsx
│   │   ├── MyBookings.jsx
│   │   └── AdminPanel.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSlots.js
│   │   └── useBookings.js
│   ├── lib/supabase.js
│   ├── context/AuthContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── supabase_schema.sql
├── supabase_seed.sql
├── vercel.json
└── .env.example
```

---

*Made with ❤️ for FAST CFD Campus Hostel — batch of 2025.*
