import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    )
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const email = session.customer_email || session.customer_details?.email

      if (email) {
        await supabaseAdmin
          .from('users')
          .upsert(
            {
              email,
              is_premium: true,
            },
            {
              onConflict: 'email',
            }
          )
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object

      const customer = await stripe.customers.retrieve(subscription.customer)
      const email = customer.email

      if (email) {
        await supabaseAdmin
          .from('users')
          .upsert(
            {
              email,
              is_premium: false,
            },
            {
              onConflict: 'email',
            }
          )
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Webhook Handler Fehler' },
      { status: 500 }
    )
  }
}
