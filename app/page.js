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

    if (error) alert(error.message)
    else alert('Account erstellt. Jetzt einloggen.')
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-6xl font-bold mb-6">RESET</h1>

      <input
        type="email"
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-gray-900 border border-gray-700 px-4 py-3 rounded-xl w-full max-w-sm mb-4"
      />

      <input
        type="password"
        placeholder="Passwort"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-gray-900 border border-gray-700 px-4 py-3 rounded-xl w-full max-w-sm mb-4"
      />

      <button
        onClick={signIn}
        className="bg-white text-black px-8 py-4 rounded-2xl font-bold mb-4 w-full max-w-sm"
      >
        Einloggen
      </button>

      <button
        onClick={signUp}
        className="bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold w-full max-w-sm"
      >
        Registrieren
      </button>
    </main>
  )
}