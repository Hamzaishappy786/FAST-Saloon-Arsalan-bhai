import { useRef, useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { saveAvatar, loadAvatar, removeAvatar } from '@/lib/localAvatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/nameUtils'
import { Camera, Trash2, User, Phone, Hash, ShieldCheck, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

const roleColors = {
  admin:   'admin',
  barber:  'admin',
  teacher: 'booked',
  student: 'secondary',
}

export default function Profile() {
  const { user, profile } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (user?.id) setAvatarUrl(loadAvatar(user.id))
  }, [user?.id])

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await saveAvatar(user.id, file)
      setAvatarUrl(url)
      window.dispatchEvent(new Event('avatar-updated'))
      toast.success('Profile photo updated!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function handleRemove() {
    removeAvatar(user.id)
    setAvatarUrl(null)
    window.dispatchEvent(new Event('avatar-updated'))
    toast.success('Profile photo removed')
  }

  const initials = getInitials(profile?.full_name)
  const joinDate = user?.created_at
    ? format(new Date(user.created_at), 'MMMM d, yyyy')
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <User className="w-6 h-6 text-gold-400" />
          My Profile
        </h1>
        <p className="text-slate-400 mt-1">Your account info — photo is saved on this device only</p>
      </div>

      {/* Avatar section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6 flex-wrap">
          {/* Avatar display */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gold-500/40 shadow-lg shadow-gold-500/10">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gold-500/15 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gold-300">{initials}</span>
                </div>
              )}
            </div>
            {/* Camera button overlay */}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-9 h-9 bg-gold-500 hover:bg-gold-400 rounded-full flex items-center justify-center shadow-lg transition-colors"
              title="Change photo"
            >
              <Camera className="w-4 h-4 text-navy-900" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-300">
                {avatarUrl ? 'Looking great! 👍' : 'No photo set yet'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Stored only on this device · JPG, PNG, WEBP · auto-resized to 200×200px
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="w-4 h-4" />
                {uploading ? 'Saving...' : avatarUrl ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {avatarUrl && (
                <Button size="sm" variant="destructive" onClick={handleRemove}>
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow
            icon={User}
            label="Full Name"
            value={profile?.full_name}
          />
          <InfoRow
            icon={Mail}
            label="Email"
            value={user?.email}
          />
          {profile?.roll_number && (
            <InfoRow
              icon={Hash}
              label="Roll Number"
              value={profile.roll_number}
            />
          )}
          {profile?.phone && (
            <InfoRow
              icon={Phone}
              label="Phone"
              value={profile.phone}
            />
          )}
          <InfoRow
            icon={ShieldCheck}
            label="Role"
            value={
              <Badge variant={roleColors[profile?.role] || 'secondary'}>
                {profile?.role || 'student'}
              </Badge>
            }
          />
          {joinDate && (
            <InfoRow
              icon={User}
              label="Member Since"
              value={joinDate}
            />
          )}
        </CardContent>
      </Card>

      {/* Device storage note */}
      <p className="text-xs text-slate-600 text-center">
        💡 Your profile photo is saved in your browser's local storage on this device.
        It won't appear on other devices or after clearing browser data.
      </p>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-700/40 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        {typeof value === 'string' || typeof value === 'undefined' ? (
          <p className="text-sm text-slate-200 mt-0.5 truncate">{value || '—'}</p>
        ) : (
          <div className="mt-0.5">{value}</div>
        )}
      </div>
    </div>
  )
}
