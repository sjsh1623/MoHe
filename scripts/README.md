# Mohe Platform Scripts 🛠️

Utility scripts for managing the Mohe platform.

## 🚀 Quick Start Scripts

### `start-all.sh`
Starts all platform services with configuration validation.
```bash
./scripts/start-all.sh
```

**What it does:**
- Validates Docker is running
- Tests Ollama connectivity and model availability  
- Builds and starts all Docker services in correct order
- Shows service URLs and health check endpoints

### `check-ollama.sh`
Tests connection to Ollama server and model availability.
```bash
./scripts/check-ollama.sh
```

**What it does:**
- Reads configuration from .env file
- Tests connectivity to Ollama server
- Verifies specified model is available
- Tests response times for performance

### `batch-ops.sh`
Comprehensive batch operations management.
```bash
./scripts/batch-ops.sh [command]
```

**Available commands:**
- `start` - Start batch job manually
- `status` - Show batch job status and metrics
- `logs` - Stream live batch processing logs
- `health` - Check all service health endpoints
- `extract [place_id]` - Extract keywords for specific place
- `similar [place_id]` - Find similar places using keywords
- `stats` - Show detailed processing statistics
- `reset` - Reset batch job state (clears database state)

## 🔧 Development Scripts

### `dev-start.sh`
Start services for local development.
```bash
./scripts/dev-start.sh
```

**What it does:**
- Starts only database and mock services
- Leaves backend/frontend for local development
- Sets up development environment

### `test-all.sh`
Run tests for all services.
```bash
./scripts/test-all.sh
```

**What it does:**
- Runs backend unit tests
- Runs batch service tests  
- Runs integration tests
- Generates test coverage reports

## 🔍 Monitoring Scripts

### `health-check.sh`
Comprehensive health check for all services.
```bash
./scripts/health-check.sh
```

**What it does:**
- Tests all service health endpoints
- Verifies database connectivity
- Checks Ollama server status
- Reports overall system health

### `logs.sh`
Centralized log viewing.
```bash
./scripts/logs.sh [service]
```

**Examples:**
```bash
./scripts/logs.sh                    # All services
./scripts/logs.sh backend           # Backend only
./scripts/logs.sh batch-processor   # Batch processor only
```

## 🧹 Maintenance Scripts

### `cleanup.sh`
Clean up Docker resources and temporary files.
```bash
./scripts/cleanup.sh
```

**What it does:**
- Stops all services
- Removes unused Docker images
- Cleans up volumes (with confirmation)
- Removes temporary files

### `backup-db.sh`
Backup PostgreSQL database.
```bash
./scripts/backup-db.sh [filename]
```

**What it does:**
- Creates PostgreSQL dump
- Saves to backups/ directory
- Includes timestamp in filename

### `restore-db.sh`
Restore PostgreSQL database from backup.
```bash
./scripts/restore-db.sh [backup_file]
```

**What it does:**
- Restores database from dump file
- Handles schema migration
- Verifies restoration success

## 🔧 Environment Management

### `setup-env.sh`
Interactive environment setup.
```bash
./scripts/setup-env.sh
```

**What it does:**
- Creates .env from template
- Prompts for API keys
- Tests configuration
- Validates Ollama connectivity

### `validate-config.sh`
Validate current configuration.
```bash
./scripts/validate-config.sh
```

**What it does:**
- Checks .env file completeness
- Tests API key validity
- Verifies Ollama accessibility
- Reports configuration issues

## 📊 Reporting Scripts

### `system-info.sh`
Generate system information report.
```bash
./scripts/system-info.sh
```

**What it does:**
- Docker system information
- Service resource usage
- Database statistics
- Processing metrics

### `performance-report.sh`
Generate performance report.
```bash
./scripts/performance-report.sh
```

**What it does:**
- Keyword extraction performance
- API response times
- Batch processing throughput
- Resource utilization

## 🔒 Security Scripts

### `security-scan.sh`
Run security scans on services.
```bash
./scripts/security-scan.sh
```

**What it does:**
- Scans Docker images for vulnerabilities
- Checks for exposed secrets
- Validates SSL/TLS configuration
- Reports security issues

## 📋 Usage Examples

### Complete Setup From Scratch
```bash
# 1. Setup environment
./scripts/setup-env.sh

# 2. Check Ollama
./scripts/check-ollama.sh

# 3. Start platform
./scripts/start-all.sh

# 4. Monitor batch processing
./scripts/batch-ops.sh logs
```

### Development Workflow
```bash
# 1. Start development services
./scripts/dev-start.sh

# 2. Run tests
./scripts/test-all.sh

# 3. Check health
./scripts/health-check.sh
```

### Troubleshooting
```bash
# 1. Check system health
./scripts/health-check.sh

# 2. View logs
./scripts/logs.sh

# 3. Validate configuration
./scripts/validate-config.sh

# 4. Generate system report
./scripts/system-info.sh
```

### Maintenance
```bash
# 1. Backup database
./scripts/backup-db.sh

# 2. Clean up resources
./scripts/cleanup.sh

# 3. Security scan
./scripts/security-scan.sh
```

---

💡 **Pro Tips:**
- All scripts read configuration from `.env` file
- Use `--help` flag with any script for detailed usage
- Scripts are designed to be idempotent and safe to re-run
- Log output includes timestamps and service identification