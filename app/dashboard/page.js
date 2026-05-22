'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { workoutPlans } from '../data/workoutPlans'

export const dynamic = 'force-dynamic'

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  )

const defaultTasks = [
  'Trainiere deinen Körper',
  'Arbeite an deinem Ziel',
  'Lerne etwas Neues',
]

export default function Dashboard() {
  const supabase = getSupabase()

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
  const [selectedWorkoutPlan, setSelectedWorkoutPlan] = useState(null)
  const [workoutFilter, setWorkoutFilter] = useState('all')

  const today = new Date().toISOString().split('T')[0]

  const completed = tasks.filter((task) => task.completed).length
  const progress =
    tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100)

  const filteredWorkoutPlans = Object.entries(workoutPlans).filter(
    ([key, plan]) => workoutFilter === 'all' || plan.category === workoutFilter
  )

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

    await checkPremium(data.user.email)
    await createTasksIfNeeded(data.user.email)
    await loadTasks(data.user.email)
    await loadStreak(data.user.email)

    setAuthLoading(false)
  }

  const checkPremium = async (email) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    setPremium(data?.is_premium === true)
  }

  const createTasksIfNeeded = async (email) => {
    const { data } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('email', email)
      .eq('date', today)

    if (data && data.length > 0) return

    await supabase.from('daily_tasks').insert(
      defaultTasks.map((title) => ({
        email,
        title,
        completed: false,
        date: today,
      }))
    )
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
    const { data } = await supabase
      .from('streaks')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    setStreak(data?.streak || 0)
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
    if (!confirm('Aufgabe wirklich löschen?')) return

    const { error } = await supabase
      .from('daily_tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      alert(error.message)
      return
    }

    await loadTasks(user.email)
  }

  const completeDay = async () => {
    if (!tasks.every((task) => task.completed)) {
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
      newStreak = Number(data.streak || 0) + 1
    }

    const { error } = await supabase.from('streaks').upsert(
      {
        email: user.email,
        streak: newStreak,
        last_completed: today,
      },
      { onConflict: 'email' }
    )

    if (error) {
      alert(error.message)
      return
    }

    setStreak(newStreak)
    setMessage('Tag abgeschlossen. Streak gespeichert.')
  }

  const addWorkoutTasks = async (planKey) => {
    const plan = workoutPlans[planKey]
    if (!plan) return

    const { data: existingTasks } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('email', user.email)
      .eq('date', today)
      .in('title', plan.tasks)

    if (existingTasks && existingTasks.length > 0) {
      setMessage('Dieser Trainingsplan wurde heute schon hinzugefügt.')
      return
    }

    const { error } = await supabase.from('daily_tasks').insert(
      plan.tasks.map((title) => ({
        email: user.email,
        title,
        completed: false,
        date: today,
      }))
    )

    if (error) {
      alert(error.message)
      return
    }

    await loadTasks(user.email)
    setMessage('Trainingsplan wurde zu deinen Aufgaben hinzugefügt.')
  }

  const startCheckout = async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    })

    const data = await response.json()

    if (data.url) window.location.href = data.url
    else alert(data.error || 'Checkout Fehler')
  }

  const openCustomerPortal = async () => {
    const response = await fetch('/api/customer-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    })

    const data = await response.json()

    if (data.url) window.location.href = data.url
    else alert(data.error || 'Customer Portal Fehler')
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: coachInput }),
    })

    const data = await response.json()

    setCoachReply(data.reply || data.error || 'Coach konnte nicht antworten.')
    setCoachLoading(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

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
        <a href="/" className="bg-white text-black px-8 py-4 rounded-2xl font-bold">
          Zum Login
        </a>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-5 py-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-6">
          <div>
            <p className="text-gray-500 text-sm mb-1">Willkommen zurück</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              RESET Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-2">{user.email}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3">
              <p className="text-gray-500 text-xs">Status</p>
              <p className="font-bold">
                {premium ? 'Premium aktiv 🔥' : 'Free Plan'}
              </p>
            </div>

            {premium && (
              <button
                onClick={openCustomerPortal}
                className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3 font-bold text-gray-300 hover:text-white"
              >
                Abo verwalten
              </button>
            )}

            <button
              onClick={logout}
              className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3 font-bold text-gray-300 hover:text-white"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <p className="text-gray-500 text-sm mb-2">Heute</p>
            <p className="font-bold">
              {new Date().toLocaleDateString('de-DE', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
              })}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <p className="text-gray-500 text-sm mb-2">Streak</p>
            <p className="text-3xl font-bold">🔥 {streak}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <p className="text-gray-500 text-sm mb-2">Aufgaben</p>
            <p className="text-3xl font-bold">
              {completed}/{tasks.length}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <p className="text-gray-500 text-sm mb-2">Fortschritt</p>
            <p className="text-3xl font-bold">{progress}%</p>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold">Tagesaufgaben</h2>
                <p className="text-gray-500 text-sm">
                  Heute erledigt: {completed}/{tasks.length}
                </p>
              </div>
              <p className="text-3xl font-bold">{progress}%</p>
            </div>

            <div className="w-full bg-gray-800 rounded-full h-3 mb-5">
              <div
                className="bg-white h-3 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
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

            <div className="space-y-3">
              {tasks.length === 0 && (
                <div className="bg-black border border-gray-800 rounded-2xl p-5 text-center text-gray-400">
                  Noch keine Aufgaben.
                </div>
              )}

              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-black border border-gray-800 rounded-2xl p-4 flex items-center gap-4"
                >
                  <button
                    onClick={() => toggleTask(task)}
                    className="flex-1 flex justify-between text-left"
                  >
                    <span className={task.completed ? 'line-through text-gray-500' : ''}>
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
              className="mt-5 w-full bg-white text-black py-4 rounded-2xl font-bold"
            >
              Tag abschließen
            </button>

            {message && (
              <div className="mt-4 bg-black border border-gray-800 rounded-2xl p-4 text-center text-gray-300">
                {message}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            {!premium ? (
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-6">
                <p className="text-yellow-400 font-bold mb-2">RESET Premium</p>
                <h2 className="text-2xl font-bold mb-3">
                  Mehr Fokus. Mehr Struktur.
                </h2>
                <p className="text-gray-400 mb-5">
                  KI-Coach, Trainingspläne und 1:1 Coaching-Anfrage.
                </p>
                <p className="text-4xl font-bold mb-1">9,99 €</p>
                <p className="text-gray-500 mb-5">pro Monat</p>
                <button
                  onClick={startCheckout}
                  className="w-full bg-white text-black py-4 rounded-2xl font-bold"
                >
                  Premium starten
                </button>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-6">
                  <p className="text-yellow-400 font-bold mb-2">Premium aktiv</p>
                  <h2 className="text-2xl font-bold mb-2">
                    Alles freigeschaltet 🔥
                  </h2>
                  <p className="text-gray-400">
                    KI-Coach, Trainingspläne und Coaching-Anfrage sind aktiv.
                  </p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
                  <p className="text-yellow-400 font-bold mb-2">1:1 Coaching</p>
                  <h2 className="text-xl font-bold mb-3">
                    Coaching mit Niklas anfragen
                  </h2>
                  <p className="text-gray-400 mb-5">
                    Schreib kurz dein Ziel und wobei du Hilfe brauchst.
                  </p>
                  <a
                    href={`mailto:niklas.gorbatschow06@gmail.com?subject=1:1 Coaching Anfrage&body=Hi Niklas,%0D%0A%0D%0Aich möchte ein 1:1 Coaching vereinbaren.%0D%0A%0D%0AMein Ziel:%0D%0AMeine aktuelle Situation:%0D%0AWobei ich Hilfe brauche:%0D%0A%0D%0A`}
                    className="block bg-white text-black px-6 py-3 rounded-2xl font-bold text-center"
                  >
                    Coaching anfragen
                  </a>
                </div>
              </>
            )}
          </aside>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-bold">Trainingspläne</h2>
                <p className="text-gray-500">
                  Wähle einen Plan und übernimm ihn in deine Aufgaben.
                </p>
              </div>

              {!premium && (
                <span className="text-sm bg-yellow-500 text-black px-3 py-1 rounded-full font-bold w-fit">
                  Premium
                </span>
              )}
            </div>

            {!premium ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-5">
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
              <>
                <div className="flex flex-wrap gap-2 mb-5">
                  {[
                    ['all', 'Alle'],
                    ['gym', 'Gym'],
                    ['home', 'Zuhause'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setWorkoutFilter(value)}
                      className={`px-4 py-2 rounded-xl font-bold ${
                        workoutFilter === value
                          ? 'bg-white text-black'
                          : 'bg-black border border-gray-800 text-gray-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {filteredWorkoutPlans.map(([key, plan]) => (
                    <div
                      key={key}
                      className="bg-black border border-gray-800 rounded-2xl p-5"
                    >
                      <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
                      <p className="text-gray-400 mb-4">{plan.subtitle}</p>

                      <button
                        onClick={() => setSelectedWorkoutPlan(plan)}
                        className="w-full bg-white text-black py-3 rounded-xl font-bold"
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
              </>
            )}

            {selectedWorkoutPlan && (
              <div className="mt-6 bg-black border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="text-xl font-bold">{selectedWorkoutPlan.title}</h3>
                  <button
                    onClick={() => setSelectedWorkoutPlan(null)}
                    className="text-gray-500 hover:text-white font-bold"
                  >
                    Schließen
                  </button>
                </div>
                <div className="text-gray-300 whitespace-pre-wrap">
                  {selectedWorkoutPlan.details}
                </div>
              </div>
            )}

            <p className="text-gray-500 text-xs mt-6">
              Hinweis: Die Trainingspläne ersetzen keine medizinische Beratung.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">KI Coach</h2>
              {!premium && (
                <span className="text-sm bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
                  Premium
                </span>
              )}
            </div>

            {!premium ? (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-5">
                  Der KI-Coach ist Teil von RESET Premium.
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
                <div className="grid gap-3 mb-4">
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
                  placeholder="Wobei brauchst du Klarheit?"
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
        </section>
      </div>
    </main>
  )
}