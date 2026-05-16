import './globals.css'

export const metadata = {
  title: 'RESET – Gewinne deinen Tag. Jeden Tag.',
  description:
    'RESET ist eine Daily-Discipline-App für Fokus, Routinen, Streaks und persönliche Entwicklung mit optionalem KI-Coach.',
  openGraph: {
    title: 'RESET – Gewinne deinen Tag. Jeden Tag.',
    description:
      'Baue Fokus, Disziplin und Momentum auf – mit täglichen Aufgaben, Streaks und KI-Coach.',
    url: 'https://reset-app-pf4n.vercel.app',
    siteName: 'RESET',
    locale: 'de_DE',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
