import { format, parse } from 'date-fns'
import { cn } from '@/components/ui/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Lock, CheckCircle, Clock } from 'lucide-react'
import { getDisplayName } from '@/lib/nameUtils'

function slotStatus(slot) {
  if (slot.is_blocked) return 'blocked'
  const appt = slot.appointments?.find(a => a.status === 'booked')
  if (appt) return 'taken'
  return 'available'
}

function formatTime(timeStr) {
  try {
    const d = parse(timeStr, 'HH:mm:ss', new Date())
    return format(d, 'h:mm a')
  } catch {
    return timeStr
  }
}

export function SlotGrid({ slots, loading, selectedSlotId, onSelect, adminMode = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!slots.length) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 font-medium">No slots available</p>
        <p className="text-slate-600 text-sm mt-1">Check back tomorrow or pick a different date</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {slots.map(slot => {
        const status = slotStatus(slot)
        const isSelected = selectedSlotId === slot.id
        const booker = slot.appointments?.[0]?.profiles

        return (
          <button
            key={slot.id}
            disabled={status !== 'available' && !adminMode}
            onClick={() => status === 'available' && onSelect?.(slot)}
            className={cn(
              'relative rounded-xl border p-3 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1',
              status === 'available' && !isSelected && 'slot-available',
              status === 'taken' && 'slot-taken',
              status === 'blocked' && 'slot-blocked',
              isSelected && 'slot-selected',
            )}
          >
            {status === 'blocked' && <Lock className="w-3 h-3 absolute top-1.5 right-1.5 text-slate-500" />}
            {status === 'taken' && <CheckCircle className="w-3 h-3 absolute top-1.5 right-1.5 text-rose-400" />}
            <span className="text-sm font-semibold">{formatTime(slot.start_time)}</span>
            <span className="text-xs opacity-70">{formatTime(slot.end_time)}</span>
            {adminMode && status === 'taken' && booker && (
              <span className="text-xs opacity-60 truncate w-full text-center">{getDisplayName(booker.full_name)}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
