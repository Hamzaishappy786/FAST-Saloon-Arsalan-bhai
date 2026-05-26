<div align="center">

<img src="public/scissors.svg" width="80" alt="NUCES Salon Logo" />

# ✂️ NUCES Salon
### FAST CFD Campus - Hostel Salon Booking System

*A parting gift to the people who made this place feel like home.*

---

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-realtime-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## 💌 A Note Before You Click Anything

To every student who ever stood in that queue outside the hostel salon - waiting, chatting, killing time between classes - this one's for you.

Four years at FAST CFD goes by faster than you think. You stop noticing the things that are just *there* - the chai wala, the chai dhaba, the cricket on the ground out back, and Arsalan bhai and Ustad Amjad, always ready with a fresh cut and a conversation, no matter how packed the day was.

This app won't change much. You'll still show up, still talk nonsense, still argue about cricket. But maybe now you won't have to *wait* as long - and maybe the chaos gets a little more organized. Consider it a small thank-you, from one batch to everyone who comes after.

**Leaving is strange. You don't realize how much a place meant until you're writing goodbye code for it.**

Take care of each other. Keep the place alive. And always tip Arsalan bhai.

- *With love, Batch of 2026* 🎓

---

## 💈 The Men Behind the Scissors

These two are the real reason this app exists. If you've ever left the salon feeling like a different person - it's their doing.

<table align="center">
  <tr>
    <td align="center" width="300">
      <img src="public/arsalan.jpg" width="180" height="180" style="border-radius: 50%; object-fit: cover;" alt="Arsalan Bhai" /><br/>
      <!-- Replace public/arsalan.jpg with Arsalan bhai's actual photo -->
      <br/>
      <strong>Arsalan Bhai</strong><br/>
      <em>The OG. Master of the fade.<br/>Everyone's go-to guy.</em>
    </td>
    <td align="center" width="300">
      <img src="public/amjad.jpg" width="180" height="180" style="border-radius: 50%; object-fit: cover;" alt="Ustad Amjad" /><br/>
      <!-- Replace public/amjad.jpg with Ustad Amjad's actual photo -->
      <br/>
      <strong>Ustad Amjad</strong><br/>
      <em>Senior craftsman. Precise, patient,<br/>and always on time.</em>
    </td>
  </tr>
</table>

> **To add their photos:** Drop `arsalan.jpg` and `amjad.jpg` into the `public/` folder and push. They'll show up right here.

---

## 🧑‍🎓 How to Use the App - For Students & Teachers

No tech knowledge needed. Here's everything from start to finish.

### Step 1 - Create Your Account

Go to the website and click **Register**.

Fill in:
- Your **full name**
- Your **roll number** *(students only - teachers can leave it blank)*
- Your **phone number**
- Whether you're a **Student** or **Teacher**
- Your **email** and a **password**

Hit **Create Account** and you're in.

---

### Step 2 - Check What's Available

The **Dashboard** is your home screen. Every time you open the app you'll see:

| What you see | What it means |
|---|---|
| 🟢 Green slots | Available - you can book these |
| 🔴 Red slots | Already taken by someone else |
| ⬛ Grey slots | Blocked by admin (holiday, break, etc.) |

The slot colors update **live in real time** - if your friend books a slot while you're looking at the same screen, it'll turn red instantly without you refreshing.

You'll also see your **next upcoming appointment** highlighted right on the dashboard.

---

### Step 3 - Book a Slot

Click **Book** in the navbar or the big **Book Appointment** button.

The booking wizard has 4 steps:

```
1. Pick a date   →   2. Choose a barber   →   3. Pick a time slot   →   4. Confirm
```

- **Step 1:** A calendar opens. Past dates are greyed out - you can only book today or future dates.
- **Step 2:** Choose between Arsalan Bhai and Ustad Amjad. Both are legends.
- **Step 3:** A grid of time slots appears (9 AM to 9 PM, every 30 minutes). Green = free, Red = taken. Tap any green slot.
- **Step 4:** Review your booking summary, add an optional note (e.g. *"trim and fade"*), and hit **Confirm Booking**.

You'll get a success notification and land on your bookings page.

---

### Step 4 - View or Cancel Your Bookings

Go to **My Bookings** in the navbar.

- **Upcoming tab:** All your booked slots that haven't happened yet
- **Past tab:** Your full history - completed, cancelled, no-shows

To **cancel**, click the Cancel button on any upcoming appointment. You can only cancel if the slot is **more than 30 minutes away** - after that it's locked in.

---

## 🔐 For Admins (Arsalan Bhai / Management)

The **Admin Panel** is visible only to accounts with the `admin` or `barber` role.

### Tab 1 - Today's Schedule
See every booking for today in chronological order. For each one you can:
- Mark as **Completed** ✅ - once the customer is done
- Mark as **No Show** ❌ - if they didn't turn up

### Tab 2 - Manage Slots
Pick a date and a barber, then click **Generate Slots** to create 30-minute slots from 9 AM to 9 PM automatically. You can also **block** individual slots (e.g. for lunch breaks or days off) - blocked slots show as grey and can't be booked.

### Tab 3 - Manage Barbers
Add new barbers by name, or deactivate existing ones. Deactivated barbers won't appear in the booking flow.

### Making Someone an Admin
After they sign up, run this in the Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'their-email@example.com'
);
```

---

<div align="center">

*FAST NUCES, CFD Campus - Hostel Salon*
*Batch of 2026 🎓*

</div>
