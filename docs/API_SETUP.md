# Impact Autopilot API 설정 가이드

이 문서는 Impact Autopilot 프로젝트의 제3자 API 연동 및 Web3 구성 요소들을 설정하는 방법을 설명합니다.

## 📋 필요한 인증 및 설정

### 1. Cloverly API (탄소 상쇄)
**설명**: 탄소 배출량 계산 및 상쇄 크레딧 구매를 위한 API

**등록 방법**:
1. [Cloverly 웹사이트](https://cloverly.com/) 방문
2. 회원가입 및 API 키 신청
3. 이메일로 API 키 수령

**환경 변수 설정**:
```bash
CLOVERLY_API_KEY=your_actual_api_key_here
```

**API 문서**: https://docs.cloverly.com/

### 2. 1ClickImpact API (기부)
**설명**: 글로벌 기부 및 자선 단체 연동을 위한 API

**등록 방법**:
1. [1ClickImpact 웹사이트](https://www.1clickimpact.com/) 방문
2. 파트너십 문의 또는 API 접근 신청
3. 계약 체결 후 API 키 제공

**환경 변수 설정**:
```bash
ONE_CLICK_IMPACT_API_KEY=your_actual_api_key_here
```

**API 문서**: https://docs.1clickimpact.com/

### 3. NationBuilder API (청원)
**설명**: 사회 운동 및 청원 관리 플랫폼

**등록 방법**:
1. [NationBuilder 웹사이트](https://nationbuilder.com/) 방문
2. 조직 계정 생성
3. API 접근 권한 신청
4. 승인 후 API 키 발급

**환경 변수 설정**:
```bash
NATION_BUILDER_API_KEY=your_actual_api_key_here
```

**API 문서**: https://nationbuilder.com/api_documentation

## 🔗 Web3 구성 요소 설정

### ERC-4337 Account Abstraction

**필요한 설정**:
1. **Entry Point 컨트랙트**: Polygon 네트워크의 표준 Entry Point 주소
2. **Account Factory**: 스마트 계정 생성을 위한 팩토리 컨트랙트
3. **Bundler**: UserOperation을 처리하는 서비스 (Pimlico, Alchemy 등)

**환경 변수 설정**:
```bash
POLYGON_RPC_URL=https://polygon-rpc.com
ENTRY_POINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
ACCOUNT_FACTORY_ADDRESS=your_deployed_account_factory_address
BUNDLER_URL=https://api.pimlico.io/v2/137/rpc?apikey=your_pimlico_key
```

### ERC-5192 Soul Bound Token (SBT)

**배포 필요 컨트랙트**:
1. ImpactBadgeSBT.sol 컨트랙트 배포
2. 소유자 및 민팅 권한 설정

**환경 변수 설정**:
```bash
SBT_CONTRACT_ADDRESS=your_deployed_sbt_contract_address
SBT_SIGNER_PRIVATE_KEY=your_wallet_private_key_for_minting
```

### 가스 스폰서십 서비스

**지원 서비스**:
- **Pimlico**: 가장 간단하고 신뢰할 수 있는 옵션
- **Alchemy**: Paymaster 서비스 제공
- **Cloudflare Workers**: 커스텀 Paymaster 구현
- **Infura**: Sponsored Transactions

**Pimlico 설정** (권장):
```bash
GAS_SPONSORSHIP_SERVICE=pimlico
PIMLICO_API_KEY=your_pimlico_api_key
```

**Alchemy 설정**:
```bash
GAS_SPONSORSHIP_SERVICE=alchemy
ALCHEMY_API_KEY=your_alchemy_api_key
ALCHEMY_POLICY_ID=your_paymaster_policy_id
```

## 🚀 설정 및 테스트

### 1. 환경 변수 파일 생성

프로젝트 루트에 `.env` 파일 생성:

```bash
cp .env.example .env
# .env 파일을 열어서 실제 API 키들로 교체
```

### 2. 컨테이너 재빌드

```bash
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

### 3. API 테스트

```bash
# 건강 체크
curl http://localhost:3001/health

# Cloverly 테스트
curl -X POST http://localhost:3001/api/carbon/calculate \
  -H "Content-Type: application/json" \
  -d '{"weight": 1000, "weight_unit": "kg", "currency": "KRW"}'

# 기부 단체 목록
curl http://localhost:3001/api/donation/charities

# 청원 카테고리
curl http://localhost:3001/api/petition/categories
```

## 🔐 보안 고려사항

### API 키 관리
- 실제 운영 환경에서는 AWS Secrets Manager, HashiCorp Vault 등 사용
- 개발 환경에서도 `.env` 파일을 `.gitignore`에 추가하여 Git에 커밋되지 않도록 주의

### Web3 보안
- 프라이빗 키는 절대 코드에 하드코딩하지 말 것
- Account Abstraction을 통해 사용자 경험 개선과 보안 강화
- SBT 민팅은 신뢰할 수 있는 오라클 또는 검증된 프로세스에서만 수행

### 데이터 보호
- 사용자 개인정보는 최소한으로 수집
- API 호출 시 HTTPS만 사용
- 민감한 데이터는 암호화하여 저장

## 🆘 문제 해결

### API 키 관련 오류
```
Error: CLOVERLY_API_KEY not configured
```
→ `.env` 파일에 올바른 API 키를 설정했는지 확인

### Web3 연결 오류
```
Error: could not detect network
```
→ `POLYGON_RPC_URL`이 올바른 Polygon RPC 엔드포인트인지 확인

### 컨트랙트 배포 오류
```
Error: SBT_CONTRACT_ADDRESS not configured
```
→ 먼저 스마트 컨트랙트를 배포하고 주소를 환경 변수에 설정

## 📞 지원

문제가 발생하거나 추가 도움이 필요한 경우:
1. 이 문서를 다시 확인
2. 각 API 제공사의 문서 참조
3. [프로젝트 이슈](https://github.com/your-repo/issues)에 문제 보고

---

**⚠️ 중요**: 이 설정들은 개발 및 테스트용입니다. 운영 환경 배포 시 추가적인 보안 및 모니터링 설정이 필요합니다.
