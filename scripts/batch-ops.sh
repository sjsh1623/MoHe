#!/bin/bash

# Batch Operations Helper Script for Mohe Platform

show_usage() {
    echo "🔧 Mohe Batch Operations"
    echo ""
    echo "Usage: ./batch-ops.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start         - Start batch job manually"
    echo "  status        - Show batch job status"
    echo "  logs          - Show batch logs (live)"
    echo "  health        - Check all service health"
    echo "  extract       - Extract keywords for place ID"
    echo "  similar       - Find similar places for place ID"
    echo "  stats         - Show batch processing statistics"
    echo "  reset         - Reset batch job state"
    echo ""
}

check_services() {
    echo "🔍 Checking service health..."
    
    services=("backend:8080" "batch-web:8082" "batch-processor:8084")
    
    for service in "${services[@]}"; do
        name=$(echo $service | cut -d':' -f1)
        port=$(echo $service | cut -d':' -f2)
        
        if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
            echo "   ✅ $name is healthy"
        else
            echo "   ❌ $name is not responding"
        fi
    done
}

start_batch() {
    echo "🚀 Starting batch job..."
    
    response=$(curl -s -X POST "http://localhost:8082/batch/jobs/start" -H "Content-Type: application/json")
    
    if [[ $response == *"success"* ]]; then
        echo "✅ Batch job started successfully"
        echo "📊 Response: $response"
    else
        echo "❌ Failed to start batch job"
        echo "📊 Response: $response"
    fi
}

show_status() {
    echo "📊 Batch Job Status..."
    
    # Check job execution state
    echo "🔍 Job Execution State:"
    curl -s "http://localhost:8084/actuator/metrics/spring.batch.job.active" | grep -o '"value":[0-9]*' | head -1
    
    # Check processing metrics
    echo ""
    echo "📈 Processing Metrics:"
    curl -s "http://localhost:8084/actuator/metrics" | grep -o '"name":"[^"]*batch[^"]*"' | head -10
}

show_logs() {
    echo "📝 Live Batch Logs (Ctrl+C to exit)..."
    docker-compose logs -f mohebatch-processor
}

extract_keywords() {
    if [ -z "$2" ]; then
        echo "❌ Please provide a place ID"
        echo "Usage: ./batch-ops.sh extract [place_id]"
        exit 1
    fi
    
    place_id=$2
    echo "🔑 Extracting keywords for place ID: $place_id"
    
    response=$(curl -s -X POST "http://localhost:8080/api/keyword/places/$place_id/extract" -H "Content-Type: application/json")
    
    if [[ $response == *"success"* ]]; then
        echo "✅ Keywords extracted successfully"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    else
        echo "❌ Failed to extract keywords"
        echo "Response: $response"
    fi
}

find_similar() {
    if [ -z "$2" ]; then
        echo "❌ Please provide a place ID"
        echo "Usage: ./batch-ops.sh similar [place_id]"
        exit 1
    fi
    
    place_id=$2
    echo "🔍 Finding similar places for place ID: $place_id"
    
    response=$(curl -s "http://localhost:8080/api/keyword/places/$place_id/similar?limit=5" -H "Content-Type: application/json")
    
    if [[ $response == *"success"* ]]; then
        echo "✅ Similar places found"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    else
        echo "❌ Failed to find similar places"
        echo "Response: $response"
    fi
}

show_stats() {
    echo "📊 Batch Processing Statistics..."
    
    echo "🗄️  Database Stats:"
    echo "   Places processed: $(curl -s http://localhost:8084/actuator/metrics/batch.places.processed | grep -o '"value":[0-9]*' | cut -d':' -f2 || echo 'N/A')"
    echo "   Keywords generated: $(curl -s http://localhost:8084/actuator/metrics/batch.keywords.generated | grep -o '"value":[0-9]*' | cut -d':' -f2 || echo 'N/A')"
    
    echo ""
    echo "🔧 Service Status:"
    docker-compose ps
    
    echo ""
    echo "💾 Database Status:"
    docker-compose exec postgres psql -U mohe_user -d mohe_db -c "SELECT COUNT(*) as total_places FROM places;" 2>/dev/null || echo "   Database not accessible"
    docker-compose exec postgres psql -U mohe_user -d mohe_db -c "SELECT COUNT(*) as total_extractions FROM place_keyword_extractions;" 2>/dev/null || echo "   Keyword extractions not accessible"
}

reset_batch() {
    echo "🔄 Resetting batch job state..."
    
    # Stop batch processor
    docker-compose stop mohebatch-processor
    
    # Clear job execution state
    docker-compose exec postgres psql -U mohe_user -d mohe_db -c "TRUNCATE TABLE batch_job_execution_context, batch_job_execution, batch_job_instance, batch_step_execution, batch_step_execution_context CASCADE;" 2>/dev/null
    
    # Restart batch processor
    docker-compose up -d mohebatch-processor
    
    echo "✅ Batch state reset complete"
}

# Main script logic
case "$1" in
    "start")
        start_batch
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "health")
        check_services
        ;;
    "extract")
        extract_keywords "$@"
        ;;
    "similar")
        find_similar "$@"
        ;;
    "stats")
        show_stats
        ;;
    "reset")
        reset_batch
        ;;
    *)
        show_usage
        ;;
esac