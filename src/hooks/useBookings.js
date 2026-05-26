import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useRealtimeListener } from '@/context/RealtimeContext'
import { debounce } from '@/lib/debounce'
import { saveBookingsLocally } from '@/lib/localBookings'

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
          id, status, notes, booked_at, updated_at, user_id,
          time_slots (id, slot_date, start_time, end_time, barbers (id, name))
        `)
        .eq('user_id', user.id)
        .order('booked_at', { ascending: false })

      if (fetchError) throw fetchError
      setBookings(data || [])
      // Save to localStorage so past bookings survive DB cleanup
      saveBookingsLocally(user.id, data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const debouncedRefetch = useMemo(() => debounce(fetchBookings, 600), [fetchBookings])
  useRealtimeListener('appointments', debouncedRefetch)

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

// Clean up appointments older than 7 days from the database.
// Runs once per admin session to keep the system fresh.
let cleanupDone = false
async function cleanupOldAppointments() {
  if (cleanupDone) return
  cleanupDone = true
  try {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    const cutoffStr = cutoff.toISOString().split('T')[0]

    // Delete appointments linked to slots older than 7 days
    await supabase
      .from('appointments')
      .delete()
      .lt('booked_at', cutoffStr)

    // Also delete orphan time_slots older than 7 days to keep DB tidy
    await supabase
      .from('time_slots')
      .delete()
      .lt('slot_date', cutoffStr)
  } catch (err) {
    console.error('Cleanup old appointments failed:', err)
  }
}

export function useAllBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      // Clean up records older than 7 days
      await cleanupOldAppointments()

      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, status, notes, booked_at, updated_at, user_id,
          profiles (full_name, roll_number, phone, role),
          time_slots (id, slot_date, start_time, end_time, barbers (id, name))
        `)
        .order('booked_at', { ascending: false })

      if (error) throw error
      const upcoming = (data || []).filter(b => (b.time_slots?.slot_date || '') >= today)
      setBookings(upcoming)
    } catch (err) {
      console.error('Admin bookings fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const debouncedRefetch = useMemo(() => debounce(fetchAll, 600), [fetchAll])
  useRealtimeListener('appointments', debouncedRefetch)

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
