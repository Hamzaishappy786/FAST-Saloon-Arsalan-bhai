import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useRealtimeListener } from '@/context/RealtimeContext'
import { debounce } from '@/lib/debounce'
import { format } from 'date-fns'

export function useSlots(date, barberId) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSlots = useCallback(async () => {
    if (!date) return
    setLoading(true)
    setError(null)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      let query = supabase
        .from('time_slots')
        .select(`
          id, barber_id, slot_date, start_time, end_time, is_blocked,
          barbers (id, name),
          appointments (id, status, user_id, profiles (full_name, roll_number))
        `)
        .eq('slot_date', dateStr)
        .order('start_time')

      if (barberId) query = query.eq('barber_id', barberId)

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      setSlots(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [date, barberId])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  // Debounced so rapid successive DB events don't each fire a request
  const debouncedRefetch = useMemo(() => debounce(fetchSlots, 600), [fetchSlots])

  useRealtimeListener('appointments', debouncedRefetch)
  useRealtimeListener('time_slots', debouncedRefetch)

  return { slots, loading, error, refetch: fetchSlots }
}

export function useTodaySlotsSummary() {
  const [summary, setSummary] = useState({ total: 0, available: 0, booked: 0 })
  const [loading, setLoading] = useState(true)

  const fetchSummary = useCallback(async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      // Lightweight query — only fetch the fields we need for counting
      const { data, error } = await supabase
        .from('time_slots')
        .select('id, is_blocked, appointments(status)')
        .eq('slot_date', today)

      if (error) throw error

      const total = data?.length || 0
      const booked = data?.filter(s =>
        !s.is_blocked && s.appointments?.some(a => a.status === 'booked')
      ).length || 0
      const available = data?.filter(s =>
        !s.is_blocked && !s.appointments?.some(a => a.status === 'booked')
      ).length || 0

      setSummary({ total, available, booked })
    } catch (err) {
      console.error('Summary fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSummary() }, [fetchSummary])

  const debouncedRefetch = useMemo(() => debounce(fetchSummary, 600), [fetchSummary])
  useRealtimeListener('appointments', debouncedRefetch)

  return { summary, loading }
}
