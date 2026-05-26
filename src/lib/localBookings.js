const STORAGE_KEY = 'nuces-salon-bookings'

function getKey(userId) {
  return `${STORAGE_KEY}-${userId}`
}

/**
 * Save bookings array to localStorage for a user.
 * Merges with existing history so old entries are never lost.
 */
export function saveBookingsLocally(userId, bookings) {
  if (!userId || !bookings?.length) return
  try {
    const existing = loadLocalBookings(userId)
    const map = new Map()

    // Load existing first (older entries)
    existing.forEach(b => map.set(b.id, b))

    // Overwrite / add fresh data from server
    bookings.forEach(b => {
      map.set(b.id, {
        id: b.id,
        status: b.status,
        notes: b.notes,
        booked_at: b.booked_at,
        updated_at: b.updated_at,
        slot_date: b.time_slots?.slot_date || null,
        start_time: b.time_slots?.start_time || null,
        end_time: b.time_slots?.end_time || null,
        barber_name: b.time_slots?.barbers?.name || null,
      })
    })

    const merged = Array.from(map.values())
    localStorage.setItem(getKey(userId), JSON.stringify(merged))
  } catch (err) {
    console.error('Failed to save bookings locally:', err)
  }
}

/**
 * Load all locally stored bookings for a user.
 */
export function loadLocalBookings(userId) {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(getKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
