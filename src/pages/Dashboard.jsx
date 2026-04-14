import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'
import Header from '../components/Header'

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
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  return surahList[seed % surahList.length]
}

const getTodayReminder = (hijri) => {
  const day = parseInt(hijri.day)
  const month = parseInt(hijri.month.number)
  const weekday = new Date().getDay()
  if (day === 1 && month === 10) return '🎉 Eid al-Fitr — no fasting today'
  if (day === 10 && month === 12) return '🎉 Eid al-Adha — no fasting today'
  if ([11, 12, 13].includes(day) && month === 12) return '🚫 Ayyam al-Tashriq — fasting is prohibited'
  if ([13, 14, 15].includes(day)) return '🌙 Ayyamul Bidh — recommended fasting today'
  if (day === 10 && month === 1) return '✨ Ashura — highly recommended fasting today'
  if (day === 9 && month === 12) return '✨ Arafah — highly recommended fasting today'
  if (month === 10 && day <= 6) return "🌙 Syawal fasting — 6 days for a full year's reward"
  if (weekday === 1) return '🌙 Monday — recommended fasting day'
  if (weekday === 4) return '🌙 Thursday — recommended fasting day'
  return '🤲 May your day be filled with barakah'
}

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function Dashboard() {
  const { isGuest, userId } = useAuth()
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [nextPrayer, setNextPrayer] = useState(null)
  const [hijriDate, setHijriDate] = useState(null)
  const [loading, setLoading] = useState(true)

  const [prayerChecked, setPrayerChecked] = useState({ Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false })
  const [worshipChecked, setWorshipChecked] = useState(0)
  const [worshipTotal, setWorshipTotal] = useState(0)
  const [streak, setStreak] = useState(0)
  const [cycleStatus, setCycleStatus] = useState(null)

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

  const calculateStreak = (logs) => {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const log = logs.find((l) => l.date === key)
    if (log && log.fajr && log.dhuhr && log.asr && log.maghrib && log.isha) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

  const getPhase = (cycleStartDate, cycleLength, periodLength) => {
    if (!cycleStartDate) return null
    const startDate = new Date(cycleStartDate)
    const today = new Date()
    const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
    const dayOfCycle = ((diffDays % cycleLength) + cycleLength) % cycleLength + 1
    const daysUntilNext = cycleLength - dayOfCycle + 1

    let phase
    if (dayOfCycle <= periodLength) phase = 'Menstruation'
    else if (dayOfCycle <= 13) phase = 'Follicular'
    else if (dayOfCycle <= 15) phase = 'Ovulation'
    else phase = 'Luteal'

    return { phase, dayOfCycle, daysUntilNext }
  }

  const loadDashboardData = async () => {
    const today = todayStr()

    if (isGuest) {
      const savedPrayer = localStorage.getItem(`nura_prayer_${today}`)
      if (savedPrayer) setPrayerChecked(JSON.parse(savedPrayer))

      const savedChecked = localStorage.getItem(`nura_worship_checked_${today}`)
      const savedItems = localStorage.getItem('nura_worship_items')
      if (savedChecked) setWorshipChecked(JSON.parse(savedChecked).length)
      if (savedItems) setWorshipTotal(JSON.parse(savedItems).length)

      const savedSettings = localStorage.getItem('nura_cycle_settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        const status = getPhase(settings.cycleStartDate, settings.cycleLength, settings.periodLength)
        setCycleStatus(status)
      }
    } else if (userId) {
      const [prayerRes, worshipItemsRes, worshipLogsRes, prayerLogsRes, profileRes] = await Promise.all([
        supabase.from('prayer_logs').select('*').eq('user_id', userId).eq('date', today).maybeSingle(),
        supabase.from('worship_items').select('id').eq('user_id', userId).eq('is_active', true),
        supabase.from('worship_logs').select('worship_item_id').eq('user_id', userId).eq('date', today).eq('completed', true),
        supabase.from('prayer_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(365),
        supabase.from('profiles').select('cycle_start_date, cycle_length, period_length').eq('id', userId).single(),
      ])

      if (prayerRes.data) {
        setPrayerChecked({
          Fajr: prayerRes.data.fajr,
          Dhuhr: prayerRes.data.dhuhr,
          Asr: prayerRes.data.asr,
          Maghrib: prayerRes.data.maghrib,
          Isha: prayerRes.data.isha,
        })
      }

      if (worshipItemsRes.data) setWorshipTotal(worshipItemsRes.data.length)
      if (worshipLogsRes.data) setWorshipChecked(worshipLogsRes.data.length)
      if (prayerLogsRes.data) setStreak(calculateStreak(prayerLogsRes.data))

      if (profileRes.data?.cycle_start_date) {
        const status = getPhase(
          profileRes.data.cycle_start_date,
          profileRes.data.cycle_length || 28,
          profileRes.data.period_length || 7
        )
        setCycleStatus(status)
      }
    }
  }

  useEffect(() => {
    loadDashboardData()
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const date = new Date()
        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${latitude}&longitude=${longitude}&method=13`
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
  }, [userId])

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const dailySurah = getDailySurah()
  const prayerCount = Object.values(prayerChecked).filter(Boolean).length
  const worshipProgress = worshipTotal > 0 ? (worshipChecked / worshipTotal) * 100 : 0

  const getCycleStatusText = () => {
    if (!cycleStatus) return { label: 'Not set up', sub: 'Set up in Cycle tab' }
    if (cycleStatus.phase === 'Menstruation') return { label: 'Menstruation', sub: `Day ${cycleStatus.dayOfCycle} of cycle` }
    if (cycleStatus.phase === 'Ovulation') return { label: 'Ovulation', sub: `${cycleStatus.daysUntilNext} days until next period` }
    return { label: cycleStatus.phase, sub: `${cycleStatus.daysUntilNext} days until next period` }
  }

  const cycleText = getCycleStatusText()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Nura" subtitle={today}>
        {hijriDate && (
          <p className="text-[#B2D8D4] text-sm">
            {hijriDate.day} {hijriDate.month.en} {hijriDate.year} H
          </p>
        )}
        {hijriDate && (
          <p className="text-white/80 text-xs mt-3 bg-white/10 px-3 py-1.5 rounded-full inline-block">
            {getTodayReminder(hijriDate)}
          </p>
        )}
      </Header>

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
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="pr-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Prayers</p>
                <p className="text-xs text-[#4FA095] font-medium">{prayerCount} / 5</p>
              </div>
              <div className="space-y-2">
  {prayers.map((prayer) => (
    <div key={prayer} className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{prayer}</span>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        prayerChecked[prayer] ? 'bg-[#4FA095]' : 'bg-gray-100'
      }`}>
        {prayerChecked[prayer] && <span className="text-white text-xs">✓</span>}
      </div>
    </div>
  ))}
</div>
            </div>
            <div className="pl-4 flex flex-col justify-center items-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Streak</p>
              <p className="text-3xl font-semibold text-[#4FA095]">{streak}</p>
              <p className="text-xs text-gray-400 mt-1">days in a row</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Daily worship</p>
            <p className="text-xs text-[#4FA095] font-medium">{worshipChecked} / {worshipTotal}</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-[#4FA095] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${worshipProgress}%` }}
            />
          </div>
          {worshipTotal === 0 && (
            <p className="text-xs text-gray-400 mt-2">Add worship items in the Worship tab</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Cycle status</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4FA095]">{cycleText.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{cycleText.sub}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Surah of the day</p>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#4FA095]/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-medium text-[#4FA095]">{dailySurah.id}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{dailySurah.name}</p>
                <p className="text-xs text-gray-400">{dailySurah.verses} verses</p>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{dailySurah.description}</p>
              </div>
            </div>
            <p className="text-lg text-gray-700 shrink-0">{dailySurah.arabic}</p>
          </div>
        </div>

      </div>

      <div className="h-8" />
    </div>
  )
}

export default Dashboard