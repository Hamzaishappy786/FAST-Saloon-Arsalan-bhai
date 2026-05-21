-- ============================================================
-- NUCES Salon – Seed Data
-- Run AFTER supabase_schema.sql
-- Inserts 2 barbers + 7 days of time slots (9AM–9PM, 30-min)
-- ============================================================

-- Insert barbers
insert into public.barbers (id, name, is_active) values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Ustad Amjad', true),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Bilal Bhai', true)
on conflict do nothing;

-- Generate slots for next 7 days
-- Each barber gets slots from 09:00 to 21:00 in 30-minute increments
do $$
declare
  barber_ids uuid[] := array[
    'a1b2c3d4-0000-0000-0000-000000000001'::uuid,
    'a1b2c3d4-0000-0000-0000-000000000002'::uuid
  ];
  bid uuid;
  d date;
  slot_start time;
  slot_end time;
begin
  foreach bid in array barber_ids loop
    for day_offset in 0..6 loop
      d := current_date + day_offset;
      slot_start := '09:00'::time;
      while slot_start < '21:00'::time loop
        slot_end := slot_start + interval '30 minutes';
        insert into public.time_slots (barber_id, slot_date, start_time, end_time)
        values (bid, d, slot_start, slot_end)
        on conflict (barber_id, slot_date, start_time) do nothing;
        slot_start := slot_end;
      end loop;
    end loop;
  end loop;
end $$;

-- ============================================================
-- To make yourself admin, run this after signing up:
-- (replace 'your-email@example.com' with your actual email)
-- ============================================================
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'your-email@example.com');
