import { useState, useEffect } from 'react'

const surahList = [
  { id: 1, name: 'Al-Fatihah', verses: 7, description: 'The opening prayer — a conversation between you and Allah.' },
  { id: 18, name: 'Al-Kahfi', verses: 110, description: 'Stories of faith and trial — recite every Friday for protection.' },
  { id: 36, name: 'Ya-Sin', verses: 83, description: 'The heart of the Quran — a reminder of resurrection and Allah\'s power.' },
  { id: 55, name: 'Ar-Rahman', verses: 78, description: 'A celebration of Allah\'s blessings — which of His favors will you deny?' },
  { id: 56, name: "Al-Waqi'ah", verses: 96, description: 'On the Day of Judgment — recite daily for protection from poverty.' },
  { id: 67, name: 'Al-Mulk', verses: 30, description: 'Allah\'s sovereignty over all — recite every night before sleep.' },
  { id: 78, name: "An-Naba'", verses: 40, description: 'The great news of resurrection and the Day of Judgment.' },
  { id: 87, name: "Al-A'la", verses: 19, description: 'Glorify the name of your Lord — a reminder to purify the soul.' },
  { id: 93, name: 'Ad-Duha', verses: 11, description: 'A message of comfort — Allah has not forsaken you, nor is He displeased.' },
  { id: 112, name: 'Al-Ikhlas', verses: 4, description: 'The essence of tawhid — worth a third of the Quran.' },
  { id: 113, name: 'Al-Falaq', verses: 5, description: 'Seeking refuge from external harm and evil.' },
  { id: 114, name: 'An-Nas', verses: 6, description: 'Seeking refuge from whispers of the heart and evil within.' },
]

const getDailySurah = () => {
  const today = new Date()
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  return surahList[seed % surahList.length]
}

function Dashboard() {
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [nextPrayer, setNextPrayer] = useState(null)
  const [hijriDate, setHijriDate] = useState(null)
  const [loading, setLoading] = useState(true)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

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
          countdown: hours > 0 ? `in ${hours}h ${mins}m` : `in ${mins}m`,
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
        setHijriDate(data.data.date.hijri)
        setLoading(false)
      },
      () => setLoading(false)
    )
  }, [])

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const dailySurah = getDailySurah()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#4FA095] px-6 pt-12 pb-10">
        <p className="text-[#B2D8D4] text-sm">{greeting()}</p>
        <h1 className="text-white text-2xl font-semibold mt-1">Nura</h1>
        <p className="text-[#B2D8D4] text-sm mt-1">{today}</p>
        {hijriDate && (
          <p className="text-[#B2D8D4] text-sm">
            {hijriDate.day} {hijriDate.month.en} {hijriDate.year} H
          </p>
        )}
      </div>

      <div className="px-4 -mt-4 space-y-4">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Next prayer</p>
          {loading ? (
            <p className="text-gray-400 text-sm">Getting your location...</p>
          ) : nextPrayer ? (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{nextPrayer.name}</h2>
                <p className="text-gray-400 text-sm">{nextPrayer.countdown}</p>
              </div>
              <p className="text-2xl font-semibold text-[#4FA095]">{nextPrayer.time}</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Could not get location. Please allow access.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Today's prayers</p>
            <p className="text-xs text-[#4FA095] font-medium">0 / 5</p>
          </div>
          <div className="flex justify-between">
            {prayers.map((prayer) => (
              <div key={prayer} className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-300 text-sm">○</span>
                </div>
                <span className="text-xs text-gray-400">{prayer.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="pr-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Dhikr</p>
                <p className="text-xs text-[#4FA095] font-medium">0 / 6</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-[#4FA095] h-1.5 rounded-full" style={{ width: '0%' }} />
              </div>
              <p className="text-xs text-gray-400 mt-2">No dhikr yet</p>
            </div>
            <div className="pl-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Sunnah</p>
                <p className="text-xs text-[#4FA095] font-medium">0 / 3</p>
              </div>
              <div className="flex gap-2 mt-1">
                {['Dhuha', 'Tahajud', 'Rawatib'].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-1">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-300 text-xs">○</span>
                    </div>
                    <span className="text-xs text-gray-400">{s.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Cycle status</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4FA095]">Suci</p>
              <p className="text-xs text-gray-400 mt-0.5">Day 12 of cycle</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">21 days</p>
              <p className="text-xs text-gray-400 mt-0.5">until next period</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Surah of the day</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#4FA095]/10 flex items-center justify-center">
                <span className="text-sm font-medium text-[#4FA095]">{dailySurah.id}</span>
              </div>
<div>
  <p className="text-sm font-medium text-gray-800">{dailySurah.name}</p>
  <p className="text-xs text-gray-400">{dailySurah.verses} verses</p>
  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{dailySurah.description}</p>
</div>
            </div>
            <p className="text-lg text-gray-700">{dailySurah.arabic}</p>
          </div>
        </div>

      </div>

      <div className="h-8" />
    </div>
  )
}

export default Dashboard