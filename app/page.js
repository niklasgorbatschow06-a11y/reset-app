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

          <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
            Gewinne deinen Tag. Jeden Tag.
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-8">
            Baue Fokus, Disziplin und Momentum auf – mit täglichen Aufgaben, Streaks, Fortschritt und einem KI-Coach, der dich auf Kurs hält.
          </p>
<div className="flex flex-col sm:flex-row gap-3 mb-8">
  <a
    href="#login"
    className="bg-white text-black px-6 py-4 rounded-2xl font-bold text-center"
  >
    Kostenlos starten
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