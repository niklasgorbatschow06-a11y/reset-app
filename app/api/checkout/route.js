import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST() {
  try {
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

      success_url: 'https://reset-app-pf4n.vercel.app/dashboard?success=true',
cancel_url: 'https://reset-app-pf4n.vercel.app/dashboard?canceled=true',
    })

    return NextResponse.json({
      url: session.url,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    )
  }
}