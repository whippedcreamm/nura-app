import { useState, useEffect } from 'react'

function Prayer() {
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [hijriDate, setHijriDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [coords, setCoords] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const displayPrayers = [
    { key: 'Fajr', label: 'Fajr' },
    { key: 'Sunrise', label: 'Syuruq' },
    { key: 'Dhuhr', label: 'Dhuhr' },
    { key: 'Asr', label: 'Asr' },
    { key: 'Maghrib', label: 'Maghrib' },
    { key: 'Isha', label: 'Isha' },
    { key: 'Midnight', label: 'Midnight' },
  ]

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
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ latitude, longitude })
        fetchPrayerTimes(latitude, longitude, selectedDate)
      },
      () => setLoading(false)
    )
  }, [])

  const changeDate = (days) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
    if (coords) fetchPrayerTimes(coords.latitude, coords.longitude, newDate)
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getCurrentPrayer = () => {
    if (!prayerTimes) return null
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    let current = null
    for (const key of prayerKeys) {
      const [h, m] = prayerTimes[key].split(':').map(Number)
      if (h * 60 + m <= currentTime) current = key
    }
    return current
  }

  const currentPrayer = isToday ? getCurrentPrayer() : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#4FA095] px-6 pt-12 pb-8">
        <h1 className="text-white text-2xl font-semibold">Prayer Times</h1>
        {hijriDate && (
          <p className="text-[#B2D8D4] text-sm mt-1">
            {hijriDate.day} {hijriDate.month.en} {hijriDate.year} H
          </p>
        )}
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-sm"
            >
              ‹
            </button>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800">
                {isToday ? 'Today' : formatDate(selectedDate)}
              </p>
              {isToday && (
                <p className="text-xs text-gray-400">{formatDate(selectedDate)}</p>
              )}
            </div>
            <button
              onClick={() => changeDate(1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-sm"
            >
              ›
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-4">Loading prayer times...</p>
          ) : prayerTimes ? (
            <div className="space-y-1">
              {displayPrayers.map((prayer) => {
                const isActive = currentPrayer === prayer.key
                return (
                  <div
                    key={prayer.key}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${
                      isActive ? 'bg-[#4FA095]/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isActive && (
                        <div className="w-1.5 h-6 bg-[#4FA095] rounded-full" />
                      )}
                      <span className={`text-sm font-medium ${
                        isActive ? 'text-[#4FA095]' : 'text-gray-700'
                      }`}>
                        {prayer.label}
                      </span>
                    </div>
                    <span className={`text-sm ${
                      isActive ? 'text-[#4FA095] font-semibold' : 'text-gray-400'
                    }`}>
                      {prayerTimes[prayer.key]}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">
              Could not load prayer times. Please allow location access.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Prayer