import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'RESET Premium',
          },
          unit_amount: 999,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    success_url: 'http://localhost:3000/dashboard?success=true',
    cancel_url: 'http://localhost:3000/dashboard?canceled=true',
  })

  return NextResponse.json({ url: session.url })
}