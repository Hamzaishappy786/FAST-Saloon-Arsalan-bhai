import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSlots } from '@/hooks/useSlots'
import { useBookings } from '@/hooks/useBookings'
import { supabase } from '@/lib/supabase'
import { BookingCalendar } from '@/components/BookingCalendar'
import { SlotGrid } from '@/components/SlotGrid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Scissors, Calendar, Clock, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { format, parse } from 'date-fns'
import { toast } from 'sonner'

function formatTime(timeStr) {
  try {
    const d = parse(timeStr, 'HH:mm:ss', new Date())
    return format(d, 'h:mm a')
  } catch { return timeStr }
}

const STEPS = ['Date', 'Barber', 'Slot', 'Confirm']

export default function BookAppointment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [notes, setNotes] = useState('')
  const [barbers, setBarbers] = useState([])
  const [barbersLoading, setBarbersLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  const { slots, loading: slotsLoading } = useSlots(selectedDate, selectedBarber?.id)
  const { bookSlot } = useBookings()

  useEffect(() => {
    async function fetchBarbers() {
      try {
        const { data, error } = await supabase
          .from('barbers')
          .select('*')
          .eq('is_active', true)
          .order('name')
        if (error) throw error
        setBarbers(data || [])
      } catch (err) {
        toast.error('Failed to load barbers')
      } finally {
        setBarbersLoading(false)
      }
    }
    fetchBarbers()
  }, [])

  async function handleConfirm() {
    if (!selectedSlot) return
    setBooking(true)
    try {
      await bookSlot(selectedSlot.id, notes)
      toast.success('Appointment booked! See you there ✂️')
      navigate('/my-bookings')
    } catch (err) {
      toast.error(err.message || 'Booking failed — slot may already be taken')
    } finally {
      setBooking(false)
    }
  }

  function canNext() {
    if (step === 0) return !!selectedDate
    if (step === 1) return !!selectedBarber
    if (step === 2) return !!selectedSlot
    return true
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Book an Appointment</h1>
        <p className="text-slate-400 mt-1">Reserve your slot at the NUCES CFD Hostel Salon</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-gold-400' : 'text-slate-600'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                i < step
                  ? 'bg-gold-500/20 border-gold-500 text-gold-300'
                  : i === step
                  ? 'bg-gold-500/15 border-gold-400 text-gold-300'
                  : 'border-slate-700 text-slate-600'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-gold-300' : i < step ? 'text-slate-400' : 'text-slate-600'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${i < step ? 'bg-gold-500/40' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="min-h-[380px]">
        <CardContent className="p-0">
          {/* Step 0: Date */}
          {step === 0 && (
            <div>
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold-400" />
                  Pick a Date
                </CardTitle>
              </CardHeader>
              <div className="mt-4">
                <BookingCalendar selected={selectedDate} onSelect={setSelectedDate} />
                {selectedDate && (
                  <p className="text-center text-sm text-gold-400 mt-2 font-medium">
                    Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Barber */}
          {step === 1 && (
            <div>
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-gold-400" />
                  Choose a Barber
                </CardTitle>
              </CardHeader>
              <div className="mt-4">
                {barbersLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-24 rounded-xl" />
                    <Skeleton className="h-24 rounded-xl" />
                  </div>
                ) : barbers.length === 0 ? (
                  <div className="text-center py-8">
                    <Scissors className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No barbers available right now</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {barbers.map(b => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBarber(b)}
                        className={`p-5 rounded-xl border text-left transition-all duration-200 ${
                          selectedBarber?.id === b.id
                            ? 'bg-gold-500/15 border-gold-400 text-gold-300 gold-glow'
                            : 'border-white/10 text-slate-300 hover:border-gold-500/30 hover:bg-gold-500/5'
                        }`}
                      >
                        <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center mb-3">
                          <Scissors className="w-5 h-5 text-gold-400" />
                        </div>
                        <p className="font-semibold">{b.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Barber</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Slot */}
          {step === 2 && (
            <div>
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold-400" />
                  Pick a Time Slot
                </CardTitle>
                {selectedDate && (
                  <p className="text-sm text-slate-400">
                    {format(selectedDate, 'EEEE, MMMM d')} · {selectedBarber?.name}
                  </p>
                )}
              </CardHeader>
              <div className="mt-4">
                <SlotGrid
                  slots={slots}
                  loading={slotsLoading}
                  selectedSlotId={selectedSlot?.id}
                  onSelect={setSelectedSlot}
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gold-400" />
                  Confirm Booking
                </CardTitle>
              </CardHeader>
              <div className="mt-4 space-y-4">
                <div className="bg-navy-900/60 rounded-xl border border-gold-500/20 p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Date</span>
                    <span className="text-slate-200 font-medium">
                      {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Barber</span>
                    <span className="text-slate-200 font-medium">{selectedBarber?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Time</span>
                    <span className="text-slate-200 font-medium">
                      {selectedSlot ? `${formatTime(selectedSlot.start_time)} – ${formatTime(selectedSlot.end_time)}` : '—'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Notes <span className="text-slate-600">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="E.g. trim and fade, beard shaping..."
                    rows={3}
                    className="w-full bg-navy-900/60 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="secondary"
          onClick={() => {
            if (step === 0) return
            setStep(s => s - 1)
            if (step === 2) setSelectedSlot(null)
            if (step === 1) setSelectedBarber(null)
          }}
          disabled={step === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleConfirm} disabled={booking || !selectedSlot}>
            {booking ? 'Booking...' : 'Confirm Booking ✂️'}
          </Button>
        )}
      </div>
    </div>
  )
}
