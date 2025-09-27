# Mohe Platform Setup Guide 🚀

Complete setup guide for the Mohe platform with keyword extraction pipeline.

## ⚡ Quick Start

### 1. Environment Configuration

Create `.env` file in the root directory with your API keys:

```bash
# Copy the example and fill in your keys
cp .env.example .env
```

Edit `.env` with your actual API keys:

```env
# API Keys (REQUIRED - Get these from respective platforms)
NAVER_CLIENT_ID=your_naver_client_id_here
NAVER_CLIENT_SECRET=your_naver_client_secret_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Ollama Configuration (REQUIRED - Update with your server)
OLLAMA_HOST=http://192.168.219.127:11434
OLLAMA_MODEL=gpt-oss:20b
OLLAMA_TIMEOUT=120

# Database Configuration
POSTGRES_DB=mohe_db
POSTGRES_USER=mohe_user
POSTGRES_PASSWORD=mohe_password

# Other configurations...
```

### 2. Check Ollama Server

```bash
./setup-ollama.sh
```

### 3. Start All Services

```bash
./start-all.sh
```

## 📋 Prerequisites

### Required API Keys

1. **Naver Local Search API**
   - Visit: https://developers.naver.com/
   - Create application and get Client ID & Secret
   
2. **Google Places API**
   - Visit: https://console.cloud.google.com/
   - Enable Places API and get API key

3. **Ollama Server**
   - Must be running with a compatible model
   - Test connectivity before starting services

### System Requirements

- Docker & Docker Compose
- 8GB+ RAM recommended (for Ollama model)
- Network access to Ollama server

## 🌐 Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Spring Backend │    │  Batch Services │
│   Port: 3000    │    │   Port: 8080    │    │ Ports: 8082/84  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Port: 5432    │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Ollama Server   │
                    │ (External)      │
                    └─────────────────┘
```

## 🔧 Batch Management

### Start Batch Processing
```bash
./batch-ops.sh start
```

### Monitor Batch Progress
```bash
./batch-ops.sh logs
```

### Check Service Health
```bash
./batch-ops.sh health
```

### Extract Keywords for Place
```bash
./batch-ops.sh extract [place_id]
```

### Find Similar Places
```bash
./batch-ops.sh similar [place_id]
```

## 📊 Keyword Extraction Pipeline

1. **Data Collection**
   - Fetch places from Naver Local Search API
   - Enrich with Google Places API data
   - Process 8 Seoul locations × 15 categories

2. **Keyword Extraction**
   - Process each place through Ollama
   - Extract exactly 15 keywords from 100-keyword catalog
   - Generate confidence scores (0.0-1.0)

3. **Vector Storage**
   - Convert keywords to 100-dimensional vectors
   - Store in PostgreSQL with pgvector extension
   - Enable similarity search via cosine distance

4. **Recommendation Engine**
   - Find similar places using vector similarity
   - Filter by confidence thresholds
   - Return ranked recommendations

## 🚀 API Endpoints

### Keyword Extraction
```bash
# Extract keywords for a place
POST /api/keyword/places/{placeId}/extract

# Find similar places
GET /api/keyword/places/{placeId}/similar?limit=10&minSimilarity=0.3
```

### Batch Management
```bash
# Start batch job
POST http://localhost:8082/batch/jobs/start

# Check batch status
GET http://localhost:8084/actuator/health

# View batch metrics
GET http://localhost:8084/actuator/metrics
```

## 🔍 Monitoring & Debugging

### Health Checks
- Backend: http://localhost:8080/health
- Batch Web: http://localhost:8082/health
- Batch Processor: http://localhost:8084/health

### Management Endpoints
- Backend Actuator: http://localhost:8080/actuator
- Batch Actuator: http://localhost:8085/actuator

### API Documentation
- Swagger UI: http://localhost:8080/swagger-ui.html
- API Docs: http://localhost:8080/v3/api-docs

## 🐛 Troubleshooting

### Common Issues

1. **Ollama Connection Failed**
   ```bash
   # Check server accessibility
   curl http://192.168.219.127:11434/api/tags
   
   # Verify model availability
   curl -s http://192.168.219.127:11434/api/tags | grep "gpt-oss:20b"
   ```

2. **Batch Job Fails**
   ```bash
   # Check logs
   docker-compose logs mohebatch-processor
   
   # Restart batch processor
   docker-compose restart mohebatch-processor
   ```

3. **Database Connection Issues**
   ```bash
   # Check PostgreSQL
   docker-compose logs postgres
   
   # Verify database
   docker-compose exec postgres psql -U mohe_user -d mohe_db -c "\dt"
   ```

### Reset Everything
```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: destroys data)
docker-compose down -v

# Start fresh
./start-all.sh
```

## 🔐 Security Notes

- ✅ API keys are in environment variables
- ✅ .env file is gitignored
- ✅ No secrets in source code
- ✅ Database credentials configurable
- ⚠️ Default JWT secret should be changed for production

## 📚 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Similarity System](./SIMILARITY_SYSTEM_KR.md)
- [Troubleshooting Guide](./MoheSpring/TROUBLESHOOTING.md)

---

🎉 **Your keyword extraction pipeline is ready!** The system will automatically process Seoul places and generate AI-powered keyword classifications for better recommendations.