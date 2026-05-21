/**
 * Returns the most meaningful first name to display.
 * Skips "Muhammad" as a prefix (very common in Pakistani names)
 * so "Muhammad Hamza" shows as "Hamza", but "Hamza Ahmed" shows as "Hamza".
 */
export function getDisplayName(fullName, fallback = 'there') {
  if (!fullName) return fallback
  const parts = fullName.trim().split(/\s+/)
  if (parts.length > 1 && parts[0].toLowerCase() === 'muhammad') {
    return parts[1]
  }
  return parts[0]
}

/**
 * Returns initials for an avatar, also skipping "Muhammad" prefix.
 * "Muhammad Hamza Khan" → "HK", "Ali Raza" → "AR"
 */
export function getInitials(fullName, fallback = '?') {
  if (!fullName) return fallback
  const parts = fullName.trim().split(/\s+/)
  const relevant = parts[0].toLowerCase() === 'muhammad' && parts.length > 1
    ? parts.slice(1)
    : parts
  return relevant.map(n => n[0]).join('').slice(0, 2).toUpperCase()
}
