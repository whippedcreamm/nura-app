import { useState } from 'react'

const slides = [
  {
    title: 'Track your prayers',
    description: 'Never miss a prayer. Log your daily salah, track your streak, and stay consistent.',
    icon: '🕌',
    bg: 'bg-[#4FA095]',
  },
  {
    title: 'Understand your cycle',
    description: 'Know your phase, log symptoms, and let your ibadah adapt to your body.',
    icon: '🌸',
    bg: 'bg-rose-400',
  },
  {
    title: 'Your light, every day',
    description: 'Dhikr, Quran, worship — all in one place. Nura grows with you, every single day.',
    icon: '✨',
    bg: 'bg-[#4FA095]',
  },
]

function Onboarding({ onFinish }) {
  const [current, setCurrent] = useState(0)

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1)
    }
  }

  const prev = () => {
    if (current > 0) setCurrent(current - 1)
  }

  const slide = slides[current]
  const isLast = current === slides.length - 1

  return (
    <div className="min-h-screen flex flex-col">
      <div className={`${slide.bg} flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8 transition-colors duration-500`}>
        <p className="text-8xl mb-8">{slide.icon}</p>
        <h1 className="text-white text-2xl font-semibold text-center leading-snug">
          {slide.title}
        </h1>
        <p className="text-white/70 text-sm text-center mt-3 leading-relaxed">
          {slide.description}
        </p>

        <div className="flex gap-2 mt-10">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'bg-white w-6' : 'bg-white/30 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white px-6 py-8 space-y-3">
        {isLast ? (
          <>
            <button
              onClick={() => onFinish('auth')}
              className="w-full bg-[#4FA095] text-white text-sm font-medium py-3.5 rounded-2xl"
            >
              Sign in or create account
            </button>
            <button
              onClick={() => onFinish('guest')}
              className="w-full border border-gray-200 text-gray-500 text-sm py-3.5 rounded-2xl"
            >
              Continue as guest
            </button>
          </>
        ) : (
          <div className="flex gap-3">
            {current > 0 && (
              <button
                onClick={prev}
                className="flex-1 border border-gray-200 text-gray-500 text-sm py-3.5 rounded-2xl"
              >
                Back
              </button>
            )}
            <button
              onClick={next}
              className="flex-1 bg-[#4FA095] text-white text-sm font-medium py-3.5 rounded-2xl"
            >
              Next
            </button>
          </div>
        )}

        {!isLast && (
          <button
            onClick={() => setCurrent(slides.length - 1)}
            className="w-full text-gray-300 text-sm py-2"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  )
}

export default Onboarding