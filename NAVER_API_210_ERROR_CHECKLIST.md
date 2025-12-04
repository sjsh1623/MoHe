# Naver API Error 210 해결 체크리스트

## 현재 상황
- **Error Code**: 210
- **Error Message**: "Permission Denied - A subscription to the API is required"
- **Client ID**: `1ijlr5ptha`
- **테스트 결과**: Reverse Geocoding과 Geocoding 모두 동일한 에러 발생

## 해결을 위한 상세 체크리스트

### 1️⃣ Application 서비스 선택 확인 (가장 중요!)

**경로**: Console > AI·NAVER API > Application > 해당 앱 선택 > **"서비스 선택"** 탭

다음 항목들이 **체크되어 있는지** 확인:

```
Maps 카테고리:
☐ Web Dynamic Map
☐ Mobile Dynamic Map
☐ Static Map
☐ Directions 5
☐ Directions 15
☑️ Geocoding           ← 주소 → 좌표
☑️ Reverse Geocoding   ← 좌표 → 주소 (필수!)
```

**⚠️ 주의사항:**
- 단순히 체크만으로는 안 되고, **반드시 "저장" 버튼을 클릭**해야 합니다
- 저장 후 1-2분 대기 (즉시 적용 안 될 수 있음)

---

### 2️⃣ Application 상태 확인

**확인사항:**
- [ ] Application이 **"사용 중"** 상태인지 확인
- [ ] Application이 **비활성화** 또는 **삭제** 상태가 아닌지 확인
- [ ] 생성일/수정일 확인 (방금 생성한 경우 반영 대기 필요)

---

### 3️⃣ API Key 재확인

**경로**: Console > AI·NAVER API > Application > 해당 앱 선택 > **"인증 정보"** 탭

현재 사용 중인 키:
```
Client ID: 1ijlr5ptha
Client Secret: ZhkCvv5GMALICrjwb5OSITnd6XjmPD1uerNN02UN
```

**확인사항:**
- [ ] 위 Client ID가 콘솔에 표시된 값과 **정확히 일치**하는지 확인
- [ ] Client Secret 전체를 다시 복사해서 확인 (일부만 복사한 경우 문제 발생)

---

### 4️⃣ 결제 정보 확인

**경로**: Console > 결제 관리 > 서비스 현황

**확인사항:**
- [ ] Maps 서비스가 **활성화** 상태인지 확인
- [ ] **무료 할당량** 또는 **유료 요금제** 등록 여부 확인
- [ ] 결제 수단 등록 필요 여부 확인 (일부 서비스는 결제 수단 등록 필수)

**참고**: Reverse Geocoding은 월 300만 건까지 무료이지만, **결제 수단 등록이 필요할 수 있습니다**

---

### 5️⃣ VPC 환경 확인

Naver Cloud Platform의 일부 API는 **VPC(Virtual Private Cloud) 환경에서만** 작동합니다.

**확인사항:**
- [ ] Reverse Geocoding API가 Classic 환경을 지원하는지 확인
- [ ] VPC 전용인 경우, VPC 서버에서 테스트 필요

**공식 문서 확인**: [Reverse Geocoding API 가이드](https://guide.ncloud-docs.com/release-20250320/docs/en/application-maps-reversegeocoding-api-vpc)

---

### 6️⃣ 대체 방법: 새 Application 생성

현재 Application에 문제가 있을 수 있으므로, **새로운 Application을 생성**해보세요:

**단계:**
1. Console > AI·NAVER API > Application
2. **"+ 애플리케이션 등록"** 클릭
3. 애플리케이션 이름 입력 (예: "Mohe-Maps-API-v2")
4. **서비스 선택**에서 다음 체크:
   - ✅ Geocoding
   - ✅ Reverse Geocoding
5. **저장** 버튼 클릭
6. 새로 생성된 Client ID와 Secret 복사
7. `.env` 파일 업데이트

---

### 7️⃣ Naver Cloud 공식 지원 문의

위 모든 방법이 실패하면, **공식 지원팀에 문의**해야 합니다:

**문의 방법:**
- **URL**: https://www.ncloud.com/support/question/service
- **카테고리**: AI·NAVER API > Maps
- **제목**: "Error 210: Reverse Geocoding API 권한 오류"
- **내용 포함사항**:
  - Client ID: `1ijlr5ptha`
  - Error Code: 210
  - Error Message: "Permission Denied - A subscription to the API is required"
  - 서비스 선택 탭에서 Reverse Geocoding 체크 완료
  - 테스트 API 엔드포인트: `/map-reversegeocode/v2/gc`

---

## 긴급 임시 해결책

API 키 문제가 해결될 때까지, 코드에서 **Fallback 로직을 개선**할 수 있습니다:

### Option A: Google Geocoding API 사용
이미 `.env`에 Google API 키가 있습니다:
```bash
GOOGLE_PLACES_API_KEY=AIzaSyAqVRQCthhp0YX-m1XVFSx_3EKunkeaLsw
```

Google Geocoding API를 Fallback으로 사용 가능합니다.

### Option B: KakaoMap API 사용
Kakao 좌표 → 주소 변환 API는 무료이며 설정이 간단합니다.

---

## 테스트 명령어

새 API 키를 받으면 다음 명령어로 즉시 테스트 가능:

```bash
# Python 테스트
python3 << 'EOF'
import requests
client_id = "YOUR_NEW_CLIENT_ID"
client_secret = "YOUR_NEW_CLIENT_SECRET"

response = requests.get(
    "https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc",
    params={"coords": "126.904,37.526", "output": "json", "orders": "roadaddr"},
    headers={"X-NCP-APIGW-API-KEY-ID": client_id, "X-NCP-APIGW-API-KEY": client_secret}
)
print(f"Status: {response.status_code}")
print(response.text)
EOF
```

**성공 시 출력**:
```json
{
  "status": {
    "code": 0,
    "name": "ok"
  },
  "results": [
    {
      "region": {
        "area1": {"name": "서울특별시"},
        "area2": {"name": "영등포구"},
        "area3": {"name": "여의도동"}
      }
    }
  ]
}
```

---

## 다음 단계

1. ✅ 위 체크리스트 1-6번 순서대로 확인
2. ✅ 문제 발견 시 수정 후 테스트
3. ✅ 여전히 실패 시 7번(공식 지원) 문의
4. ✅ API 키 업데이트되면 저에게 알려주시면 즉시 테스트하겠습니다

**현재 `.env` 파일은 이미 업데이트되어 있으므로**, API 키만 해결되면 즉시 작동할 것입니다! 🚀
