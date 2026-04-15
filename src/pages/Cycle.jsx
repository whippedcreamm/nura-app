import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'
import Header from '../components/Header'

const phases = {
  menstruation: {
    name: 'Menstruation',
    bg: 'bg-rose-50',
    text: 'text-rose-500',
    border: 'border-rose-100',
    description: 'Your body is shedding the uterine lining. Rest, stay hydrated, and be gentle with yourself.',
  },
  follicular: {
    name: 'Follicular',
    bg: 'bg-amber-50',
    text: 'text-amber-500',
    border: 'border-amber-100',
    description: 'Estrogen is rising. Energy increases — a great time to start new things and be productive.',
  },
  ovulation: {
    name: 'Ovulation',
    bg: 'bg-[#4FA095]/10',
    text: 'text-[#4FA095]',
    border: 'border-[#4FA095]/20',
    description: 'You are at peak fertility. Energy and confidence are high — make the most of it.',
  },
  luteal: {
    name: 'Luteal',
    bg: 'bg-purple-50',
    text: 'text-purple-500',
    border: 'border-purple-100',
    description: 'Progesterone rises then drops. You may feel slower — this is normal. Rest and reflect.',
  },
}

const symptoms = ['Cramps', 'Headache', 'Fatigue', 'Bloating', 'Backache', 'Nausea']
const moods = ['😊', '😐', '😢', '😤', '😴', '🤩']
const flows = ['Spotting', 'Light', 'Medium', 'Heavy']

function Cycle() {
  const { isGuest, userId } = useAuth()
  const [currentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [logs, setLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [cycleSettings, setCycleSettings] = useState({
    cycleStartDate: null,
    cycleLength: 28,
    periodLength: 7,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [settingsInput, setSettingsInput] = useState({
    cycleStartDate: '',
    cycleLength: 28,
    periodLength: 7,
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    setLoading(true)
    if (isGuest) {
      const savedSettings = localStorage.getItem('nura_cycle_settings')
      const savedLogs = localStorage.getItem('nura_cycle_logs')
      if (savedSettings) setCycleSettings(JSON.parse(savedSettings))
      if (savedLogs) setLogs(JSON.parse(savedLogs))
    } else if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('cycle_start_date, cycle_length, period_length')
        .eq('id', userId)
        .single()

      if (profile) {
        setCycleSettings({
          cycleStartDate: profile.cycle_start_date,
          cycleLength: profile.cycle_length || 28,
          periodLength: profile.period_length || 7,
        })
        setSettingsInput({
          cycleStartDate: profile.cycle_start_date || '',
          cycleLength: profile.cycle_length || 28,
          periodLength: profile.period_length || 7,
        })
      }

      const { data: cycleLogs } = await supabase
        .from('cycle_logs')
        .select('*')
        .eq('user_id', userId)

      if (cycleLogs) {
        const logsMap = {}
        cycleLogs.forEach((log) => {
          const day = new Date(log.date).getDate()
          logsMap[day] = {
            id: log.id,
            flow: log.flow,
            symptoms: log.symptoms || [],
            mood: log.mood,
            notes: log.notes,
          }
        })
        setLogs(logsMap)
      }
    }
    setLoading(false)
  }

  const saveSettings = async () => {
    const updated = {
      cycleStartDate: settingsInput.cycleStartDate || null,
      cycleLength: parseInt(settingsInput.cycleLength),
      periodLength: parseInt(settingsInput.periodLength),
    }
    setCycleSettings(updated)

    if (isGuest) {
      localStorage.setItem('nura_cycle_settings', JSON.stringify(updated))
    } else if (userId) {
      await supabase.from('profiles').update({
        cycle_start_date: updated.cycleStartDate,
        cycle_length: updated.cycleLength,
        period_length: updated.periodLength,
      }).eq('id', userId)
    }
    setShowSettings(false)
  }

  const saveLog = async (day, updatedLog) => {
    setSaving(true)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    if (isGuest) {
      const updated = { ...logs, [day]: updatedLog }
      setLogs(updated)
      localStorage.setItem('nura_cycle_logs', JSON.stringify(updated))
    } else if (userId) {
      const existing = logs[day]
      if (existing?.id) {
        await supabase.from('cycle_logs').update({
          flow: updatedLog.flow,
          symptoms: updatedLog.symptoms,
          mood: updatedLog.mood,
          notes: updatedLog.notes,
        }).eq('id', existing.id)
      } else {
        const { data } = await supabase.from('cycle_logs').insert({
          user_id: userId,
          date: dateStr,
          flow: updatedLog.flow,
          symptoms: updatedLog.symptoms,
          mood: updatedLog.mood,
          notes: updatedLog.notes,
        }).select().single()
        if (data) updatedLog.id = data.id
      }
      setLogs((prev) => ({ ...prev, [day]: updatedLog }))
    }
    setSaving(false)
  }

  const updateLog = (day, field, value) => {
    const current = logs[day] || {}
    const updated = { ...current, [field]: value }
    saveLog(day, updated)
  }

  const toggleSymptom = (day, symptom) => {
    const current = logs[day]?.symptoms || []
    const updated = current.includes(symptom)
      ? current.filter((s) => s !== symptom)
      : [...current, symptom]
    const currentLog = logs[day] || {}
    saveLog(day, { ...currentLog, symptoms: updated })
  }

  const getPhase = (day) => {
    if (!cycleSettings.cycleStartDate) {
      const { cycleLength, periodLength } = cycleSettings
      const dayOfCycle = ((day - 1 + cycleLength) % cycleLength) + 1
      if (dayOfCycle <= periodLength) return 'menstruation'
      if (dayOfCycle <= 13) return 'follicular'
      if (dayOfCycle <= 15) return 'ovulation'
      return 'luteal'
    }

    const startDate = new Date(cycleSettings.cycleStartDate)
    const targetDate = new Date(year, month, day)
    const diffDays = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24))
    const dayOfCycle = ((diffDays % cycleSettings.cycleLength) + cycleSettings.cycleLength) % cycleSettings.cycleLength + 1

    if (dayOfCycle <= cycleSettings.periodLength) return 'menstruation'
    if (dayOfCycle <= 13) return 'follicular'
    if (dayOfCycle <= 15) return 'ovulation'
    return 'luteal'
  }

  const getDayStatus = (day) => {
    const phase = getPhase(day)
    if (phase === 'menstruation') return 'period'
    if (phase === 'ovulation') return 'ovulation'
    return 'normal'
  }

  const todayPhase = phases[getPhase(currentDate.getDate())]
  const selectedLog = selectedDay ? logs[selectedDay] || {} : null
  const selectedPhase = selectedDay ? phases[getPhase(selectedDay)] : null

  const daysUntilNext = () => {
    if (!cycleSettings.cycleStartDate) return cycleSettings.cycleLength
    const startDate = new Date(cycleSettings.cycleStartDate)
    const today = new Date()
    const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
    const dayOfCycle = ((diffDays % cycleSettings.cycleLength) + cycleSettings.cycleLength) % cycleSettings.cycleLength + 1
    return cycleSettings.cycleLength - dayOfCycle + 1
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Cycle" subtitle={monthName} />

      <div className="px-4 -mt-4 space-y-4">

        <div className={`rounded-2xl border p-5 ${todayPhase.bg} ${todayPhase.border}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Current phase</p>
              <p className={`text-base font-semibold ${todayPhase.text}`}>{todayPhase.name}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{todayPhase.description}</p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="text-xs text-gray-400 border border-gray-200 rounded-lg px-2 py-1 bg-white"
            >
              Setup
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
  {!cycleSettings.cycleStartDate ? (
    <div className="text-center py-6">
      <p className="text-gray-500 text-sm font-medium">Your cycle isn't set up yet</p>
      <p className="text-gray-400 text-xs mt-1 mb-4">Add your last period date to start tracking</p>
      <button
        onClick={() => setShowSettings(true)}
        className="bg-[#4FA095] text-white text-sm px-6 py-2.5 rounded-xl font-medium"
      >
        Set up cycle
      </button>
    </div>
  ) : (
    <>
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <p key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {blanks.map((b) => <div key={`blank-${b}`} />)}
        {days.map((day) => {
          const status = getDayStatus(day)
          const isToday = day === currentDate.getDate()
          const isSelected = day === selectedDay
          const hasLog = logs[day] && (logs[day].mood || logs[day].flow || (logs[day].symptoms?.length > 0))
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`relative aspect-square flex items-center justify-center rounded-full text-sm mx-auto w-8 h-8 transition-colors
                ${status === 'period' ? 'bg-rose-400 text-white' : ''}
                ${status === 'ovulation' ? 'bg-[#4FA095] text-white' : ''}
                ${status === 'normal' && isToday ? 'border-2 border-[#4FA095] text-[#4FA095] font-semibold' : ''}
                ${status === 'normal' && isSelected && !isToday ? 'bg-[#4FA095]/20 text-[#4FA095]' : ''}
                ${status === 'normal' && !isToday && !isSelected ? 'text-gray-600 hover:bg-gray-100' : ''}
              `}
            >
              {day}
              {hasLog && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4FA095]" />}
            </button>
          )
        })}
      </div>
    </>
  )}
</div>

        {selectedDay && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-800">
                {new Date(year, month, selectedDay).toLocaleDateString('en-GB', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </p>
              <div className="flex items-center gap-2">
                {saving && <p className="text-xs text-gray-400">Saving...</p>}
                <span className={`text-xs px-2 py-1 rounded-full ${selectedPhase.bg} ${selectedPhase.text}`}>
                  {selectedPhase.name}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Flow</p>
                <div className="flex gap-2 flex-wrap">
                  {flows.map((f) => (
                    <button
                      key={f}
                      onClick={() => updateLog(selectedDay, 'flow', selectedLog?.flow === f ? null : f)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        selectedLog?.flow === f
                          ? 'bg-rose-400 text-white border-rose-400'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Symptoms</p>
                <div className="flex gap-2 flex-wrap">
                  {symptoms.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(selectedDay, s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        selectedLog?.symptoms?.includes(s)
                          ? 'bg-[#4FA095] text-white border-[#4FA095]'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Mood</p>
                <div className="flex gap-3">
                  {moods.map((m) => (
                    <button
                      key={m}
                      onClick={() => updateLog(selectedDay, 'mood', selectedLog?.mood === m ? null : m)}
                      className={`text-2xl transition-all ${
                        selectedLog?.mood === m ? 'scale-125' : 'opacity-40 hover:opacity-70'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Cycle info</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#4FA095]">{cycleSettings.periodLength}</p>
              <p className="text-xs text-gray-400 mt-1">Period days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#4FA095]">{cycleSettings.cycleLength}</p>
              <p className="text-xs text-gray-400 mt-1">Cycle length</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#4FA095]">{daysUntilNext()}</p>
              <p className="text-xs text-gray-400 mt-1">Days until next</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Legend</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-rose-400" />
              <p className="text-xs text-gray-600">Menstruation</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#4FA095]" />
              <p className="text-xs text-gray-600">Ovulation</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-[#4FA095]" />
              <p className="text-xs text-gray-600">Today</p>
            </div>
          </div>
        </div>

      </div>

      <div className="h-8" />

      {showSettings && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-white rounded-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="text-sm font-medium text-gray-800">Cycle settings</p>
              <p className="text-xs text-gray-400 mt-0.5">Set your cycle details for accurate tracking</p>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
                  Last period start date
                </label>
                <input
                  type="date"
                  value={settingsInput.cycleStartDate}
                  onChange={(e) => setSettingsInput((prev) => ({ ...prev, cycleStartDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#4FA095]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
                  Cycle length (days)
                </label>
                <input
                  type="number"
                  min="21"
                  max="45"
                  value={settingsInput.cycleLength}
                  onChange={(e) => setSettingsInput((prev) => ({ ...prev, cycleLength: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#4FA095]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
                  Period length (days)
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={settingsInput.periodLength}
                  onChange={(e) => setSettingsInput((prev) => ({ ...prev, periodLength: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#4FA095]"
                />
              </div>
            </div>

            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 border border-gray-200 text-gray-500 text-sm py-3 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="flex-1 bg-[#4FA095] text-white text-sm py-3 rounded-xl font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cycle