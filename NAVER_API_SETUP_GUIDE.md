# Naver Reverse Geocoding API 설정 가이드

## 문제 상황

현재 `/api/address/reverse` 엔드포인트에서 **서울 영등포구** 좌표를 입력해도 **중구**가 반환되는 문제가 발생하고 있습니다.

**원인**: Naver Cloud Platform Reverse Geocoding API 인증 실패
```json
{
  "error": {
    "errorCode": "200",
    "message": "Authentication Failed",
    "details": "Invalid authentication information."
  }
}
```

## 해결 방법: Naver Cloud Platform API 키 재설정

### 1단계: Naver Cloud Platform 콘솔 접속

1. [Naver Cloud Platform 콘솔](https://console.ncloud.com) 로그인
2. **Services** → **AI·NAVER API** 메뉴 선택

### 2단계: Application 등록 확인

1. **AI·NAVER API** → **Application** 메뉴로 이동
2. 기존 애플리케이션이 있는지 확인:
   - **있는 경우**: 해당 애플리케이션 선택
   - **없는 경우**: **+ 애플리케이션 등록** 버튼 클릭하여 신규 생성

### 3단계: Reverse Geocoding API 서비스 활성화 ⚠️ **중요**

이 단계를 빠뜨리면 `429 Quota Exceed` 또는 `Authentication Failed` 오류가 발생합니다!

1. 애플리케이션 상세 페이지에서 **서비스 선택** 탭으로 이동
2. **Maps** 카테고리에서 다음 서비스 **체크** 확인:
   - ✅ **Reverse Geocoding** ← **반드시 체크되어 있어야 함**
   - ✅ Geocoding (선택사항, 주소 → 좌표 변환)
   - ✅ 기타 필요한 Maps 서비스

3. **저장** 버튼 클릭

### 4단계: API 인증 정보 확인

1. 애플리케이션 상세 페이지에서 **인증 정보** 탭으로 이동
2. 다음 값들을 복사:
   ```
   Client ID: xxxxxxxxxxxxx
   Client Secret: xxxxxxxxxxxxx
   ```

### 5단계: 환경 변수 업데이트

프로젝트 루트의 `.env` 파일을 수정:

```bash
# Naver Cloud Platform - Maps API
NAVER_CLIENT_ID=새로_발급받은_Client_ID
NAVER_CLIENT_SECRET=새로_발급받은_Client_Secret
```

### 6단계: 서버 재시작

```bash
# MoheSpring 서버 재시작
cd MoheSpring
./gradlew bootRun
```

### 7단계: API 테스트

#### 방법 1: curl로 직접 테스트
```bash
curl -X GET "https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=126.90405127666924,37.52604989143766&sourcecrs=epsg:4326&output=json&orders=roadaddr" \
  -H "X-NCP-APIGW-API-KEY-ID: YOUR_CLIENT_ID" \
  -H "X-NCP-APIGW-API-KEY: YOUR_CLIENT_SECRET"
```

**성공 응답 예시**:
```json
{
  "status": {
    "code": 0,
    "name": "ok",
    "message": "done"
  },
  "results": [
    {
      "name": "roadaddr",
      "region": {
        "area1": {
          "name": "서울특별시"
        },
        "area2": {
          "name": "영등포구"
        },
        "area3": {
          "name": "여의도동"
        }
      }
    }
  ]
}
```

#### 방법 2: 애플리케이션 API 테스트
```bash
# 로컬 서버 실행 중일 때
curl "http://localhost:8080/api/address/reverse?lat=37.52604989143766&lon=126.90405127666924"
```

**성공 응답 예시**:
```json
{
  "success": true,
  "data": {
    "fullAddress": "서울특별시 영등포구 여의도동",
    "shortAddress": "영등포구 여의도동",
    "sido": "서울특별시",
    "sigungu": "영등포구",
    "dong": "여의도동",
    "latitude": 37.52604989143766,
    "longitude": 126.90405127666924
  }
}
```

## 자주 발생하는 오류 및 해결 방법

### 오류 1: `Authentication Failed`
```json
{
  "error": {
    "errorCode": "200",
    "message": "Authentication Failed"
  }
}
```
**원인**: 잘못된 API 키 또는 만료된 키
**해결**: 4단계에서 API 키를 다시 확인하고 복사

---

### 오류 2: `429 Quota Exceed`
```json
{
  "error": {
    "errorCode": "429",
    "message": "Quota Exceed"
  }
}
```
**원인**: Reverse Geocoding 서비스가 활성화되지 않음
**해결**: 3단계로 돌아가서 **Reverse Geocoding 체크박스 활성화**

---

### 오류 3: `Invalid Coordinates`
**원인**: 좌표 형식 오류
**해결**: Naver API는 `lon,lat` 순서를 사용합니다 (위도/경도 순서 아님!)
```
올바른 형식: coords=126.904,37.526  (경도,위도)
잘못된 형식: coords=37.526,126.904  (위도,경도)
```

---

### 오류 4: Fallback으로 "중구" 반환
**원인**: API 호출이 실패하여 fallback 로직이 작동
**해결**:
1. 로그 확인: `MoheSpring/logs/spring.log`에서 "Failed to get address from Naver" 검색
2. 실제 오류 메시지 확인
3. 위의 오류 1-3 중 해당하는 케이스 해결

## API 요금 정보

- **무료 할당량**: 월 300만 건
- **추가 요금**: 1,000건당 0.5원 (무료 할당량 초과 시)
- **개인 프로젝트**: 대부분 무료 범위 내에서 사용 가능

## 추가 리소스

- [Naver Cloud Platform Reverse Geocoding 공식 문서](https://api.ncloud-docs.com/docs/ai-naver-mapsreversegeocoding-gc)
- [API 가이드](https://guide.ncloud-docs.com/docs/maps-geocoding-api)
- [Naver Cloud Console](https://console.ncloud.com)

## 참고: 현재 코드에서 사용 중인 설정

**파일**: `MoheSpring/src/main/java/com/mohe/spring/service/AddressService.java`

```java
// Naver API 호출 (87번 줄)
String coords = longitude + "," + latitude; // Naver uses lon,lat format
Map<String, Object> response = webClient.get()
    .uri("https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=" + coords + "&sourcecrs=epsg:4326&output=json&orders=roadaddr")
    .header("X-NCP-APIGW-API-KEY-ID", naverClientId)
    .header("X-NCP-APIGW-API-KEY", naverClientSecret)
    .retrieve()
    .bodyToMono(Map.class)
    .block(Duration.ofSeconds(3));
```

**환경 변수 주입** (36-38번 줄):
```java
@Value("${api.naver.client-id:}") String naverClientId
@Value("${api.naver.client-secret:}") String naverClientSecret
```

## 완료 확인

✅ Naver Cloud Platform에서 Reverse Geocoding 서비스 활성화 확인
✅ `.env` 파일에 새 API 키 설정 완료
✅ 서버 재시작 완료
✅ curl 테스트 성공 (JSON 응답에 `status.code: 0` 확인)
✅ 애플리케이션 API 테스트 성공 (영등포구 정확히 반환)

문제가 해결되지 않으면 `MoheSpring/logs/spring.log` 파일의 오류 로그를 확인해주세요.
