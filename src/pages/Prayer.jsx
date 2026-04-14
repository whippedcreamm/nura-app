import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'
import Header from '../components/Header'

function Prayer() {
  const { isGuest, userId } = useAuth()
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [hijriDate, setHijriDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [coords, setCoords] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [checked, setChecked] = useState({
    Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false,
  })
  const [toast, setToast] = useState(null)

  const displayPrayers = [
    { key: 'Fajr', label: 'Fajr' },
    { key: 'Sunrise', label: 'Syuruq' },
    { key: 'Dhuhr', label: 'Dhuhr' },
    { key: 'Asr', label: 'Asr' },
    { key: 'Maghrib', label: 'Maghrib' },
    { key: 'Isha', label: 'Isha' },
    { key: 'Midnight', label: 'Midnight' },
  ]

  const trackablePrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

  const todayKey = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const getToastMessage = (count) => {
    if (count === 1) return 'Alhamdulillah! Keep it up 🤲'
    if (count === 2) return 'MasyaAllah, 2 down! 🌿'
    if (count === 3) return 'Halfway there, barakallahu fiik!'
    if (count === 4) return 'Almost complete, subhanallah!'
    if (count === 5) return 'Alhamdulillah, all 5 prayers done today! 🌟'
    return null
  }

  const loadChecked = async () => {
    if (isGuest) {
      const saved = localStorage.getItem(`nura_prayer_${todayKey()}`)
      if (saved) setChecked(JSON.parse(saved))
    } else if (userId) {
      const today = todayKey()
      const { data } = await supabase
        .from('prayer_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()
      if (data) {
        setChecked({
          Fajr: data.fajr, Dhuhr: data.dhuhr, Asr: data.asr,
          Maghrib: data.maghrib, Isha: data.isha,
        })
      }
    }
  }

  const saveChecked = async (updated) => {
    if (isGuest) {
      localStorage.setItem(`nura_prayer_${todayKey()}`, JSON.stringify(updated))
    } else if (userId) {
      const today = todayKey()
      const { data: existing } = await supabase
        .from('prayer_logs').select('id').eq('user_id', userId).eq('date', today).maybeSingle()
      if (existing) {
        await supabase.from('prayer_logs').update({
          fajr: updated.Fajr, dhuhr: updated.Dhuhr, asr: updated.Asr,
          maghrib: updated.Maghrib, isha: updated.Isha,
        }).eq('id', existing.id)
      } else {
        await supabase.from('prayer_logs').insert({
          user_id: userId, date: today,
          fajr: updated.Fajr, dhuhr: updated.Dhuhr, asr: updated.Asr,
          maghrib: updated.Maghrib, isha: updated.Isha,
        })
      }
    }
  }

  const fetchPrayerTimes = async (latitude, longitude, date) => {
    setLoading(true)
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=13`
    )
    const data = await res.json()
    setPrayerTimes(data.data.timings)
    setHijriDate(data.data.date.hijri)
    setLoading(false)
  }

  useEffect(() => {
    loadChecked()
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ latitude, longitude })
        fetchPrayerTimes(latitude, longitude, selectedDate)
      },
      () => setLoading(false)
    )
  }, [userId])

  const changeDate = (days) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
    if (coords) fetchPrayerTimes(coords.latitude, coords.longitude, newDate)
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  const formatDate = (date) => date.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const getCurrentPrayer = () => {
    if (!prayerTimes) return null
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    let current = null
    for (const key of trackablePrayers) {
      const [h, m] = prayerTimes[key].split(':').map(Number)
      if (h * 60 + m <= currentTime) current = key
    }
    return current
  }

  const currentPrayer = isToday ? getCurrentPrayer() : null
  const checkedCount = Object.values(checked).filter(Boolean).length

  const toggle = (key) => {
    setChecked((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      const count = Object.values(updated).filter(Boolean).length
      setToast(count > 0 ? getToastMessage(count) : null)
      saveChecked(updated)
      return updated
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Prayer Times"
        subtitle={hijriDate ? `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year} H` : ''}
      />

      <div className="px-4 -mt-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => changeDate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">‹</button>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800">{isToday ? 'Today' : formatDate(selectedDate)}</p>
              {isToday && <p className="text-xs text-gray-400">{formatDate(selectedDate)}</p>}
            </div>
            <button onClick={() => changeDate(1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">›</button>
          </div>
        </div>

        {isToday && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Prayer tracker</p>
              <p className="text-xs text-[#4FA095] font-medium">{checkedCount} / 5</p>
            </div>
            <div className="flex justify-between">
              {trackablePrayers.map((prayer) => (
  <button key={prayer} onClick={() => toggle(prayer)} className="flex flex-col items-center gap-2">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
      checked[prayer] ? 'bg-[#4FA095] text-white' : 'bg-gray-100 text-gray-300'
    }`}>
      {checked[prayer] ? <span className="text-sm">✓</span> : <span className="text-sm">○</span>}
    </div>
    <span className="text-xs text-gray-400">{prayer}</span>
  </button>
))}
            </div>
            {toast && <p className="text-sm text-[#4FA095] font-medium mt-4 text-center">{toast}</p>}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Schedule</p>
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-4">Loading prayer times...</p>
          ) : prayerTimes ? (
            <div className="space-y-1">
              {displayPrayers.map((prayer) => {
                const isActive = currentPrayer === prayer.key
                return (
                  <div key={prayer.key} className={`flex items-center justify-between px-3 py-3 rounded-xl ${isActive ? 'bg-[#4FA095]/10' : ''}`}>
                    <div className="flex items-center gap-3">
                      {isActive && <div className="w-1.5 h-5 bg-[#4FA095] rounded-full" />}
                      <span className={`text-sm font-medium ${isActive ? 'text-[#4FA095]' : 'text-gray-700'}`}>{prayer.label}</span>
                    </div>
                    <span className={`text-sm ${isActive ? 'text-[#4FA095] font-semibold' : 'text-gray-400'}`}>{prayerTimes[prayer.key]}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">Could not load prayer times. Please allow location access.</p>
          )}
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}

export default Prayer