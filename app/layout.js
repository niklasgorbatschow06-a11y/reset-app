import './globals.css'

export const metadata = {
  title: 'RESET – Gewinne deinen Tag. Jeden Tag.',
  description:
    'RESET ist eine Daily-Discipline-App für Fokus, Routinen, Streaks und persönliche Entwicklung mit optionalem KI-Coach.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
