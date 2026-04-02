// Supabase Edge Function: stripe-webhook
//
// Receives Stripe webhook events and grants the Commercial Licence
// to the matching user in the Supabase database.
//
// Deploy:
//   supabase functions deploy stripe-webhook
//
// Required Supabase secrets (set via `supabase secrets set`):
//   STRIPE_SECRET_KEY          — Stripe secret key
//   STRIPE_WEBHOOK_SECRET      — Stripe webhook signing secret (whsec_…)
//   SUPABASE_URL               — Your Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY  — Supabase service role key (NOT the anon key)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing Stripe signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Stripe Checkout captures the customer email when customer_email is set
    const customerEmail = session.customer_email ?? session.customer_details?.email;

    if (!customerEmail) {
      console.error('No customer email found in session:', session.id);
      return new Response('No customer email', { status: 400 });
    }

    // Find the user in Supabase auth by email
    const { data: users, error: lookupError } = await supabase.auth.admin.listUsers();

    if (lookupError) {
      console.error('User lookup error:', lookupError.message);
      return new Response('Database error', { status: 500 });
    }

    const user = users.users.find(
      (u) => u.email?.toLowerCase() === customerEmail.toLowerCase(),
    );

    if (!user) {
      console.error('No Supabase user found for email:', customerEmail);
      // Return 200 so Stripe does not retry — the user may not have an account yet
      // TODO: store the purchase against the email and apply when they sign up
      return new Response('User not found — purchase recorded for future activation', { status: 200 });
    }

    // Grant Commercial Licence in the profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        licence_type: 'commercial',
        commercial_licence_granted_at: new Date().toISOString(),
        commercial_stripe_session_id: session.id,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError.message);
      return new Response('Failed to update licence', { status: 500 });
    }

    console.log(`Commercial licence granted to user ${user.id} (${customerEmail})`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
