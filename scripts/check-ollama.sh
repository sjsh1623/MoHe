#!/bin/bash

echo "🧠 Ollama Server Check for Mohe Keyword Extraction"
echo ""

# Read configuration from .env file
if [ -f .env ]; then
    set -a  # automatically export all variables
    source <(grep -v '^#' .env | grep -v '^$')
    set +a  # disable automatic export
fi

OLLAMA_HOST=${OLLAMA_HOST:-"http://192.168.219.127:11434"}
OLLAMA_MODEL=${OLLAMA_MODEL:-"gpt-oss:20b"}

echo "🔗 Testing connection to your Mac Mini Ollama server..."
echo "   Server: ${OLLAMA_HOST}"
echo "   Model: ${OLLAMA_MODEL}"
echo ""

# Test connectivity
if curl -s "${OLLAMA_HOST}/api/tags" > /dev/null 2>&1; then
    echo "✅ Successfully connected to Ollama server"
    
    # Show available models
    echo ""
    echo "📋 Available models:"
    curl -s "${OLLAMA_HOST}/api/tags" | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sed 's/^/   - /'
    
    # Check if our model exists
    if curl -s "${OLLAMA_HOST}/api/tags" | grep -q "${OLLAMA_MODEL}"; then
        echo ""
        echo "✅ ${OLLAMA_MODEL} model is ready for keyword extraction"
        
        echo ""
        echo "🧪 Testing model response time..."
        echo "   (This may take 30-60 seconds for the gpt-oss:20b model)"
        
        start_time=$(date +%s)
        curl -s --max-time 60 -X POST "${OLLAMA_HOST}/api/generate" \
            -H "Content-Type: application/json" \
            -d '{
                "model": "'${OLLAMA_MODEL}'",
                "prompt": "Hello",
                "stream": false,
                "options": {"max_tokens": 5}
            }' > /dev/null
        end_time=$(date +%s)
        
        if [ $? -eq 0 ]; then
            duration=$((end_time - start_time))
            echo "   ✅ Model responded in ${duration} seconds"
            if [ $duration -gt 30 ]; then
                echo "   ⚠️  Response time is slow - this is normal for gpt-oss:20b"
            fi
        else
            echo "   ⚠️  Model response timed out or failed"
            echo "   This might affect keyword extraction performance"
        fi
    else
        echo "❌ ${OLLAMA_MODEL} model not found"
        echo "   Available models listed above"
        exit 1
    fi
    
else
    echo "❌ Cannot connect to Ollama server at ${OLLAMA_HOST}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Make sure Ollama is running on your Mac Mini"
    echo "   2. Check if the IP address 192.168.219.127 is correct"
    echo "   3. Verify port 11434 is accessible"
    echo "   4. Check firewall settings on Mac Mini"
    exit 1
fi

echo ""
echo "🎉 Ollama Setup Check Complete!"
echo ""
echo "▶️  Your system is ready. Run: ./start-all.sh"