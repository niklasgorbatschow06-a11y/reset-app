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
            'Du bist ein direkter, motivierender Self-Improvement Coach. Antworte kurz, klar und auf Deutsch.',
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
