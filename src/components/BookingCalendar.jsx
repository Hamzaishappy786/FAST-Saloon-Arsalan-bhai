import { DayPicker } from 'react-day-picker'
import { isBefore, startOfDay } from 'date-fns'
import 'react-day-picker/dist/style.css'

export function BookingCalendar({ selected, onSelect }) {
  const today = startOfDay(new Date())

  return (
    <div className="flex justify-center">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={[{ before: today }]}
        showOutsideDays={false}
        className="text-slate-200"
        modifiersClassNames={{
          selected: 'rdp-day_selected',
          disabled: 'rdp-day_disabled',
        }}
      />
    </div>
  )
}
