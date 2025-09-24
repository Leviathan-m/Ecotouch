# 🌱 임팩트 오토파일럿 (Impact Autopilot)

*"한 번의 터치로 지구를 지키다"*

텔레그램 미니앱 기반의 글로벌 사회적 임팩트 플랫폼입니다. 사용자가 주간 미션(탄소상쇄, 소액기부, 청원 서명)을 선택하고 승인하면 플랫폼이 자동으로 실행하며, 실시간으로 작업 로그·증빙·영향 메트릭을 시각화하고 완료 시 SBT "임팩트 배지"를 발급합니다.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/Leviathan-m/impact-autopilot/actions/workflows/ci.yml/badge.svg)](https://github.com/Leviathan-m/impact-autopilot/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)

## ✨ 주요 특징

- **🤖 자동화된 임팩트 생성**: 한 번의 탭으로 탄소상쇄, 기부, 청원 자동 실행
- **📊 실시간 모니터링**: 작업 진행상황, 로그, 메트릭 실시간 시각화
- **🏆 SBT 배지 시스템**: 완료된 미션마다 영구적인 NFT 배지 발급
- **🌍 글로벌 확장**: 다국어 지원, 다중 통화, 국제 NGO 연동
- **🔒 블록체인 보안**: ERC-4337 Account Abstraction + ERC-5192 Soul Bound Tokens
- **📱 텔레그램 네이티브**: WebApp SDK로 완벽한 모바일 경험 제공

## 🏗️ 기술 스택

### 프론트엔드
- **React 18** + **TypeScript** - 모던 웹 개발
- **Telegram Web App SDK** - 텔레그램 미니앱 통합
- **Wagmi + Web3Modal** - 블록체인 지갑 연결
- **Framer Motion** - 부드러운 애니메이션
- **Styled Components** - 컴포넌트 스타일링
- **React Query** - 서버 상태 관리
- **i18next** - 국제화 지원

### 백엔드
- **Node.js + Express** + **TypeScript** - 확장성 있는 API 서버
- **PostgreSQL + TypeORM** - 관계형 데이터베이스
- **Redis** - 캐싱 및 큐 시스템
- **Bull** - 작업 큐 관리
- **Winston** - 구조화된 로깅
- **Rate Limiting** - API 보호

### 블록체인
- **Polygon PoS** - 저가스비 L2 솔루션
- **ERC-4337 Account Abstraction** - 가스리스 트랜잭션
- **ERC-5192 Soul Bound Tokens** - 양도불가능한 배지
- **Ethers.js + Web3.js** - 블록체인 상호작용

### 서드파티 API 통합
- **Cloverly API** - 글로벌 탄소상쇄
- **1ClickImpact API** - 소액기부 플랫폼
- **NationBuilder API** - 청원 및 캠페인
- **국세청 API** - 기부금영수증 자동 발급

### 인프라
- **Docker + Docker Compose** - 컨테이너화
- **AWS/Vercel** - 클라우드 배포
- **GitHub Actions** - CI/CD 파이프라인
- **PM2** - 프로세스 관리

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Git

### 설치 및 실행

1. **레포지토리 클론**
   ```bash
   git clone https://github.com/Leviathan-m/impact-autopilot.git
   cd impact-autopilot
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   cp docs/ENVIRONMENT_SETUP.md .env
   # docs/ENVIRONMENT_SETUP.md 파일을 참고하여 .env 파일을 설정하세요
   ```

   📖 [환경 변수 설정 가이드](docs/ENVIRONMENT_SETUP.md)를 참조하세요.

4. **데이터베이스 설정**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

5. **개발 서버 실행**
   ```bash
   # 루트 디렉토리에서
   npm run dev
   ```

6. **브라우저에서 접속**
   - 프론트엔드: http://localhost:3000
   - 백엔드 API: http://localhost:3001

### Docker를 이용한 실행

```bash
# 전체 스택 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

## 📁 프로젝트 구조

```
impact-autopilot/
├── frontend/                    # 텔레그램 미니앱 프론트엔드
│   ├── public/
│   ├── src/
│   │   ├── components/         # UI 컴포넌트
│   │   │   ├── Dashboard.tsx   # 메인 대시보드
│   │   │   ├── MissionCard.tsx # 미션 카드
│   │   │   ├── ProgressBar.tsx # 진행률 바
│   │   │   ├── SBTBadge.tsx    # 배지 갤러리
│   │   │   └── WorkLog.tsx     # 작업 로그 뷰어
│   │   ├── hooks/              # 커스텀 훅
│   │   │   ├── useTelegram.ts  # 텔레그램 WebApp
│   │   │   ├── useWallet.ts    # 지갑 연결
│   │   │   └── useMissions.ts  # 미션 관리
│   │   ├── services/           # API 서비스
│   │   │   ├── api.ts          # 백엔드 API 클라이언트
│   │   │   ├── telegram.ts     # 텔레그램 SDK 래퍼
│   │   │   └── blockchain.ts   # 블록체인 상호작용
│   │   ├── types/              # TypeScript 타입 정의
│   │   └── i18n/               # 국제화 설정
├── backend/                     # 백엔드 API 서버
│   ├── src/
│   │   ├── controllers/        # API 컨트롤러
│   │   │   ├── missions.ts     # 미션 CRUD
│   │   │   ├── automation.ts   # 자동화 실행
│   │   │   ├── receipts.ts     # 영수증 발급
│   │   │   └── sbt.ts         # SBT 민팅
│   │   ├── services/          # 비즈니스 로직
│   │   │   ├── CarbonOffsetService.ts
│   │   │   ├── DonationService.ts
│   │   │   ├── PetitionService.ts
│   │   │   └── BlockchainService.ts
│   │   ├── models/            # 데이터베이스 모델
│   │   │   ├── User.ts
│   │   │   ├── Mission.ts
│   │   │   ├── Transaction.ts
│   │   │   └── Receipt.ts
│   │   ├── middleware/        # 미들웨어
│   │   ├── utils/            # 유틸리티 함수
│   │   └── config/           # 설정 파일
├── contracts/                  # 스마트 컨트랙트
│   ├── ImpactBadgeSBT.sol     # ERC-5192 SBT 컨트랙트
│   ├── AccountFactory.sol     # ERC-4337 계정 팩토리
│   └── test/                 # 컨트랙트 테스트
├── docs/                      # 문서
│   ├── API.md                # API 문서
│   ├── ROADMAP.md           # 로드맵
│   └── CORE_PRINCIPLES.md   # 핵심 원칙
└── docker/                   # Docker 설정
```

## 🔧 API 문서

### 주요 엔드포인트

#### 미션 관리
- `GET /api/missions` - 사용 가능한 미션 목록 조회
- `POST /api/missions/:id/start` - 미션 시작
- `GET /api/missions/:id/logs` - 미션 로그 조회

#### 자동화
- `POST /api/automation/execute` - 자동화 작업 실행
- `GET /api/automation/status` - 작업 상태 조회

#### 영수증
- `GET /api/receipts` - 영수증 목록 조회
- `GET /api/receipts/:id/download` - 영수증 PDF 다운로드

#### SBT 배지
- `GET /api/sbt/badges` - 사용자의 배지 목록
- `POST /api/sbt/mint` - 배지 민팅

### Webhook 엔드포인트
- `POST /webhooks/cloverly` - 탄소상쇄 완료 알림
- `POST /webhooks/1clickimpact` - 기부 완료 알림
- `POST /webhooks/nationbuilder` - 청원 완료 알림

## 🎯 핵심 기능

### 1. 자동화된 임팩트 생성
사용자가 미션을 선택하면 플랫폼이 자동으로:
- 외부 API 호출 (Cloverly, 1ClickImpact, NationBuilder)
- 트랜잭션 처리 및 블록체인 기록
- SBT 배지 자동 민팅
- 기부금영수증 자동 발급

### 2. 실시간 모니터링
- 작업 진행률 실시간 업데이트
- 상세한 로그 기록 및 표시
- 오류 발생 시 자동 재시도
- 사용자에게 진행상황 푸시 알림

### 3. SBT 배지 시스템
- 미션 완료마다 고유한 SBT 발급
- 레벨별 디자인 (브론즈/실버/골드/플래티넘)
- 영구적인 블록체인 기록
- 소셜 공유 및 전시 기능

### 4. 글로벌 확장성
- 다국어 UI (한국어/영어 우선, 이후 유럽어 추가)
- 다중 통화 지원 (KRW/USD/EUR 등)
- 지역별 NGO 및 API 연동
- 현지 법규 준수 (세액공제 등)

## 🧪 테스트

```bash
# 프론트엔드 테스트
cd frontend
npm test

# 백엔드 테스트
cd backend
npm test

# 컨트랙트 테스트
cd contracts
npx hardhat test
```

## 🚀 배포

### 개발 환경
```bash
npm run build
npm run start:prod
```

### 프로덕션 배포
```bash
# Docker를 이용한 배포
docker-compose -f docker-compose.prod.yml up -d

# AWS EB 또는 Vercel을 이용한 배포
npm run deploy
```

## 📊 로드맵 및 비전

### Phase 1: 한국 시장 안착 (완료 목표)
- ✅ 텔레그램 미니앱 기본 기능
- ✅ 3가지 미션 타입 자동화
- ✅ SBT 배지 시스템
- ✅ 국세청 기부금영수증 연동

### Phase 2: 영미권 확장 (4-6개월)
- 🌍 다국어 지원 (영어/프랑스어/독일어)
- 💰 미국 501(c)(3) 단체 연동
- 📄 영국 Gift Aid 자동 처리
- 🏦 Stripe/PayPal 결제 통합

### Phase 3: 유럽 진출 (7-9개월)
- 🇪🇺 GDPR 완전 준수
- 💼 기업 B2B 서비스 론칭
- 🏢 ESG 리포팅 자동화
- 🌟 메타버스 배지 착용 기능

### Phase 4: 아시아 태평양 (10-12개월)
- 🗾 일본/싱가포르/홍콩 진출
- 💳 현지 결제 시스템 (Alipay/LINE Pay)
- 🎮 메타버스 통합 고도화
- 🔗 크로스체인 지원 (Solana/Avalanche)

### Phase 5: 글로벌 플랫폼 (13-18개월)
- 🤖 AI 추천 미션 시스템
- 🏛️ DAO 거버넌스 도입
- 🎯 1억 건 이상 임팩트 누적 목표
- 💰 월 매출 $500,000+ 달성

## 🤝 기여하기

프로젝트에 관심을 가져주셔서 감사합니다! 기여를 원하신다면 다음 단계를 따라주세요:

### 개발 환경 설정

1. **레포지토리 클론**
   ```bash
   git clone https://github.com/Leviathan-m/impact-autopilot.git
   cd impact-autopilot
   ```

2. **개발 환경 준비**
   ```bash
   npm run install:all
   # 환경 변수 설정 (docs/ENVIRONMENT_SETUP.md 참고)
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

### 기여 절차

1. **Fork the repository**
2. **브랜치 생성**: `git checkout -b feature/your-feature-name`
3. **코드 변경 및 테스트**
4. **커밋**: `git commit -m 'feat: add amazing feature'`
5. **푸시**: `git push origin feature/your-feature-name`
6. **Pull Request 생성**

### 커밋 메시지 규칙

- `feat:` 새로운 기능 추가
- `fix:` 버그 수정
- `docs:` 문서 변경
- `style:` 코드 스타일 변경 (기능 변경 없음)
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가/수정
- `chore:` 빌드, 설정 등 기타 변경

### 코드 품질

- TypeScript 엄격 모드 준수
- ESLint 규칙 준수
- 테스트 커버리지 유지
- PR 전에 모든 테스트 통과 확인

### 질문이 있으신가요?

- 💬 [GitHub Discussions](https://github.com/Leviathan-m/impact-autopilot/discussions)
- 📧 [이메일 문의](mailto:contact@impactautopilot.com)

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- **프로젝트 리드**: [Your Name]
- **이메일**: contact@impactautopilot.com
- **텔레그램**: [@impactautopilot]
- **웹사이트**: [https://impactautopilot.com](https://impactautopilot.com)

## 🙏 감사의 말

이 프로젝트는 다음과 같은 오픈소스 프로젝트와 서비스의 도움을 받았습니다:

- [Telegram Web App](https://core.telegram.org/bots/webapps) - 텔레그램 미니앱 플랫폼
- [Cloverly](https://cloverly.com) - 탄소상쇄 API
- [1ClickImpact](https://1clickimpact.com) - 기부 플랫폼
- [NationBuilder](https://nationbuilder.com) - 청원 플랫폼
- [Polygon](https://polygon.technology) - L2 블록체인

---

**함께 지구를 지키는 여정을 시작하세요! 🌍✨**
