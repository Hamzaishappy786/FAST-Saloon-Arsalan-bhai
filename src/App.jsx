import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { RealtimeProvider } from '@/context/RealtimeContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Navbar } from '@/components/Navbar'
import { Toaster } from 'sonner'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import BookAppointment from '@/pages/BookAppointment'
import MyBookings from '@/pages/MyBookings'
import AdminPanel from '@/pages/AdminPanel'
import Profile from '@/pages/Profile'

function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RealtimeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2e4a',
              border: '1px solid rgba(245,158,11,0.2)',
              color: '#e2e8f0',
            },
            classNames: {
              success: 'border-emerald-500/30',
              error: 'border-rose-500/30',
            },
          }}
          richColors
        />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/book"
            element={
              <ProtectedRoute>
                <Layout><BookAppointment /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <Layout><MyBookings /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Layout><AdminPanel /></Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </RealtimeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
