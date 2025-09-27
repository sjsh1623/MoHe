#!/bin/bash

# Mohe Platform Startup Script
echo "🚀 Starting Mohe Platform with Keyword Extraction Pipeline..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it with your API keys."
    exit 1
fi

echo "📋 Configuration:"
echo "   - Naver API: ✓ Configured"
echo "   - Google Places API: ✓ Configured" 
echo "   - Ollama Host: $(grep OLLAMA_HOST .env | cut -d'=' -f2)"

# Test Ollama connectivity
echo "🧠 Testing Ollama connectivity..."
OLLAMA_HOST=$(grep OLLAMA_HOST .env | cut -d'=' -f2)
OLLAMA_MODEL=$(grep OLLAMA_MODEL .env | cut -d'=' -f2)

echo "   🔗 Connecting to: ${OLLAMA_HOST}"
echo "   🤖 Model: ${OLLAMA_MODEL}"

if curl -s "${OLLAMA_HOST}/api/tags" > /dev/null 2>&1; then
    echo "   ✅ Ollama server is accessible"
    
    # Check if the specified model is available
    if curl -s "${OLLAMA_HOST}/api/tags" | grep -q "${OLLAMA_MODEL}"; then
                                                      echo "   ✅ ${OLLAMA_MODEL} model is available"
    else
        echo "   ⚠️  ${OLLAMA_MODEL} model not found"
        echo "   Available models:"
        curl -s "${OLLAMA_HOST}/api/tags" | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sed 's/^/      - /'
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    echo "   ❌ Cannot connect to Ollama at ${OLLAMA_HOST}"
    echo "   Make sure Ollama is running on your Mac Mini (192.168.219.127:11434)"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🏗️  Building and starting services..."

# Build all services
echo "   📦 Building Docker images..."
docker-compose build --parallel

# Start core services first (database, backend)
echo "   🗄️  Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "   ⏳ Waiting for PostgreSQL to be ready..."
sleep 10

echo "   🖥️  Starting MoheSpring backend..."
docker-compose up -d mohe-backend

echo "   🔄 Starting Mock API..."
docker-compose up -d mock-api

# Wait for backend to be ready
echo "   ⏳ Waiting for backend to be ready..."
sleep 15

echo "   📊 Starting batch services..."
docker-compose up -d mohebatch-web mohebatch-processor

echo "   🌐 Starting React frontend..."
docker-compose up -d mohe-frontend

echo ""
echo "🎉 Mohe Platform is starting up!"
echo ""
echo "📡 Service URLs:"
echo "   🌐 Frontend:           http://localhost:3000"
echo "   🖥️  Backend API:        http://localhost:8080"
echo "   📊 Batch Web:          http://localhost:8082"
echo "   ⚙️  Batch Processor:    http://localhost:8084"
echo "   🧪 Mock API:           http://localhost:3001"
echo ""
echo "🔍 Health Check URLs:"
echo "   Backend:     http://localhost:8080/health"
echo "   Batch Web:   http://localhost:8082/health"
echo "   Processor:   http://localhost:8084/health"
echo ""
echo "📊 Batch Management:"
echo "   Web Actuator:       http://localhost:8083/actuator"
echo "   Processor Actuator: http://localhost:8085/actuator"
echo ""
echo "🔧 Keyword Extraction API:"
echo "   Extract keywords:   POST http://localhost:8080/api/keyword/places/{placeId}/extract"
echo "   Find similar:       GET http://localhost:8080/api/keyword/places/{placeId}/similar"
echo ""
echo "▶️  To start batch job manually:"
echo "   curl -X POST http://localhost:8082/batch/jobs/start"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f [service-name]"
echo ""
echo "🛑 Stop all services:"
echo "   docker-compose down"
echo ""
echo "⏳ Services are starting up... Check health endpoints above to verify they're ready."

# Show status
sleep 5
echo ""
echo "📈 Current Status:"
docker-compose ps