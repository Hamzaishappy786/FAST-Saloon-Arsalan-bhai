import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { LogOut, User, Scissors, LayoutDashboard, CalendarPlus, BookOpen, ShieldCheck, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

export function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      toast.success('Signed out successfully')
      navigate('/login')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?'

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-gold-400 bg-gold-500/10 border border-gold-500/20'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
    }`

  return (
    <nav className="sticky top-0 z-40 border-b border-white/8 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gold-500/15 border border-gold-500/30 rounded-xl flex items-center justify-center group-hover:bg-gold-500/25 transition-colors">
              <Scissors className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-100">NUCES</span>
              <span className="text-base font-bold text-gold-400 ml-1">Salon</span>
            </div>
          </Link>

          {/* Nav Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
              <NavLink to="/book" className={navLinkClass}>
                <CalendarPlus className="w-4 h-4" />
                Book
              </NavLink>
              <NavLink to="/my-bookings" className={navLinkClass}>
                <BookOpen className="w-4 h-4" />
                My Bookings
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </NavLink>
              )}
            </div>
          )}

          {/* User Menu */}
          {user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/5 transition-colors group focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-200 leading-none">
                      {profile?.full_name?.split(' ')[0] || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{profile?.role || 'student'}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[200px] glass-card rounded-xl p-1.5 shadow-xl mt-2"
                  sideOffset={4}
                  align="end"
                >
                  <div className="px-3 py-2 border-b border-white/8 mb-1">
                    <p className="text-sm font-semibold text-slate-200">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>

                  <DropdownMenu.Item asChild>
                    <Link
                      to="/my-bookings"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 rounded-lg cursor-pointer transition-colors focus:outline-none focus:bg-white/5"
                    >
                      <User className="w-4 h-4" />
                      My Bookings
                    </Link>
                  </DropdownMenu.Item>

                  {isAdmin && (
                    <DropdownMenu.Item asChild>
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 rounded-lg cursor-pointer transition-colors focus:outline-none focus:bg-white/5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenu.Item>
                  )}

                  <DropdownMenu.Separator className="h-px bg-white/8 my-1" />

                  <DropdownMenu.Item
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors focus:outline-none focus:bg-rose-500/10"
                    onSelect={handleSignOut}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
