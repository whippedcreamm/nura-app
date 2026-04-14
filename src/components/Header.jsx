import { useNavigate } from 'react-router-dom'

function Header({ title, subtitle, children }) {
  const navigate = useNavigate()

  return (
    <div className="bg-[#4FA095] px-6 pt-12 pb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="text-[#B2D8D4] text-sm mt-1">{subtitle}</p>}
          {children}
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mt-1"
        >
          <span className="text-white text-sm">👤</span>
        </button>
      </div>
    </div>
  )
}

export default Header