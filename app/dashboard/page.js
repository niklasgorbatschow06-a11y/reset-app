'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const [tasks, setTasks] = useState([
    { id: 1, title: '10 Minuten Bewegung', completed: false },
    { id: 2, title: '30 Minuten Fokusarbeit', completed: false },
    { id: 3, title: '5 Seiten lesen', completed: false },
  ])

  const [premium, setPremium] = useState(false)
  const [coachInput, setCoachInput] = useState('')
  const [coachReply, setCoachReply] = useState('')
  const [coachLoading, setCoachLoading] = useState(false)

  useEffect(() => {
    checkPremium()
  }, [])

  const checkPremium = async () => {
    const { data } = await supabase.auth.getUser()

    const email = data.user?.email || 'test@reset.app'

    const params = new URLSearchParams(window.location.search)

    if (params.get('success') === 'true') {
      await supabase.from('users').upsert({
        email,
        is_premium: true,
      })

      setPremium(true)
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    setPremium(Boolean(userData?.is_premium))
  }

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const startCheckout = async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
    })

    const text = await response.text()
    const data = text
      ? JSON.parse(text)
      : { error: 'Leere Antwort von /api/checkout' }

    if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.error || 'Checkout Fehler')
    }
  }

  const askCoach = async () => {
    if (!premium) {
      alert('KI Coach ist nur für Premium verfügbar 🔒')
      return
    }

    if (!coachInput.trim()) return

    setCoachLoading(true)
    setCoachReply('')

    const response = await fetch('/api/coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: coachInput,
      }),
    })

    const text = await response.text()
    const data = text
      ? JSON.parse(text)
      : { error: 'Leere Antwort vom Coach' }

    setCoachReply(data.reply || data.error || 'Coach konnte nicht antworten.')
    setCoachLoading(false)
  }

  const completed = tasks.filter((task) => task.completed).length
  const progress = Math.round((completed / tasks.length) * 100)

  return (
<main className="min-h-screen bg-black text-white px-6 py-8">
  <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
  <div>
    <p className="text-gray-500 mb-2">Willkommen zurück</p>
    <h1 className="text-4xl md:text-5xl font-bold">RESET Dashboard</h1>
    <p className="text-gray-400 mt-2">
      Gewinne den heutigen Tag mit klaren Aufgaben.
    </p>
  </div>

  <div className="flex gap-3">
  <div className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4">
    <p className="text-gray-500 text-sm">Status</p>
    <p className="font-bold">
      {premium ? 'Premium aktiv 🔥' : 'Free Plan'}
    </p>
  </div>

  <button
    onClick={async () => {
      await supabase.auth.signOut()
      window.location.href = '/'
    }}
    className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 font-bold text-gray-300 hover:text-white"
  >
    Logout
  </button>
</div>
</div>
      {premium && (
        <div className="bg-yellow-500 text-black px-4 py-2 rounded-xl mb-6 font-bold">
          PREMIUM AKTIV 🔥
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl p-6 mb-6">
        <p className="text-gray-400 mb-2">Fortschritt</p>

        <div className="w-full bg-gray-800 rounded-full h-4 mb-4">
          <div
            className="bg-white h-4 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p>
          {completed} von {tasks.length} erledigt
        </p>
      </div>

      <button
        onClick={startCheckout}
        className="w-full bg-white text-black py-4 rounded-2xl font-bold mb-8"
      >
        Premium starten – 9,99 €/Monat
      </button>

      <div className="space-y-4 mb-8">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className="w-full bg-gray-900 p-4 rounded-xl flex justify-between"
          >
            <span
              className={task.completed ? 'line-through text-gray-500' : ''}
            >
              {task.title}
            </span>

            <span>{task.completed ? '✅' : '⬜'}</span>
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">KI Coach</h2>

        <textarea
          value={coachInput}
          onChange={(e) => setCoachInput(e.target.value)}
          placeholder="Was hält dich heute zurück?"
          className="w-full bg-black border border-gray-700 rounded-xl p-4 mb-4 min-h-28"
        />

        <button
          onClick={askCoach}
          disabled={coachLoading}
          className="w-full bg-white text-black py-4 rounded-2xl font-bold disabled:opacity-50"
        >
          {coachLoading ? 'Coach denkt...' : 'Coach fragen'}
        </button>

        {coachReply && (
          <div className="mt-4 bg-black border border-gray-800 rounded-xl p-4 text-gray-300 whitespace-pre-wrap">
            {coachReply}
          </div>
        )}
      </div>
     </div>
    </main>
  )
}