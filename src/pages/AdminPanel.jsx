import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAllBookings } from '@/hooks/useBookings'
import { useSlots } from '@/hooks/useSlots'
import { SlotGrid } from '@/components/SlotGrid'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BookingCalendar } from '@/components/BookingCalendar'
import {
  ShieldCheck, CalendarDays, Scissors, Users, CheckCircle,
  XCircle, Plus, Loader2, Lock, Unlock, RefreshCw, Clock
} from 'lucide-react'
import { format, parse, parseISO, addMinutes } from 'date-fns'
import { toast } from 'sonner'

function formatTime(t) {
  try { return format(parse(t, 'HH:mm:ss', new Date()), 'h:mm a') } catch { return t }
}

const statusConfig = {
  booked: { label: 'Booked', variant: 'booked' },
  completed: { label: 'Completed', variant: 'completed' },
  cancelled: { label: 'Cancelled', variant: 'cancelled' },
  no_show: { label: 'No Show', variant: 'no_show' },
}

// ── Tab 1: Today's Schedule ────────────────────────────────────────────────
function TodaySchedule() {
  const { bookings, loading, updateStatus } = useAllBookings()
  const [updating, setUpdating] = useState(null)
  const today = format(new Date(), 'yyyy-MM-dd')

  const todayBookings = bookings.filter(b => b.time_slots?.slot_date === today)

  async function handleStatus(id, status) {
    setUpdating(id)
    try {
      await updateStatus(id, status)
      toast.success(`Marked as ${status.replace('_', ' ')}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>

  if (todayBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 font-medium">No bookings for today</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {todayBookings
        .sort((a, b) => (a.time_slots?.start_time || '').localeCompare(b.time_slots?.start_time || ''))
        .map(booking => {
          const cfg = statusConfig[booking.status] || statusConfig.booked
          return (
            <Card key={booking.id}>
              <CardContent className="flex items-center justify-between gap-4 flex-wrap p-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-700/40 rounded-xl flex items-center justify-center shrink-0">
                    <Scissors className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-100">
                        {booking.profiles?.full_name || 'Unknown'}
                      </span>
                      {booking.profiles?.roll_number && (
                        <span className="text-xs text-slate-500">{booking.profiles.roll_number}</span>
                      )}
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-400 flex-wrap">
                      <span>{booking.time_slots?.barbers?.name}</span>
                      <span>·</span>
                      <span>{formatTime(booking.time_slots?.start_time)} – {formatTime(booking.time_slots?.end_time)}</span>
                      {booking.profiles?.phone && <span>· {booking.profiles.phone}</span>}
                    </div>
                  </div>
                </div>
                {booking.status === 'booked' && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                      disabled={updating === booking.id}
                      onClick={() => handleStatus(booking.id, 'completed')}
                    >
                      {updating === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Done
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
                      disabled={updating === booking.id}
                      onClick={() => handleStatus(booking.id, 'no_show')}
                    >
                      <XCircle className="w-4 h-4" />
                      No Show
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
    </div>
  )
}

// ── Tab 2: Manage Slots ────────────────────────────────────────────────────
function ManageSlots() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [barbers, setBarbers] = useState([])
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [toggling, setToggling] = useState(null)
  const { slots, loading, refetch } = useSlots(selectedDate, selectedBarber?.id)

  useEffect(() => {
    supabase.from('barbers').select('*').eq('is_active', true).then(({ data }) => {
      setBarbers(data || [])
      if (data?.length) setSelectedBarber(data[0])
    })
  }, [])

  async function generateSlots() {
    if (!selectedDate || !selectedBarber) return
    setGenerating(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const slots = []
      let current = parse('09:00', 'HH:mm', new Date())
      const end = parse('21:00', 'HH:mm', new Date())
      while (current < end) {
        const next = addMinutes(current, 30)
        slots.push({
          barber_id: selectedBarber.id,
          slot_date: dateStr,
          start_time: format(current, 'HH:mm'),
          end_time: format(next, 'HH:mm'),
        })
        current = next
      }
      const { error } = await supabase.from('time_slots').upsert(slots, {
        onConflict: 'barber_id,slot_date,start_time',
        ignoreDuplicates: true,
      })
      if (error) throw error
      toast.success(`Generated ${slots.length} slots for ${format(selectedDate, 'MMM d')}`)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to generate slots')
    } finally {
      setGenerating(false)
    }
  }

  async function toggleBlock(slot) {
    setToggling(slot.id)
    try {
      const { error } = await supabase
        .from('time_slots')
        .update({ is_blocked: !slot.is_blocked })
        .eq('id', slot.id)
      if (error) throw error
      toast.success(slot.is_blocked ? 'Slot unblocked' : 'Slot blocked')
      refetch()
    } catch {
      toast.error('Failed to toggle slot')
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold text-slate-300 mb-3">Select Date</h3>
        <Card>
          <CardContent className="p-0">
            <BookingCalendar selected={selectedDate} onSelect={setSelectedDate} />
          </CardContent>
        </Card>

        <div className="mt-4 space-y-3">
          <h3 className="font-semibold text-slate-300">Select Barber</h3>
          <div className="flex gap-2 flex-wrap">
            {barbers.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBarber(b)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  selectedBarber?.id === b.id
                    ? 'bg-gold-500/15 border-gold-400 text-gold-300'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>

          <Button onClick={generateSlots} disabled={generating || !selectedDate || !selectedBarber} className="w-full">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Generate Slots (9 AM – 9 PM, 30 min)
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-300">
            Slots — {selectedDate ? format(selectedDate, 'MMM d') : ''}
            {selectedBarber ? ` · ${selectedBarber.name}` : ''}
          </h3>
          <span className="text-xs text-slate-500">Click to block/unblock</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No slots for this date. Generate them first.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map(slot => {
              const isBooked = slot.appointments?.some(a => a.status === 'booked')
              return (
                <button
                  key={slot.id}
                  disabled={isBooked || toggling === slot.id}
                  onClick={() => !isBooked && toggleBlock(slot)}
                  className={`relative rounded-xl border p-2 text-center text-xs font-medium transition-all ${
                    isBooked
                      ? 'slot-taken cursor-not-allowed'
                      : slot.is_blocked
                      ? 'slot-blocked hover:bg-slate-600/30 cursor-pointer'
                      : 'slot-available cursor-pointer'
                  }`}
                >
                  {toggling === slot.id && <Loader2 className="w-3 h-3 animate-spin absolute top-1.5 right-1.5" />}
                  {!isBooked && !toggling && (
                    slot.is_blocked
                      ? <Unlock className="w-3 h-3 absolute top-1.5 right-1.5 text-slate-400" />
                      : <Lock className="w-3 h-3 absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-slate-400" />
                  )}
                  <div className="font-semibold">{formatTime(slot.start_time)}</div>
                  <div className="opacity-60 mt-0.5">{formatTime(slot.end_time)}</div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tab 3: Manage Barbers ─────────────────────────────────────────────────
function ManageBarbers() {
  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [toggling, setToggling] = useState(null)

  const fetchBarbers = useCallback(async () => {
    const { data } = await supabase.from('barbers').select('*').order('created_at')
    setBarbers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchBarbers() }, [fetchBarbers])

  async function addBarber(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    try {
      const { error } = await supabase.from('barbers').insert({ name: newName.trim() })
      if (error) throw error
      toast.success(`${newName} added`)
      setNewName('')
      fetchBarbers()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setAdding(false)
    }
  }

  async function toggleActive(barber) {
    setToggling(barber.id)
    try {
      const { error } = await supabase
        .from('barbers')
        .update({ is_active: !barber.is_active })
        .eq('id', barber.id)
      if (error) throw error
      toast.success(`${barber.name} ${barber.is_active ? 'deactivated' : 'activated'}`)
      fetchBarbers()
    } catch {
      toast.error('Failed to update barber')
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <form onSubmit={addBarber} className="flex gap-2">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Barber name..."
          className="flex-1 bg-navy-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30"
        />
        <Button type="submit" disabled={adding || !newName.trim()}>
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </Button>
      </form>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {barbers.map(b => (
            <Card key={b.id}>
              <CardContent className="flex items-center justify-between p-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center">
                    <Scissors className="w-4 h-4 text-gold-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">{b.name}</p>
                    <Badge variant={b.is_active ? 'completed' : 'cancelled'}>
                      {b.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant={b.is_active ? 'destructive' : 'outline'}
                  size="sm"
                  disabled={toggling === b.id}
                  onClick={() => toggleActive(b)}
                >
                  {toggling === b.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : b.is_active ? 'Deactivate' : 'Activate'
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Admin Panel ──────────────────────────────────────────────────────
export default function AdminPanel() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-gold-400" />
          Admin Panel
        </h1>
        <p className="text-slate-400 mt-1">Manage the salon schedule, slots, and barbers</p>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList className="mb-6">
          <TabsTrigger value="schedule">
            <CalendarDays className="w-4 h-4" />
            Today's Schedule
          </TabsTrigger>
          <TabsTrigger value="slots">
            <Clock className="w-4 h-4" />
            Manage Slots
          </TabsTrigger>
          <TabsTrigger value="barbers">
            <Scissors className="w-4 h-4" />
            Barbers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule"><TodaySchedule /></TabsContent>
        <TabsContent value="slots"><ManageSlots /></TabsContent>
        <TabsContent value="barbers"><ManageBarbers /></TabsContent>
      </Tabs>
    </div>
  )
}
