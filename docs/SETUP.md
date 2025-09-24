# 🚀 Impact Autopilot - 설정 가이드

이 가이드는 Impact Autopilot 프로젝트를 로컬 환경에서 설정하고 실행하는 방법을 설명합니다.

## 📋 사전 요구사항

- **Node.js**: 18.0.0 이상
- **PostgreSQL**: 14 이상
- **Redis**: 7 이상
- **Git**: 최신 버전

### macOS (Homebrew 사용)
```bash
# Node.js 설치
brew install node

# PostgreSQL 설치 및 시작
brew install postgresql
brew services start postgresql
createdb impact_autopilot

# Redis 설치 및 시작
brew install redis
brew services start redis
```

### Ubuntu/Debian
```bash
# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 설치
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb impact_autopilot

# Redis 설치
sudo apt-get install redis-server
sudo systemctl start redis-server
```

## ⚙️ 환경 설정

### 1. 프로젝트 클론 및 의존성 설치
```bash
git clone https://github.com/your-org/impact-autopilot.git
cd impact-autopilot
npm install --legacy-peer-deps
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정하세요:

```bash
# 데이터베이스
DATABASE_URL=postgresql://impact_user:impact_password@localhost:5432/impact_autopilot
REDIS_URL=redis://localhost:6379

# 텔레그램
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_WEBAPP_URL=http://localhost:3000

# 블록체인 (Polygon 테스트넷용)
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here

# API 키들 (테스트용 더미 값 사용 가능)
CLOVERLY_API_KEY=test_key
ONE_CLICK_IMPACT_API_KEY=test_key
NATION_BUILDER_API_KEY=test_key
KRA_API_KEY=test_key
KRA_API_SECRET=test_secret

# JWT
JWT_SECRET=your-super-secret-jwt-key

# 기타
NODE_ENV=development
PORT=3001
```

### 3. 데이터베이스 초기화
```bash
cd backend

# 데이터베이스 마이그레이션
npm run db:migrate

# 시드 데이터 추가 (선택사항)
npm run db:seed
```

## 🏃‍♂️ 실행하기

### 개발 모드
```bash
# 전체 스택 실행 (루트 디렉토리에서)
npm run dev

# 또는 개별 서비스 실행
# 터미널 1: 프론트엔드
cd frontend && npm start

# 터미널 2: 백엔드
cd backend && npm run dev
```

### Docker를 이용한 실행
```bash
# Docker Compose로 전체 스택 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

## 🔧 API 테스트

서버가 실행되면 다음 엔드포인트들을 테스트할 수 있습니다:

### Health Check
```bash
curl http://localhost:3001/health
```

### API 엔드포인트
```bash
# 미션 목록 조회
curl http://localhost:3001/api/missions

# 사용자 대시보드
curl -H "Authorization: Bearer YOUR_TELEGRAM_INIT_DATA" \
     http://localhost:3001/api/user/profile
```

## 🧪 테스트 실행

### 백엔드 테스트
```bash
cd backend
npm test
```

### 프론트엔드 테스트
```bash
cd frontend
npm test
```

## 🔗 텔레그램 봇 설정

### 1. BotFather를 통해 봇 생성
1. Telegram에서 [@BotFather](https://t.me/botfather)를 검색
2. `/newbot` 명령어로 새 봇 생성
3. 봇 토큰을 받아서 `.env` 파일에 설정

### 2. Web App 설정
```bash
# BotFather에서
/setcommands
/setmenubutton
```

### 3. Webhook 설정 (프로덕션)
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -d "url=https://your-domain.com/webhooks/telegram"
```

## 🌐 배포

### Vercel (프론트엔드)
```bash
# Vercel CLI 설치
npm i -g vercel

# 프론트엔드 배포
cd frontend
vercel --prod
```

### AWS/Vercel (백엔드)
```bash
# 백엔드 배포
cd backend
vercel --prod
```

### Docker 프로덕션 배포
```bash
# 프로덕션 컴포즈 파일 사용
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 문제 해결

### 일반적인 문제들

**포트 충돌**
```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :3001

# 포트 변경 (예: package.json에서 PORT 수정)
```

**데이터베이스 연결 실패**
```bash
# PostgreSQL 상태 확인
brew services list | grep postgresql

# 데이터베이스 재생성
dropdb impact_autopilot
createdb impact_autopilot
```

**Redis 연결 실패**
```bash
# Redis 상태 확인
redis-cli ping

# Redis 재시작
brew services restart redis
```

### 로그 확인
```bash
# 백엔드 로그
cd backend && npm run logs

# Docker 로그
docker-compose logs backend
docker-compose logs frontend
```

## 📚 추가 리소스

- [API 문서](./API.md)
- [로드맵](./ROADMAP.md)
- [핵심 원칙](./CORE_PRINCIPLES.md)
- [컨트리뷰션 가이드](../CONTRIBUTING.md)

## 🆘 지원

문제가 발생하거나 도움이 필요하시면:

1. [Issues](https://github.com/your-org/impact-autopilot/issues)에서 검색
2. 새로운 Issue 생성
3. [Discussions](https://github.com/your-org/impact-autopilot/discussions) 사용

---

**행복한 코딩 되세요! 🎉**
