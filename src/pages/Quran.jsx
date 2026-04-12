import { useState, useEffect } from 'react'

function Quran() {
  const [surahs, setSurahs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('https://api.quran.com/api/v4/chapters?language=en')
      .then((res) => res.json())
      .then((data) => {
        setSurahs(data.chapters)
        setLoading(false)
      })
  }, [])

  const filtered = surahs.filter((s) =>
    s.name_simple.toLowerCase().includes(search.toLowerCase()) ||
    s.translated_name.name.toLowerCase().includes(search.toLowerCase()) ||
    String(s.id).includes(search)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#4FA095] px-6 pt-12 pb-8">
        <h1 className="text-white text-2xl font-semibold">Qur'an</h1>
        <p className="text-[#B2D8D4] text-sm mt-1">114 Surahs</p>
      </div>

      <div className="px-4 -mt-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          <input
            type="text"
            placeholder="Search surah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm text-gray-700 outline-none px-2 py-1 placeholder-gray-300"
          />
        </div>
      </div>

      <div className="px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading surahs...</p>
          ) : (
            <div>
              {filtered.map((surah, index) => (
                <div
                  key={surah.id}
                  className={`flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    index !== filtered.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#4FA095]/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-[#4FA095]">{surah.id}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{surah.name_simple}</p>
                      <p className="text-xs text-gray-400">{surah.translated_name.name} · {surah.verses_count} verses</p>
                    </div>
                  </div>
                  <p className="text-base text-gray-700 font-arabic">{surah.name_arabic}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}

export default Quran