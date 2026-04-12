import { useState, useEffect } from 'react'

function Dashboard() {
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [nextPrayer, setNextPrayer] = useState(null)
  const [loading, setLoading] = useState(true)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
  const displayPrayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

  const getNextPrayer = (times) => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    for (const prayer of prayers) {
      const [h, m] = times[prayer].split(':').map(Number)
      const prayerMinutes = h * 60 + m
      if (prayerMinutes > currentTime) {
        const diff = prayerMinutes - currentTime
        const hours = Math.floor(diff / 60)
        const mins = diff % 60
        return {
          name: prayer,
          time: times[prayer],
          countdown: hours > 0 ? `in ${hours}h ${mins}m` : `in ${mins}m`
        }
      }
    }
    return { name: 'Fajr', time: times['Fajr'], countdown: 'tomorrow' }
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords

        const date = new Date()
        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()

        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=13`
        )
        const data = await res.json()
        const timings = data.data.timings
        setPrayerTimes(timings)
        setNextPrayer(getNextPrayer(timings))
        setLoading(false)
      },
      () => {
        setLoading(false)
      }
    )
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#4FA095] px-6 pt-12 pb-8">
        <p className="text-[#B2D8D4] text-sm">{greeting()}</p>
        <h1 className="text-white text-2xl font-semibold mt-1">Nura</h1>
        <p className="text-[#B2D8D4] text-sm mt-1">نور — Your light in every day</p>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Next prayer</p>
          {loading ? (
            <p className="text-gray-400 text-sm">Getting your location...</p>
          ) : nextPrayer ? (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{nextPrayer.name}</h2>
                <p className="text-gray-400 text-sm">{nextPrayer.countdown}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-[#4FA095]">{nextPrayer.time}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Could not get location. Please allow access.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Today's prayers</p>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : prayerTimes ? (
            <div className="space-y-3">
              {displayPrayers.map((prayer) => (
                <div key={prayer} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-gray-100 text-gray-400">
                    </div>
                    <span className="text-sm font-medium text-gray-400">
                      {prayer === 'Sunrise' ? 'Syuruq' : prayer}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">{prayerTimes[prayer]}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Could not load prayer times.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard