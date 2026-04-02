// Vercel Serverless Function
// POST /api/contact
//
// Forwards contact form submissions to hello@solarsnap.co.uk via email.
// Required environment variables (set in Vercel dashboard):
//   RESEND_API_KEY   — API key from resend.com (or replace with your preferred email service)

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SolarSnap Website <noreply@solarsnap.co.uk>',
        to:   ['hello@solarsnap.co.uk'],
        reply_to: email,
        subject: `[SolarSnap Contact] ${subject || 'General enquiry'} — from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend API error:', err);
      throw new Error('Email delivery failed');
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err.message);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
