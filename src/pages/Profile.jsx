import Header from '../components/Header'

function Profile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Profile" subtitle="Your account & settings" />
      <div className="px-4 -mt-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Qur'an bookmarks</p>
          <p className="text-sm text-gray-400">Coming soon</p>
        </div>
      </div>
    </div>
  )
}

export default Profile