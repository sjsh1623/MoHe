# MOHE React

## 소개
MOHE React는 사용자의 성향, 위치, 날씨를 기반으로 맞춤형 장소를 추천하는 모바일 웹뷰 전용 프론트엔드입니다. React 19와 Vite 7을 사용하며, 컨텍스트 기반 추천 엔진·게스트 브라우징·다단계 온보딩 등 백엔드 API와 완전하게 연동된 상태입니다.

## 주요 기능
- 이메일 → OTP → 프로필 → 비밀번호로 이어지는 완전한 회원가입 플로우와 JWT 세션 관리
- 게스트 모드, 글로벌 검색 입력, 위치·날씨 기반 홈 피드, 북마크/최근 본 장소 관리
- MBTI·선호 공간·교통 수단을 반영하는 컨텍스트 추천 및 Ollama 기반 자연어 질의 해석
- WebView 최적화, 글로벌 플로팅 버튼/메시지 입력, 에러 바운더리로 안정성 확보

## 기술 스택
- React 19, React Router DOM 7, Framer Motion 12
- Vite + @vitejs/plugin-react, ESLint (React Hooks / Refresh 규칙)
- Context API + 커스텀 훅, CSS Modules, alias `@` → `src`

## 프로젝트 구조
```
src/
  components/      # UI 컴포넌트 및 전역 레이아웃
  pages/           # 라우팅되는 화면 (온보딩, 홈, 검색, 프로필 등)
  contexts/ hooks/ # 사용자 설정, 백버튼, 권한 등 전역 상태
  services/ utils/ # API 서비스, 포맷터, WebView 최적화 헬퍼
  styles/ assets/  # 전역 스타일과 정적 리소스
public/            # 정적 파일 (favicon, manifest 등)
dist/              # `npm run build` 결과물
```

## 설치 및 실행
1. Node.js 18 LTS 이상을 준비하고 `npm install`로 의존성을 설치합니다.
2. `npm run dev`로 3000번 포트를 열어 HMR 개발 서버를 실행합니다. 기기 테스트가 필요하면 `npm run dev -- --host`를 사용합니다.
3. `npm run build`는 최적화된 정적 번들을 `dist/`에 생성하며, 배포 전 필수입니다.
4. `npm run preview`로 빌드 아티팩트를 로컬에서 서빙해 프로덕션 동작을 검증합니다.
5. `npm run lint`로 ESLint 검사를 수행하고, React Hooks 규칙·`no-unused-vars` 예외를 모두 해결합니다.

## API 및 통합 현황
- 인증, 장소, 추천, 북마크, 프로필, 날씨 API가 모두 연결되어 있으며 오류 핸들링과 토큰 갱신이 포함됩니다.
- `src/services/apiService.js`를 통해 모든 HTTP 요청을 관리하고, `src/hooks/useAuthGuard.js`로 보호 라우트를 제어합니다.
- 상세한 엔드포인트와 페이로드는 `API_DOCUMENTATION.md`, 통합 과정은 `README_INTEGRATION.md`에서 확인할 수 있습니다.

## 테스트 및 검증
- 자동화 테스트는 도입 중으로, 현재는 `npm run lint`와 홈 → 장소 상세 → 메시지 입력 → 북마크 플로우의 수동 회귀를 요구합니다.
- 위치/날씨 의존 기능은 Mock 데이터가 준비되어 있으므로 네트워크가 불안정해도 개발·시연이 가능합니다.

## 추가 문서
- 운영 가이드: `AGENTS.md`
- 백엔드 연동 완료 보고: `BACKEND_INTEGRATION_COMPLETE.md`
- API 통합 가이드: `API_INTEGRATION_GUIDE.md`
