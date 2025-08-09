# MOHE React 애플리케이션 API 문서

## 📱 애플리케이션 개요

MOHE React는 사용자의 성향과 선호도를 기반으로 한 장소 추천 모바일 웹뷰 애플리케이션입니다. React 19와 최신 웹 기술을 활용하여 구축된 이 앱은 개인화된 장소 발견 경험을 제공합니다.

### 🔧 기술 스택
- **프론트엔드**: React 19.1.0, Vite 7.0.4
- **라우팅**: React Router DOM 7.7.1 
- **애니메이션**: Framer Motion 12.23.12
- **스타일링**: CSS Modules
- **상태관리**: React Context API
- **빌드 도구**: Vite

---

## 🚀 애플리케이션 구조 및 라우팅

### 📋 전체 페이지 목록 및 라우팅

#### 🔐 인증 관련 페이지
| 경로 | 컴포넌트 | 설명 | API 연동 필요 |
|------|----------|------|---------------|
| `/` | AuthPage | 랜딩 페이지 (로그인/회원가입 선택) | ❌ |
| `/login` | LoginPage | 이메일/비밀번호 로그인 | ✅ 로그인 API |
| `/forgot-password` | ForgotPasswordPage | 비밀번호 재설정 | ✅ 비밀번호 재설정 API |
| `/signup` | EmailSignupPage | 이메일 회원가입 | ✅ 회원가입 API |
| `/verify-email` | EmailVerificationPage | 5자리 OTP 인증 | ✅ OTP 검증 API |
| `/nickname-setup` | NicknameSetupPage | 닉네임 설정 (중복 확인) | ✅ 닉네임 중복확인 API |
| `/terms` | TermsAgreementPage | 약관 동의 | ✅ 약관 동의 API |
| `/password-setup` | PasswordSetupPage | 비밀번호 생성 | ✅ 비밀번호 설정 API |

#### 🎯 온보딩/선호도 설정 페이지
| 경로 | 컴포넌트 | 설명 | API 연동 필요 |
|------|----------|------|---------------|
| `/age-range` | AgeRangeSelectionPage | 연령대 선택 (19세 미만 ~ 50세 이상) | ✅ 사용자 프로필 API |
| `/mbti-selection` | MBTISelectionPage | MBTI 4차원 성격 테스트 | ✅ MBTI 설정 API |
| `/space-preference` | SpacePreferenceSelectionPage | 5가지 공간 유형 선호도 설정 | ✅ 선호도 설정 API |
| `/transportation-selection` | TransportationSelectionPage | 교통 수단 선호도 (대중교통/자차) | ✅ 교통 선호도 API |
| `/hello` | HelloPage | 온보딩 완료 환영 페이지 | ❌ |

#### 🏠 메인 애플리케이션 페이지
| 경로 | 컴포넌트 | 설명 | API 연동 필요 |
|------|----------|------|---------------|
| `/home` | HomePage | 개인화된 추천 장소 대시보드 | ✅ 장소 추천 API |
| `/places` | PlacesListPage | 전체 장소 그리드 뷰 | ✅ 장소 목록 API |
| `/place/:id` | PlaceDetailPage | 장소 상세보기 (드래그 시트 UI) | ✅ 장소 상세 API |
| `/search-results` | SearchResultsPage | 컨텍스트 기반 검색 결과 | ✅ 검색 API |
| `/profile-settings` | ProfileSettingsPage | 사용자 프로필 및 앱 설정 | ✅ 프로필 API |
| `/profile-edit` | ProfileEditPage | 사용자 프로필 편집 | ✅ 프로필 수정 API |
| `/bookmarks` | BookmarksPage | 북마크한 장소 목록 | ✅ 북마크 API |
| `/my-places` | MyPlacesPage | 사용자가 등록한 장소 | ✅ 사용자 장소 API |
| `/recent-view` | RecentViewPage | 최근 본 장소 목록 | ✅ 조회 기록 API |

---

## 🔌 API 엔드포인트 명세

### 🔐 인증 관련 API (Spring Security + JWT)

#### 🔑 JWT 인증 헤더
모든 보호된 API 요청에는 다음 헤더가 필요합니다:
```http
Authorization: Bearer {jwt_token}
```

#### 1. 사용자 로그인
```http
POST /api/auth/login
```

**요청 데이터:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답 데이터:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "nickname": "홍길동",
      "isOnboardingCompleted": true,
      "roles": ["ROLE_USER"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

**오류 응답:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "이메일 또는 비밀번호가 잘못되었습니다."
  }
}
```

#### 2. 사용자 회원가입
```http
POST /api/auth/signup
```

**요청 데이터:**
```json
{
  "email": "user@example.com"
}
```

**응답 데이터:**
```json
{
  "success": true,
  "message": "인증 코드가 이메일로 발송되었습니다.",
  "data": {
    "tempUserId": "temp_user_123"
  }
}
```

#### 3. 이메일 OTP 인증
```http
POST /api/auth/verify-email
```

**요청 데이터:**
```json
{
  "tempUserId": "temp_user_123",
  "otpCode": "12345"
}
```

**응답 데이터:**
```json
{
  "success": true,
  "message": "이메일 인증이 완료되었습니다.",
  "data": {
    "isVerified": true
  }
}
```

#### 4. 닉네임 중복 확인
```http
POST /api/auth/check-nickname
```

**요청 데이터:**
```json
{
  "nickname": "홍길동"
}
```

**응답 데이터:**
```json
{
  "success": true,
  "data": {
    "isAvailable": false,
    "message": "이미 사용중인 닉네임입니다."
  }
}
```

#### 5. 비밀번호 설정 (회원가입 완료)
```http
POST /api/auth/setup-password
```

**요청 데이터:**
```json
{
  "tempUserId": "temp_user_123",
  "nickname": "홍길동",
  "password": "password123",
  "termsAgreed": true
}
```

**응답 데이터:**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "nickname": "홍길동",
      "roles": ["ROLE_USER"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

#### 6. 토큰 갱신
```http
POST /api/auth/refresh
```

**요청 데이터:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**응답 데이터:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

#### 7. 로그아웃
```http
POST /api/auth/logout
```

**헤더:**
```http
Authorization: Bearer {jwt_token}
```

**요청 데이터:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**응답 데이터:**
```json
{
  "success": true,
  "message": "로그아웃이 완료되었습니다."
}
```

#### 8. 비밀번호 재설정 요청
```http
POST /api/auth/forgot-password
```

**요청 데이터:**
```json
{
  "email": "user@example.com"
}
```

**응답 데이터:**
```json
{
  "success": true,
  "message": "비밀번호 재설정 링크가 이메일로 발송되었습니다."
}
```

#### 9. 비밀번호 재설정 확인
```http
POST /api/auth/reset-password
```

**요청 데이터:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newPassword123"
}
```

**응답 데이터:**
```json
{
  "success": true,
  "message": "비밀번호가 성공적으로 변경되었습니다."
}
```

### 👤 사용자 프로필 및 선호도 API

#### 1. 사용자 선호도 설정
```http
PUT /api/user/preferences
```

**헤더:**
```http
Authorization: Bearer {jwt_token}
```

**요청 데이터:**
```json
{
  "mbti": {
    "extroversion": "E",
    "sensing": "N", 
    "thinking": "T",
    "judging": "J"
  },
  "ageRange": "20",
  "spacePreferences": ["workshop", "exhibition", "nature"],
  "transportationMethod": "public"
}
```

**응답 데이터:**
```json
{
  "success": true,
  "message": "선호도 설정이 완료되었습니다.",
  "data": {
    "preferences": {
      "mbti": "ENTJ",
      "ageRange": "20",
      "spacePreferences": ["workshop", "exhibition", "nature"],
      "transportationMethod": "public"
    }
  }
}
```

#### 2. 사용자 프로필 조회
```http
GET /api/user/profile
```

**헤더:**
```http
Authorization: Bearer {jwt_token}
```

**응답 데이터:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "nickname": "홍길동",
      "mbti": "ENTJ",
      "ageRange": "20",
      "spacePreferences": ["workshop", "exhibition", "nature"],
      "transportationMethod": "public",
      "profileImage": "https://example.com/profile.jpg",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### 3. 프로필 수정
```http
PUT /api/user/profile
```

**헤더:**
```http
Authorization: Bearer {jwt_token}
```

**요청 데이터:**
```json
{
  "nickname": "새닉네임",
  "profileImage": "base64_image_data"
}
```

**응답 데이터:**
```json
{
  "success": true,
  "message": "프로필이 성공적으로 수정되었습니다.",
  "data": {
    "user": {
      "id": "user123",
      "nickname": "새닉네임",
      "profileImage": "https://example.com/new-profile.jpg"
    }
  }
}
```

### 📍 장소 관련 API

#### 1. 개인화된 장소 추천 (홈페이지)
```http
GET /api/places/recommendations
```

**헤더:**
```http
Authorization: Bearer {jwt_token}
```

**응답 데이터:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "place123",
        "title": "카페 무브먼트랩",
        "rating": 4.7,
        "reviewCount": 2498,
        "location": "서울 성수동",
        "image": "https://example.com/place.jpg",
        "tags": ["#성수동", "#카페", "#인기 플레이스"],
        "description": "가벼운 이야기를 나누기 좋은 조용한 골목의 카페",
        "transportation": {
          "car": "5분",
          "bus": "10분"
        },
        "isBookmarked": false,
        "recommendationReason": "조용한 공간을 선호하는 ENTJ 성향에 맞춤"
      }
    ],
    "totalCount": 15
  }
}
```

#### 2. 장소 목록 조회
```http
GET /api/places?page=1&limit=20&category=cafe&sort=rating
```

**응답 데이터:**
```json
{
  "success": true,
  "data": {
    "places": [
      {
        "id": "place123",
        "title": "카페 무브먼트랩",
        "rating": 4.7,
        "location": "서울 성수동", 
        "image": "https://example.com/place.jpg",
        "isBookmarked": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100
    }
  }
}
```

#### 3. 장소 상세 정보 조회
```http
GET /api/places/:id
```

**응답 데이터:**
```json
{
  "success": true,
  "data": {
    "place": {
      "id": "place123",
      "title": "카페 무브먼트랩",
      "tags": ["#성수동", "#카페", "#인기 플레이스"],
      "location": "서울 성수동",
      "address": "서울특별시 성동구 성수동1가 123-45",
      "rating": 4.7,
      "reviewCount": 2498,
      "description": "가벼운 이야기를 나누기 좋은 조용한 골목의 카페...",
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "gallery": [
        "https://example.com/thumb1.jpg",
        "https://example.com/thumb2.jpg"
      ],
      "additionalImageCount": 16,
      "transportation": {
        "car": "5분",
        "bus": "10분"
      },
      "operatingHours": "09:00 ~ 22:00",
      "amenities": ["wifi", "parking", "outdoor"],
      "isBookmarked": false
    }
  }
}
```

#### 4. 장소 검색
```http
GET /api/places/search?q=카페&location=성수동&weather=hot&time=afternoon
```

**응답 데이터:**
```json
{
  "success": true,
  "data": {
    "searchResults": [
      {
        "id": "place123",
        "name": "카페 무브먼트랩",
        "hours": "09:00 ~ 19:00",
        "location": "서울 성수동",
        "rating": 4.7,
        "carTime": "5분",
        "busTime": "10분",
        "tags": ["#조용한", "#카페", "#시원한"],
        "image": "https://example.com/place.jpg",
        "isBookmarked": false,
        "weatherTag": {
          "text": "더운 날씨에 가기 좋은 카페",
          "color": "red",
          "icon": "thermometer"
        },
        "noiseTag": {
          "text": "시끄럽지 않은 카페",
          "color": "blue", 
          "icon": "speaker"
        }
      }
    ],
    "searchContext": {
      "weather": "더운 날씨",
      "time": "오후 2시",
      "recommendation": "지금은 멀지 않고 실내 장소들을 추천드릴께요."
    }
  }
}
```

### 🔖 북마크 관련 API

#### 1. 북마크 추가/제거
```http
POST /api/bookmarks/toggle
```

**헤더:**
```http
Authorization: Bearer {jwt_token}
```

**요청 데이터:**
```json
{
  "placeId": "place123"
}
```

**응답 데이터:**
```json
{
  "success": true,
  "data": {
    "isBookmarked": true,
    "message": "북마크가 추가되었습니다."
  }
}
```

#### 2. 북마크 목록 조회
```http
GET /api/bookmarks
```

**헤더:**
```http
Authorization: Bearer {jwt_token}
```

**응답 데이터:**
```json
{
  "success": true,
  "data": {
    "bookmarks": [
      {
        "id": "bookmark123",
        "place": {
          "id": "place123",
          "name": "카페 무브먼트랩",
          "location": "서울 성수동",
          "image": "https://example.com/place.jpg",
          "rating": 4.7
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 📈 사용자 활동 API

#### 1. 최근 조회한 장소
```http
GET /api/user/recent-places
```

**헤더:**
```http
Authorization: Bearer {jwt_token}
```

**응답 데이터:**
```json
{
  "success": true,
  "data": {
    "recentPlaces": [
      {
        "id": "place123",
        "title": "카페 무브먼트랩",
        "location": "서울 성수동",
        "image": "https://example.com/place.jpg",
        "rating": 4.7,
        "viewedAt": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

#### 2. 사용자가 등록한 장소
```http
GET /api/user/my-places
```

**헤더:**
```http
Authorization: Bearer {jwt_token}
```

**응답 데이터:**
```json
{
  "success": true,
  "data": {
    "myPlaces": [
      {
        "id": "place456",
        "title": "내가 추천하는 카페",
        "location": "서울 강남구",
        "image": "https://example.com/my-place.jpg",
        "status": "approved",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 📊 데이터 모델

### 🏢 Place (장소) 데이터 모델
```typescript
interface Place {
  id: string;
  title: string;
  rating: number;
  reviewCount: number;
  location: string;
  address?: string;
  image: string;
  images?: string[];
  gallery?: string[];
  additionalImageCount?: number;
  tags: string[];
  description: string;
  transportation: {
    car: string;
    bus: string;
  };
  operatingHours?: string;
  amenities?: string[];
  isBookmarked: boolean;
  category?: string;
  weatherTags?: WeatherTag[];
  noiseTags?: NoiseTag[];
}
```

### 👤 User (사용자) 데이터 모델
```typescript
interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
  preferences: UserPreferences;
  isOnboardingCompleted: boolean;
  roles: string[]; // Spring Security 권한
  createdAt: string;
  lastLoginAt?: string;
}

interface UserPreferences {
  mbti: {
    extroversion: 'E' | 'I';
    sensing: 'S' | 'N';
    thinking: 'T' | 'F';
    judging: 'J' | 'P';
  };
  ageRange: string;
  spacePreferences: string[];
  transportationMethod: 'public' | 'car';
}
```

### 🔖 Bookmark (북마크) 데이터 모델
```typescript
interface Bookmark {
  id: string;
  userId: string;
  placeId: string;
  place: Place;
  createdAt: string;
}
```

### 🔐 JWT 토큰 데이터 모델
```typescript
interface JWTResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // "Bearer"
  expiresIn: number; // seconds
}

interface JWTClaims {
  sub: string; // 사용자 ID
  iat: number; // 발급 시간
  exp: number; // 만료 시간
  roles: string[]; // 사용자 권한
  nickname: string;
}
```

### ⚠️ API 오류 응답 모델
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}

// 공통 오류 코드
enum ErrorCode {
  // 인증 관련
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED", 
  INVALID_TOKEN = "INVALID_TOKEN",
  ACCESS_DENIED = "ACCESS_DENIED",
  
  // 검증 관련
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DUPLICATE_EMAIL = "DUPLICATE_EMAIL",
  DUPLICATE_NICKNAME = "DUPLICATE_NICKNAME",
  
  // 리소스 관련
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  
  // 서버 관련
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
}
```

---

## 🔄 상태 관리

### UserPreferencesContext
사용자 선호도 및 온보딩 상태를 관리하는 전역 컨텍스트

**제공 기능:**
- MBTI 4차원 설정 관리
- 연령대, 공간 선호도, 교통 수단 선호도 저장
- localStorage를 통한 로컬 데이터 지속성

**API 연동 포인트:**
- 선호도 변경 시 서버 동기화 필요
- 로그인 시 서버에서 사용자 선호도 불러오기

### BackButtonContext  
전역 뒤로가기 버튼 관리

**제공 기능:**
- 라우트별 뒤로가기 버튼 표시/숨김 제어
- 커스텀 뒤로가기 동작 정의

---

## 🎨 UI 컴포넌트 라이브러리 (50+ 개)

### 📱 버튼 컴포넌트 (8종)
- **PrimaryButton**: 메인 액션 버튼 (로딩, 비활성화 상태 지원)
- **SocialButton**: 소셜 로그인 버튼 (구글, 카카오, 애플)
- **OutlineButton**: 아웃라인 스타일 버튼
- **FloatingButton**: 고정 플로팅 버튼
- **BackButton**: 네비게이션 뒤로가기 버튼
- **ProfileButton**: 프로필 아바타 버튼
- **MenuButton**: 햄버거 메뉴 버튼
- **StandardButton**: 기본 스타일 버튼

### 🃏 카드 컴포넌트 (6종)
- **PlaceCard**: 가로형 장소 카드 (평점, 아바타 표시)
- **GridPlaceCard**: 그리드 레이아웃 장소 카드
- **BookmarkPlaceCard**: 북마크된 장소 표시용 카드
- **ProfileCard**: 사용자 프로필 정보 카드
- **ProfileHeader**: 프로필 섹션 헤더
- **ProfileInfoCard**: 상세 프로필 정보 카드

### 📝 입력 컴포넌트 (3종)
- **FormInput**: 라벨과 검증 기능이 있는 텍스트 입력
- **OTPInput**: 5자리 인증번호 입력
- **Checkbox**: 약관 동의용 커스텀 체크박스

### 📐 레이아웃 컴포넌트 (9종)
- **Container**: 메인 콘텐츠 래퍼 (패딩 적용)
- **Stack**: 간격 조절이 가능한 플렉스 레이아웃
- **PageLayout**: 전체 페이지 레이아웃 템플릿
- **PagePreloader**: 로딩 상태 컴포넌트
- **GlobalBackButton**: 앱 전역 뒤로가기 버튼
- **GlobalFloatingButton**: 앱 전역 플로팅 액션 버튼
- **GlobalMessageInput**: 전역 메시지 입력 컴포넌트
- **LoadingOverlay**: 전체 화면 로딩 오버레이
- **PageTransition**: 페이지 전환 애니메이션

---

## ⚡ 성능 및 최적화

### 📱 모바일 웹뷰 최적화
- **터치 최적화**: Webkit tap highlight, touch-action 설정
- **하드웨어 가속**: Transform3d, backface-visibility 적용
- **스크롤 최적화**: Webkit overflow scrolling, 스크롤 복원
- **뷰포트 처리**: 동적 뷰포트 높이 (100dvh) 지원

### 🎭 애니메이션 시스템
- **라우트 기반 애니메이션**: 네비게이션 계층에 따른 방향별 슬라이드 전환
- **스크롤 위치 보존**: 라우트별 고급 스크롤 위치 복원
- **스프링 물리학**: Framer Motion을 활용한 Material Design 이징
- **하드웨어 가속**: GPU 가속을 활용한 웹뷰 최적화

---

## 🔧 개발 환경 및 빌드

### 🛠 개발 명령어
```bash
npm run dev      # Vite 개발 서버 시작 (HMR 지원)
npm run build    # 프로덕션 빌드
npm run preview  # 프로덕션 빌드 미리보기
npm run lint     # ESLint 코드 품질 검사
```

### 📁 프로젝트 구조
```
src/
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── ui/              # 아토믹 디자인 컴포넌트
│   ├── layout/          # 레이아웃 컴포넌트
│   └── auth/            # 인증 관련 컴포넌트
├── pages/               # 페이지 레벨 컴포넌트
├── contexts/            # React Context 프로바이더
├── hooks/               # 커스텀 React 훅
├── styles/              # CSS Modules (컴포넌트 구조와 동일)
├── assets/              # 이미지 및 정적 파일
└── utils/               # 웹뷰 최적화 및 유틸리티
```

---

## 🚀 배포 및 운영 고려사항

### 🌐 프론트엔드 배포
- **빌드 결과물**: `/dist` 폴더에 정적 파일 생성
- **CDN 배포**: 이미지 및 정적 자원 CDN 서빙 권장
- **PWA 지원**: 추후 PWA 기능 추가 가능

### 🔒 Spring Security + JWT 보안 구현 가이드

#### 🔐 JWT 토큰 관리
- **Access Token**: 짧은 만료 시간 (1시간), API 요청 시 사용
- **Refresh Token**: 긴 만료 시간 (30일), Access Token 갱신 시 사용
- **토큰 저장**: 
  - Access Token: 메모리 또는 sessionStorage 
  - Refresh Token: httpOnly 쿠키 또는 secure storage
- **토큰 자동 갱신**: Access Token 만료 시 Refresh Token으로 자동 갱신

#### 🛡 Spring Security 설정 필요사항
```java
// JWT 필터 체인 설정
@EnableWebSecurity
public class SecurityConfig {
    // JWT 인증 필터
    // CORS 설정
    // 인증이 필요한 엔드포인트 설정
    // 예외 처리 핸들러
}
```

#### 🔍 권한 기반 접근 제어
- **ROLE_USER**: 일반 사용자 권한
- **ROLE_ADMIN**: 관리자 권한 (향후 관리 기능용)
- **메소드 레벨 보안**: `@PreAuthorize`, `@PostAuthorize` 활용

#### ⚠️ 보안 고려사항
- **CORS 설정**: 프론트엔드 도메인 허용
- **HTTPS 강제**: 프로덕션 환경에서 HTTPS 사용
- **토큰 탈취 방지**: XSS, CSRF 공격 방지
- **Rate Limiting**: API 호출 빈도 제한
- **입력 검증**: 모든 API 입력값 검증
- **SQL Injection 방지**: Prepared Statement 사용

### 📊 모니터링 필요 지점
- **API 응답 시간**: 장소 데이터 로딩 성능 모니터링
- **사용자 플로우**: 온보딩 완료율 추적
- **오류 추적**: 클라이언트 에러 및 API 호출 실패 모니터링

---

## 📈 향후 개발 계획

### 🎯 단기 목표
1. **실제 백엔드 API 연동**
2. **실시간 위치 기반 서비스**
3. **푸시 알림 시스템**
4. **소셜 기능 (리뷰, 공유)**

### 🌟 중장기 목표
1. **AI 기반 개인화 추천 고도화**
2. **AR 기능을 통한 장소 정보 표시**
3. **커뮤니티 기능 (사용자 간 장소 추천)**
4. **다국어 지원 확장**

---

## 📞 문의 및 지원

개발 관련 문의사항이나 API 연동 관련 질문이 있으시면 개발팀에 문의해 주시기 바랍니다.

**마지막 업데이트**: 2024년 1월
**문서 버전**: 1.0.0