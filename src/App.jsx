import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Prayer from './pages/Prayer'
import Quran from './pages/Quran'
import Cycle from './pages/Cycle'
import Dhikr from './pages/Dhikr'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 pb-16">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/prayer" element={<Prayer />} />
          <Route path="/quran" element={<Quran />} />
          <Route path="/cycle" element={<Cycle />} />
          <Route path="/dhikr" element={<Dhikr />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App