// Mock data for demo purposes
const mockMissions = [
  {
    id: '1',
    title: '탄소 발자국 줄이기 챌린지',
    description: '일주일 동안 대중교통 이용하고 탄소 배출량을 20kg 줄여보세요',
    type: 'carbon_offset',
    impact: 25,
    cost: 0,
    currency: 'KRW',
    status: 'pending',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    requirements: ['대중교통 5회 이용', '자가용 대신 도보/자전거 이용'],
  },
  {
    id: '2',
    title: '환경 기부 챌린지',
    description: '환경 단체에 10,000원 기부하고 기부 영수증을 공유하세요',
    type: 'donation',
    impact: 50,
    cost: 10000,
    currency: 'KRW',
    status: 'pending',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    requirements: ['환경 단체 선정', '기부 영수증 업로드'],
  },
  {
    id: '3',
    title: '청원 참여 챌린지',
    description: '환경 보호 관련 청원에 서명하고 5명의 친구를 초대하세요',
    type: 'petition',
    impact: 30,
    cost: 0,
    currency: 'KRW',
    status: 'pending',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    requirements: ['청원 서명', '친구 5명 초대'],
  },
  {
    id: '4',
    title: '제로 웨이스트 챌린지',
    description: '일주일 동안 일회용품 사용하지 않고 지속 가능한 생활 실천하기',
    type: 'carbon_offset',
    impact: 35,
    cost: 0,
    currency: 'KRW',
    status: 'pending',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    requirements: ['일회용품 사용 금지', '재사용 용품 활용'],
  },
  {
    id: '5',
    title: '나무 심기 캠페인',
    description: '도시 숲 조성 프로젝트에 참여하여 5그루의 나무 심기',
    type: 'carbon_offset',
    impact: 40,
    cost: 5000,
    currency: 'KRW',
    status: 'pending',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    requirements: ['나무 심기 참여', '참여 인증 사진'],
  },
];

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      if (req.query.id) {
        // Get mission by ID
        const mission = mockMissions.find(m => m.id === req.query.id);
        if (!mission) {
          return res.status(404).json({ error: 'Mission not found' });
        }
        res.json(mission);
      } else {
        // Get all missions
        res.json(mockMissions);
      }
    } else if (req.method === 'POST') {
      if (req.query.id && req.query.action === 'start') {
        // Start mission
        const mission = mockMissions.find(m => m.id === req.query.id);
        if (!mission) {
          return res.status(404).json({ error: 'Mission not found' });
        }
        // Update status to processing
        mission.status = 'processing';
        res.json({ message: `Mission ${req.query.id} started`, mission });
      } else {
        // Create new mission (not implemented for demo)
        res.status(201).json({ message: 'Mission creation not implemented in demo' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Missions API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
