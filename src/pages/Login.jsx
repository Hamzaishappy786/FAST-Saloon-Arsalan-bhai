import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Scissors, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const { user, signIn, signUp, loading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    rollNumber: '',
    phone: '',
    role: 'student',
  })

  if (!loading && user) return <Navigate to="/dashboard" replace />

  function update(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await signIn({ email: form.email, password: form.password })
        toast.success('Welcome back!')
        navigate('/dashboard')
      } else {
        if (!form.fullName.trim()) throw new Error('Full name is required')
        if (form.password.length < 6) throw new Error('Password must be at least 6 characters')
        await signUp({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          rollNumber: form.rollNumber,
          phone: form.phone,
          role: form.role,
        })
        toast.success('Account created! You can now sign in.')
        setMode('login')
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gold-500/10 border-2 border-gold-500/30 rounded-2xl mb-5 gold-glow">
            <Scissors className="w-10 h-10 text-gold-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">
            NUCES <span className="text-gold-400">Salon</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">FAST CFD Campus — Hostel Salon Booking</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          {/* Mode Toggle */}
          <div className="flex gap-1 bg-navy-900/60 rounded-xl p-1 mb-6 border border-white/8">
            {['login', 'register'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                  mode === m
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Register-only fields */}
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={update('fullName')}
                    placeholder="Muhammad Ali"
                    required
                    className="w-full bg-navy-900/60 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Roll Number</label>
                    <input
                      type="text"
                      value={form.rollNumber}
                      onChange={update('rollNumber')}
                      placeholder="23F-XXXX"
                      className="w-full bg-navy-900/60 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={update('phone')}
                      placeholder="03XX-XXXXXXX"
                      className="w-full bg-navy-900/60 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">I am a...</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['student', 'teacher'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, role: r }))}
                        className={`py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                          form.role === r
                            ? 'bg-gold-500/15 text-gold-300 border-gold-500/40'
                            : 'text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
                required
                className="w-full bg-navy-900/60 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                  required
                  className="w-full bg-navy-900/60 border border-white/10 rounded-xl px-4 py-3 pr-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base mt-2"
              disabled={submitting}
            >
              {submitting
                ? 'Please wait...'
                : mode === 'login' ? 'Sign In' : 'Create Account'
              }
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-gold-400 hover:text-gold-300 font-medium"
            >
              {mode === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          ✂️ Made with love for FAST CFD Campus Hostel
        </p>
      </div>
    </div>
  )
}
