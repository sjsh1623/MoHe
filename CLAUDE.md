# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Platform Overview

Mohe is a multi-service platform for place recommendations and data processing, consisting of three main applications:

- **MoheReact**: Frontend React application for user interactions
- **MoheSpring**: Backend Spring Boot API with JWT authentication
- **MoheBatch**: Spring Batch processing service for data ingestion and AI operations

## Development Commands

### Frontend (MoheReact)
```bash
cd MoheReact
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Backend (MoheSpring)
```bash
cd MoheSpring
./gradlew build           # Build application
./gradlew test            # Run tests
./gradlew bootRun         # Run locally
docker-compose up --build # Start with Docker
```

### Batch Processing (MoheBatch)
```bash
cd MoheBatch
./gradlew build           # Build application
./gradlew test            # Run tests
docker-compose up --build # Start services
```

### Platform Management Scripts
```bash
# From project root
./scripts/start-all.sh     # Start entire platform
./scripts/batch-ops.sh     # Manage batch operations
./scripts/health-check.sh  # Check all services
./scripts/check-ollama.sh  # Test Ollama connectivity
```

## Architecture Overview

### Service Communication
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ MoheReact   │───▶│ MoheSpring  │───▶│ PostgreSQL  │
│ (Frontend)  │    │ (Backend)   │    │ (Database)  │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │ MoheBatch   │
                   │ (Processing)│
                   └─────────────┘
```

### Frontend Architecture (MoheReact)
- **Framework**: React 19.1.0 with Vite build system
- **Routing**: React Router DOM with animated page transitions
- **State Management**: React Context (UserPreferencesContext)
- **Styling**: CSS Modules with mobile-first responsive design
- **Key Features**: MBTI personality assessment, place recommendations, user preferences

### Backend Architecture (MoheSpring)
- **Framework**: Spring Boot 3.2.0 with Kotlin
- **Security**: JWT-based authentication with access/refresh tokens
- **Database**: PostgreSQL with JPA/Hibernate
- **API Pattern**: Standardized `ApiResponse<T>` wrapper for all endpoints
- **External APIs**: Naver Places, Google Places, Ollama AI integration

### Batch Processing (MoheBatch)
- **Framework**: Spring Batch with chunk-oriented processing
- **Features**: API data ingestion, image generation, idempotent upserts
- **Architecture**: ItemReader → ItemProcessor → ItemWriter pattern
- **Monitoring**: Prometheus metrics, health checks, structured logging

## Database Configuration

All services share a PostgreSQL database:
- **Database**: `mohe_db`
- **User**: `mohe_user`
- **Password**: `mohe_password`
- **Port**: `5432`

Key tables:
- `places`: Location data with MBTI scoring
- `place_images`: AI-generated images for places
- `users`: User accounts and preferences
- `batch_job_*`: Spring Batch metadata tables

## Environment Configuration

### Required Environment Variables
```bash
# API Keys
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
GOOGLE_PLACES_API_KEY=your_google_api_key

# AI Configuration
USE_OPENAI=false
OLLAMA_HOST=http://host.docker.internal:11434
OLLAMA_MODEL=llama3

# Database (auto-configured in Docker)
DATABASE_URL=jdbc:postgresql://postgres:5432/mohe_db
DATABASE_USERNAME=mohe_user
DATABASE_PASSWORD=mohe_password
```

### Docker Compose Profiles
- `default`: Basic services (database, backend, frontend)
- `monitoring`: Includes Prometheus and Grafana
- `development`: Development-optimized configuration

## Development Workflow

### 1. Initial Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# Start Ollama server (if using local AI)

# Start all services
./scripts/start-all.sh
```

### 2. Service URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Batch Service**: http://localhost:8082
- **API Docs**: http://localhost:8080/swagger-ui.html
- **Health Checks**: http://localhost:8080/health

### 3. Common Development Tasks

**Backend Development**:
```bash
cd MoheSpring
docker-compose up postgres  # Start database only
./gradlew bootRun           # Run backend locally
```

**Frontend Development**:
```bash
cd MoheReact
npm run dev                 # Start dev server with HMR
```

**Batch Operations**:
```bash
./scripts/batch-ops.sh start  # Trigger batch job
./scripts/batch-ops.sh logs   # Monitor batch processing
```

## Key Implementation Notes

### Spring Boot + Kotlin Considerations
- Source code in `src/main/java/` (project structure preference)
- `ApiResponse<out T>` uses covariant generics for Spring compatibility
- Avoid explicit type parameters on ResponseEntity methods

### React Component Patterns
- CSS Modules for scoped styling (`.module.css`)
- Barrel exports via `index.js` files
- `PreferencePageLayout` for onboarding consistency
- Mobile-first responsive design with WebView optimizations

### Batch Processing Patterns
- Chunk-based processing with configurable sizes
- Idempotent upserts using PostgreSQL `ON CONFLICT`
- Job resumability with state tracking
- Exponential backoff retry logic

### Security Considerations
- JWT tokens stored in memory (not localStorage)
- API endpoints secured with Spring Security
- Public endpoints: `/api/auth/**`, `/health`, `/swagger-ui/**`
- Database credentials managed via Docker secrets

## Testing

### Backend Tests
```bash
cd MoheSpring
./gradlew test                                    # All tests
./gradlew test --tests "AuthControllerTest"      # Specific test
./gradlew test -Dspring.profiles.active=test     # With test profile
```

### Batch Tests
```bash
cd MoheBatch
./gradlew test                      # All tests
./gradlew test jacocoTestReport     # With coverage
```

### Frontend Tests
No test framework currently configured for React application.

## Troubleshooting

### Common Issues
1. **403 Forbidden on /test endpoints**: Restart Spring services, check SecurityConfig
2. **Database connection errors**: Verify PostgreSQL container status
3. **Ollama connectivity issues**: Run `./scripts/check-ollama.sh`
4. **Batch jobs not completing**: Check API rate limits and timeouts

### Debugging Commands
```bash
# Service status
docker ps
docker logs [service-name]

# Database queries
docker exec mohe-postgres psql -U mohe_user -d mohe_db

# Batch job status
docker exec mohe-postgres psql -U mohe_user -d mohe_db -c "
SELECT job_name, status, start_time, end_time
FROM batch_job_execution
ORDER BY start_time DESC LIMIT 5;"
```

## Platform Features

### User Journey
1. **Authentication**: Email signup → OTP verification → Profile setup
2. **Onboarding**: MBTI assessment → Preference selection
3. **Recommendations**: Place discovery based on personality and preferences
4. **Interaction**: Bookmarking, rating, profile management

### Data Processing Pipeline
1. **Collection**: External API data ingestion (Naver, Google Places)
2. **Processing**: Data validation, normalization, MBTI scoring
3. **Enhancement**: AI image generation for places
4. **Delivery**: Real-time API serving with search and filtering

### AI Integration
- **Image Generation**: Ollama or OpenAI DALL-E for place images
- **Keyword Extraction**: AI-powered place description analysis
- **Recommendation Engine**: MBTI-based similarity scoring with configurable weights