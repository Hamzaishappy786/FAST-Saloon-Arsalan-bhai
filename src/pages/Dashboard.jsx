import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useBookings } from '@/hooks/useBookings'
import { useTodaySlotsSummary, useSlots } from '@/hooks/useSlots'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarPlus, Clock, CheckCircle, Scissors, TrendingUp, Zap } from 'lucide-react'
import { format, parseISO, isAfter, parse } from 'date-fns'
import { getDisplayName } from '@/lib/nameUtils'

function formatTime(timeStr) {
  try {
    const d = parse(timeStr, 'HH:mm:ss', new Date())
    return format(d, 'h:mm a')
  } catch { return timeStr }
}

function StatCard({ label, value, icon: Icon, color, loading }) {
  return (
    <Card className={`border-${color}-500/20`}>
      <CardContent className="flex items-center gap-4 p-0">
        <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-7 w-12 mb-1" />
          ) : (
            <p className="text-2xl font-bold text-slate-100">{value}</p>
          )}
          <p className="text-xs text-slate-500 font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { profile } = useAuth()
  const { bookings, loading: bookingsLoading } = useBookings()
  const { summary, loading: summaryLoading } = useTodaySlotsSummary()
  const today = new Date()
  const { slots, loading: slotsLoading } = useSlots(today)

  const upcoming = bookings.filter(b => {
    if (b.status !== 'booked') return false
    const slot = b.time_slots
    if (!slot) return false
    try {
      const dt = parse(`${slot.slot_date} ${slot.start_time}`, 'yyyy-MM-dd HH:mm:ss', new Date())
      return isAfter(dt, new Date())
    } catch { return false }
  })

  const nextAppointment = upcoming[0]

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {greeting()}, <span className="text-gold-400">{getDisplayName(profile?.full_name)}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1">
            {format(today, "EEEE, MMMM d, yyyy")} · NUCES CFD Hostel Salon
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/book">
            <CalendarPlus className="w-5 h-5" />
            Book Appointment
          </Link>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Available Today" value={summary.available} icon={Zap} color="emerald" loading={summaryLoading} />
        <StatCard label="Booked Today" value={summary.booked} icon={CheckCircle} color="blue" loading={summaryLoading} />
        <StatCard label="Your Upcoming" value={upcoming.length} icon={TrendingUp} color="gold" loading={bookingsLoading} />
      </div>

      {/* Next Appointment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-base font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-400" />
            Next Appointment
          </h2>
          {bookingsLoading ? (
            <Skeleton className="h-32 rounded-xl" />
          ) : nextAppointment ? (
            <Card className="border-gold-500/25 gold-glow">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gold-500/15 rounded-xl flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{nextAppointment.time_slots?.barbers?.name}</p>
                    <Badge variant="booked">booked</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-300 font-medium">
                    {nextAppointment.time_slots?.slot_date
                      ? format(parseISO(nextAppointment.time_slots.slot_date), 'EEE, MMM d')
                      : '—'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {formatTime(nextAppointment.time_slots?.start_time)} – {formatTime(nextAppointment.time_slots?.end_time)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-6 p-0">
                <Scissors className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-medium">No upcoming appointments</p>
                <Button asChild size="sm" className="mt-3">
                  <Link to="/book">Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Today's Live Feed */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold-400" />
            Today's Slot Feed
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-normal">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live
            </span>
          </h2>
          {slotsLoading ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 p-0">
                <p className="text-slate-400">No slots generated for today</p>
                <p className="text-slate-600 text-sm mt-1">Ask admin to generate slots</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {slots.map(slot => {
                const isBooked = slot.appointments?.some(a => a.status === 'booked')
                const isBlocked = slot.is_blocked
                return (
                  <div
                    key={slot.id}
                    className={`rounded-xl border p-2 text-center text-xs font-medium transition-colors ${
                      isBlocked
                        ? 'bg-slate-700/30 border-slate-600/20 text-slate-600'
                        : isBooked
                        ? 'bg-rose-500/15 border-rose-500/25 text-rose-400'
                        : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                    }`}
                  >
                    {formatTime(slot.start_time)}
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 bg-emerald-500/40 border border-emerald-500/40 rounded" />
              Available
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 bg-rose-500/40 border border-rose-500/40 rounded" />
              Booked
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 bg-slate-700/40 border border-slate-600/40 rounded" />
              Blocked
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
