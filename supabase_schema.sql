-- ============================================================
-- NUCES Salon – Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Tables ──────────────────────────────────────────────────

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  roll_number text unique,
  phone text,
  role text not null default 'student' check (role in ('student', 'teacher', 'admin', 'barber')),
  created_at timestamptz default now()
);

create table public.barbers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.time_slots (
  id uuid default uuid_generate_v4() primary key,
  barber_id uuid references public.barbers(id) on delete cascade,
  slot_date date not null,
  start_time time not null,
  end_time time not null,
  is_blocked boolean default false,
  created_at timestamptz default now(),
  unique(barber_id, slot_date, start_time)
);

create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  slot_id uuid references public.time_slots(id) on delete cascade unique,
  status text default 'booked' check (status in ('booked', 'completed', 'cancelled', 'no_show')),
  notes text,
  booked_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Row Level Security ───────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.barbers enable row level security;
alter table public.time_slots enable row level security;
alter table public.appointments enable row level security;

-- Profiles
create policy "Users can view all profiles"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Barbers
create policy "Anyone can view barbers"
  on public.barbers for select using (true);

create policy "Admins can manage barbers"
  on public.barbers for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'barber')
    )
  );

-- Time Slots
create policy "Anyone can view slots"
  on public.time_slots for select using (true);

create policy "Admins can manage slots"
  on public.time_slots for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'barber')
    )
  );

-- Appointments
create policy "Users can view all appointments"
  on public.appointments for select using (true);

create policy "Users can book appointments"
  on public.appointments for insert with check (auth.uid() = user_id);

create policy "Users can cancel own appointments"
  on public.appointments for update using (
    auth.uid() = user_id or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'barber')
    )
  );

-- ── Auto-create Profile on Signup ────────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, roll_number, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.raw_user_meta_data->>'roll_number',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Realtime ────────────────────────────────────────────────

alter publication supabase_realtime add table public.appointments;
alter publication supabase_realtime add table public.time_slots;
