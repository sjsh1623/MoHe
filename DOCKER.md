# 🐳 Docker Deployment Guide

React 앱을 Docker 컨테이너로 배포하는 가이드입니다.

## 📋 사전 요구사항

- Docker 설치 완료
- Docker Compose 설치 완료 (선택 사항)

## 🚀 빠른 시작

### 방법 1: Docker Compose 사용 (권장)

```bash
# 1. 이미지 빌드 및 컨테이너 시작
docker-compose up -d

# 2. 로그 확인
docker-compose logs -f

# 3. 컨테이너 중지
docker-compose down
```

### 방법 2: Docker 명령어 직접 사용

```bash
# 1. Docker 이미지 빌드
docker build -t mohe-frontend:latest .

# 2. 컨테이너 실행 (3002번 포트)
docker run -d \
  --name mohe-react-app \
  -p 3002:80 \
  --restart unless-stopped \
  mohe-frontend:latest

# 3. 로그 확인
docker logs -f mohe-react-app

# 4. 컨테이너 중지 및 삭제
docker stop mohe-react-app
docker rm mohe-react-app
```

## 🌐 접속 확인

컨테이너 실행 후 브라우저에서 접속:

```
http://localhost:3002
```

## 🔧 환경 변수 설정

백엔드 API URL을 환경에 맞게 설정:

### 개발 환경 (.env.development)
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 프로덕션 환경 (.env.production)
```env
VITE_API_BASE_URL=https://api.mohe.app
```

## 📦 Docker 이미지 관리

### 이미지 재빌드 (코드 변경 시)

```bash
# Docker Compose 사용
docker-compose build --no-cache
docker-compose up -d

# 또는 Docker 명령어 직접 사용
docker build --no-cache -t mohe-frontend:latest .
docker stop mohe-react-app
docker rm mohe-react-app
docker run -d --name mohe-react-app -p 3002:80 mohe-frontend:latest
```

### 이미지 크기 확인

```bash
docker images mohe-frontend
```

### 사용하지 않는 이미지 정리

```bash
docker image prune -a
```

## 🔍 문제 해결

### 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker ps

# 모든 컨테이너 확인
docker ps -a

# 컨테이너 상세 정보
docker inspect mohe-react-app
```

### 컨테이너 내부 접속

```bash
docker exec -it mohe-react-app sh
```

### 로그 확인

```bash
# 실시간 로그
docker logs -f mohe-react-app

# 최근 100줄
docker logs --tail 100 mohe-react-app
```

### 포트 충돌 해결

3002번 포트가 이미 사용 중인 경우:

```bash
# docker-compose.yml 수정
ports:
  - "3003:80"  # 다른 포트로 변경

# 또는 Docker 명령어 사용 시
docker run -d --name mohe-react-app -p 3003:80 mohe-frontend:latest
```

## 🏗️ 프로덕션 배포

### Docker Hub에 푸시

```bash
# 1. Docker Hub 로그인
docker login

# 2. 이미지 태그 지정
docker tag mohe-frontend:latest yourusername/mohe-frontend:latest
docker tag mohe-frontend:latest yourusername/mohe-frontend:v1.0.0

# 3. 이미지 푸시
docker push yourusername/mohe-frontend:latest
docker push yourusername/mohe-frontend:v1.0.0
```

### 서버에서 이미지 가져오기

```bash
# 1. 이미지 다운로드
docker pull yourusername/mohe-frontend:latest

# 2. 컨테이너 실행
docker run -d \
  --name mohe-react-app \
  -p 3002:80 \
  --restart unless-stopped \
  yourusername/mohe-frontend:latest
```

## 📊 성능 모니터링

### 리소스 사용량 확인

```bash
# 실시간 모니터링
docker stats mohe-react-app

# 한 번만 확인
docker stats --no-stream mohe-react-app
```

## 🔐 보안 고려사항

1. **환경 변수 관리**: 민감한 정보는 환경 변수로 관리
2. **최소 권한 원칙**: 컨테이너는 non-root 유저로 실행
3. **정기 업데이트**: 베이스 이미지 정기적으로 업데이트
4. **포트 노출 최소화**: 필요한 포트만 노출

## 📁 파일 구조

```
.
├── Dockerfile           # Docker 이미지 빌드 설정
├── docker-compose.yml   # Docker Compose 설정
├── .dockerignore        # Docker 빌드 시 제외할 파일
├── nginx.conf           # Nginx 웹서버 설정
└── DOCKER.md           # 이 문서
```

## 💡 추가 팁

### API 프록시 설정

백엔드 API와 같은 도메인에서 서비스하고 싶은 경우, `nginx.conf` 파일의 주석 처리된 API 프록시 설정을 활성화하세요:

```nginx
location /api {
    proxy_pass http://backend:8080;
    # ... 프록시 설정
}
```

### HTTPS 설정

프로덕션 환경에서는 Let's Encrypt + Nginx를 사용하여 HTTPS를 설정하세요.

### 헬스 체크

```bash
# 컨테이너 헬스 체크
curl http://localhost:3002/health
```

## 🆘 지원

문제가 발생하면:
1. 로그 확인: `docker logs -f mohe-react-app`
2. 컨테이너 상태 확인: `docker ps -a`
3. 네트워크 확인: `docker network inspect mohe-network`
