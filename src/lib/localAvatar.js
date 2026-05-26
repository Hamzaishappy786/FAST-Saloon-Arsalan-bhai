const avatarKey = (userId) => `nuces-salon-avatar-${userId}`
const MAX_PX = 200   // resize to 200×200 max
const QUALITY = 0.75 // JPEG quality — keeps file tiny

/**
 * Compress an image File to 200×200 JPEG and save to localStorage.
 * Returns the dataURL string, or throws if storage is full.
 */
export async function saveAvatar(userId, file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please pick an image file'))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Invalid image'))
      img.onload = () => {
        // Resize keeping aspect ratio, max 200×200
        const scale = Math.min(MAX_PX / img.width, MAX_PX / img.height, 1)
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)

        const dataUrl = canvas.toDataURL('image/jpeg', QUALITY)
        try {
          localStorage.setItem(avatarKey(userId), dataUrl)
          resolve(dataUrl)
        } catch {
          reject(new Error('Device storage full — try clearing browser data'))
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

/** Load avatar dataURL from localStorage. Returns null if not set. */
export function loadAvatar(userId) {
  if (!userId) return null
  return localStorage.getItem(avatarKey(userId)) || null
}

/** Remove avatar from localStorage. */
export function removeAvatar(userId) {
  if (!userId) return
  localStorage.removeItem(avatarKey(userId))
}
