export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-gray-800 px-4 py-2 text-sm text-gray-400">
          Dein persönliches System für Disziplin & Wachstum
        </div>

        <h1 className="text-5xl md:text-7xl font-bold max-w-4xl mb-6">
          Fix dein Leben. Einen Tag nach dem anderen.
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10">
          RESET hilft dir mit täglichen Aufgaben, Fortschritt, Premium-Coaching und KI-Unterstützung dabei, Struktur aufzubauen.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/dashboard"
            className="bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg"
          >
            Kostenlos starten
          </a>

          <a
            href="/dashboard"
            className="bg-gray-900 border border-gray-800 px-8 py-4 rounded-2xl font-bold text-lg"
          >
            Dashboard ansehen
          </a>
        </div>
      </section>

      <section className="px-6 pb-24 max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-3">✅ Daily Tasks</h2>
          <p className="text-gray-400">
            Klare Aufgaben für jeden Tag, damit du nicht mehr planlos bist.
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-3">📈 Fortschritt</h2>
          <p className="text-gray-400">
            Sieh sofort, wie viel du geschafft hast und bleib motiviert.
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-3">🤖 KI-Coach</h2>
          <p className="text-gray-400">
            Erhalte direkte, praktische Antworten, wenn du Motivation brauchst.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">
          Starte heute. Nicht irgendwann.
        </h2>

        <p className="text-gray-400 mb-8">
          Die meisten verlieren, weil sie keinen Plan haben. RESET gibt dir einen einfachen Startpunkt.
        </p>

        <a
          href="/dashboard"
          className="inline-block bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg"
        >
          Jetzt loslegen
        </a>
      </section>
    </main>
  )
}