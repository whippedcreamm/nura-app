import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'

const presetItems = [
  { preset_id: 1, name: 'Morning dhikr', category: 'Dhikr' },
  { preset_id: 2, name: 'Evening dhikr', category: 'Dhikr' },
  { preset_id: 3, name: 'Dhuha prayer', category: 'Sunnah prayer' },
  { preset_id: 4, name: 'Tahajud prayer', category: 'Sunnah prayer' },
  { preset_id: 5, name: 'Rawatib prayer', category: 'Sunnah prayer' },
  { preset_id: 6, name: 'Read Quran', category: 'Quran' },
  { preset_id: 7, name: 'Monday fasting', category: 'Fasting' },
  { preset_id: 8, name: 'Thursday fasting', category: 'Fasting' },
  { preset_id: 9, name: 'Ayyamul bidh fasting', category: 'Fasting' },
  { preset_id: 10, name: 'Sedekah', category: 'Others' },
  { preset_id: 11, name: 'Istighfar 100x', category: 'Dhikr' },
  { preset_id: 12, name: 'Shalawat 100x', category: 'Dhikr' },
]

const categories = ['All', 'Dhikr', 'Sunnah prayer', 'Quran', 'Fasting', 'Others']

const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function Worship() {
  const { isGuest, userId } = useAuth()
  const [activeTab, setActiveTab] = useState('today')
  const [myItems, setMyItems] = useState([])
  const [checked, setChecked] = useState([])
  const [filterCategory, setFilterCategory] = useState('All')
  const [customName, setCustomName] = useState('')
  const [loading, setLoading] = useState(true)

  const today = todayKey()

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    setLoading(true)
    if (isGuest) {
      const savedItems = localStorage.getItem('nura_worship_items')
      const savedChecked = localStorage.getItem(`nura_worship_checked_${today}`)
      if (savedItems) setMyItems(JSON.parse(savedItems))
      if (savedChecked) setChecked(JSON.parse(savedChecked))
    } else if (userId) {
      const { data: items } = await supabase
        .from('worship_items')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
      if (items) setMyItems(items)

      const { data: logs } = await supabase
        .from('worship_logs')
        .select('worship_item_id')
        .eq('user_id', userId)
        .eq('date', today)
        .eq('completed', true)
      if (logs) setChecked(logs.map((l) => l.worship_item_id))
    }
    setLoading(false)
  }

  const toggleCheck = async (id) => {
    const isChecked = checked.includes(id)
    const updated = isChecked
      ? checked.filter((c) => c !== id)
      : [...checked, id]
    setChecked(updated)

    if (isGuest) {
      localStorage.setItem(`nura_worship_checked_${today}`, JSON.stringify(updated))
    } else if (userId) {
      if (isChecked) {
        await supabase
          .from('worship_logs')
          .delete()
          .eq('user_id', userId)
          .eq('worship_item_id', id)
          .eq('date', today)
      } else {
        await supabase
          .from('worship_logs')
          .insert({
            user_id: userId,
            worship_item_id: id,
            date: today,
            completed: true,
          })
      }
    }
  }

  const addItem = async (name, category = 'Others') => {
    if (!name.trim()) return

    if (isGuest) {
      const newItem = { id: Date.now(), name: name.trim(), category }
      const updated = [...myItems, newItem]
      setMyItems(updated)
      localStorage.setItem('nura_worship_items', JSON.stringify(updated))
    } else if (userId) {
      const { data } = await supabase
        .from('worship_items')
        .insert({ user_id: userId, name: name.trim(), category, is_active: true })
        .select()
        .single()
      if (data) setMyItems((prev) => [...prev, data])
    }
    setCustomName('')
  }

  const addPreset = async (preset) => {
    const already = myItems.find((i) => i.name === preset.name)
    if (already) {
      removeItem(already.id)
      return
    }
    await addItem(preset.name, preset.category)
  }

  const removeItem = async (id) => {
    if (isGuest) {
      const updated = myItems.filter((i) => i.id !== id)
      setMyItems(updated)
      localStorage.setItem('nura_worship_items', JSON.stringify(updated))
    } else if (userId) {
      await supabase.from('worship_items').delete().eq('id', id)
      setMyItems((prev) => prev.filter((i) => i.id !== id))
    }
  }

  const filtered = filterCategory === 'All'
    ? presetItems
    : presetItems.filter((i) => i.category === filterCategory)

  const checkedCount = checked.length
  const totalCount = myItems.length
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#4FA095] px-6 pt-12 pb-8">
        <h1 className="text-white text-2xl font-semibold">Worship & Sunnah</h1>
        <p className="text-[#B2D8D4] text-sm mt-1">{checkedCount} of {totalCount} completed today</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 flex">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 text-sm py-2 rounded-xl transition-colors font-medium ${
              activeTab === 'today' ? 'bg-[#4FA095] text-white' : 'text-gray-400'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 text-sm py-2 rounded-xl transition-colors font-medium ${
              activeTab === 'manage' ? 'bg-[#4FA095] text-white' : 'text-gray-400'
            }`}
          >
            Manage
          </button>
        </div>

        {activeTab === 'today' && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Progress</p>
                <p className="text-xs text-[#4FA095] font-medium">{checkedCount} / {totalCount}</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-[#4FA095] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
              ) : myItems.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400 text-sm">No worship items yet.</p>
                  <button
                    onClick={() => setActiveTab('manage')}
                    className="text-[#4FA095] text-sm mt-2 underline"
                  >
                    Add from Manage tab
                  </button>
                </div>
              ) : (
                myItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left ${
                      index !== myItems.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        checked.includes(item.id)
                          ? 'bg-[#4FA095] border-[#4FA095]'
                          : 'border-gray-200'
                      }`}>
                        {checked.includes(item.id) && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${
                          checked.includes(item.id) ? 'text-gray-300 line-through' : 'text-gray-800'
                        }`}>
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'manage' && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom worship..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem(customName)}
                  className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-300"
                />
                <button
                  onClick={() => addItem(customName)}
                  className="text-sm text-[#4FA095] font-medium px-3"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                    filterCategory === cat
                      ? 'bg-[#4FA095] text-white border-[#4FA095]'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {filtered.map((preset, index) => {
                const isAdded = myItems.some((i) => i.name === preset.name)
                return (
                  <button
                    key={preset.preset_id}
                    onClick={() => addPreset(preset)}
                    className={`w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left ${
                      index !== filtered.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{preset.name}</p>
                      <p className="text-xs text-gray-400">{preset.category}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isAdded
                        ? 'bg-[#4FA095] border-[#4FA095]'
                        : 'border-gray-200'
                    }`}>
                      {isAdded && <span className="text-white text-xs">✓</span>}
                    </div>
                  </button>
                )
              })}
            </div>

            {myItems.filter(i => !presetItems.find(p => p.name === i.name)).length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <p className="text-xs text-gray-400 uppercase tracking-wide px-5 pt-4 pb-2">Custom</p>
                {myItems
                  .filter(i => !presetItems.find(p => p.name === i.name))
                  .map((item, index, arr) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between px-5 py-4 ${
                        index !== arr.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-rose-400 px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

      </div>

      <div className="h-8" />
    </div>
  )
}

export default Worship