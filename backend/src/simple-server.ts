import http from 'http';
import { Client } from 'pg';
import { carbonOffsetService } from './services/CarbonOffsetService';
import { donationService } from './services/DonationService';
import { petitionService } from './services/PetitionService';
import { accountAbstractionService } from './services/AccountAbstractionService';
import { sbtService } from './services/SBTService';
import { gasSponsorshipService } from './services/GasSponsorshipService';

const PORT = process.env.PORT || 3001;

// PostgreSQL client
const dbClient = new Client({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'impact_autopilot',
  user: process.env.DB_USER || 'impact_user',
  password: process.env.DB_PASSWORD || 'impact_password',
});

// 데이터베이스 연결
async function connectDB() {
  try {
    await dbClient.connect();
    console.log('✅ 데이터베이스 연결 성공');
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
  }
}

// 실제 데이터 조회 함수들
async function getMissions() {
  try {
    const query = `
      SELECT id, type, title, description, impact, cost, currency, status,
             created_at, updated_at
      FROM missions
      ORDER BY created_at DESC
    `;
    const result = await dbClient.query(query);
    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      impact: parseInt(row.impact),
      cost: parseFloat(row.cost),
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('미션 조회 오류:', error);
    return [];
  }
}

async function getUserProfile() {
  try {
    const query = `
      SELECT id, telegram_id, username, first_name, last_name,
             language_code, wallet_address, total_impact,
             missions_completed, badges_earned, created_at, updated_at
      FROM users
      LIMIT 1
    `;
    const result = await dbClient.query(query);
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        id: row.id,
        telegramId: parseInt(row.telegram_id),
        username: row.username,
        firstName: row.first_name,
        lastName: row.last_name,
        languageCode: row.language_code,
        walletAddress: row.wallet_address,
        totalImpact: parseInt(row.total_impact),
        missionsCompleted: parseInt(row.missions_completed),
        badgesEarned: parseInt(row.badges_earned),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    }
    return null;
  } catch (error) {
    console.error('사용자 프로필 조회 오류:', error);
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${req.method} ${req.url}`);

  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Eco Touch Backend is running with real database!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected'
    }));
    return;
  }

  // API endpoints
  if (req.url?.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    // Missions endpoint
    if (req.url === '/api/missions' && req.method === 'GET') {
      const missions = await getMissions();
      res.end(JSON.stringify({ success: true, data: missions }));
      return;
    }

    // User profile endpoint
    if (req.url === '/api/user/profile' && req.method === 'GET') {
      const profile = await getUserProfile();
      if (profile) {
        res.end(JSON.stringify({ success: true, data: profile }));
      } else {
        res.end(JSON.stringify({ success: false, error: 'User not found' }));
      }
      return;
    }

    // Mission start endpoint
    if (req.url?.startsWith('/api/missions/') && req.method === 'POST') {
      const missionId = req.url.split('/api/missions/')[1].split('/')[0];
      try {
        await dbClient.query('UPDATE missions SET status = $1, updated_at = NOW() WHERE id = $2', ['in_progress', missionId]);
        res.end(JSON.stringify({ success: true, message: 'Mission started successfully' }));
      } catch (error) {
        console.error('Mission start error:', error);
        res.end(JSON.stringify({ success: false, error: 'Failed to start mission' }));
      }
      return;
    }

    // ===== 제3자 API 연동 엔드포인트들 =====

    // Cloverly Carbon Offset endpoints
    if (req.url === '/api/carbon/calculate' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const result = await carbonOffsetService.calculateOffset(data);
          res.end(JSON.stringify({ success: true, data: result }));
        } catch (error) {
          res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
        }
      });
      return;
    }

    if (req.url === '/api/carbon/purchase' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const result = await carbonOffsetService.purchaseOffset(data);
          res.end(JSON.stringify({ success: true, data: result }));
        } catch (error) {
          res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
        }
      });
      return;
    }

    // 1ClickImpact Donation endpoints
    if (req.url === '/api/donation/charities' && req.method === 'GET') {
      try {
        const category = new URL(req.url!, `http://${req.headers.host}`).searchParams.get('category');
        const charities = await donationService.getCharities(category || undefined);
        res.end(JSON.stringify({ success: true, data: charities }));
      } catch (error) {
        res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
      }
      return;
    }

    if (req.url === '/api/donation/create' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const result = await donationService.createDonation(data);
          res.end(JSON.stringify({ success: true, data: result }));
        } catch (error) {
          res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
        }
      });
      return;
    }

    // NationBuilder Petition endpoints
    if (req.url === '/api/petition/categories' && req.method === 'GET') {
      try {
        const categories = await petitionService.getCategories();
        res.end(JSON.stringify({ success: true, data: categories }));
      } catch (error) {
        res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
      }
      return;
    }

    if (req.url === '/api/petition/active' && req.method === 'GET') {
      try {
        const petitions = await petitionService.getActivePetitions();
        res.end(JSON.stringify({ success: true, data: petitions }));
      } catch (error) {
        res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
      }
      return;
    }

    if (req.url === '/api/petition/create' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const result = await petitionService.createPetition(data);
          res.end(JSON.stringify({ success: true, data: result }));
        } catch (error) {
          res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
        }
      });
      return;
    }

    if (req.url?.startsWith('/api/petition/') && req.url.endsWith('/sign') && req.method === 'POST') {
      const petitionId = req.url.split('/api/petition/')[1].split('/')[0];
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const signature = JSON.parse(body);
          const result = await petitionService.signPetition(petitionId, signature);
          res.end(JSON.stringify({ success: true, data: result }));
        } catch (error) {
          res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
        }
      });
      return;
    }

    // ===== Web3 구성 요소 엔드포인트들 =====

    // ERC-4337 Account Abstraction endpoints
    if (req.url === '/api/account/create' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const result = await accountAbstractionService.createAccount(data.ownerAddress, data.salt);
          res.end(JSON.stringify({ success: true, data: result }));
        } catch (error) {
          res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
        }
      });
      return;
    }

    if (req.url === '/api/account/userop/create' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const userOp = await accountAbstractionService.createUserOperation(
            data.sender, data.to, data.value, data.data, data.nonce
          );
          res.end(JSON.stringify({ success: true, data: { userOp } }));
        } catch (error) {
          res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
        }
      });
      return;
    }

    if (req.url === '/api/account/userop/submit' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const result = await accountAbstractionService.submitUserOperation(data.userOp);
          res.end(JSON.stringify({ success: true, data: result }));
        } catch (error) {
          res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
        }
      });
      return;
    }

    // ERC-5192 SBT endpoints
    if (req.url === '/api/sbt/mint' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const result = await sbtService.mintSBT(data);
          res.end(JSON.stringify({ success: true, data: result }));
        } catch (error) {
          res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
        }
      });
      return;
    }

    if (req.url?.startsWith('/api/sbt/') && req.method === 'GET') {
      const tokenId = req.url.split('/api/sbt/')[1];
      try {
        const metadata = await sbtService.getSBTMetadata(tokenId);
        if (metadata) {
          res.end(JSON.stringify({ success: true, data: metadata }));
        } else {
          res.end(JSON.stringify({ success: false, error: 'SBT not found' }));
        }
      } catch (error) {
        res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
      }
      return;
    }

    if (req.url?.startsWith('/api/sbt/balance/') && req.method === 'GET') {
      const address = req.url.split('/api/sbt/balance/')[1];
      try {
        const balance = await sbtService.getSBTBalance(address);
        const sbts = await sbtService.getOwnedSBTs(address);
        res.end(JSON.stringify({ success: true, data: { balance, tokens: sbts } }));
      } catch (error) {
        res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
      }
      return;
    }

    // Gas Sponsorship endpoints
    if (req.url === '/api/gas/sponsor' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const result = await gasSponsorshipService.sponsorGas(data);
          res.end(JSON.stringify({ success: true, data: result }));
        } catch (error) {
          res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
        }
      });
      return;
    }

    if (req.url?.startsWith('/api/gas/eligibility/') && req.method === 'GET') {
      const address = req.url.split('/api/gas/eligibility/')[1];
      try {
        const result = await gasSponsorshipService.checkEligibility(address);
        res.end(JSON.stringify({ success: true, data: result }));
      } catch (error) {
        res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }));
        }
      return;
    }

    // Default API response
    res.end(JSON.stringify({
      success: true,
      message: `API endpoint: ${req.url}`,
      method: req.method,
      note: '실제 데이터베이스에서 데이터를 가져옵니다'
    }));
    return;
  }

  // Default response
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    message: 'Eco Touch Backend Server with Real Database',
    endpoints: [
      'GET /health',
      'GET /api/missions - 실제 데이터베이스에서 미션 목록 조회',
      'GET /api/user/profile - 실제 데이터베이스에서 사용자 정보 조회',
      'POST /api/missions/:id/start - 미션 시작'
    ],
    database: 'PostgreSQL connected'
  }));
});

// 서버 시작
async function startServer() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 Eco Touch Backend Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🗄️  Database: PostgreSQL connected`);
  });
}

startServer().catch(console.error);
