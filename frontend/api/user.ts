// Mock user data
const mockUser = {
  id: '1',
  telegramId: '123456789',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  profile: {
    totalImpact: 180,
    badgesEarned: 4,
    missionsCompleted: 5,
    joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  }
};

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      res.json({ success: true, data: mockUser });
    } else if (req.method === 'PUT') {
      const updatedData = req.body;
      Object.assign(mockUser, updatedData);
      res.json({ success: true, message: 'User profile updated', data: mockUser });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = handler;


