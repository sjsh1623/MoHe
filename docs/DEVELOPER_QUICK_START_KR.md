# Mohe 장소 정보 향상 시스템 - 개발자 빠른 시작 가이드

## 🚀 빠른 시작

### 1. 전체 시스템 실행 (Docker 방식)

```bash
# 프로젝트 루트 디렉토리로 이동
cd /path/to/Mohe

# 환경 변수 파일 생성
cp .env.example .env
# .env 파일에서 API 키들을 실제 값으로 수정

# 전체 스택 실행 (Frontend + Backend + Batch + DB)
docker-compose up --build

# 또는 모니터링 스택 포함 실행
docker-compose --profile monitoring up --build
```

### 2. 개별 서비스 개발 실행

#### MoheSpring (백엔드) 개발
```bash
cd MoheSpring

# PostgreSQL만 Docker로 실행
docker-compose up postgres

# 스프링 애플리케이션 로컬 실행
./gradlew bootRun

# 테스트 실행
./gradlew test
```

#### MoheBatch (배치) 개발  
```bash
cd MoheBatch

# 배치 서비스 실행
./gradlew bootRun

# 특정 배치 잡 실행
./gradlew bootRun --args=\"--job=naverGooglePlaceIngestionJob\"
```

#### MoheReact (프론트엔드) 개발
```bash
cd MoheReact

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev  # http://localhost:5173
```

## 🔧 필수 API 키 설정

### .env 파일 템플릿
```env
# 네이버 검색 API (필수)
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# 구글 Places API (필수)  
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# Ollama AI 서버 (선택사항)
OLLAMA_HOST=http://localhost:11434

# 데이터베이스 설정
DATABASE_URL=jdbc:postgresql://localhost:5432/mohe_db
DATABASE_USERNAME=mohe_user
DATABASE_PASSWORD=mohe_password

# 추천 알고리즘 조정 (선택사항)
MOHE_WEIGHT_JACCARD=0.7
MOHE_WEIGHT_COSINE=0.3
MOHE_WEIGHT_SAME_MBTI=2.0
MOHE_TIME_DECAY_TAU_DAYS=30
MOHE_MIN_PLACES_THRESHOLD=50
```

### API 키 발급 방법

#### 네이버 검색 API
1. [네이버 개발자 센터](https://developers.naver.com/) 접속
2. '애플리케이션 등록' → '검색' API 선택
3. Client ID와 Client Secret 발급

#### 구글 Places API  
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 'Places API' 활성화
4. '사용자 인증 정보' → API 키 생성

## 🛠️ 주요 기능 테스트

### 1. 단계별 장소 정보 수집 테스트

```bash
# 개별 장소 처리 (실시간)
curl -X POST \"http://localhost:8080/api/place-enhancement/process-step-by-step\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"placeName\": \"스타벅스 강남역점\",
    \"address\": \"서울 강남구\"
  }'
```

**예상 응답:**
```json
{
  \"success\": true,
  \"data\": {
    \"placeId\": \"step_123456\",
    \"placeName\": \"스타벅스 강남역점\",
    \"overallStatus\": \"SUCCESS\",
    \"progressPercentage\": 100,
    \"steps\": {
      \"NAVER_SEARCH\": {\"status\": \"SUCCESS\", \"processingTimeMs\": 850},
      \"GOOGLE_SEARCH\": {\"status\": \"SUCCESS\", \"processingTimeMs\": 1200},
      \"GOOGLE_DETAILS\": {\"status\": \"SUCCESS\", \"processingTimeMs\": 950}
    }
  }
}
```

### 2. 배치 처리 트리거 테스트

```bash
# 네이버+구글 배치 ingestion 트리거
curl -X POST \"http://localhost:8082/api/data/batch/trigger\" \\
  -H \"Content-Type: application/json\"
```

### 3. 데이터베이스 리셋 테스트 (개발환경에서만)

```sql
-- PostgreSQL 직접 접속
psql -h localhost -U mohe_user -d mohe_db

-- 장소 데이터만 리셋 (사용자 데이터 보존)
SELECT reset_places_only(true);

-- 전체 장소 관련 데이터 리셋
SELECT reset_all_place_data(true);
```

## 📊 시스템 상태 확인

### 주요 엔드포인트

| 서비스 | URL | 용도 |
|--------|-----|------|
| 백엔드 헬스체크 | http://localhost:8080/health | 서비스 상태 확인 |
| Swagger UI | http://localhost:8080/swagger-ui.html | API 문서 및 테스트 |
| 프론트엔드 | http://localhost:3000 | 사용자 인터페이스 |
| 배치 웹 | http://localhost:8082 | 배치 작업 관리 |
| 배치 프로세서 | http://localhost:8084 | 배치 처리 상태 |

### 로그 확인

```bash
# Docker 환경에서 실시간 로그 확인
docker-compose logs -f mohe-backend
docker-compose logs -f mohebatch-processor

# 특정 시간대 로그 확인
docker-compose logs --since=\"2024-01-20T10:00:00\" mohe-backend
```

## 🧪 개발 워크플로우

### 1. 새로운 설명 스타일 추가

#### Step 1: 스타일 로직 구현
```kotlin
// PlaceDescriptionMergeService.kt에 새로운 메서드 추가
private fun createCustomizedStyle(naverPlace: NaverPlaceItem, googlePlace: GooglePlaceDetail?): String {
    // 새로운 스타일 로직 구현
    return \"커스터마이징된 설명\"
}
```

#### Step 2: 스타일 결정 로직 업데이트
```kotlin
private fun determineDescriptionStyle(naverPlace: NaverPlaceItem, googlePlace: GooglePlaceDetail?): String {
    return when {
        // 기존 조건들...
        isCustomCondition(naverPlace) -> \"CUSTOMIZED_STYLE\"
        else -> \"BALANCED\"
    }
}
```

#### Step 3: 테스트 및 검증
```bash
# 테스트 실행
./gradlew test --tests \"*PlaceDescriptionMergeServiceTest\"

# 특정 장소로 실제 테스트
curl -X POST \"http://localhost:8080/api/place-enhancement/preview-description\" \\
  -H \"Content-Type: application/json\" \\
  -d '{\"naverPlaceData\": {...}, \"googlePlaceData\": {...}}'
```

### 2. 새로운 API 제공자 추가

#### Step 1: ApiProvider 구현
```kotlin
@Component  
class KakaoMapProvider : ApiProvider {
    override fun getProviderName(): String = \"kakao\"
    
    override suspend fun fetchPlaceData(placeName: String, address: String?): Any {
        // Kakao Map API 호출 로직
    }
    
    // 기타 필수 메서드 구현...
}
```

#### Step 2: 등록 및 테스트
```kotlin
@Configuration
class ApiConfig(private val registry: ApiProviderRegistry) {
    
    @PostConstruct
    fun registerProviders() {
        registry.registerProvider(\"kakao\", KakaoMapProvider())
    }
}
```

### 3. 데이터베이스 스키마 변경

#### Step 1: 새로운 마이그레이션 파일 생성
```bash
# 새 마이그레이션 파일 생성
touch src/main/resources/db/migration/V7__add_custom_fields.sql
```

#### Step 2: 마이그레이션 스크립트 작성
```sql
-- V7__add_custom_fields.sql
ALTER TABLE places 
ADD COLUMN IF NOT EXISTS custom_field TEXT,
ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_places_custom_field ON places(custom_field);
```

#### Step 3: 마이그레이션 실행 및 확인
```bash
# 마이그레이션 실행
./gradlew flywayMigrate

# 마이그레이션 상태 확인
./gradlew flywayInfo
```

## 🐛 일반적인 문제 해결

### 1. \"API 키가 유효하지 않습니다\"

**해결방법:**
```bash
# 환경 변수 확인
echo $NAVER_CLIENT_ID
echo $GOOGLE_PLACES_API_KEY

# 직접 API 테스트
curl -H \"X-Naver-Client-Id: $NAVER_CLIENT_ID\" \\
     -H \"X-Naver-Client-Secret: $NAVER_CLIENT_SECRET\" \\
     \"https://openapi.naver.com/v1/search/local.json?query=테스트\"
```

### 2. \"데이터베이스 연결 실패\"

**해결방법:**
```bash  
# PostgreSQL 컨테이너 상태 확인
docker-compose ps postgres

# PostgreSQL 로그 확인
docker-compose logs postgres

# 직접 연결 테스트
psql -h localhost -p 5432 -U mohe_user -d mohe_db
```

### 3. \"OutOfMemoryError 발생\"

**해결방법:**
```bash
# JVM 힙 메모리 증가
export JAVA_OPTS=\"-Xmx2g -Xms1g\"
./gradlew bootRun

# 또는 Docker 메모리 제한 증가
docker-compose up --memory=2g
```

### 4. \"배치 처리가 너무 느림\"

**해결방법:**
```yaml
# application.yml 튜닝
app:
  batch:
    chunk-size: 100        # 기본값 50 → 100
    thread-pool-size: 8    # 병렬 처리 스레드 증가
  external:
    naver:
      page-size: 10        # 기본값 5 → 10
      timeout: 5           # 타임아웃 단축
    google:
      timeout: 10          # 타임아웃 단축
```

## 📈 성능 모니터링

### 주요 메트릭스 확인

```bash
# Prometheus 메트릭스 엔드포인트 확인
curl http://localhost:8080/actuator/prometheus | grep -E '(api_call|description_generation|batch_)'

# 주요 메트릭스:
# - api_call_duration_seconds: API 응답 시간
# - description_generation_success_total: 설명 생성 성공 수
# - batch_processing_duration_seconds: 배치 처리 시간
```

### 데이터베이스 성능 분석

```sql
-- 느린 쿼리 분석
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 테이블 크기 분석
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY bytes DESC;
```

## 🚦 배포 가이드

### 1. 개발환경 → 스테이징

```bash
# 1. 코드 테스트
./gradlew test

# 2. Docker 이미지 빌드
docker-compose build

# 3. 스테이징 환경 배포
docker-compose -f docker-compose.staging.yml up -d

# 4. 헬스체크
curl http://staging.mohe.com/health
```

### 2. 스테이징 → 프로덕션

```bash
# 1. 프로덕션 환경 설정 확인
# system_settings 테이블에서 environment='production' 설정 필수

# 2. 데이터베이스 백업
pg_dump -h prod-db -U mohe_user mohe_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. 마이그레이션 실행 (신중하게!)
./gradlew flywayMigrate -Dspring.profiles.active=production

# 4. 애플리케이션 배포
docker-compose -f docker-compose.prod.yml up -d

# 5. 모니터링 확인
curl http://mohe.com/health
curl http://mohe.com/actuator/prometheus
```

---

## 📞 개발 지원

- **Slack 채널**: #mohe-development
- **이슈 트래킹**: [GitHub Issues](https://github.com/your-org/mohe/issues)  
- **API 문서**: http://localhost:8080/swagger-ui.html
- **개발 위키**: [내부 위키 링크]

---

*이 가이드는 Mohe 장소 정보 향상 시스템의 실제 개발 경험을 바탕으로 작성되었습니다.*
*질문이나 개선 사항이 있으면 언제든지 연락해주세요!*