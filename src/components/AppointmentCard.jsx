import { format, parse, parseISO, isAfter, addMinutes } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, Scissors } from 'lucide-react'

function formatTime(timeStr) {
  try {
    const d = parse(timeStr, 'HH:mm:ss', new Date())
    return format(d, 'h:mm a')
  } catch {
    return timeStr
  }
}

const statusVariant = {
  booked: 'booked',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'no_show',
}

export function AppointmentCard({ appointment, onCancel, showCancelButton = true }) {
  const slot = appointment.time_slots
  const barber = slot?.barbers

  const slotDate = slot?.slot_date ? parseISO(slot.slot_date) : null
  const slotDateTime = slotDate && slot?.start_time
    ? parse(`${slot.slot_date} ${slot.start_time}`, 'yyyy-MM-dd HH:mm:ss', new Date())
    : null

  const canCancel =
    showCancelButton &&
    appointment.status === 'booked' &&
    slotDateTime &&
    isAfter(slotDateTime, addMinutes(new Date(), 30))

  return (
    <Card className="hover:border-gold-500/25 transition-all duration-200">
      <CardContent className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0">
            <Scissors className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-100">
                {barber?.name || 'Barber'}
              </span>
              <Badge variant={statusVariant[appointment.status] || 'secondary'}>
                {appointment.status?.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {slotDate && (
                <span className="flex items-center gap-1 text-sm text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(slotDate, 'EEE, MMM d, yyyy')}
                </span>
              )}
              {slot?.start_time && (
                <span className="flex items-center gap-1 text-sm text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                </span>
              )}
            </div>
            {appointment.notes && (
              <p className="text-xs text-slate-500 mt-1">{appointment.notes}</p>
            )}
          </div>
        </div>

        {canCancel && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onCancel?.(appointment.id)}
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
