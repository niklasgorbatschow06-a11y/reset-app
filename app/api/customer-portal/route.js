import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Keine E-Mail gefunden.' },
        { status: 400 }
      )
    }

    const customers = await stripe.customers.list({
      email,
      limit: 1,
    })

    if (!customers.data.length) {
      return NextResponse.json(
        { error: 'Kein Stripe-Kunde gefunden.' },
        { status: 404 }
      )
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Customer Portal Fehler' },
      { status: 500 }
    )
  }
}
