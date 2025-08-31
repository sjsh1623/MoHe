# API Integration Testing Guide

## 🚀 Quick Start

1. **Start the backend server**:
   ```bash
   cd MoheSpring
   ./gradlew bootRun
   ```

2. **Start the frontend**:
   ```bash
   cd MoheReact
   npm run dev
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

## 🧪 Testing API Integration

### Browser Console Testing
The frontend automatically loads API testing utilities in development mode. Open your browser console and run:

```javascript
// Test all APIs at once
window.apiTest.runAllTests()

// Test individual services
window.apiTest.testBackendConnection()
window.apiTest.testWeatherService()
window.apiTest.testContextualRecommendations()
window.apiTest.testPlaceSearch()
```

### Expected API Flows

#### 1. Home Page Loading
```
HomePage loads → 
  Check user auth → 
  Get location → 
  Fetch weather → 
  Load contextual recommendations → 
  Check bookmark status → 
  Render cards
```

#### 2. Natural Language Search
```
User types query → 
  GlobalMessageInput captures → 
  Call contextual API → 
  Navigate to SearchResults → 
  Display results
```

#### 3. Bookmark Interaction
```
User clicks bookmark → 
  Check authentication → 
  Call bookmark API → 
  Update UI state
```

## 🔧 API Endpoints Being Used

### Weather APIs
- `GET /api/weather/current?lat={lat}&lon={lon}` - Current weather data
- `GET /api/weather/context?lat={lat}&lon={lon}` - Weather context for recommendations

### Recommendation APIs
- `POST /api/recommendations/query` - Natural language contextual search
- `POST /api/recommendations/search` - Keyword-based search
- `GET /api/recommendations/personalized` - MBTI-weighted recommendations

### Bookmark APIs
- `POST /api/bookmarks/toggle/{placeId}` - Toggle bookmark status
- `GET /api/bookmarks/check/{placeId}` - Check bookmark status

### Authentication APIs
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `GET /api/users/profile` - User profile

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
If you see CORS errors, make sure your backend is running on `http://localhost:8080` and includes CORS configuration.

#### 2. 401 Unauthorized
The frontend handles token refresh automatically. Check:
- Browser localStorage for `authToken` and `refreshToken`
- Backend authentication configuration
- Token expiration settings

#### 3. Weather Service Fails
Weather service has fallback mock data. Check:
- OpenWeatherMap API key configuration
- Network connectivity
- Console logs for detailed error messages

#### 4. Empty Recommendations
Check:
- Database has place data
- Ollama service is running (if using AI features)
- Geolocation permissions are granted
- Backend logs for processing errors

### Debug Steps

1. **Check browser console** for detailed error logs
2. **Use API test utilities**:
   ```javascript
   window.apiTest.testBackendConnection()
   ```
3. **Check network tab** in DevTools for API calls
4. **Verify backend logs** for processing errors
5. **Check localStorage** for authentication tokens

## 📊 Expected Data Flow

### Homepage Recommendations
```json
{
  "success": true,
  "data": {
    "places": [
      {
        "id": 1,
        "name": "카페 이름",
        "category": "카페",
        "rating": 4.5,
        "latitude": 37.5665,
        "longitude": 126.9780,
        "imageUrl": "https://...",
        "distanceM": 500,
        "isOpenNow": true,
        "weatherSuitability": "비 오는 날에 적합",
        "reasonWhy": "실내 공간, 높은 평점"
      }
    ],
    "searchContext": {
      "weather": { "tempC": 20, "conditionCode": "clear" },
      "recommendation": "현재 날씨를 고려한 추천"
    },
    "totalResults": 10
  }
}
```

### Authentication Response
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": 123,
      "nickname": "사용자",
      "mbti": "ENFP",
      "email": "user@example.com"
    }
  }
}
```

## 🔄 Fallback Strategies

The frontend implements multiple fallback layers:

1. **Contextual Recommendations** → Personalized Recommendations → Mock Data
2. **Real Weather Data** → Mock Weather Data
3. **Authenticated User** → Guest Session
4. **API Success** → Error Message with Retry

## 🌟 Features to Test

### Location Features
- [ ] Automatic geolocation on page load
- [ ] Location permission handling
- [ ] Fallback to default Seoul coordinates
- [ ] Location display in header

### Weather Integration
- [ ] Weather data loading
- [ ] Weather-based recommendation filtering
- [ ] Time-based context (morning/afternoon/evening)
- [ ] Weather condition display

### Recommendation Engine
- [ ] Natural language query processing
- [ ] Contextual search results
- [ ] MBTI-weighted personalization
- [ ] Bookmark status loading
- [ ] Distance-based sorting

### Authentication
- [ ] Guest mode functionality
- [ ] Login/logout flow
- [ ] Token refresh handling
- [ ] Profile data loading

### Error Handling
- [ ] Network error graceful degradation
- [ ] API timeout handling
- [ ] Retry functionality
- [ ] User-friendly error messages

## 📱 Production Considerations

Before deploying:

1. **Environment Variables**:
   - Set `VITE_API_BASE_URL` to production backend
   - Configure proper CORS on backend
   - Set up proper SSL certificates

2. **Performance**:
   - API response caching
   - Image optimization
   - Bundle size optimization

3. **Security**:
   - Remove development console logs
   - Secure token storage
   - Input validation

4. **Monitoring**:
   - Error tracking (Sentry, etc.)
   - Performance monitoring
   - API usage analytics