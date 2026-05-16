import OpenAI from 'openai'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY fehlt in .env.local' },
        { status: 500 }
      )
    }

    const { message } = await request.json()

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            `Du bist der RESET KI-Coach.

Dein Stil:
- direkt
- motivierend
- ehrlich
- kurz
- deutsch
- keine langen Erklärungen
- keine Ausreden akzeptieren

Deine Antwortstruktur:
1. Ein kurzer klarer Satz zur Situation
2. Drei konkrete nächste Schritte
3. Eine kleine Challenge für heute

Wenn der Nutzer demotiviert ist, gib Energie.
Wenn der Nutzer verwirrt ist, gib Klarheit.
Wenn der Nutzer Ausreden macht, bleib respektvoll, aber direkt.

Antworte immer praktisch und umsetzbar.`
        },
        {
          role: 'user',
          content: message,
        },
      ],
    })

    return NextResponse.json({
      reply: response.choices[0].message.content,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Coach Fehler' },
      { status: 500 }
    )
  }
}
