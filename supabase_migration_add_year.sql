-- ============================================================
-- Migration: add optional 'year' column to profiles
-- Run this in Supabase SQL Editor if you already ran the schema
-- ============================================================

alter table public.profiles
  add column if not exists year text
  check (year in ('1', '2', '3', '4'));

-- Update the trigger so new signups can store their year too
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, roll_number, phone, role, year)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.raw_user_meta_data->>'roll_number',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'year'
  );
  return new;
end;
$$ language plpgsql security definer;
