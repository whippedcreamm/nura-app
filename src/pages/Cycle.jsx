import { useState } from 'react'

function Cycle() {
  const [currentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [cycleData, setCycleData] = useState({
    periodDays: [1, 2, 3, 4, 5, 6, 7],
    predictedDays: [28, 29, 30],
  })

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

  const getDayStatus = (day) => {
    if (cycleData.periodDays.includes(day)) return 'period'
    if (cycleData.predictedDays.includes(day)) return 'predicted'
    return 'normal'
  }

  const todayStatus = getDayStatus(currentDate.getDate())

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#4FA095] px-6 pt-12 pb-8">
        <h1 className="text-white text-2xl font-semibold">Cycle</h1>
        <p className="text-[#B2D8D4] text-sm mt-1">{monthName}</p>
      </div>

      <div className="px-4 -mt-4">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Today's status</p>
          <div className={`rounded-xl px-4 py-3 ${
            todayStatus === 'period'
              ? 'bg-rose-50'
              : todayStatus === 'predicted'
              ? 'bg-amber-50'
              : 'bg-[#4FA095]/10'
          }`}>
            <p className={`text-sm font-medium ${
              todayStatus === 'period'
                ? 'text-rose-500'
                : todayStatus === 'predicted'
                ? 'text-amber-500'
                : 'text-[#4FA095]'
            }`}>
              {todayStatus === 'period'
                ? 'Menstruation — prayers paused'
                : todayStatus === 'predicted'
                ? 'Predicted period incoming'
                : 'Suci — keep up your prayers!'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
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

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square flex items-center justify-center rounded-full text-sm mx-auto w-8 h-8 transition-colors
                    ${status === 'period' ? 'bg-rose-400 text-white' : ''}
                    ${status === 'predicted' ? 'bg-amber-200 text-amber-700' : ''}
                    ${status === 'normal' && isToday ? 'border-2 border-[#4FA095] text-[#4FA095] font-semibold' : ''}
                    ${status === 'normal' && !isToday ? 'text-gray-600 hover:bg-gray-100' : ''}
                    ${isSelected && status === 'normal' ? 'bg-[#4FA095]/20' : ''}
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Legend</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-rose-400" />
              <p className="text-sm text-gray-600">Menstruation</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-amber-200" />
              <p className="text-sm text-gray-600">Predicted period</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-[#4FA095]" />
              <p className="text-sm text-gray-600">Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Cycle info</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#4FA095]">7</p>
              <p className="text-xs text-gray-400 mt-1">Period days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#4FA095]">28</p>
              <p className="text-xs text-gray-400 mt-1">Cycle length</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#4FA095]">21</p>
              <p className="text-xs text-gray-400 mt-1">Days until next</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Cycle