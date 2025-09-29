export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, title, text, url, meta } = req.body || {};

    if (!title && !text) {
      return res.status(400).json({ error: 'title or text is required' });
    }

    // Generate a simple trackable slug (non-crypto for demo)
    const base = `${type || 'general'}-${Date.now()}`;
    const slug = Buffer.from(base).toString('base64').replace(/=/g, '').slice(0, 16);

    // Compose final share URL (same domain)
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
    const basename = `${protocol}://${host}`;
    const target = url || `${basename}`;
    const shareUrl = `${basename}/s/${slug}?to=${encodeURIComponent(target)}`;

    // Optionally store meta for analytics (skipped in demo)
    const response = {
      success: true,
      data: {
        slug,
        shareUrl,
        title: title || '',
        text: text || '',
        type: type || 'general',
        meta: meta || {},
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Share API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


