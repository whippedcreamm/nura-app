import { useState } from 'react'

const phases = {
  menstruation: {
    name: 'Menstruation',
    color: 'rose',
    bg: 'bg-rose-50',
    text: 'text-rose-500',
    border: 'border-rose-100',
    description: 'Your body is shedding the uterine lining. Rest, stay hydrated, and be gentle with yourself.',
  },
  follicular: {
    name: 'Follicular',
    color: 'amber',
    bg: 'bg-amber-50',
    text: 'text-amber-500',
    border: 'border-amber-100',
    description: 'Estrogen is rising. Energy increases — a great time to start new things and be productive.',
  },
  ovulation: {
    name: 'Ovulation',
    color: 'teal',
    bg: 'bg-[#4FA095]/10',
    text: 'text-[#4FA095]',
    border: 'border-[#4FA095]/20',
    description: 'You are at peak fertility. Energy and confidence are high — make the most of it.',
  },
  luteal: {
    name: 'Luteal',
    color: 'purple',
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
  const [currentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [cycleStart] = useState(1)
  const [cycleLength] = useState(28)
  const [periodLength] = useState(7)

  const [logs, setLogs] = useState({})

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthName = currentDate.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const getPhase = (day) => {
    const dayOfCycle = ((day - cycleStart + cycleLength) % cycleLength) + 1
    if (dayOfCycle <= periodLength) return 'menstruation'
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

  const updateLog = (day, field, value) => {
    setLogs((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const toggleSymptom = (day, symptom) => {
    const current = logs[day]?.symptoms || []
    const updated = current.includes(symptom)
      ? current.filter((s) => s !== symptom)
      : [...current, symptom]
    updateLog(day, 'symptoms', updated)
  }

  const selectedLog = selectedDay ? logs[selectedDay] || {} : null
  const selectedPhase = selectedDay ? phases[getPhase(selectedDay)] : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#4FA095] px-6 pt-12 pb-8">
        <h1 className="text-white text-2xl font-semibold">Cycle</h1>
        <p className="text-[#B2D8D4] text-sm mt-1">{monthName}</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">

        <div className={`rounded-2xl border p-5 ${todayPhase.bg} ${todayPhase.border}`}>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Current phase</p>
          <p className={`text-base font-semibold ${todayPhase.text}`}>{todayPhase.name}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{todayPhase.description}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="grid grid-cols-7 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <p key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</p>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {blanks.map((b) => (
              <div key={`blank-${b}`} />
            ))}
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
                    ${status === 'normal' && isSelected ? 'bg-[#4FA095]/20 text-[#4FA095]' : ''}
                    ${status === 'normal' && !isToday && !isSelected ? 'text-gray-600 hover:bg-gray-100' : ''}
                  `}
                >
                  {day}
                  {hasLog && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4FA095]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {selectedDay && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-800">
                {new Date(year, month, selectedDay).toLocaleDateString('en-GB', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </p>
              <span className={`text-xs px-2 py-1 rounded-full ${selectedPhase.bg} ${selectedPhase.text}`}>
                {selectedPhase.name}
              </span>
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
                        selectedLog?.mood === m
                          ? 'scale-125'
                          : 'opacity-40 hover:opacity-70'
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
              <p className="text-2xl font-semibold text-[#4FA095]">{periodLength}</p>
              <p className="text-xs text-gray-400 mt-1">Period days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#4FA095]">{cycleLength}</p>
              <p className="text-xs text-gray-400 mt-1">Cycle length</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#4FA095]">
                {cycleLength - ((currentDate.getDate() - cycleStart + cycleLength) % cycleLength)}
              </p>
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
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#4FA095]" />
              </div>
              <p className="text-xs text-gray-600">Has log</p>
            </div>
          </div>
        </div>

      </div>

      <div className="h-8" />
    </div>
  )
}

export default Cycle