# MoHe - 장소 추천 서비스 프론트엔드

React 기반 장소 추천 모바일 웹 애플리케이션입니다.

## 기술 스택

- **Frontend**: React 19.1.0 with Vite 7.0.4
- **Routing**: React Router DOM 7.7.1
- **Animations**: Framer Motion 12.23.12 + React Transition Group 4.4.5
- **Styling**: CSS Modules
- **State Management**: React Context API

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

**로컬 환경:**
```bash
npm run dev
```

개발 서버는 http://localhost:3000 에서 실행됩니다.

**Docker 개발 환경 (HMR 지원):**
```bash
docker-compose -f docker-compose.dev.yml up --build
```

Docker를 사용하면 볼륨 마운트를 통해 소스 코드 수정사항이 실시간으로 반영됩니다. 개발 서버는 http://localhost:3000 에서 접속할 수 있습니다.

중지:
```bash
docker-compose -f docker-compose.dev.yml down
```

### 프로덕션 빌드

**로컬 환경:**
```bash
npm run build
```

**Docker 프로덕션 환경:**
```bash
docker-compose up --build
```

프로덕션 환경은 Nginx로 빌드된 정적 파일을 서빙하며 http://localhost:3002 에서 접속할 수 있습니다.

### 프로덕션 미리보기

```bash
npm run preview
```

### 린트 검사

```bash
npm run lint
```

## 주요 기능

- 사용자 인증 및 이메일 인증
- MBTI 기반 성격 평가
- 사용자 선호도 수집 (연령, 공간 유형, 교통수단)
- 장소 추천 시스템
- 북마크 기능
- 프로필 관리

## 프로젝트 구조

```
src/
├── components/         # 재사용 가능한 UI 컴포넌트
│   ├── ui/            # 기본 UI 컴포넌트 (버튼, 카드, 입력 등)
│   ├── layout/        # 레이아웃 컴포넌트
│   └── auth/          # 인증 관련 컴포넌트
├── pages/             # 페이지 컴포넌트
├── contexts/          # React Context 상태 관리
├── styles/            # CSS 모듈
└── assets/            # 이미지 및 정적 파일
```

## 개발 가이드

자세한 개발 가이드는 [CLAUDE.md](./CLAUDE.md)를 참조하세요.
