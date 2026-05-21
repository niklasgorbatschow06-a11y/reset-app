'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  )

export default function Home() {
  const supabase = getSupabase()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert(error.message)
      return
    }

    router.push('/dashboard')
  }

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      alert(error.message)
      return
    }

    alert('Account erstellt. Du kannst dich jetzt einloggen.')
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <nav className="flex items-center justify-between mb-20">
          <div className="text-2xl font-bold">RESET</div>
          <a href="#login" className="text-gray-400 hover:text-white">
            Einloggen
          </a>
        </nav>

        <section className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <div className="inline-block mb-6 rounded-full border border-gray-800 bg-gray-950 px-4 py-2 text-sm text-gray-400">
              Daily Tasks Â· Streaks Â· KI-Coach Â· TrainingsplÃ¤ne
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
              Baue Fokus, Disziplin und Momentum auf.
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-8">
              RESET hilft dir, deine wichtigsten Aufgaben zu erledigen, deinen Streak aufzubauen,
              TrainingsplÃ¤ne zu nutzen und mit einem KI-Coach dranzubleiben.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href="#login"
                className="bg-white text-black px-7 py-4 rounded-2xl font-bold text-center"
              >
                Kostenlos starten
              </a>

              <a
                href="#features"
                className="bg-gray-900 border border-gray-800 px-7 py-4 rounded-2xl font-bold text-center"
              >
                Features ansehen
              </a>
            </div>

            <p className="text-gray-500 text-sm">
              Kostenlos nutzbar. Premium optional fÃ¼r 9,99 â‚¬ pro Monat.
            </p>
          </div>

          <section
            id="login"
            className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl"
          >
            <h2 className="text-3xl font-bold mb-2">Starte mit RESET</h2>
            <p className="text-gray-400 mb-6">
              Logge dich ein oder erstelle kostenlos deinen Account.
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
          </section>
        </section>

        <section id="features" className="grid md:grid-cols-4 gap-5 mb-24">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <p className="text-3xl mb-4">âœ…</p>
            <h3 className="text-xl font-bold mb-2">Daily Tasks</h3>
            <p className="text-gray-400">
              Erstelle Aufgaben, hake sie ab und gewinne den Tag Schritt fÃ¼r Schritt.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <p className="text-3xl mb-4">ðŸ”¥</p>
            <h3 className="text-xl font-bold mb-2">Streaks</h3>
            <p className="text-gray-400">
              Bleib dran und baue sichtbares Momentum auf.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <p className="text-3xl mb-4">ðŸ¤–</p>
            <h3 className="text-xl font-bold mb-2">KI-Coach</h3>
            <p className="text-gray-400">
              Bekomme Motivation, Klarheit und konkrete nÃ¤chste Schritte.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <p className="text-3xl mb-4">ðŸ’ª</p>
            <h3 className="text-xl font-bold mb-2">TrainingsplÃ¤ne</h3>
            <p className="text-gray-400">
              Nutze PlÃ¤ne fÃ¼r Gym, Zuhause, Muskelaufbau und schnelle Workouts.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 md:p-10 mb-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-yellow-400 font-bold mb-3">RESET Premium</p>
              <h2 className="text-3xl md:text-5xl font-bold mb-5">
                Schalte Coach und TrainingsplÃ¤ne frei.
              </h2>
              <p className="text-gray-400 text-lg">
                Premium gibt dir mehr Struktur, bessere PlÃ¤ne und UnterstÃ¼tzung, wenn du festhÃ¤ngst.
              </p>
            </div>

            <div className="bg-black border border-gray-800 rounded-3xl p-6">
              <p className="text-5xl font-bold mb-2">9,99 â‚¬</p>
              <p className="text-gray-500 mb-6">pro Monat</p>

              <ul className="text-gray-300 space-y-3 mb-8">
                <li>âœ“ KI-Coach fÃ¼r Motivation und Klarheit</li>
                <li>âœ“ Premium-TrainingsplÃ¤ne</li>
                <li>âœ“ PlÃ¤ne als Tagesaufgaben Ã¼bernehmen</li>
                <li>âœ“ Mehr Fokus, Struktur und Momentum</li>
              </ul>

              <a
                href="#login"
                className="block bg-white text-black px-8 py-4 rounded-2xl font-bold text-center"
              >
                Kostenlos starten
              </a>
            </div>
          </div>
        </section>

        <section className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Kein kompliziertes System.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            RESET ist fÃ¼r Menschen, die Struktur, Fokus und Momentum aufbauen wollen â€”
            ohne Ã¼berladene ProduktivitÃ¤ts-App.
          </p>
        </section>

        <footer className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row gap-4 justify-between text-sm text-gray-500">
          <p>Â© 2026 RESET Â· Version 1.0</p>

          <div className="flex gap-4">
            <a href="/impressum" className="hover:text-white">
              Impressum
            </a>
            <a href="/datenschutz" className="hover:text-white">
              Datenschutz
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}