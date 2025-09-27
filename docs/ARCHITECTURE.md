# Mohe Platform Architecture 🏗️

Comprehensive architecture overview of the AI-powered place recommendation platform.

## 🎯 System Overview

Mohe is a microservices-based platform that uses AI to extract keywords from places and provide intelligent recommendations through vector similarity search.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mohe Platform                            │
├─────────────────────────────────────────────────────────────────┤
│                      🌐 User Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Web App    │  │ Mobile App  │  │   Admin     │              │
│  │  (React)    │  │  (Future)   │  │  Dashboard  │              │
│  │ Port: 3000  │  │             │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                     🖥️ API Gateway                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 Spring Boot Backend                        │ │
│  │  • REST API with JWT Authentication                       │ │
│  │  • Keyword Extraction Service                            │ │
│  │  • Vector Similarity Engine                              │ │
│  │  • User & Place Management                               │ │
│  │  Port: 8080                                               │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                  📊 Batch Processing Layer                      │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │  Batch Web      │  │ Batch Processor │                      │
│  │  • Job Control  │  │ • Data Collection│                     │
│  │  • Monitoring   │  │ • AI Processing  │                     │
│  │  Port: 8082     │  │ • Vector Storage │                     │
│  │                 │  │ Port: 8084      │                     │
│  └─────────────────┘  └─────────────────┘                      │
├─────────────────────────────────────────────────────────────────┤
│                   🗄️ Data Layer                                │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │  PostgreSQL     │  │   pgvector      │                      │
│  │  • User Data    │  │ • Vector Search │                     │
│  │  • Places       │  │ • Similarity    │                     │
│  │  • Bookmarks    │  │ • Keywords      │                     │
│  │  Port: 5432     │  │                 │                     │
│  └─────────────────┘  └─────────────────┘                      │
├─────────────────────────────────────────────────────────────────┤
│                   🧠 AI Processing Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │  Ollama Server  │  │  External APIs  │                      │
│  │  • gpt-oss:20b  │  │ • Naver Local   │                     │
│  │  • Keyword Gen  │  │ • Google Places │                     │
│  │  Port: 11434    │  │                 │                     │
│  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## 🧩 Service Architecture

### Frontend Layer (MoheReact)
```
React Application
├── 🎨 UI Components
│   ├── Cards, Buttons, Forms
│   ├── Place Cards & Lists  
│   ├── User Profile Management
│   └── Authentication Pages
├── 🔄 State Management
│   ├── React Context
│   ├── Local Storage
│   └── API Integration
├── 🛣️ Routing (React Router)
└── 📱 Responsive Design (CSS Modules)
```

### Backend Layer (MoheSpring)
```
Spring Boot Application
├── 🌐 Controllers (REST API)
│   ├── AuthController - Authentication & JWT
│   ├── PlaceController - Place management
│   ├── BookmarkController - User bookmarks
│   ├── KeywordRecommendationController - AI recommendations
│   └── BatchController - Internal batch communication
├── 🔧 Services (Business Logic)
│   ├── AuthService - User authentication
│   ├── PlaceService - Place CRUD operations
│   ├── KeywordExtractionService - AI keyword processing
│   ├── SimilarityCalculationService - Vector similarity
│   └── BatchService - Batch data processing
├── 🗄️ Repositories (Data Access)
│   ├── UserRepository
│   ├── PlaceRepository
│   ├── PlaceKeywordExtractionRepository
│   └── KeywordCatalogRepository
├── 🔐 Security (JWT + Spring Security)
└── 📊 Monitoring (Spring Actuator)
```

### Batch Processing Layer (MoheBatch)
```
Spring Batch Application
├── 🔍 Readers
│   ├── NaverGooglePlaceReader - External API integration
│   └── ConfigurableItemReader - Flexible data reading
├── ⚙️ Processors  
│   ├── PlaceEnrichmentProcessor - Data transformation
│   └── KeywordExtractionProcessor - AI processing
├── ✍️ Writers
│   ├── MoheSpringApiWriter - Send to backend API
│   └── DatabaseWriter - Direct database writes
├── 📅 Scheduling (Cron-based)
└── 📈 Metrics (Micrometer + Prometheus)
```

## 🔄 Data Flow Architecture

### 1. User Registration & Authentication Flow
```
User → Frontend → Backend API → Database
  ↓
JWT Token ← Spring Security ← User Validation
```

### 2. Place Recommendation Flow
```
User Request → Backend API → Keyword Similarity Service
     ↓                              ↓
Frontend ←─── JSON Response ←─── pgvector Search
```

### 3. Batch Processing Flow
```
Scheduler → Batch Processor → Naver API → Google API
    ↓              ↓              ↓           ↓
Database ←─── Ollama AI ←──── Data Enrichment ←┘
```

### 4. Keyword Extraction Flow
```
Place Data → Ollama Server → JSON Response → Vector Calculation
     ↓            ↓              ↓              ↓
Database ←─── 15 Keywords ←─── Parsing ←─── 100D Vector
```

## 🗄️ Database Schema

### Core Tables
```sql
-- User Management
users (id, email, password_hash, nickname, mbti, created_at)
refresh_tokens (id, user_id, token, expires_at)
email_verifications (id, email, token, expires_at)

-- Place Management  
places (id, name, address, latitude, longitude, category, description, 
        rating, naver_place_id, google_place_id, created_at)
        
-- Keyword System (NEW)
keyword_catalog (id, keyword, definition, category, vector_position)
place_keyword_extractions (id, place_id, keyword_vector, selected_keywords,
                           model_name, processing_time_ms, created_at)

-- User Interactions
bookmarks (id, user_id, place_id, created_at)
recent_views (id, user_id, place_id, viewed_at)

-- Legacy (Being Replaced)
place_mbti_descriptions (id, place_id, mbti, description, model)
place_similarities (id, place1_id, place2_id, similarity_score)
```

### Vector Search Tables
```sql
-- pgvector extension for similarity search
CREATE EXTENSION vector;

-- Keyword vectors (100 dimensions)
place_keyword_extractions (
    keyword_vector vector(100),
    -- Indexed for cosine similarity
    INDEX USING ivfflat (keyword_vector vector_cosine_ops)
);

-- Keyword relationships
keyword_relationships (
    keyword1_id, keyword2_id, similarity_score, relationship_type
);
```

## 🔌 API Architecture

### Authentication APIs
```
POST /auth/signup         - User registration
POST /auth/signin         - User login  
POST /auth/refresh        - Token refresh
POST /auth/signout        - User logout
```

### Core APIs
```
GET  /places              - List places with filters
GET  /places/{id}         - Get place details
POST /places/{id}/bookmark - Bookmark place
GET  /bookmarks           - User bookmarks
```

### Keyword System APIs (NEW)
```
GET  /api/keyword/places/{id}/similar  - Find similar places
POST /api/keyword/places/{id}/extract  - Extract keywords
```

### Batch APIs (Internal)
```
POST /api/batch/internal/ingest/place  - Batch data ingestion
GET  /actuator/health                   - Service health
GET  /actuator/metrics                  - Processing metrics
```

## 🧠 AI Processing Architecture

### Keyword Extraction Pipeline
```
Place Data → Context Builder → Ollama Prompt → JSON Parser → Vector Calculator
     ↓              ↓               ↓              ↓              ↓
  Rating,       Korean Prompt   gpt-oss:20b    15 Keywords   100D Vector
  Address,      Template        Model          + Confidence  → Database
  Category      
```

### Similarity Calculation
```
User Query → Place Keywords → Vector Similarity → Ranking → Results
     ↓             ↓              ↓                ↓          ↓
  Place ID    100D Vector    Cosine Distance   Score Sort  JSON API
```

### Batch Processing Pipeline
```
Cron Trigger → Seoul Locations → Naver API → Google API → Ollama AI
     ↓              ↓               ↓           ↓           ↓
   Every Hour    8 Coordinates   Place Data  Enrichment  Keywords
                 × 15 Categories              
```

## 🔐 Security Architecture

### Authentication & Authorization
```
JWT Token Strategy:
- Access Token: 1 hour expiry
- Refresh Token: 30 days expiry  
- HS256 algorithm with secret key
- Stateless authentication
```

### API Security
```
Spring Security Configuration:
- JWT Filter for all protected endpoints
- CORS enabled for frontend domain
- Rate limiting on authentication endpoints
- Input validation and sanitization
```

### Environment Security
```
Configuration Management:
- API keys in environment variables
- No secrets in source code
- .env file excluded from git
- Production secrets in secure storage
```

## 📊 Monitoring Architecture

### Health Monitoring
```
Spring Actuator Endpoints:
- /actuator/health - Service health status
- /actuator/metrics - Application metrics
- /actuator/info - Build information
- /actuator/prometheus - Metrics for monitoring
```

### Batch Monitoring
```
Processing Metrics:
- Places processed per hour
- Keywords extracted count  
- API call success rates
- Processing time averages
- Error rates and types
```

### Performance Monitoring
```
Key Performance Indicators:
- API response times < 200ms
- Keyword extraction < 30s per place
- Vector similarity search < 50ms
- Batch processing throughput
```

## 🚀 Deployment Architecture

### Development Environment
```
Local Development:
- Docker Compose for all services
- Hot reload for frontend/backend
- Local PostgreSQL instance
- Mock external APIs
```

### Production Environment
```
Container Orchestration:
- Docker containers for all services
- Load balancer for backend API
- Horizontal scaling capability
- Database clustering (future)
```

### CI/CD Pipeline
```
Automated Deployment:
- Git push triggers build
- Automated testing suite
- Docker image creation
- Rolling deployment
```

## 🔮 Future Architecture Enhancements

### Planned Improvements
```
1. Microservices Split:
   - Separate Keyword Service
   - Independent Similarity Service
   - Dedicated Batch Processing

2. Caching Layer:
   - Redis for API responses
   - Vector similarity cache
   - Session management

3. Message Queue:
   - Asynchronous keyword processing
   - Event-driven architecture
   - Background job processing

4. Advanced AI:
   - Multiple AI model support
   - A/B testing for models
   - Custom model fine-tuning
```

---

🏗️ **This architecture provides a scalable foundation for AI-powered place recommendations with the flexibility to grow and adapt to future requirements.**