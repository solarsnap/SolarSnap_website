// Vercel Serverless Function
// POST /api/notify
//
// Saves a launch notification signup — emails the address to info@ and
// sends the user a confirmation.
// Required environment variables (set in Vercel dashboard):
//   RESEND_API_KEY — API key from resend.com

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    // Notify the SolarSnap team
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'SolarSnap Website <noreply@solarsnap.co.uk>',
        to:      ['info@solarsnap.co.uk'],
        subject: 'New launch notification signup',
        text:    `New signup: ${email}`,
      }),
    });

    // Send confirmation to the user
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'SolarSnap <noreply@solarsnap.co.uk>',
        to:      [email],
        subject: "You're on the list — SolarSnap",
        text:    "Thanks for your interest in SolarSnap!\n\nWe'll send you a single email the moment the app is available to download on iOS and Android. No spam, ever.\n\n— The SolarSnap team",
      }),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Notify error:', err.message);
    return res.status(500).json({ error: 'Failed to send' });
  }
};
