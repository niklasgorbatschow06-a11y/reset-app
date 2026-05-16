export default function Datenschutz() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-gray-400 hover:text-white">
          Zurueck zur Startseite
        </a>

        <h1 className="text-4xl font-bold mt-8 mb-6">Datenschutz</h1>

        <div className="space-y-4 text-gray-300">
          <p>
            Diese Datenschutzerklaerung informiert darueber, welche personenbezogenen Daten bei der Nutzung von RESET verarbeitet werden.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">Verantwortlicher</h2>
          <p>
            Niklas Gorbatschow<br />
            E-Mail: niklas.gorbatschow06@gmail.com
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">Verarbeitete Daten</h2>
          <p>
            Bei der Nutzung der App koennen insbesondere E-Mail-Adresse, Login-Daten, Aufgaben, Streaks, Premium-Status und technische Nutzungsdaten verarbeitet werden.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">Dienste</h2>
          <p>
            Fuer Authentifizierung und Datenspeicherung wird Supabase genutzt. Fuer Zahlungen wird Stripe genutzt. Fuer Hosting wird Vercel genutzt.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">Zweck der Verarbeitung</h2>
          <p>
            Die Daten werden verarbeitet, um Nutzerkonten bereitzustellen, Aufgaben und Fortschritt zu speichern, Premium-Funktionen freizuschalten und Zahlungen abzuwickeln.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">Kontakt</h2>
          <p>
            Bei Fragen zum Datenschutz kannst du dich an folgende E-Mail wenden: niklas.gorbatschow06@gmail.com
          </p>

          <p className="text-gray-500 text-sm">
            Hinweis: Diese Vorlage ersetzt keine Rechtsberatung. Vor einem oeffentlichen Launch solltest du Impressum und Datenschutz rechtlich pruefen lassen.
          </p>
        </div>
      </div>
    </main>
  )
}
