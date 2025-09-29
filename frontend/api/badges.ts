// Mock badges data
const mockBadges = [
  { level: 'bronze', missionType: 'carbon_offset', impact: 25, earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { level: 'silver', missionType: 'donation', impact: 50, earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { level: 'gold', missionType: 'petition', impact: 75, earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { level: 'platinum', missionType: 'carbon_offset', impact: 100, earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), isNew: true },
];

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      res.json({ success: true, data: mockBadges });
    } else if (req.method === 'POST') {
      const tokenId = Math.floor(Math.random() * 1000000);
      const txHash = '0x' + Math.random().toString(16).substr(2, 64);
      res.json({ success: true, data: { tokenId, txHash }, message: 'SBT badge minted successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Badges API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = handler;


