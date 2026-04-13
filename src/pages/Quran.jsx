import { useState, useEffect } from 'react'
import { useAuth } from '../lib/useAuth'

function Quran() {
  const { isGuest, userId } = useAuth()
  const [surahs, setSurahs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSurah, setSelectedSurah] = useState(null)
  const [verses, setVerses] = useState([])
  const [versesLoading, setVersesLoading] = useState(false)
  const [bookmarks, setBookmarks] = useState([])
  const [lastRead, setLastRead] = useState(null)

  useEffect(() => {
    fetch('https://api.quran.com/api/v4/chapters?language=en')
      .then((res) => res.json())
      .then((data) => {
        setSurahs(data.chapters)
        setLoading(false)
      })

    const saved = localStorage.getItem('nura_quran_bookmarks')
    if (saved) setBookmarks(JSON.parse(saved))

    const last = localStorage.getItem('nura_quran_last_read')
    if (last) setLastRead(JSON.parse(last))
  }, [])

  const openSurah = async (surah) => {
  setSelectedSurah(surah)
  setVersesLoading(true)
  
  const [versesRes, translationsRes] = await Promise.all([
    fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surah.id}`),
    fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah.id}?language=en&translations=131&per_page=300&fields=verse_number`)
  ])
  
  const versesData = await versesRes.json()
  const translationsData = await translationsRes.json()

  const combined = versesData.verses.map((v, i) => ({
    ...v,
    verse_number: i + 1,
    translation: translationsData.verses[i]?.translations?.[0]?.text || ''
  }))

  setVerses(combined)
  setVersesLoading(false)
}

  const saveLastRead = (surah, verseNumber) => {
    const data = { surahId: surah.id, surahName: surah.name_simple, verseNumber }
    localStorage.setItem('nura_quran_last_read', JSON.stringify(data))
    setLastRead(data)
  }

  const toggleBookmark = (surah, verse) => {
    const key = `${surah.id}:${verse.verse_number}`
    const exists = bookmarks.find((b) => b.key === key)
    let updated
    if (exists) {
      updated = bookmarks.filter((b) => b.key !== key)
    } else {
      updated = [...bookmarks, {
        key,
        surahId: surah.id,
        surahName: surah.name_simple,
        verseNumber: verse.verse_number,
        text: verse.words?.map((w) => w.text_uthmani).join(' '),
      }]
    }
    setBookmarks(updated)
    localStorage.setItem('nura_quran_bookmarks', JSON.stringify(updated))
  }

  const isBookmarked = (surahId, verseNumber) => {
    return bookmarks.some((b) => b.key === `${surahId}:${verseNumber}`)
  }

  const filtered = surahs.filter((s) =>
    s.name_simple.toLowerCase().includes(search.toLowerCase()) ||
    s.translated_name.name.toLowerCase().includes(search.toLowerCase()) ||
    String(s.id).includes(search)
  )

  if (selectedSurah) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#4FA095] px-6 pt-12 pb-8">
          <button
            onClick={() => setSelectedSurah(null)}
            className="text-[#B2D8D4] text-sm mb-4 flex items-center gap-1"
          >
            ‹ Back
          </button>
          <h1 className="text-white text-2xl font-semibold">{selectedSurah.name_simple}</h1>
          <p className="text-[#B2D8D4] text-sm mt-1">
            {selectedSurah.translated_name.name} · {selectedSurah.verses_count} verses
          </p>
        </div>

        <div className="px-4 -mt-4 space-y-3">
          {versesLoading ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-gray-400 text-sm">Loading verses...</p>
            </div>
          ) : (
            verses.map((verse) => (
              <div
                key={verse.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                onClick={() => saveLastRead(selectedSurah, verse.verse_number)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-7 h-7 rounded-full bg-[#4FA095]/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-[#4FA095]">{verse.verse_number}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleBookmark(selectedSurah, verse)
                    }}
                    className="text-lg"
                  >
                    {isBookmarked(selectedSurah.id, verse.verse_number) ? '🔖' : '📄'}
                  </button>
                </div>
                <p className="text-right text-xl leading-loose text-gray-800 mb-3" style={{ fontFamily: 'serif' }}>
  {verse.text_uthmani}
</p>
{verse.translation && (
  <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
    {verse.translation.replace(/<[^>]*>/g, '')}
  </p>
)}
              </div>
            ))
          )}
        </div>

        <div className="h-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#4FA095] px-6 pt-12 pb-8">
        <h1 className="text-white text-2xl font-semibold">Qur'an</h1>
        <p className="text-[#B2D8D4] text-sm mt-1">114 Surahs</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">

        {lastRead && (
          <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between cursor-pointer"
            onClick={() => {
              const surah = surahs.find((s) => s.id === lastRead.surahId)
              if (surah) openSurah(surah)
            }}
          >
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Continue reading</p>
              <p className="text-sm font-medium text-gray-800">{lastRead.surahName}</p>
              <p className="text-xs text-gray-400">Verse {lastRead.verseNumber}</p>
            </div>
            <span className="text-[#4FA095] text-lg">›</span>
          </div>
        )}

        {bookmarks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Bookmarks</p>
            <div className="space-y-2">
              {bookmarks.slice(0, 3).map((b) => (
                <div
                  key={b.key}
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    const surah = surahs.find((s) => s.id === b.surahId)
                    if (surah) openSurah(surah)
                  }}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{b.surahName}</p>
                    <p className="text-xs text-gray-400">Verse {b.verseNumber}</p>
                  </div>
                  <span className="text-gray-300 text-lg">›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          <input
            type="text"
            placeholder="Search surah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm text-gray-700 outline-none px-2 py-1 placeholder-gray-300"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading surahs...</p>
          ) : (
            filtered.map((surah, index) => (
              <div
                key={surah.id}
                onClick={() => openSurah(surah)}
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
                    <p className="text-xs text-gray-400">
                      {surah.translated_name.name} · {surah.verses_count} verses
                    </p>
                  </div>
                </div>
                <p className="text-base text-gray-700">{surah.name_arabic}</p>
              </div>
            ))
          )}
        </div>

      </div>

      <div className="h-8" />
    </div>
  )
}

export default Quran