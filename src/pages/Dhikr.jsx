import { useState } from 'react'

const dhikrList = [
  {
    id: 1,
    arabic: 'سُبْحَانَ اللهِ',
    transliteration: 'Subhanallah',
    translation: 'Glory be to Allah',
    count: 33,
  },
  {
    id: 2,
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise be to Allah',
    count: 33,
  },
  {
    id: 3,
    arabic: 'اللهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    count: 33,
  },
  {
    id: 4,
    arabic: 'لَا إِلَٰهَ إِلَّا اللهُ',
    transliteration: 'La ilaha illallah',
    translation: 'There is no god but Allah',
    count: 100,
  },
  {
    id: 5,
    arabic: 'أَسْتَغْفِرُ اللهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    count: 100,
  },
  {
    id: 6,
    arabic: 'صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ',
    transliteration: 'Sallallahu alaihi wasallam',
    translation: 'May Allah bless him and grant him peace',
    count: 10,
  },
]

function Dhikr() {
  const [counters, setCounters] = useState(
    Object.fromEntries(dhikrList.map((d) => [d.id, 0]))
  )
  const [selected, setSelected] = useState(null)

  const increment = (id, max) => {
    setCounters((prev) => ({
      ...prev,
      [id]: prev[id] >= max ? 0 : prev[id] + 1,
    }))
  }

  const reset = (id) => {
    setCounters((prev) => ({ ...prev, [id]: 0 }))
  }

  if (selected !== null) {
    const dhikr = dhikrList.find((d) => d.id === selected)
    const current = counters[dhikr.id]
    const progress = (current / dhikr.count) * 100

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-[#4FA095] px-6 pt-12 pb-8">
          <button
            onClick={() => setSelected(null)}
            className="text-[#B2D8D4] text-sm mb-4 flex items-center gap-1"
          >
            ‹ Back
          </button>
          <h1 className="text-white text-2xl font-semibold">{dhikr.transliteration}</h1>
          <p className="text-[#B2D8D4] text-sm mt-1">{dhikr.translation}</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full text-center mb-6">
            <p className="text-4xl text-gray-800 mb-4" style={{ fontFamily: 'serif' }}>
              {dhikr.arabic}
            </p>
            <p className="text-gray-400 text-sm">{dhikr.transliteration}</p>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
            <div
              className="bg-[#4FA095] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <button
            onClick={() => increment(dhikr.id, dhikr.count)}
            className="w-36 h-36 rounded-full bg-[#4FA095] text-white flex flex-col items-center justify-center shadow-sm active:scale-95 transition-transform mb-6"
          >
            <span className="text-4xl font-semibold">{current}</span>
            <span className="text-sm text-[#B2D8D4]">of {dhikr.count}</span>
          </button>

          <button
            onClick={() => reset(dhikr.id)}
            className="text-sm text-gray-400 underline"
          >
            Reset
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#4FA095] px-6 pt-12 pb-8">
        <h1 className="text-white text-2xl font-semibold">Dhikr</h1>
        <p className="text-[#B2D8D4] text-sm mt-1">Remember Allah often</p>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {dhikrList.map((dhikr, index) => (
            <button
              key={dhikr.id}
              onClick={() => setSelected(dhikr.id)}
              className={`w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left ${
                index !== dhikrList.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{dhikr.transliteration}</p>
                <p className="text-xs text-gray-400 mt-0.5">{dhikr.translation}</p>
              </div>
              <div className="flex items-center gap-3">
                {counters[dhikr.id] > 0 && (
                  <span className="text-xs text-[#4FA095] font-medium">
                    {counters[dhikr.id]}/{dhikr.count}
                  </span>
                )}
                <div className="w-8 h-8 rounded-full bg-[#4FA095]/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-[#4FA095]">{dhikr.count}×</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}

export default Dhikr