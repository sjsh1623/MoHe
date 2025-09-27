# 🧠 Mohe 플랫폼 유사도 시스템 가이드

## 📖 개요

Mohe 플랫폼의 유사도 시스템은 사용자의 MBTI 성향과 북마크 패턴을 분석하여 개인화된 장소 추천을 제공합니다. 이 시스템은 자카드(Jaccard) 유사도, 코사인(Cosine) 유사도, MBTI 가중치, 시간 감쇠 등 다양한 알고리즘을 활용합니다.

## 🏗️ 시스템 구조

```
사용자 북마크 데이터
        ↓
MBTI 가중치 적용된 공동 출현 분석
        ↓
자카드 & 코사인 유사도 계산
        ↓
시간 감쇠 및 인기도 패널티 적용
        ↓
Top-K 유사 장소 캐시 생성
        ↓
개인화된 추천 결과
```

## 🧮 핵심 알고리즘

### 1. MBTI 가중치 시스템

**동일 MBTI 사용자 상호작용에 더 높은 가중치 부여:**

```
weighted_co = same_mbti_count × 2.0 + diff_mbti_count × 1.0
```

- `same_mbti_count`: 같은 MBTI 사용자들의 공동 북마크 수
- `diff_mbti_count`: 다른 MBTI 사용자들의 공동 북마크 수
- **기본 가중치**: 같은 MBTI = 2.0, 다른 MBTI = 1.0

### 2. 자카드 유사도 (Jaccard Similarity)

북마크한 사용자들의 교집합과 합집합 비율:

```
jaccard = |users_A ∩ users_B| / |users_A ∪ users_B|
```

- **용도**: 장소 간 사용자 중복도 측정
- **범위**: 0.0 ~ 1.0 (높을수록 유사)

### 3. 코사인 유사도 (Cosine Similarity)

MBTI 가중치가 적용된 벡터 간 코사인 각도:

```
cosine = weighted_sum / √(users_A × users_B)
```

- **용도**: MBTI 성향이 고려된 유사도 측정
- **범위**: 0.0 ~ 1.0 (높을수록 유사)

### 4. 시간 감쇠 (Time Decay)

최신 북마크에 더 높은 가중치 부여:

```
decay_factor = exp(-days_since / tau_days)
score = base_score × decay_factor
```

- **tau_days**: 감쇠 상수 (기본값: 30일)
- **효과**: 최신 트렌드 반영

### 5. 인기도 패널티 (Popularity Penalty)

지나치게 인기 있는 장소의 편향 완화:

```
penalty = ln(1 + review_count / 1000) × penalty_weight
final_score = score × (1 - penalty)
```

- **penalty_weight**: 기본값 0.1
- **최대 패널티**: 30%

## ⚙️ 설정 파라미터

### 유사도 가중치
```yaml
mohe:
  weight:
    jaccard: 0.7          # 자카드 유사도 가중치
    cosine: 0.3           # 코사인 유사도 가중치
    mbtiBoost: 0.3        # MBTI 매칭 보너스
    popularityPenalty: 0.1 # 인기도 패널티 강도
    sameMbti: 2.0         # 같은 MBTI 가중치
    diffMbti: 1.0         # 다른 MBTI 가중치
```

### 시간 및 다양성 설정
```yaml
mohe:
  timeDecay:
    tauDays: 30           # 시간 감쇠 상수 (일)
  diversity:
    enabled: true         # 다양성 필터링 활성화
  recommendation:
    topK: 100            # Top-K 캐시 크기
```

## 📊 데이터베이스 스키마

### place_similarity 테이블
```sql
CREATE TABLE place_similarity (
    place_id1 BIGINT NOT NULL,
    place_id2 BIGINT NOT NULL,
    jaccard DECIMAL(5,4) DEFAULT 0.0000,
    cosine_bin DECIMAL(5,4) DEFAULT 0.0000,
    co_users INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (place_id1, place_id2),
    CHECK (place_id1 < place_id2)  -- 일관된 순서 보장
);
```

### place_similarity_topk 테이블
```sql
CREATE TABLE place_similarity_topk (
    place_id BIGINT NOT NULL,
    neighbor_place_id BIGINT NOT NULL,
    rank SMALLINT NOT NULL,
    jaccard DECIMAL(5,4),
    cosine_bin DECIMAL(5,4),
    co_users INT,
    updated_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (place_id, neighbor_place_id),
    UNIQUE (place_id, rank)
);
```

## 🔄 처리 프로세스

### 1. 실시간 업데이트
- **트리거**: 사용자가 북마크 추가/제거시
- **동작**: 해당 장소의 Top-K 유사도 캐시 갱신
- **처리 시간**: 비동기 (사용자 경험에 영향 없음)

### 2. 정기 배치 처리
- **주기**: 4시간마다 (`0 0 */4 * * ?`)
- **동작**: 전체 장소 간 유사도 재계산
- **소요 시간**: 2-6시간 (데이터 규모에 따라)

### 3. Top-K 캐시 갱신
- **주기**: 30분마다 (`0 */30 * * * ?`)
- **동작**: 활성 장소들의 추천 캐시 갱신
- **효과**: 추천 응답 속도 향상 (<100ms)

## 🎯 추천 알고리즘

### 단계별 프로세스

1. **데이터 충분성 검사**
   ```
   if (database_places < min_threshold):
       fetch_new_places_from_apis()
   ```

2. **사용자 북마크 분석**
   ```
   user_bookmarks = get_user_bookmarks(user_id)
   if (user_bookmarks.empty):
       return rating_based_recommendations()
   ```

3. **유사 장소 후보 생성**
   ```
   for each bookmarked_place:
       similar_places = get_top_k_similar(place_id)
       apply_mbti_boost(similar_places, user_mbti)
       apply_time_decay(similar_places)
   ```

4. **다양성 필터링**
   ```
   if (diversity_enabled):
       diversified = apply_category_location_diversity(candidates)
   ```

5. **최종 순위 결정**
   ```
   final_score = jaccard_weight × jaccard + cosine_weight × cosine
   final_score = apply_popularity_penalty(final_score)
   ```

## 📈 성능 및 모니터링

### 성능 지표
- **추천 응답 시간**: <100ms (캐시 적중시)
- **유사도 계산 처리량**: ~1,000 장소쌍/초
- **Top-K 갱신 시간**: ~50ms/장소

### 모니터링 API
```bash
# 유사도 시스템 상태 확인
GET /api/admin/similarity/status

# 유사도 통계 조회
GET /api/admin/similarity/statistics

# 수동 계산 트리거
POST /api/admin/similarity/calculate
```

## 🛠️ 관리자 도구

### 수동 유사도 계산
```bash
curl -X POST "http://localhost:8080/api/admin/similarity/calculate" \
  -H "Authorization: Bearer {admin_token}"
```

### 특정 장소 Top-K 갱신
```bash
curl -X POST "http://localhost:8080/api/admin/similarity/refresh-topk/{place_id}" \
  -H "Authorization: Bearer {admin_token}"
```

### 시스템 통계 확인
```bash
curl "http://localhost:8080/api/admin/similarity/statistics" \
  -H "Authorization: Bearer {admin_token}"
```

## 🔧 튜닝 가이드

### 성능 최적화
1. **배치 크기 조정**: `BATCH_CHUNK_SIZE=500`
2. **스레드 풀 설정**: `similarity.executor.corePoolSize=4`
3. **캐시 크기**: `MOHE_TOP_K=100`

### 추천 품질 향상
1. **가중치 조정**: 도메인 특성에 맞게 `jaccard/cosine` 비율 조정
2. **MBTI 부스트**: `mbtiBoost` 값으로 개인화 강도 조절
3. **다양성 활성화**: `diversity.enabled=true`로 단조로움 방지

### 실시간 반영성 향상
1. **Top-K 갱신 주기 단축**: `MOHE_SIMILARITY_TOPK_CRON`
2. **시간 감쇠 상수 조정**: `tauDays` 값으로 트렌드 민감도 조절

## 🚨 주의사항

### 데이터 품질
- **최소 데이터 요구량**: 사용자 50명, 북마크 200개 이상
- **콜드 스타트 대응**: 신규 사용자는 인기도 기반 추천으로 시작
- **데이터 편향 주의**: 특정 지역/카테고리 편중 모니터링 필요

### 시스템 자원
- **메모리 사용량**: 유사도 행렬 크기에 비례 (O(n²))
- **CPU 집약적**: 배치 처리 시 CPU 사용률 급증 가능
- **네트워크 대역폭**: 외부 API 호출량 고려

### 개인정보 보호
- **MBTI 데이터**: 사용자 동의 하에서만 활용
- **북마크 패턴**: 개별 식별 불가능하도록 집계화
- **데이터 보존**: 사용자 탈퇴시 관련 데이터 완전 삭제

## 📚 기술 참조

### 알고리즘 출처
- **협업 필터링**: Collaborative Filtering for Implicit Feedback Datasets
- **자카드 유사도**: Paul Jaccard, 1912
- **코사인 유사도**: Vector Space Model in Information Retrieval
- **시간 감쇠**: Temporal Dynamics in Collaborative Filtering

### 구현 기술
- **Spring Boot 3.x**: 비동기 처리 및 스케줄링
- **PostgreSQL**: JSONB 및 배열 인덱스 활용
- **Jackson**: JSON 직렬화/역직렬화
- **Kotlin Coroutines**: 동시성 처리

---

**© 2024 Mohe Platform. All rights reserved.**