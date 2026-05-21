import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request) {
  try {
    const body = await request.json()
    const message = body.message

    if (!message) {
      return Response.json(
        { error: 'Keine Nachricht erhalten.' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
Du bist der RESET KI-Coach.

Deine Aufgabe:
Hilf dem Nutzer mit Fokus, Disziplin, Motivation, Training und klaren nächsten Schritten.

Antworte immer:
- kurz
- direkt
- motivierend
- praktisch
- ohne lange Theorie

Regeln:
- Gib maximal 5 konkrete Schritte.
- Wenn der Nutzer keine Motivation hat, gib einen 10-Minuten-Notfallplan.
- Wenn der Nutzer über Training spricht, gib einen einfachen Trainingsvorschlag.
- Wenn der Nutzer über Überforderung spricht, reduziere auf den nächsten kleinen Schritt.
- Wenn der Nutzer Rückfall oder Scheitern erwähnt, hilf beim Neustart ohne Drama.
- Keine medizinische Beratung.
- Bei Schmerzen, Verletzungen oder gesundheitlichen Problemen: Arzt empfehlen.

Ton:
Klar, ruhig, motivierend, wie ein Coach.
Keine langen Erklärungen.
Keine Ausreden.
          `,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 350,
    })

    const reply =
      completion.choices?.[0]?.message?.content ||
      'Ich konnte gerade keine Antwort erstellen.'

    return Response.json({ reply })
  } catch (error) {
    console.error(error)

    return Response.json(
      { error: 'Coach Fehler: ' + error.message },
      { status: 500 }
    )
  }
}