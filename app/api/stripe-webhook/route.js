import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function setPremiumByCustomerId(supabaseAdmin, customerId, isPremium) {
  if (!customerId) return

  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  if (userData?.email) {
    await supabaseAdmin
      .from('users')
      .update({
        is_premium: isPremium,
      })
      .eq('email', userData.email)
  }
}

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

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
      const customerId = session.customer

      if (email) {
        await supabaseAdmin
          .from('users')
          .upsert(
            {
              email,
              is_premium: true,
              stripe_customer_id: customerId,
            },
            {
              onConflict: 'email',
            }
          )
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      await setPremiumByCustomerId(supabaseAdmin, subscription.customer, false)
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object

      if (
        subscription.cancel_at_period_end === true ||
        subscription.status === 'canceled' ||
        subscription.status === 'unpaid' ||
        subscription.status === 'incomplete_expired'
      ) {
        await setPremiumByCustomerId(supabaseAdmin, subscription.customer, false)
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