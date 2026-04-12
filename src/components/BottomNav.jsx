import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/prayer', label: 'Prayer', icon: '🕌' },
  { path: '/quran', label: "Qur'an", icon: '📖' },
  { path: '/cycle', label: 'Cycle', icon: '🌸' },
  { path: '/worship', label: 'Worship', icon: '🤲' },
]

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs px-3 py-2 rounded-lg transition-colors ${
              isActive ? 'text-[#4FA095] font-medium' : 'text-gray-400'
            }`
          }
        >
          <span className="text-xl">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav