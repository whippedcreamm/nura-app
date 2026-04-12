import { useState } from 'react'

const presetItems = [
  { id: 1, name: 'Morning dhikr', category: 'Dhikr' },
  { id: 2, name: 'Evening dhikr', category: 'Dhikr' },
  { id: 3, name: 'Dhuha prayer', category: 'Sunnah prayer' },
  { id: 4, name: 'Tahajud prayer', category: 'Sunnah prayer' },
  { id: 5, name: 'Rawatib prayer', category: 'Sunnah prayer' },
  { id: 6, name: 'Read Quran', category: 'Quran' },
  { id: 7, name: 'Monday fasting', category: 'Fasting' },
  { id: 8, name: 'Thursday fasting', category: 'Fasting' },
  { id: 9, name: 'Ayyamul bidh fasting', category: 'Fasting' },
  { id: 10, name: 'Sedekah', category: 'Others' },
  { id: 11, name: 'Istighfar 100x', category: 'Dhikr' },
  { id: 12, name: 'Shalawat 100x', category: 'Dhikr' },
]

const categories = ['All', 'Dhikr', 'Sunnah prayer', 'Quran', 'Fasting', 'Others']

function Worship() {
  const [activeTab, setActiveTab] = useState('today')
  const [selectedItems, setSelectedItems] = useState([1, 2, 6])
  const [checked, setChecked] = useState([])
  const [filterCategory, setFilterCategory] = useState('All')
  const [customName, setCustomName] = useState('')
  const [customItems, setCustomItems] = useState([])

  const allItems = [...presetItems, ...customItems]
  const myItems = allItems.filter((item) => selectedItems.includes(item.id))
  const checkedCount = checked.length
  const totalCount = myItems.length

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleCheck = (id) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const addCustom = () => {
    if (!customName.trim()) return
    const newItem = {
      id: Date.now(),
      name: customName.trim(),
      category: 'Others',
    }
    setCustomItems((prev) => [...prev, newItem])
    setSelectedItems((prev) => [...prev, newItem.id])
    setCustomName('')
  }

  const filtered = allItems.filter((item) =>
    filterCategory === 'All' ? true : item.category === filterCategory
  )

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
              activeTab === 'today'
                ? 'bg-[#4FA095] text-white'
                : 'text-gray-400'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 text-sm py-2 rounded-xl transition-colors font-medium ${
              activeTab === 'manage'
                ? 'bg-[#4FA095] text-white'
                : 'text-gray-400'
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
              {myItems.length === 0 ? (
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
                  onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                  className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-300"
                />
                <button
                  onClick={addCustom}
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
              {filtered.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left ${
                    index !== filtered.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedItems.includes(item.id)
                      ? 'bg-[#4FA095] border-[#4FA095]'
                      : 'border-gray-200'
                  }`}>
                    {selectedItems.includes(item.id) && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

      </div>

      <div className="h-8" />
    </div>
  )
}

export default Worship