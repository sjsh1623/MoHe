# Mohe Batch Job 완전 가이드

## Spring Batch 기초 이론

### Spring Batch란?

Spring Batch는 대용량 데이터 처리를 위한 Spring Framework 기반의 프레임워크입니다. 배치 처리는 대량의 데이터를 일괄적으로 처리하는 방식으로, 실시간 처리와는 달리 정해진 시간에 많은 양의 작업을 수행합니다.

### 핵심 아키텍처 구성요소

#### 1. Job
- **정의**: 배치 처리의 전체 단위
- **특징**: 하나 이상의 Step으로 구성
- **예시**: "장소 데이터 수집 Job", "이미지 생성 Job"

#### 2. Step
- **정의**: Job 내의 독립적인 처리 단위
- **구성**: ItemReader → ItemProcessor → ItemWriter
- **특징**: 트랜잭션 단위로 처리

#### 3. ItemReader
- **역할**: 데이터를 읽어오는 컴포넌트
- **예시**: 데이터베이스, 파일, API에서 데이터 읽기

#### 4. ItemProcessor (선택사항)
- **역할**: 읽어온 데이터를 변환/가공
- **예시**: 데이터 검증, 형식 변환, 비즈니스 로직 적용

#### 5. ItemWriter
- **역할**: 처리된 데이터를 저장
- **예시**: 데이터베이스 저장, 파일 생성, API 호출

### Spring Batch 메타데이터 테이블

Spring Batch는 실행 상태를 추적하기 위해 다음 테이블들을 사용합니다:

- `BATCH_JOB_INSTANCE`: Job의 논리적 실행 단위
- `BATCH_JOB_EXECUTION`: Job의 물리적 실행 기록
- `BATCH_JOB_EXECUTION_PARAMS`: Job 실행시 전달된 파라미터
- `BATCH_STEP_EXECUTION`: Step의 실행 기록
- `BATCH_JOB_EXECUTION_CONTEXT`: Job 실행 중 공유되는 데이터
- `BATCH_STEP_EXECUTION_CONTEXT`: Step 실행 중 공유되는 데이터

---

## Mohe 시스템의 배치 Job 아키텍처

### 시스템 구성

Mohe 시스템은 다음과 같은 배치 처리 구조를 가지고 있습니다:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   외부 API      │────│   BatchService   │────│   Database      │
│   (Naver/Google)│    │                  │    │   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────────────┐
                       │ TestController│
                       │ (Job Trigger) │
                       └──────────────┘
```

### 배치 서비스 계층

#### BatchService 주요 메서드
- `triggerBatch()`: 전체 배치 프로세스 실행
- `collectRealPlaceData()`: 장소 데이터 수집
- `generateAiImagesForPlaces()`: AI 이미지 생성 (현재 비활성화)
- `createPlaceholderImages()`: 플레이스홀더 이미지 생성
- `batchUpdatePlaceImages()`: 배치 이미지 업데이트
- `getBatchStatus()`: 배치 상태 조회

---

## 사용 가능한 Job 목록 및 상세 설명

### 1. Place 데이터 수집 Job (`collect-places`)

#### 목적
- 외부 API(Naver, Google)를 통해 장소 데이터를 수집
- 데이터베이스에 새로운 장소 정보 저장

#### 처리 과정
1. **Naver API 호출**: 서울 지역 장소 검색
2. **Google Places API 호출**: 평점 및 상세 정보 보강
3. **데이터 검증**: 중복 제거, 유효성 검사
4. **데이터베이스 저장**: `places` 테이블에 저장

#### 실행 방법
```bash
# 테스트 컨트롤러를 통한 실행 (현재 보안 이슈로 접근 불가)
curl -X GET "http://localhost:8080/test/collect-places"

# 배치 API를 통한 실행 (API 키 필요)
curl -X POST "http://localhost:8080/api/batch/trigger"
```

#### 필수 환경 변수
```env
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
GOOGLE_PLACES_API_KEY=your_google_api_key
```

#### 예상 결과
```json
{
  "success": true,
  "collected": 150,
  "message": "Place collection completed"
}
```

### 2. 플레이스홀더 이미지 생성 Job (`create-placeholder-images`)

#### 목적
- 이미지가 없는 장소들에 대해 기본 이미지 플레이스홀더 생성
- 2단계 이미지 처리 시스템의 1단계 구현

#### 처리 과정
1. **이미지 없는 장소 조회**: `findPlacesWithoutImages()` 메서드 사용
2. **카테고리 매핑**: 장소 카테고리를 기본 이미지 URL로 매핑
3. **PlaceImage 레코드 생성**: `PENDING` 상태로 저장
4. **기본 이미지 URL 설정**: 카테고리별 기본 이미지 경로 할당

#### 카테고리 매핑 규칙
```kotlin
// 예시 매핑
"카페,디저트>와플" → "/cafe-dessert.jpg"
"음식점>한식" → "/restaurant-korean.jpg"
"술집>바(BAR)" → "/bar.jpg"
"갤러리카페" → "/gallery-cafe.jpg"
```

#### 실행 방법
```bash
curl -X GET "http://localhost:8080/test/create-placeholder-images"
```

#### 예상 결과
```json
{
  "success": true,
  "created": 25,
  "message": "Placeholder image creation completed"
}
```

### 3. 배치 이미지 업데이트 Job (`batch-update-images`)

#### 목적
- `PENDING` 상태의 플레이스홀더 이미지를 실제 AI 생성 이미지로 업데이트
- 2단계 이미지 처리 시스템의 2단계 구현

#### 처리 과정
1. **PENDING 이미지 조회**: `ImageSource.PENDING` 상태 이미지 찾기
2. **AI 이미지 생성**: OpenAI DALL-E 또는 Ollama 사용
3. **이미지 저장**: 생성된 이미지를 파일 시스템에 저장
4. **메타데이터 업데이트**: 이미지 경로 및 상태 업데이트

#### 실행 방법
```bash
curl -X GET "http://localhost:8080/test/batch-update-images"
```

#### 필수 환경 변수
```env
# OpenAI 사용 시
USE_OPENAI=true
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo

# Ollama 사용 시
USE_OPENAI=false
OLLAMA_HOST=http://192.168.1.XXX:11434
OLLAMA_MODEL=llama3
```

### 4. 단일 이미지 생성 Job (`generate-single-image`)

#### 목적
- 특정 장소에 대해서만 이미지 생성
- 테스트 및 개별 처리용

#### 실행 방법
```bash
# 특정 Place ID로 실행
curl -X GET "http://localhost:8080/test/generate-single-image?placeId=123"

# 기본값 (placeId=57) 사용
curl -X GET "http://localhost:8080/test/generate-single-image"
```

### 5. 배치 상태 조회 Job (`status`)

#### 목적
- 현재 배치 시스템의 상태 확인
- 실행 중인 Job 및 통계 정보 제공

#### 실행 방법
```bash
curl -X GET "http://localhost:8080/test/status"
```

#### 예상 응답
```json
{
  "success": true,
  "totalPlaces": 150,
  "placesWithImages": 75,
  "pendingImages": 25,
  "lastBatchRun": "2025-09-17T14:06:15Z",
  "systemStatus": "ACTIVE"
}
```

### 6. 카테고리 매핑 테스트 Job (`test-category-mapping`)

#### 목적
- 장소 카테고리와 기본 이미지 매핑 규칙 테스트
- 새로운 카테고리의 매핑 결과 확인

#### 실행 방법
```bash
# 모든 테스트 카테고리 매핑 확인
curl -X GET "http://localhost:8080/test/test-category-mapping"

# 특정 카테고리 테스트
curl -X GET "http://localhost:8080/test/test-category-mapping?category=카페,디저트>와플"
```

---

## Job 실행 환경 및 구성

### Docker 환경 설정

#### 1. 기본 서비스 시작
```bash
cd /Users/andrewlim/Desktop/Developer/Mohe/MoheSpring
docker-compose up --build
```

#### 2. 개별 서비스 시작
```bash
# PostgreSQL만 시작
docker-compose up postgres

# 애플리케이션만 시작 (PostgreSQL이 이미 실행 중일 때)
docker-compose up app
```

#### 3. 서비스 상태 확인
```bash
# 컨테이너 상태 확인
docker ps

# 애플리케이션 로그 확인
docker logs mohe-spring-app

# 데이터베이스 연결 테스트
docker exec mohe-postgres psql -U mohe_user -d mohe_db -c "\dt"
```

### 환경 변수 설정

#### .env 파일 생성 (프로젝트 루트)
```env
# 필수 API 키들
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
GOOGLE_PLACES_API_KEY=your_google_api_key

# AI 설정
USE_OPENAI=false
OLLAMA_HOST=http://192.168.1.100:11434
OLLAMA_MODEL=llama3

# 데이터베이스 (docker-compose에서 자동 설정)
POSTGRES_DB=mohe_db
POSTGRES_USER=mohe_user
POSTGRES_PASSWORD=mohe_password
```

---

## 일반적인 배치 실행 워크플로우

### 1. 전체 시스템 초기화 및 데이터 수집

```bash
# 1단계: 기존 데이터 클리어 (필요시)
docker exec mohe-postgres psql -U mohe_user -d mohe_db -c "DELETE FROM place_images; DELETE FROM places;"

# 2단계: 서비스 재시작
docker-compose restart

# 3단계: 장소 데이터 수집
curl -X POST "http://localhost:8080/api/batch/trigger"

# 4단계: 플레이스홀더 이미지 생성
curl -X GET "http://localhost:8080/test/create-placeholder-images"

# 5단계: 데이터 검증
docker exec mohe-postgres psql -U mohe_user -d mohe_db -c "SELECT COUNT(*) FROM places; SELECT COUNT(*) FROM place_images;"
```

### 2. 이미지 업데이트 워크플로우

```bash
# 1단계: PENDING 이미지 상태 확인
curl -X GET "http://localhost:8080/test/status"

# 2단계: 배치 이미지 업데이트 실행
curl -X GET "http://localhost:8080/test/batch-update-images"

# 3단계: 결과 확인
docker exec mohe-postgres psql -U mohe_user -d mohe_db -c "SELECT source, COUNT(*) FROM place_images GROUP BY source;"
```

---

## 트러블슈팅 가이드

### 일반적인 문제들

#### 1. 403 Forbidden 오류
**증상**: `/test/**` 엔드포인트 접근시 403 에러
**원인**: Spring Security 설정 문제
**해결방법**:
- 애플리케이션 재시작: `docker restart mohe-spring-app`
- Security 설정 확인: `SecurityConfig.java`에서 `/test/**` 경로가 `permitAll()`에 포함되어 있는지 확인

#### 2. Internal Server Error (500)
**증상**: API 호출시 내부 서버 오류
**원인**: API 키 누락 또는 외부 서비스 연결 실패
**해결방법**:
```bash
# 환경 변수 확인
docker exec mohe-spring-app env | grep -E "NAVER|GOOGLE|OLLAMA"

# 로그 확인
docker logs mohe-spring-app --tail=50
```

#### 3. 데이터베이스 연결 오류
**증상**: Connection refused 또는 timeout 오류
**해결방법**:
```bash
# PostgreSQL 상태 확인
docker ps | grep postgres

# 헬스체크 확인
docker exec mohe-postgres pg_isready -U mohe_user -d mohe_db

# 네트워크 확인
docker network ls
```

#### 4. 배치 Job 실행이 멈춤
**증상**: Job이 시작되지만 완료되지 않음
**원인**: 외부 API 호출 타임아웃 또는 레이트 리밋
**해결방법**:
- 타임아웃 설정 확인
- API 키 할당량 확인
- 로그에서 구체적인 오류 메시지 확인

### 디버깅 명령어

```bash
# 배치 실행 상태 확인
docker exec mohe-postgres psql -U mohe_user -d mohe_db -c "
SELECT
    job_instance_id,
    job_name,
    start_time,
    end_time,
    status
FROM batch_job_execution
ORDER BY start_time DESC
LIMIT 5;
"

# Step 실행 상태 확인
docker exec mohe-postgres psql -U mohe_user -d mohe_db -c "
SELECT
    step_name,
    read_count,
    write_count,
    commit_count,
    rollback_count,
    exit_code
FROM batch_step_execution
ORDER BY start_time DESC
LIMIT 10;
"
```

---

## 성능 최적화 및 모니터링

### 배치 성능 튜닝

#### 1. Chunk Size 최적화
```java
// BatchService.java에서 chunk size 조정
private static final int CHUNK_SIZE = 100; // 기본값, 상황에 따라 조정
```

#### 2. Thread Pool 설정
```yaml
# application.yml
spring:
  task:
    execution:
      pool:
        core-size: 4
        max-size: 8
```

#### 3. 데이터베이스 최적화
```sql
-- 인덱스 확인
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('places', 'place_images');

-- 통계 정보 업데이트
ANALYZE places;
ANALYZE place_images;
```

### 모니터링 지표

#### 1. 처리량 모니터링
- 초당 처리된 레코드 수
- Job 완료 시간
- 오류율

#### 2. 리소스 사용률
```bash
# CPU 및 메모리 사용률
docker stats mohe-spring-app

# 데이터베이스 연결 상태
docker exec mohe-postgres psql -U mohe_user -d mohe_db -c "
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';
"
```

---

## 확장 계획 및 향후 개선 사항

### 1. 분산 처리 지원
- Spring Cloud Data Flow 도입
- 멀티 인스턴스 배치 처리

### 2. 실시간 모니터링
- Prometheus + Grafana 통합
- 배치 실행 대시보드

### 3. 자동화 개선
- Cron 기반 스케줄링
- 조건부 Job 실행

### 4. 데이터 품질 관리
- 데이터 검증 규칙 강화
- 자동 데이터 정제

---

## 보안 고려사항

### 1. API 키 관리
- 환경 변수를 통한 키 관리
- Docker secrets 사용 권장

### 2. 데이터 접근 제어
- 배치 전용 데이터베이스 사용자
- 최소 권한 원칙 적용

### 3. 로그 관리
- 민감한 정보 로그에서 제외
- 로그 로테이션 설정

---

## 마치며

이 가이드는 Mohe 시스템의 배치 처리 전반에 대한 완전한 설명서입니다. 각 Job의 목적과 실행 방법을 이해하고, 문제 발생시 트러블슈팅 섹션을 참조하여 해결하시기 바랍니다.

추가 질문이나 개선 제안이 있으시면 개발팀에 문의해주세요.

---

**최종 업데이트**: 2025-09-17
**작성자**: Claude Code Assistant
**버전**: 1.0.0