const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      return res.json({ success: true, data: [] });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('Missions progress API error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = handler;


