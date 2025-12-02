# 모바일 이미지 로딩 문제 해결 - URL 인코딩

## 문제 상황
- 웹 브라우저에서는 이미지가 정상적으로 표시됨
- 모바일 디바이스(WebView)에서는 이미지 로딩 실패
- 이미지 파일명에 한글이 포함됨 (예: `10000_파스토보이_월계점_1.jpg`)

## 근본 원인

### 1. URL 인코딩 문제
모바일 브라우저는 URL에 있는 한글 문자를 자동으로 인코딩하지 않거나, 인코딩 방식이 웹 브라우저와 다릅니다.

**예시:**
```
웹 브라우저: https://mohe.today/image/10000_파스토보이_월계점_1.jpg
            → 자동으로 인코딩 처리

모바일:     https://mohe.today/image/10000_파스토보이_월계점_1.jpg
            → 인코딩되지 않아 서버에서 파일을 찾지 못함
```

### 2. Mixed Content 이슈 (이미 해결됨)
- HTTPS 사이트에서 HTTP 이미지 로딩 차단
- 환경 변수로 HTTPS 도메인 사용하여 해결

## 해결 방법

### 1. 프론트엔드 (React) - URL 인코딩
**파일**: `src/utils/image.js:24`

```javascript
// Encode URI component to handle Korean characters and special characters
// Split by '/' to encode each path segment separately
const encodedPath = withoutImagesPrefix.split('/').map(encodeURIComponent).join('/');

return `${IMAGE_BASE_URL}${encodedPath}`;
```

**효과:**
- `10000_파스토보이_월계점_1.jpg` → `10000_%ED%8C%8C%EC%8A%A4%ED%86%A0%EB%B3%B4%EC%9D%B4_%EC%9B%94%EA%B3%84%EC%A0%90_1.jpg`
- 모든 브라우저에서 일관된 URL 형식

### 2. 백엔드 (Image Processor) - URL 디코딩
**파일**: `MoheImageProcessor/src/controllers/imageController.js`

#### sendImageHandler (Line 35)
```javascript
// Decode URI component to handle Korean characters in filename
const { fileName } = req.params;
const decodedFileName = decodeURIComponent(fileName);
const { targetPath, safeFileName } = await getImagePath(decodedFileName);
```

#### sendResizedImageHandler (Line 56)
```javascript
// Decode URI component to handle Korean characters in filename
const { fileName, width, height } = req.params;
const decodedFileName = decodeURIComponent(fileName);
const { buffer, mimeType } = await getResizedImage(decodedFileName, width, height);
```

**효과:**
- 인코딩된 URL을 받아서 파일 시스템의 실제 한글 파일명으로 변환
- 파일을 정확하게 찾아서 전송

## 처리 흐름

```
프론트엔드 (React)
  ↓ 한글 파일명
  "10000_파스토보이_월계점_1.jpg"
  ↓ encodeURIComponent
  "10000_%ED%8C%8C%EC%8A%A4%ED%86%A0%EB%B3%B4%EC%9D%B4_%EC%9B%94%EA%B3%84%EC%A0%90_1.jpg"
  ↓ HTTP 요청
백엔드 (Image Processor)
  ↓ decodeURIComponent
  "10000_파스토보이_월계점_1.jpg"
  ↓ 파일 시스템에서 검색
  ✅ 이미지 파일 찾음
  ↓ 응답
모바일/웹 브라우저
  ✅ 이미지 표시 성공
```

## 커밋 내역

### React (MoheReact)
```
778a100 - fix: 한글 파일명 이미지 로딩을 위한 URL 인코딩 처리 추가
cdd0fda - fix: 모바일 디바이스 이미지 로딩 문제 해결을 위한 환경 변수 설정
```

### Image Processor (MoheImageProcessor)
```
ba51112 - fix: 한글 파일명 처리를 위한 URL 디코딩 추가
```

### Spring (MoheSpring)
```
4dee309 - chore: Docker Compose PostgreSQL 설정 활성화
```

## 테스트 방법

### 1. 개발 환경
```bash
cd /Users/andrewlim/Desktop/Mohe/MoheReact
npm run dev
```

### 2. 프로덕션 빌드
```bash
npm run build
```

### 3. 모바일 테스트
- 실제 모바일 디바이스에서 `https://mohe.today` 접속
- 한글 파일명을 가진 이미지가 정상적으로 로딩되는지 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인

### 4. 확인 사항
- [ ] 이미지 URL이 올바르게 인코딩되었는지 확인
- [ ] 404 에러가 발생하지 않는지 확인
- [ ] 이미지가 모바일과 웹 모두에서 동일하게 표시되는지 확인

## 추가 고려사항

### 이미지 크기 최적화
현재 구현된 이미지 리사이징 기능을 활용하여 모바일 성능 개선 가능:

```javascript
// 원본 이미지
https://mohe.today/image/10000_파스토보이_월계점_1.jpg

// 리사이즈된 이미지 (240x240)
https://mohe.today/image/10000_파스토보이_월계점_1.jpg/240/240
```

### MIME Type 처리
이미지 컨트롤러에서 올바른 Content-Type 헤더를 설정하여 모바일 호환성 보장:
```javascript
const mime = require('mime-types');
const mimeType = mime.lookup(safeFileName) || 'application/octet-stream';
res.setHeader('Content-Type', mimeType);
```

### 캐시 최적화
긴 캐시 기간 설정으로 모바일 데이터 사용량 감소:
```javascript
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
```

## 참고 자료
- MDN encodeURIComponent: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
- RFC 3986 (URI): https://www.ietf.org/rfc/rfc3986.txt
