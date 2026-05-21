import { createContext, useContext, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Single shared realtime channel for the entire app.
 * All hooks subscribe to this instead of creating their own Supabase channels.
 * This means 1 WebSocket connection per browser tab regardless of how many
 * hooks are listening — critical for staying within Supabase's 200-connection limit.
 */
const RealtimeContext = createContext(null)

export function RealtimeProvider({ children }) {
  const listenersRef = useRef({ appointments: new Set(), time_slots: new Set() })

  useEffect(() => {
    const channel = supabase
      .channel('app-global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        listenersRef.current.appointments.forEach(fn => fn())
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_slots' }, () => {
        listenersRef.current.time_slots.forEach(fn => fn())
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <RealtimeContext.Provider value={listenersRef}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeListener(table, callback) {
  const listenersRef = useContext(RealtimeContext)

  useEffect(() => {
    if (!listenersRef) return
    const listeners = listenersRef.current[table]
    if (!listeners) return
    listeners.add(callback)
    return () => { listeners.delete(callback) }
  }, [listenersRef, table, callback])
}
