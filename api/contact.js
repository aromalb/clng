// Vercel serverless function: POST /api/contact
// Reads the Resend API key from an environment variable (set in Vercel dashboard),
// never from the client. Sends the contact form submission as an email.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  // Very basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Resend requires the "from" address to be on a domain you've verified
        // in your Resend account. Update this once your domain is verified there.
        from: 'NextGreenTech Website <onboarding@resend.dev>',
        to: ['info@nextgreentech.co.uk'],
        reply_to: email,
        subject: `New project enquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      })
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      console.error('Resend API error:', errBody);
      return res.status(502).json({ error: 'Failed to send message. Please try again or email us directly.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again or email us directly.' });
  }
}
