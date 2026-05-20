'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    router.push('/dashboard')
  }

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    alert('Account erstellt. Du kannst dich jetzt einloggen.')
  }

  return (
    <main className="min-h-screen bg-black text-white px-5 py-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center min-h-[85vh]">
        <section>
          <div className="inline-block mb-6 rounded-full border border-gray-800 px-4 py-2 text-sm text-gray-400">
            RESET · Dein System für tägliche Disziplin
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
  Baue Fokus, Disziplin und Momentum auf.
</h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-8">
  RESET hilft dir, deine wichtigsten Aufgaben zu erledigen, deinen Streak aufzubauen, Trainingspläne zu nutzen und mit einem KI-Coach dranzubleiben.
</p>
<div className="flex flex-col sm:flex-row gap-3 mb-8">
  <a
    href="#login"
    className="bg-white text-black px-6 py-4 rounded-2xl font-bold text-center"
  >
    Kostenlos starten
    <p className="text-gray-500 text-sm mb-8">
  Kostenlos starten. Premium optional für 9,99 € pro Monat.
</p>
  </a>

  <a
    href="#features"
    className="bg-gray-900 border border-gray-800 text-white px-6 py-4 rounded-2xl font-bold text-center"
  >
    Mehr erfahren
  </a>
</div>
          <div id="features" className="grid sm:grid-cols-3 gap-4 max-w-xl">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <p className="text-2xl font-bold">🔥</p>
              <p className="font-bold mt-2">Streaks</p>
              <p className="text-gray-500 text-sm">Bleib dran.</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <p className="text-2xl font-bold">✅</p>
              <p className="font-bold mt-2">Tasks</p>
              <p className="text-gray-500 text-sm">Klarer Fokus.</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <p className="text-2xl font-bold">🤖</p>
              <p className="font-bold mt-2">KI-Coach</p>
              <p className="text-gray-500 text-sm">Premium.</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
  <h3 className="text-xl font-bold mb-2">Trainingspläne</h3>
  <p className="text-gray-400">
    Nutze fertige Pläne für Gym, Zuhause, Muskelaufbau und schnelle Workouts.
  </p>
</div>
<section className="max-w-5xl mx-auto px-6 py-20">
  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 md:p-10">
    <p className="text-yellow-400 font-bold mb-3">RESET Premium</p>

    <h2 className="text-3xl md:text-4xl font-bold mb-4">
      Schalte deinen KI-Coach und Trainingspläne frei.
    </h2>

    <p className="text-gray-400 max-w-2xl mb-6">
      Premium gibt dir mehr Struktur, Motivation und konkrete Pläne für deinen Alltag.
    </p>

    <ul className="text-gray-300 space-y-3 mb-8">
      <li>✓ KI-Coach für Motivation und klare nächste Schritte</li>
      <li>✓ Premium-Trainingspläne für Gym und Zuhause</li>
      <li>✓ Trainingspläne als Tagesaufgaben übernehmen</li>
      <li>✓ Mehr Fokus, Struktur und Momentum</li>
    </ul>

    <a
      href="/login"
      className="inline-block bg-white text-black px-8 py-4 rounded-2xl font-bold"
    >
      Kostenlos starten
    </a>

    <p className="text-gray-500 text-sm mt-4">
      Premium optional für 9,99 € pro Monat.
    </p>
  </div>
</section>
          </div>
        </section>
          <div className="mt-8 border border-gray-800 rounded-3xl p-5 bg-gray-950 max-w-xl">
  <p className="text-gray-400 text-sm mb-2">Für wen RESET ist</p>
  <p className="text-white font-bold text-lg mb-2">
    Für Menschen, die Struktur, Fokus und Momentum aufbauen wollen.
  </p>
  <p className="text-gray-500">
    Keine überladene Produktivitäts-App. Kein kompliziertes System.
    Nur tägliche Aufgaben, Streaks und ein Coach, der dich wieder auf Kurs bringt.
  </p>
</div>
        <section id="login" className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8">
          <h2 className="text-3xl font-bold mb-2">Einloggen</h2>
          <p className="text-gray-400 mb-6">
            Logge dich ein und arbeite an deinem heutigen Fortschritt.
          </p>

          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black border border-gray-700 px-4 py-3 rounded-xl w-full mb-4"
          />

          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black border border-gray-700 px-4 py-3 rounded-xl w-full mb-4"
          />

          <button
            onClick={signIn}
            className="bg-white text-black px-8 py-4 rounded-2xl font-bold mb-4 w-full"
          >
            Einloggen
          </button>

          <button
            onClick={signUp}
            className="bg-black border border-gray-700 text-white px-8 py-4 rounded-2xl font-bold w-full"
          >
            Kostenlos registrieren
          </button>

          <p className="text-gray-500 text-sm mt-6 text-center">
            Kostenlos starten · Premium-Coach optional für 9,99 €/Monat
          </p>
        </section>
      </div>
      <footer className="max-w-6xl mx-auto border-t border-gray-800 pt-6 mt-10 flex flex-col sm:flex-row gap-4 justify-between text-sm text-gray-500">
  <p>© 2026 RESET · Version 1.0</p>

  <div className="flex gap-4">
    <a href="/impressum" className="hover:text-white">
      Impressum
    </a>
    <a href="/datenschutz" className="hover:text-white">
      Datenschutz
    </a>
  </div>
</footer>
    </main>
  )
}