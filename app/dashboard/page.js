'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const defaultTasks = [
  'Trainiere deinen Körper',
  'Arbeite an deinem Ziel',
  'Lerne etwas Neues',
]

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [premium, setPremium] = useState(false)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const [message, setMessage] = useState('')
  const [newTask, setNewTask] = useState('')
  const [coachInput, setCoachInput] = useState('')
  const [coachReply, setCoachReply] = useState('')
  const [coachLoading, setCoachLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      setUser(null)
      setAuthLoading(false)
      return
    }

    setUser(data.user)
const params = new URLSearchParams(window.location.search)

if (params.get('success') === 'true') {
  setSuccessMessage('Premium wurde aktiviert. Willkommen bei RESET Premium.')
}
    await checkPremium(data.user.email)
    await createTasksIfNeeded(data.user.email)
    await loadTasks(data.user.email)
    await loadStreak(data.user.email)

    setAuthLoading(false)
  }

  const checkPremium = async (email) => {
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

setPremium(userData?.is_premium === true)
  }

  const createTasksIfNeeded = async (email) => {
    const { data } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('email', email)
      .eq('date', today)

    if (data && data.length > 0) return

    const tasksToCreate = defaultTasks.map((title) => ({
      email,
      title,
      completed: false,
      date: today,
    }))

    await supabase.from('daily_tasks').insert(tasksToCreate)
  }

  const loadTasks = async (email) => {
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('email', email)
      .eq('date', today)
      .order('id', { ascending: true })

    if (error) {
      alert(error.message)
      return
    }

    setTasks(data || [])
  }

  const loadStreak = async (email) => {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      alert(error.message)
      return
    }

    if (!data) {
      await supabase.from('streaks').insert({
        email,
        streak: 0,
        last_completed: null,
      })

      setStreak(0)
      return
    }

    setStreak(data.streak || 0)
  }

  const toggleTask = async (task) => {
    const { error } = await supabase
      .from('daily_tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id)

    if (error) {
      alert(error.message)
      return
    }

    await loadTasks(user.email)
    setMessage('')
  }

  const addTask = async () => {
    if (!newTask.trim()) return

    const { error } = await supabase.from('daily_tasks').insert({
      email: user.email,
      title: newTask,
      completed: false,
      date: today,
    })

    if (error) {
      alert(error.message)
      return
    }

    setNewTask('')
    await loadTasks(user.email)
  }

  const deleteTask = async (taskId) => {
    const { error } = await supabase
      .from('daily_tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      alert('Löschen Fehler: ' + error.message)
      return
    }

    await loadTasks(user.email)
  }

  const completeDay = async () => {
    const allDone = tasks.every((task) => task.completed)

    if (!allDone) {
      setMessage('Erledige zuerst alle Aufgaben.')
      return
    }

    const { data } = await supabase
      .from('streaks')
      .select('*')
      .eq('email', user.email)
      .maybeSingle()

    if (data?.last_completed === today) {
      setMessage('Du hast deinen Streak heute schon gesichert.')
      return
    }

    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterday = yesterdayDate.toISOString().split('T')[0]

    let newStreak = 1

    if (data?.last_completed === yesterday) {
      newStreak = (data?.streak || 0) + 1
    }

    await supabase.from('streaks').upsert({
      email: user.email,
      streak: newStreak,
      last_completed: today,
    })

    setStreak(newStreak)
    setMessage('Tag abgeschlossen. Streak gespeichert.')
  }

  const startCheckout = async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
      }),
    })

    const text = await response.text()
    const data = text
      ? JSON.parse(text)
      : { error: 'Leere Antwort vom Checkout' }

    if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.error || 'Checkout Fehler')
    }
  }

  const askCoach = async () => {
    if (!premium) {
      alert('KI Coach ist nur für Premium verfügbar.')
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
const openCustomerPortal = async () => {
  const response = await fetch('/api/customer-portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: user.email,
    }),
  })

  const text = await response.text()
  const data = text
    ? JSON.parse(text)
    : { error: 'Leere Antwort vom Customer Portal' }

  if (data.url) {
    window.location.href = data.url
  } else {
    alert(data.error || 'Customer Portal Fehler')
  }
}
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const completed = tasks.filter((task) => task.completed).length
  const progress =
    tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100)

  if (authLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Lade Dashboard...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Bitte einloggen</h1>
        <p className="text-gray-400 mb-6">
          Du musst eingeloggt sein, um dein Dashboard zu sehen.
        </p>
        <a
          href="/"
          className="bg-white text-black px-8 py-4 rounded-2xl font-bold"
        >
          Zum Login
        </a>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-gray-500 mb-2">Willkommen zurück</p>
            <h1 className="text-4xl md:text-5xl font-bold">RESET Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Fokussiere dich auf das, was heute zählt.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 flex-1">
              <p className="text-gray-500 text-sm">Status</p>
              <p className="font-bold">
                {premium ? 'Premium aktiv 🔥' : 'Free Plan'}
              </p>
            </div>
{premium && (
  <button
    onClick={openCustomerPortal}
    className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 font-bold text-gray-300 hover:text-white flex-1"
  >
    Abo verwalten
  </button>
)}
            <button
              onClick={logout}
              className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 font-bold text-gray-300 hover:text-white flex-1"
            >
              Logout
            </button>
          </div>
        </div>
{successMessage && (
  <div className="bg-green-500 text-black px-5 py-4 rounded-2xl mb-6 font-bold">
    {successMessage}
  </div>
)}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <p className="text-gray-400 mb-2">Dein Streak</p>
          <h2 className="text-5xl font-bold">🔥 {streak} Tage</h2>
        </div>

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

        {!premium && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-yellow-400 font-bold mb-2">RESET Premium</p>
                <h2 className="text-3xl font-bold mb-3">
                  Schalte deinen KI-Coach frei
                </h2>
                <p className="text-gray-400 max-w-xl">
                  Erhalte persönliche Motivation, klare nächste Schritte und direkte Antworten, wenn du festhängst.
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 min-w-64">
                <p className="text-gray-400 mb-1">Nur</p>
                <p className="text-4xl font-bold mb-4">9,99 €</p>
                <p className="text-gray-500 mb-4">pro Monat</p>

                <button
                  onClick={startCheckout}
                  className="w-full bg-white text-black py-4 rounded-2xl font-bold"
                >
                  Premium starten
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Eigene Aufgabe hinzufügen</h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Was willst du heute erledigen?"
              className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3"
            />

            <button
              onClick={addTask}
              className="bg-white text-black px-6 py-3 rounded-xl font-bold"
            >
              Hinzufügen
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="w-full bg-gray-900 p-4 rounded-xl flex justify-between items-center gap-4"
            >
              <button
                onClick={() => toggleTask(task)}
                className="flex-1 flex justify-between text-left"
              >
                <span
                  className={task.completed ? 'line-through text-gray-500' : ''}
                >
                  {task.title}
                </span>

                <span>{task.completed ? '✅' : '⬜'}</span>
              </button>

              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-500 hover:text-red-400 font-bold"
              >
                Löschen
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={completeDay}
          className="w-full bg-white text-black py-4 rounded-2xl font-bold mb-4"
        >
          Tag abschließen
        </button>

        {message && (
          <p className="text-center text-gray-400 mb-8">{message}</p>
        )}

        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">KI Coach</h2>

            {!premium && (
              <span className="text-sm bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
                Premium gesperrt
              </span>
            )}
          </div>

          {!premium ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-6">
                Der KI-Coach ist nur für Premium-Nutzer verfügbar.
              </p>

              <button
                onClick={startCheckout}
                className="bg-white text-black px-6 py-3 rounded-2xl font-bold"
              >
                Premium freischalten
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder="Wobei brauchst du gerade Klarheit?"
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
            </>
          )}
        </div>
      </div>
    </main>
  )
}