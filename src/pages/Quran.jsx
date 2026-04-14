import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../lib/useAuth'
import Header from '../components/Header'

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
  const [contextMenu, setContextMenu] = useState(null)
  const holdTimer = useRef(null)

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

    const [arabicRes, translationRes, transliterationRes] = await Promise.all([
      fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surah.id}`),
      fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah.id}?language=en&translations=85&per_page=300&fields=verse_number`),
      fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah.id}?language=en&per_page=300&fields=verse_number,transliteration`)
    ])

    const arabicData = await arabicRes.json()
    const translationData = await translationRes.json()
    const transliterationData = await transliterationRes.json()

    const combined = arabicData.verses.map((v, i) => ({
      ...v,
      verse_number: i + 1,
      translation: translationData.verses[i]?.translations?.[0]?.text || '',
      transliteration: transliterationData.verses[i]?.transliteration?.text || '',
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
        text: verse.text_uthmani,
      }]
    }
    setBookmarks(updated)
    localStorage.setItem('nura_quran_bookmarks', JSON.stringify(updated))
  }

  const isBookmarked = (surahId, verseNumber) => {
    return bookmarks.some((b) => b.key === `${surahId}:${verseNumber}`)
  }

  const handleHoldStart = (verse) => {
    holdTimer.current = setTimeout(() => {
      setContextMenu(verse)
    }, 500)
  }

  const handleHoldEnd = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
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
            onClick={() => { setSelectedSurah(null); setContextMenu(null) }}
            className="text-[#B2D8D4] text-sm mb-4 flex items-center gap-1"
          >
            ‹ Back
          </button>
          <h1 className="text-white text-2xl font-semibold">{selectedSurah.name_simple}</h1>
          <p className="text-[#B2D8D4] text-sm mt-1">
            {selectedSurah.translated_name.name} · {selectedSurah.verses_count} verses
          </p>
        </div>

        <div className="px-4 -mt-4 pb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            {versesLoading ? (
              <p className="text-gray-400 text-sm text-center py-8">Loading verses...</p>
            ) : (
              verses.map((verse, index) => (
                <div
                  key={verse.id}
                  className={`py-5 px-5 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'} ${index !== verses.length - 1 ? 'border-b border-gray-50' : ''}`}
                  onTouchStart={() => handleHoldStart(verse)}
                  onTouchEnd={handleHoldEnd}
                  onTouchCancel={handleHoldEnd}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-6 h-6 rounded-full bg-[#4FA095]/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-[#4FA095]">{verse.verse_number}</span>
                    </div>
                    {isBookmarked(selectedSurah.id, verse.verse_number) && (
                      <span className="text-xs text-[#4FA095]">🔖</span>
                    )}
                  </div>
                  <p className="text-right text-xl leading-loose text-gray-800 mb-2" style={{ fontFamily: 'serif' }}>
                    {verse.text_uthmani}
                  </p>
                  {verse.transliteration && (
                    <p className="text-xs text-gray-400 italic mb-2 leading-relaxed">{verse.transliteration}</p>
                  )}
                  {verse.translation && (
                    <p className="text-sm text-gray-500 leading-relaxed">{verse.translation.replace(/<[^>]*>/g, '')}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {contextMenu && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center px-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setContextMenu(null)}
          >
            <div className="bg-white rounded-2xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-gray-50">
                <p className="text-xs text-gray-400 mb-1">Verse {contextMenu.verse_number}</p>
                <p className="text-base text-gray-800 text-right leading-loose" style={{ fontFamily: 'serif' }}>
                  {contextMenu.text_uthmani}
                </p>
              </div>
              <button
                onClick={() => { saveLastRead(selectedSurah, contextMenu.verse_number); setContextMenu(null) }}
                className="w-full text-left px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 flex items-center gap-3"
              >
                <span>📍</span>
                <div>
                  <p className="font-medium">Set as last read</p>
                  <p className="text-xs text-gray-400 mt-0.5">Continue from this verse next time</p>
                </div>
              </button>
              <button
                onClick={() => { toggleBookmark(selectedSurah, contextMenu); setContextMenu(null) }}
                className="w-full text-left px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <span>🔖</span>
                <div>
                  <p className="font-medium">{isBookmarked(selectedSurah.id, contextMenu.verse_number) ? 'Remove bookmark' : 'Add bookmark'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{isBookmarked(selectedSurah.id, contextMenu.verse_number) ? 'Remove from your saved verses' : 'Save this verse for later'}</p>
                </div>
              </button>
              <button onClick={() => setContextMenu(null)} className="w-full text-center px-5 py-4 text-sm text-gray-400 border-t border-gray-50">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Qur'an" subtitle="114 Surahs" />

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
                className={`flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${index !== filtered.length - 1 ? 'border-b border-gray-50' : ''}`}
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