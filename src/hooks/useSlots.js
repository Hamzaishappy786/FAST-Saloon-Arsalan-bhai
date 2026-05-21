import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
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
          *,
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

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  // Realtime subscription
  useEffect(() => {
    if (!date) return

    const channel = supabase
      .channel(`slots-${format(date, 'yyyy-MM-dd')}-${barberId || 'all'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => { fetchSlots() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_slots' },
        () => { fetchSlots() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [date, barberId, fetchSlots])

  return { slots, loading, error, refetch: fetchSlots }
}

export function useTodaySlotsSummary() {
  const [summary, setSummary] = useState({ total: 0, available: 0, booked: 0 })
  const [loading, setLoading] = useState(true)

  const fetchSummary = useCallback(async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const { data, error } = await supabase
        .from('time_slots')
        .select('id, is_blocked, appointments(id, status)')
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

  useEffect(() => {
    fetchSummary()

    const channel = supabase
      .channel('today-summary')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchSummary)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchSummary])

  return { summary, loading }
}
