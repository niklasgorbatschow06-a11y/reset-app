import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Keine E-Mail gefunden.' },
        { status: 400 }
      )
    }

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (!userData?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Kein Stripe-Kunde gefunden.' },
        { status: 404 }
      )
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
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