import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBookings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          time_slots (id, slot_date, start_time, end_time, barbers (id, name))
        `)
        .eq('user_id', user.id)
        .order('booked_at', { ascending: false })

      if (fetchError) throw fetchError
      setBookings(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  async function bookSlot(slotId, notes = '') {
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('appointments')
      .insert({ user_id: user.id, slot_id: slotId, notes })
      .select()
      .single()
    if (error) throw error
    await fetchBookings()
    return data
  }

  async function cancelBooking(appointmentId) {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
      .eq('user_id', user.id)
    if (error) throw error
    await fetchBookings()
  }

  return { bookings, loading, error, bookSlot, cancelBooking, refetch: fetchBookings }
}

export function useAllBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles (full_name, roll_number, phone, role),
          time_slots (id, slot_date, start_time, end_time, barbers (id, name))
        `)
        .order('time_slots(slot_date)', { ascending: true })

      if (error) throw error
      setBookings(data || [])
    } catch (err) {
      console.error('Admin bookings fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()

    const channel = supabase
      .channel('admin-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchAll)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchAll])

  async function updateStatus(appointmentId, status) {
    const { error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
    if (error) throw error
    await fetchAll()
  }

  return { bookings, loading, updateStatus, refetch: fetchAll }
}
