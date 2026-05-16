export default function Impressum() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-gray-400 hover:text-white">
          Zurueck zur Startseite
        </a>

        <h1 className="text-4xl font-bold mt-8 mb-6">Impressum</h1>

        <div className="space-y-4 text-gray-300">
          <p>
            Angaben gemaess § 5 TMG
          </p>

          <p>
            Niklas Gorbatschow<br />
            Adresse hier eintragen<br />
            PLZ Ort hier eintragen<br />
            Deutschland
          </p>

          <p>
            Kontakt:<br />
            E-Mail: niklas.gorbatschow06@gmail.com
          </p>

          <p>
            Verantwortlich fuer den Inhalt nach § 18 Abs. 2 MStV:<br />
            Niklas Gorbatschow
          </p>

          <p className="text-gray-500 text-sm">
            Hinweis: Bitte pruefe diese Angaben vor dem oeffentlichen Launch und ergaenze deine vollstaendige ladungsfaehige Anschrift.
          </p>
        </div>
      </div>
    </main>
  )
}
