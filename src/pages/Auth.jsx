import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Auth({ onBack }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          name,
          madhhab: 'shafi',
        })
        setMessage('Account created! Please check your email to confirm.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-[#4FA095] px-6 pt-16 pb-12 text-center">
        <h1 className="text-white text-3xl font-semibold">Nura</h1>
        <p className="text-[#B2D8D4] text-sm mt-2">نور — Your light in every day</p>
      </div>

      <div className="flex-1 px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(null); setMessage(null) }}
              className={`flex-1 text-sm py-2 rounded-lg transition-colors font-medium ${
                isLogin ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); setMessage(null) }}
              className={`flex-1 text-sm py-2 rounded-lg transition-colors font-medium ${
                !isLogin ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'
              }`}
            >
              Create account
            </button>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#4FA095] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#4FA095] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#4FA095] transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-500 bg-rose-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            {message && (
              <p className="text-xs text-[#4FA095] bg-[#4FA095]/10 px-4 py-3 rounded-xl">{message}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#4FA095] text-white text-sm font-medium py-3 rounded-xl transition-opacity disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="w-full text-gray-300 text-sm py-2"
              >
                Continue as guest instead
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth