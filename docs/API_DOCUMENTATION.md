# 📚 Mohe Platform - Official API Documentation

## 🌟 Overview

The Mohe Platform provides a comprehensive API for place discovery, personalized recommendations, and intelligent place management. This document covers all available endpoints, request/response formats, and authentication requirements.

**Base URL**: `http://localhost:8080/api`  
**API Version**: v1  
**Authentication**: JWT Bearer Token  

---

## 🔐 Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "name": "John Doe",
      "email": "user@example.com",
      "mbti": "INTJ"
    }
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "mbti": "INTJ"
}
```

---

## 🏢 Place Management

### Get Places
```http
GET /places?page=1&limit=20&category=카페&sort=rating
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `category` (optional): Place category filter
- `sort` (optional): Sort by `rating`, `popularity`, or `created`

**Response:**
```json
{
  "success": true,
  "data": {
    "places": [
      {
        "id": "1",
        "title": "카페 모헤",
        "rating": 4.5,
        "reviewCount": 127,
        "location": "서울시 강남구",
        "image": "https://example.com/image.jpg",
        "isBookmarked": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalCount": 200
    }
  }
}
```

### Get Place Details
```http
GET /places/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "place": {
      "id": "1",
      "title": "카페 모헤",
      "tags": ["조용한", "Wi-Fi", "디저트"],
      "location": "서울시 강남구 테헤란로 123",
      "address": "서울시 강남구 테헤란로 123",
      "rating": 4.5,
      "reviewCount": 127,
      "description": "조용하고 아늑한 분위기의 카페",
      "images": ["url1.jpg", "url2.jpg"],
      "gallery": ["gallery1.jpg", "gallery2.jpg"],
      "additionalImageCount": 5,
      "transportation": {
        "car": "15분",
        "bus": "25분"
      },
      "operatingHours": "09:00-22:00",
      "amenities": ["Wi-Fi", "주차", "테라스"],
      "isBookmarked": false
    }
  }
}
```

### Search Places
```http
GET /places/search?query=카페&location=강남&weather=hot&time=afternoon
Authorization: Bearer {token}
```

**Query Parameters:**
- `query` (required): Search keyword
- `location` (optional): Location filter
- `weather` (optional): Weather condition (`hot`, `cold`)
- `time` (optional): Time of day (`morning`, `afternoon`, `evening`)

**Response:**
```json
{
  "success": true,
  "data": {
    "searchResults": [
      {
        "id": "1",
        "name": "카페 모헤",
        "hours": "09:00-22:00",
        "location": "서울시 강남구",
        "rating": 4.5,
        "carTime": "15분",
        "busTime": "25분",
        "tags": ["조용한", "Wi-Fi"],
        "image": "https://example.com/image.jpg",
        "isBookmarked": false,
        "weatherTag": {
          "text": "더운 날씨에 가기 좋은 장소",
          "color": "red",
          "icon": "thermometer"
        },
        "noiseTag": {
          "text": "시끄럽지 않은 장소",
          "color": "blue",
          "icon": "speaker"
        }
      }
    ],
    "searchContext": {
      "weather": "더운 날씨",
      "time": "오후 2시",
      "recommendation": "지금은 멀지 않고 실내 장소들을 추천드릴게요."
    }
  }
}
```

---

## 🎯 Enhanced Recommendations

### Get Enhanced Recommendations
```http
GET /recommendations/enhanced?limit=15&excludeBookmarked=true
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 15, max: 50)
- `excludeBookmarked` (optional): Exclude bookmarked places (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "1",
        "title": "카페 모헤",
        "rating": 4.5,
        "reviewCount": 127,
        "location": "서울시 강남구",
        "image": "https://example.com/image.jpg",
        "tags": ["조용한", "Wi-Fi"],
        "description": "독립적 사고가 가능한 조용한 카페입니다.",
        "mbtiDescription": "INTJ 성향에 맞는 집중할 수 있는 공간",
        "transportation": {
          "car": "15분",
          "bus": "25분"
        },
        "isBookmarked": false,
        "recommendationScore": 0.8754,
        "recommendationReasons": ["당신의 취향과 매우 유사한 장소"],
        "category": "카페"
      }
    ],
    "algorithm": "mbti_similarity_based",
    "totalCount": 15,
    "userMbti": "INTJ",
    "basedOnBookmarks": 12
  }
}
```

### Get MBTI-Specific Recommendations
```http
GET /recommendations/mbti/{mbtiType}?limit=15
Authorization: Bearer {token}
```

**Path Parameters:**
- `mbtiType`: MBTI type (INTJ, ENFP, etc.)

**Response:** Same as enhanced recommendations with MBTI-specific descriptions.

### Get Recommendation Explanation
```http
GET /recommendations/explanation
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "userMbti": "INTJ",
    "algorithm": "mbti_similarity_based",
    "explanation": {
      "step1": "사용자의 북마크된 장소들을 분석합니다",
      "step2": "북마크된 장소와 유사한 다른 장소들을 찾습니다",
      "step3": "MBTI 성향에 따라 가중치를 적용합니다",
      "step4": "다양성과 인기도 균형을 맞춰 최종 추천 목록을 생성합니다"
    },
    "factors": {
      "similarity": "북마크 기반 유사도 (자카드, 코사인 유사도)",
      "mbti": "MBTI 성향별 장소 선호도 가중치",
      "diversity": "카테고리와 지역 다양성 보장",
      "freshness": "최근 데이터에 더 높은 가중치 부여",
      "popularity": "인기 편향 완화를 위한 패널티 적용"
    }
  }
}
```

---

## 📌 Bookmark Management

### Toggle Bookmark
```http
POST /bookmarks/toggle
Authorization: Bearer {token}
Content-Type: application/json

{
  "placeId": "1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isBookmarked": true,
    "message": "북마크가 추가되었습니다."
  }
}
```

### Get User Bookmarks
```http
GET /bookmarks
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookmarks": [
      {
        "id": "1",
        "place": {
          "id": "1",
          "name": "카페 모헤",
          "location": "서울시 강남구",
          "image": "https://example.com/image.jpg",
          "rating": 4.5
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 🔧 Admin APIs

### Similarity Management

#### Trigger Similarity Calculation
```http
POST /admin/similarity/calculate
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Similarity calculation started",
  "status": "running"
}
```

#### Get Similarity Status
```http
GET /admin/similarity/status
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "isRunning": false,
  "statistics": {
    "totalSimilarities": 50000,
    "totalTopKEntries": 5000,
    "averageJaccard": 0.156,
    "averageCosine": 0.234,
    "sampleSize": 100
  }
}
```

#### Refresh Top-K Similarities
```http
POST /admin/similarity/refresh-topk
Authorization: Bearer {admin_token}
Content-Type: application/json

[1, 2, 3, 4, 5]
```

#### Calculate Place Pair Similarity
```http
POST /admin/similarity/calculate-pair/{placeId1}/{placeId2}
Authorization: Bearer {admin_token}
```

### Place Management

#### Trigger Dynamic Place Fetching
```http
POST /admin/places/fetch?targetCount=50&category=카페
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Place fetching completed",
    "targetCount": 50,
    "fetchedCount": 47,
    "category": "카페",
    "status": "completed"
  }
}
```

#### Check Place Availability
```http
POST /admin/places/check-availability?minRequired=100&category=카페
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentCount": 85,
    "minRequired": 100,
    "category": "카페",
    "actionTaken": true,
    "status": "fetching_triggered",
    "message": "Insufficient places found, fetching triggered"
  }
}
```

#### Trigger Place Cleanup
```http
POST /admin/places/cleanup?maxPlacesToCheck=50
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "processed": 50,
    "removed": 12,
    "updated": 8,
    "kept": 30,
    "errors": 0
  }
}
```

#### Get Cleanup Statistics
```http
GET /admin/places/cleanup-stats
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPlaces": 5000,
    "placesNeedingRecheck": 150,
    "recommendablePlaces": 4800,
    "potentialForCleanup": 200
  }
}
```

---

## 📊 Data Batch APIs

### Trigger Batch Job
```http
POST /data/batch/trigger
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch job triggered successfully",
  "jobId": "batch_job_20240115_103000"
}
```

---

## 🚨 Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Error Codes
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Insufficient permissions
- `PLACE_001`: Place not found
- `PLACE_002`: Invalid place data
- `BOOKMARK_001`: Bookmark already exists
- `BOOKMARK_002`: Bookmark not found
- `SIMILARITY_001`: Similarity calculation in progress
- `SIMILARITY_002`: Insufficient data for calculation
- `ADMIN_001`: Admin operation failed

---

## 🔄 Rate Limits

### User APIs
- **General endpoints**: 100 requests per minute
- **Search endpoints**: 50 requests per minute
- **Recommendation endpoints**: 20 requests per minute

### Admin APIs
- **Similarity management**: 10 requests per hour
- **Place management**: 20 requests per hour
- **Batch operations**: 5 requests per hour

### Headers
Rate limit information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

---

## 🌐 Webhooks

### Similarity Calculation Complete
```http
POST {webhook_url}
Content-Type: application/json

{
  "event": "similarity_calculation_complete",
  "data": {
    "totalSimilarities": 50000,
    "processingTime": 3600000,
    "completedAt": "2024-01-15T14:30:00Z"
  }
}
```

### Place Cleanup Complete
```http
POST {webhook_url}
Content-Type: application/json

{
  "event": "place_cleanup_complete",
  "data": {
    "processed": 100,
    "removed": 15,
    "completedAt": "2024-01-15T14:30:00Z"
  }
}
```

---

## 📱 SDK Examples

### JavaScript/TypeScript
```typescript
import { MoheClient } from '@mohe/api-client';

const client = new MoheClient({
  baseUrl: 'http://localhost:8080/api',
  token: 'your-jwt-token'
});

// Get enhanced recommendations
const recommendations = await client.recommendations.getEnhanced({
  limit: 15,
  excludeBookmarked: true
});

// Toggle bookmark
await client.bookmarks.toggle({ placeId: '1' });
```

### curl Examples
```bash
# Get places
curl -H "Authorization: Bearer {token}" \
     "http://localhost:8080/api/places?page=1&limit=20"

# Toggle bookmark
curl -X POST \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"placeId": "1"}' \
     "http://localhost:8080/api/bookmarks/toggle"

# Get enhanced recommendations
curl -H "Authorization: Bearer {token}" \
     "http://localhost:8080/api/recommendations/enhanced?limit=15"
```

---

## 🔍 Testing

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "similarity": { "status": "UP" },
    "ollama": { "status": "UP" }
  }
}
```

### API Documentation
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Spec**: `http://localhost:8080/v3/api-docs`

---

## 📝 Changelog

### Version 1.3.0 (2024-01-15)
- ✅ Added dynamic place fetching
- ✅ Implemented intelligent place cleanup
- ✅ Enhanced MBTI-weighted recommendations
- ✅ Added place management admin APIs

### Version 1.2.0 (2024-01-10)
- ✅ Added similarity calculation system
- ✅ Implemented MBTI-based recommendations  
- ✅ Added Ollama integration for descriptions

### Version 1.1.0 (2024-01-05)
- ✅ Added bookmark management
- ✅ Implemented place search
- ✅ Added user authentication

### Version 1.0.0 (2024-01-01)
- ✅ Initial API release
- ✅ Basic place management
- ✅ User registration/login

---

**© 2024 Mohe Platform. All rights reserved.**

For technical support, please contact: dev@mohe.com  
For API issues, create an issue at: https://github.com/mohe/api/issues