import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Prayer from './pages/Prayer'
import Quran from './pages/Quran'
import Cycle from './pages/Cycle'
import Worship from './pages/Worship'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Profile from './pages/Profile'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [onboarded, setOnboarded] = useState(
    localStorage.getItem('nura_onboarded') === 'true'
  )
  const [mode, setMode] = useState(
    localStorage.getItem('nura_mode') || null
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        setMode('auth')
        localStorage.setItem('nura_mode', 'auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleOnboardingFinish = (choice) => {
    localStorage.setItem('nura_onboarded', 'true')
    localStorage.setItem('nura_mode', choice)
    setOnboarded(true)
    setMode(choice)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (!onboarded) {
    return <Onboarding onFinish={handleOnboardingFinish} />
  }

  if (mode === 'auth' && !session) {
    return <Auth onBack={() => {
      setMode('guest')
      localStorage.setItem('nura_mode', 'guest')
    }} />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 pb-16 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/prayer" element={<Prayer />} />
          <Route path="/quran" element={<Quran />} />
          <Route path="/cycle" element={<Cycle />} />
          <Route path="/worship" element={<Worship />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App