// Vercel Serverless Function
// POST /api/create-checkout-session
//
// Creates a Stripe Checkout session for the Commercial Licence purchase.
// Required environment variables (set in Vercel dashboard):
//   STRIPE_SECRET_KEY       — Stripe secret key (sk_test_… or sk_live_…)
//   STRIPE_PRICE_ID         — Stripe Price ID for the Commercial Licence product
//   NEXT_PUBLIC_SITE_URL    — Public URL of the site, e.g. https://solarsnap.co.uk

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://solarsnap.co.uk';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      // Collect the customer's email so we can match it to their Supabase account
      customer_email: req.body?.email || undefined,
      billing_address_collection: 'auto',
      // Stripe will append ?session_id={CHECKOUT_SESSION_ID} automatically
      success_url: `${siteUrl}/commercial.html?success=1`,
      cancel_url:  `${siteUrl}/commercial.html?cancelled=1`,
      metadata: {
        product: 'commercial_licence',
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
};
