# 환경 변수 설정 가이드

이 문서는 Eco Touch 프로젝트의 환경 변수 설정 방법을 설명합니다.

## 환경 변수 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 아래의 환경 변수들을 설정하세요.

```bash
cp .env.example .env
```

## 필수 환경 변수

### 데이터베이스 설정
```bash
# PostgreSQL 연결 URL (프로덕션 추천)
DATABASE_URL=postgresql://username:password@localhost:5432/impact_autopilot

# 또는 개별 설정 (DATABASE_URL 미사용시)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=impact_autopilot
DB_USER=impact_user
DB_PASSWORD=impact_password
```

### Redis 설정 (선택사항 - 캐싱용)
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 서버 설정
```bash
NODE_ENV=development
PORT=3001
CORS_ORIGIN=https://web.telegram.org
```

### 텔레그램 설정
```bash
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_WEBAPP_URL=https://your-domain.com
```

### 블록체인 설정 (Polygon)
```bash
POLYGON_RPC_URL=https://polygon-rpc.com

# 스마트 컨트랙트 주소
ACCOUNT_FACTORY_ADDRESS=0x...
IMPACT_BADGE_SBT_ADDRESS=0x...
ENTRY_POINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
PAYMASTER_ADDRESS=0x...

# 개인키 (보안 유지 필수!)
SBT_SIGNER_PRIVATE_KEY=your_private_key_here

# 번들러 설정
BUNDLER_URL=https://api.pimlico.io/v1/polygon/bundler/your-api-key
```

## 외부 API 키 설정

### 탄소 상쇄 서비스
```bash
CLOVERLY_API_KEY=your_cloverly_api_key_here
```

### 기부 서비스
```bash
ONE_CLICK_IMPACT_API_KEY=your_1clickimpact_api_key_here
```

### 청원 서비스
```bash
NATION_BUILDER_API_KEY=your_nation_builder_api_key_here
```

### 가스 스폰서십 서비스
```bash
PIMLICO_API_KEY=your_pimlico_api_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here
ALCHEMY_POLICY_ID=your_alchemy_policy_id_here
INFURA_PROJECT_ID=your_infura_project_id_here

# Cloudflare (선택사항)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

## 프론트엔드 환경 변수 (React)

```bash
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_POLYGON_RPC_URL=https://polygon-rpc.com
REACT_APP_ACCOUNT_FACTORY_ADDRESS=0x...
REACT_APP_IMPACT_BADGE_SBT_ADDRESS=0x...
```

## 배포 설정

### 프로덕션 배포용 (Vercel, AWS 등)
```bash
VERCEL_URL=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Docker 설정
DOCKER_REGISTRY=
DOCKER_IMAGE_TAG=latest
```

## 보안 주의사항

⚠️ **중요**: 다음 환경 변수들은 절대 Git에 커밋하지 마세요:

- `*_PRIVATE_KEY` - 개인키
- `*_API_KEY` - API 키
- `*_TOKEN` - 토큰
- `DATABASE_URL` - 데이터베이스 연결 정보
- `*_PASSWORD` - 비밀번호

`.env` 파일은 `.gitignore`에 의해 제외되도록 설정되어 있습니다.

## 개발 환경 설정 확인

환경 변수가 제대로 설정되었는지 확인하려면:

```bash
# 백엔드에서
cd backend
npm run dev

# 프론트엔드에서
cd frontend
npm start
```

서버가 정상적으로 시작되고 데이터베이스 연결이 성공하면 설정이 완료된 것입니다.
