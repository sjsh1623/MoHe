# 모바일 이미지 로딩 이슈 해결

## 문제 상황
- 웹에서는 이미지가 정상 출력
- 모바일 디바이스에서는 이미지 로딩 실패

## 원인
1. **HTTP Mixed Content 이슈**: 이미지 서버가 `http://100.99.236.50:5200`으로 하드코딩되어 있어 HTTPS 사이트에서 차단됨
2. **로컬 IP 접근 제한**: 모바일 디바이스가 로컬 네트워크 IP에 접근 불가

## 해결 방법

### 1. 프론트엔드 수정
- **파일**: `src/utils/image.js`
- **변경**: 이미지 URL을 환경 변수로 변경
  ```javascript
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || 'http://100.99.236.50:5200/image/';
  ```

### 2. 환경 변수 설정
- **개발 환경** (`.env`): `http://100.99.236.50:5200/image/` (로컬 서버)
- **프로덕션** (`.env.production`): `https://mohe.today/image/` (Caddy 프록시)

### 3. Caddy 리버스 프록시 활용
기존 Caddyfile에 이미 설정되어 있음 (`/Users/andrewlim/Desktop/Proxy-Server/Caddyfile:22-45`):
```caddy
handle /image/* {
    reverse_proxy moheimageprocessor-app-1:5200
}
```

이제 이미지는 다음 경로로 접근됩니다:
- **개발**: `http://100.99.236.50:5200/image/example.jpg`
- **프로덕션**: `https://mohe.today/image/example.jpg` ✅ HTTPS, 모바일 호환

## 배포 방법

### 프로덕션 빌드
```bash
npm run build
```

### 테스트
브라우저 개발자 도구 콘솔에서 확인:
```javascript
console.log(import.meta.env.VITE_IMAGE_BASE_URL);
```

## 확인 사항
✅ Caddy 설정 검증 완료
✅ Caddy 재시작 완료
✅ Let's Encrypt 자동 SSL 인증서 설정됨
✅ CORS 헤더 설정됨 (모바일 호환)

## 모바일 테스트 체크리스트
- [ ] 프로덕션 빌드 실행
- [ ] 모바일 디바이스에서 `https://mohe.today` 접속
- [ ] 이미지가 정상적으로 로딩되는지 확인
- [ ] 브라우저 콘솔에서 Mixed Content 에러가 없는지 확인

## 참고
- Caddy는 자동으로 HTTP→HTTPS 리다이렉트 처리
- Let's Encrypt 인증서 자동 갱신
- 이미지 서버 내부 IP는 Docker 네트워크에서만 접근 가능
- 외부에서는 `https://mohe.today/image/*` 경로로만 접근
