'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { workoutPlans } from '../data/workoutPlans'

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
  const [selectedWorkoutPlan, setSelectedWorkoutPlan] = useState('')

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
    const confirmed = confirm('Aufgabe wirklich löschen?')

if (!confirmed) return
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
const addWorkoutTasks = async () => {
  const workoutTasks = [
    'Liegestütze erledigen',
    'Kniebeugen erledigen',
    'Ausfallschritte erledigen',
    'Plank erledigen',
  ]

  const tasksToCreate = workoutTasks.map((title) => ({
    email: user.email,
    title,
    completed: false,
    date: today,
  }))

  const { data: existingTasks } = await supabase
  .from('daily_tasks')
  .select('*')
  .eq('email', user.email)
  .eq('date', today)
  .in('title', workoutTasks)

if (existingTasks && existingTasks.length > 0) {
  setMessage('Dieser Trainingsplan wurde heute schon hinzugefügt.')
  return
}

const { error } = await supabase
  .from('daily_tasks')
  .insert(tasksToCreate)
}
  return (
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-gray-500 mb-2">Willkommen zurück</p>
<p className="text-gray-600 text-sm mb-2">{user.email}</p>
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
              <p className="text-gray-500 text-xs mt-1">
                {premium ? 'KI-Coach freigeschaltet' : 'Basis-Funktionen aktiv'}
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
)}<div className="grid md:grid-cols-3 gap-4 mb-6">
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
    <p className="text-gray-500 text-sm mb-1">Heute</p>
    <p className="font-bold">
      {new Date().toLocaleDateString('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      })}
    </p>
  </div>

  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
    <p className="text-gray-500 text-sm mb-1">Aufgaben</p>
    <p className="font-bold">
      {completed}/{tasks.length} erledigt
    </p>
  </div>

  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
    <p className="text-gray-500 text-sm mb-1">Fortschritt</p>
    <p className="font-bold">{progress}%</p>
  </div>
</div>
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
            Heute erledigt: {completed}/{tasks.length}
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
{premium && (
  <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-8">
    <p className="text-gray-500 text-sm mb-2">RESET Premium</p>
    <h2 className="text-2xl font-bold mb-2">Dein KI-Coach ist aktiv 🔥</h2>
    <p className="text-gray-400">
      Nutze den Coach, wenn du Klarheit, Motivation oder einen konkreten Plan brauchst.
    </p>
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
  {tasks.length === 0 && (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center text-gray-400">
      Noch keine Aufgaben. Füge deine erste Aufgabe hinzu.
    </div>
  )}

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
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center text-gray-300 mb-8">
    {message}
  </div>
)}
<div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 mb-8">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-2xl font-bold">Trainingspläne</h2>

    {!premium && (
      <span className="text-sm bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
        Premium gesperrt
      </span>
    )}
  </div>

  {!premium ? (
    <div className="text-center py-8">
      <p className="text-gray-400 mb-6">
        Trainingspläne sind Teil von RESET Premium.
      </p>

      <button
        onClick={startCheckout}
        className="bg-white text-black px-6 py-3 rounded-2xl font-bold"
      >
        Premium freischalten
      </button>
    </div>
  ) : (
    <div className="grid md:grid-cols-3 gap-4">
  {Object.entries(workoutPlans).map(([key, plan]) => (
    <div
      key={key}
      className="bg-black border border-gray-800 rounded-2xl p-5"
    >
      <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
      <p className="text-gray-400 mb-4">{plan.subtitle}</p>

      <button
        onClick={() => setSelectedWorkoutPlan(plan.details)}
        className="mt-4 w-full bg-white text-black py-3 rounded-xl font-bold"
      >
        Plan öffnen
      </button>

      <button
        onClick={() => addWorkoutTasks(key)}
        className="mt-3 w-full bg-gray-900 border border-gray-800 text-white py-3 rounded-xl font-bold"
      >
        Als Aufgaben übernehmen
      </button>
    </div>
  ))}
</div>
  )}
{selectedWorkoutPlan && (
  <div className="mt-6 bg-black border border-gray-800 rounded-2xl p-5">
    <div className="flex items-center justify-between gap-4 mb-4">
      <h3 className="text-xl font-bold">Trainingsplan Details</h3>

      <button
        onClick={() => setSelectedWorkoutPlan('')}
        className="text-gray-500 hover:text-white font-bold"
      >
        Schließen
      </button>
    </div>

    <div className="text-gray-300 whitespace-pre-wrap">
      {selectedWorkoutPlan}
    </div>
  </div>
)}
  <p className="text-gray-500 text-xs mt-6">
    Hinweis: Die Trainingspläne ersetzen keine medizinische Beratung. Trainiere nur, wenn du gesund bist.
  </p>
</div>
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
                <div className="text-center py-8">
  <p className="text-gray-400 mb-3">
    Der KI-Coach ist Teil von RESET Premium.
  </p>

  <p className="text-gray-500 mb-6">
    Er hilft dir bei Motivation, Fokus, Tagesplanung und klaren nächsten Schritten.
  </p>

  <button
    onClick={startCheckout}
    className="bg-white text-black px-6 py-3 rounded-2xl font-bold"
  >
    Premium freischalten
  </button>
</div>
              </p>

              <button
                onClick={startCheckout}
                className="bg-white text-black px-6 py-3 rounded-2xl font-bold"
              >
                Premium freischalten
              </button>
            </div>
          ) : (
            <><div className="grid sm:grid-cols-2 gap-3 mb-4">
  {[
    'Ich habe keine Motivation',
    'Ich weiß nicht, womit ich anfangen soll',
    'Ich habe heute versagt',
    'Gib mir einen 10-Minuten-Plan',
  ].map((prompt) => (
    <button
      key={prompt}
      onClick={() => setCoachInput(prompt)}
      className="bg-black border border-gray-800 rounded-xl px-4 py-3 text-left text-gray-300 hover:text-white hover:border-gray-600"
    >
      {prompt}
    </button>
  ))}
</div>
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