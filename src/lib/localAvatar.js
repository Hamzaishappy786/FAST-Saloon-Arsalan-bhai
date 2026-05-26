const avatarKey = (userId) => `nuces-salon-avatar-${userId}`

/**
 * Save a cropped dataURL (already processed by CropModal) to localStorage.
 * Throws if storage is full.
 */
export function saveAvatarDataUrl(userId, dataUrl) {
  try {
    localStorage.setItem(avatarKey(userId), dataUrl)
    return dataUrl
  } catch {
    throw new Error('Device storage full — try clearing browser data')
  }
}

/**
 * Read a raw File into a dataURL so the CropModal can display it.
 * No resizing here — that happens after the user crops.
 */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please pick an image file'))
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.onload = (e) => resolve(e.target.result)
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
