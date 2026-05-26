import { useState, useMemo } from 'react'
import { useBookings } from '@/hooks/useBookings'
import { useAuth } from '@/context/AuthContext'
import { loadLocalBookings } from '@/lib/localBookings'
import { AppointmentCard } from '@/components/AppointmentCard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { BookOpen, CalendarPlus, Clock } from 'lucide-react'
import { isAfter, parse } from 'date-fns'
import { toast } from 'sonner'

function isUpcoming(booking) {
  if (booking.status !== 'booked') return false
  const slot = booking.time_slots
  if (!slot) return false
  try {
    const dt = parse(`${slot.slot_date} ${slot.start_time}`, 'yyyy-MM-dd HH:mm:ss', new Date())
    return isAfter(dt, new Date())
  } catch { return false }
}

/** Check if a local-format booking is upcoming */
function isLocalUpcoming(b) {
  if (b.status !== 'booked') return false
  if (!b.slot_date || !b.start_time) return false
  try {
    const dt = parse(`${b.slot_date} ${b.start_time}`, 'yyyy-MM-dd HH:mm:ss', new Date())
    return isAfter(dt, new Date())
  } catch { return false }
}

export default function MyBookings() {
  const { user } = useAuth()
  const { bookings, loading, cancelBooking } = useBookings()
  const [cancelling, setCancelling] = useState(null)

  const upcoming = bookings.filter(isUpcoming)

  // Past bookings: merge server data with localStorage history
  // so entries survive the 7-day DB cleanup
  const past = useMemo(() => {
    const serverPast = bookings.filter(b => !isUpcoming(b))
    const serverIds = new Set(serverPast.map(b => b.id))

    // Grab locally stored bookings that are no longer in the DB
    const localBookings = loadLocalBookings(user?.id)
    const localOnly = localBookings
      .filter(b => !serverIds.has(b.id) && !isLocalUpcoming(b))
      .map(b => ({
        // Shape it like a server booking so AppointmentCard can render it
        id: b.id,
        status: b.status,
        notes: b.notes,
        booked_at: b.booked_at,
        updated_at: b.updated_at,
        time_slots: {
          slot_date: b.slot_date,
          start_time: b.start_time,
          end_time: b.end_time,
          barbers: { name: b.barber_name || 'Unknown' },
        },
        _local: true, // flag so we know it came from localStorage
      }))

    // Merge and sort by date descending
    return [...serverPast, ...localOnly].sort((a, b) => {
      const dateA = a.time_slots?.slot_date || a.booked_at || ''
      const dateB = b.time_slots?.slot_date || b.booked_at || ''
      return dateB.localeCompare(dateA)
    })
  }, [bookings, user?.id])

  async function handleCancel(id) {
    setCancelling(id)
    try {
      await cancelBooking(id)
      toast.success('Appointment cancelled')
    } catch (err) {
      toast.error(err.message || 'Could not cancel — please try again')
    } finally {
      setCancelling(null)
    }
  }

  function EmptyState({ message, sub }) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-700/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-slate-600" />
        </div>
        <p className="text-slate-400 font-medium">{message}</p>
        <p className="text-slate-600 text-sm mt-1">{sub}</p>
        <Button asChild className="mt-4">
          <Link to="/book">
            <CalendarPlus className="w-4 h-4" />
            Book Now
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-gold-400" />
            My Bookings
          </h1>
          <p className="text-slate-400 mt-1">Your appointment history at NUCES Salon</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/book">
            <CalendarPlus className="w-4 h-4" />
            New Booking
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">
            Upcoming
            {upcoming.length > 0 && (
              <span className="ml-2 bg-gold-500/20 text-gold-300 text-xs px-1.5 py-0.5 rounded-full border border-gold-500/30">
                {upcoming.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">
            Past
            {past.length > 0 && (
              <span className="ml-2 bg-slate-700/60 text-slate-400 text-xs px-1.5 py-0.5 rounded-full">
                {past.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState
              message="No upcoming appointments"
              sub="Book a slot and get that fresh cut"
            />
          ) : (
            <div className="space-y-3">
              {upcoming.map(b => (
                <AppointmentCard
                  key={b.id}
                  appointment={b}
                  onCancel={handleCancel}
                  showCancelButton={cancelling !== b.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : past.length === 0 ? (
            <EmptyState
              message="No past appointments yet"
              sub="Your history will show up here"
            />
          ) : (
            <div className="space-y-3">
              {past.map(b => (
                <AppointmentCard
                  key={b.id}
                  appointment={b}
                  showCancelButton={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
