# Mohe Proxy Server with Docker

## 개요
이 설정은 Caddy를 리버스 프록시로 사용하여 Mohe 애플리케이션을 Docker로 실행합니다.

## 구조
```
Mohe/
├── Caddyfile              # Caddy 프록시 설정
├── docker-compose.yml     # Docker Compose 통합 설정
├── Dockerfile             # React 앱 빌드용 Dockerfile
└── MoheReact/            # React 소스 코드
```

## 주요 서비스

### 1. Caddy Proxy (mohe-caddy-proxy)
- 포트: 80 (HTTP), 443 (HTTPS)
- 역할: 리버스 프록시 및 SSL/TLS 터미네이션
- 자동 HTTPS 인증서 발급 (Let's Encrypt)

### 2. React Frontend (mohe-react-app)
- 내부 포트: 80
- Caddy를 통해 외부 노출
- Production 빌드로 실행

## 실행 방법

### 전체 스택 시작
```bash
docker-compose up -d
```

### 특정 서비스만 시작
```bash
# Caddy만 재시작
docker-compose up -d caddy

# React 앱만 재시작
docker-compose up -d mohe-frontend
```

### 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# Caddy 로그
docker-compose logs -f caddy

# React 앱 로그
docker-compose logs -f mohe-frontend
```

### 중지
```bash
docker-compose down
```

### 완전 삭제 (볼륨 포함)
```bash
docker-compose down -v
```

## Caddyfile 주요 설정

### 라우팅 규칙
- `/api/*` → Spring Boot 백엔드 (spring:8080)
- `/image/*` → 이미지 처리 서버 (moheimageprocessor-app-1:5200)
- `/health` → 헬스 체크 엔드포인트
- 나머지 → React 앱 (mohe-react-app:80)

### 보안 설정
- IP 직접 접근 차단 (도메인 필수)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options, X-Content-Type-Options
- CORS 헤더 설정 (이미지 경로)

### 성능 최적화
- Gzip 압축 활성화
- 이미지 캐싱 (1년)
- CORS 프리플라이트 최적화

## 볼륨 관리

### Caddy 데이터
- `caddy_data`: SSL/TLS 인증서 저장
- `caddy_config`: Caddy 설정 캐시

## 트러블슈팅

### Caddy가 시작되지 않는 경우
```bash
# Caddyfile 문법 검사
docker run --rm -v $(pwd)/Caddyfile:/etc/caddy/Caddyfile caddy:2-alpine caddy fmt --overwrite /etc/caddy/Caddyfile

# 로그 확인
docker-compose logs caddy
```

### React 앱이 빌드되지 않는 경우
```bash
# 빌드 로그 확인
docker-compose build --no-cache mohe-frontend

# 컨테이너 내부 확인
docker-compose exec mohe-frontend sh
```

### 포트 충돌
```bash
# 포트 사용 확인
lsof -i :80
lsof -i :443

# 다른 포트로 변경 (docker-compose.yml 수정)
ports:
  - "8080:80"
  - "8443:443"
```

## 개발 vs 프로덕션

현재 설정은 **프로덕션** 환경용입니다.

개발 환경이 필요한 경우:
- `docker-compose.dev.yml` 파일 사용
- React dev server 사용 (HMR 지원)
- Caddyfile에서 포트 3000으로 프록시

## 네트워크

모든 서비스는 `mohe-network` 브릿지 네트워크에 연결됩니다.
- 서비스 간 통신: 컨테이너 이름으로 접근
- 예: `caddy` → `mohe-react-app`, `spring`, `moheimageprocessor-app-1`
