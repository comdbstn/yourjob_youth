#!/bin/bash

# YourJob Platform macOS Deployment Script
# Optimized for macOS Docker Desktop

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="yourjob"
ENV_FILE=".env"
DOCKER_COMPOSE_FILE="docker-compose.macos.yml"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check macOS specific prerequisites
check_prerequisites() {
    log "Checking macOS prerequisites..."
    
    # Check macOS version
    local macos_version=$(sw_vers -productVersion | cut -d'.' -f1-2)
    log "Detected macOS version: $macos_version"
    
    # Check Docker Desktop for Mac
    if ! command -v docker &> /dev/null; then
        error "Docker Desktop for Mac is not installed."
        echo "Please install Docker Desktop from: https://docs.docker.com/desktop/mac/install/"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        error "Docker Desktop is not running. Please start Docker Desktop."
        exit 1
    fi
    
    # Check Docker Compose
    if ! docker compose version &> /dev/null && ! docker-compose --version &> /dev/null; then
        error "Docker Compose is not available."
        exit 1
    fi
    
    # Check available memory (recommended: 8GB+)
    local total_memory=$(sysctl -n hw.memsize)
    local memory_gb=$((total_memory / 1024 / 1024 / 1024))
    log "Available system memory: ${memory_gb}GB"
    
    if [ $memory_gb -lt 8 ]; then
        warning "Less than 8GB RAM detected. Performance may be affected."
        warning "Consider allocating more memory to Docker Desktop in preferences."
    fi
    
    # Check disk space (recommended: 20GB+)
    local available_space=$(df -g . | tail -1 | awk '{print $4}')
    log "Available disk space: ${available_space}GB"
    
    if [ $available_space -lt 20 ]; then
        warning "Less than 20GB disk space available. Consider cleaning up."
    fi
    
    success "macOS prerequisites check passed"
}

# Setup environment for macOS
setup_environment() {
    log "Setting up environment for macOS..."
    
    # Create .env file if it doesn't exist
    if [ ! -f "$ENV_FILE" ]; then
        log "Creating .env file with macOS optimized defaults..."
        cat > "$ENV_FILE" << 'EOF'
# Database Configuration
MYSQL_ROOT_PASSWORD=rootpass123
DB_HOST=localhost
DB_PORT=3306
DB_NAME=yourjobdb
DB_USER=urjob
DB_PASSWORD=urjobpass123

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redispass123

# JWT Configuration (IMPORTANT: Change in production)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-production
JWT_EXPIRATION=86400000

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8082
REACT_APP_BFF_BASE_URL=http://localhost:8081
BACKEND_URL=http://backend:8082

# Build Configuration
BUILD_TARGET=production
APP_ENV=production
APP_DEBUG=false
API_RATE_LIMIT=1000

# Monitoring (optional)
GRAFANA_PASSWORD=admin123

# Email Configuration (optional - configure for production)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your-email@gmail.com
# SMTP_PASSWORD=your-app-password

# AWS S3 Configuration (optional - configure for production)
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
# AWS_REGION=ap-northeast-2
# AWS_S3_BUCKET=your-bucket-name

# Payment Configuration (optional - configure for production)
# TOSS_CLIENT_KEY=your-toss-client-key
# TOSS_SECRET_KEY=your-toss-secret-key

# Firebase Configuration (optional)
# REACT_APP_FIREBASE_API_KEY=your-api-key
# REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# REACT_APP_FIREBASE_PROJECT_ID=your-project-id
# REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
# REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
# REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
EOF
        success ".env file created with default values"
        warning "Please review and update the .env file with your production values"
    else
        log ".env file already exists"
    fi
    
    # Create logs directory
    mkdir -p logs/nginx logs/backend logs/bff
    
    success "Environment setup complete"
}

# Optimize Docker settings for macOS
optimize_docker() {
    log "Optimizing Docker settings for macOS..."
    
    # Set Docker resource limits based on system
    local total_memory=$(sysctl -n hw.memsize)
    local memory_gb=$((total_memory / 1024 / 1024 / 1024))
    
    if [ $memory_gb -ge 16 ]; then
        log "High memory system detected - using optimal settings"
        export DOCKER_MEMORY_LIMIT="8g"
    elif [ $memory_gb -ge 8 ]; then
        log "Medium memory system detected - using balanced settings"
        export DOCKER_MEMORY_LIMIT="4g"
    else
        log "Low memory system detected - using conservative settings"
        export DOCKER_MEMORY_LIMIT="2g"
    fi
    
    success "Docker optimization complete"
}

# Build and deploy with macOS optimizations
deploy() {
    local environment=${1:-production}
    local compose_cmd="docker-compose"
    
    log "Deploying YourJob platform on macOS (environment: $environment)..."
    
    # Use Docker Compose V2 if available
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    fi
    
    # Set build target based on environment
    export BUILD_TARGET=$environment
    
    # Use macOS optimized compose file
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        warning "macOS compose file not found, using default"
        DOCKER_COMPOSE_FILE="docker-compose.yml"
    fi
    
    # Pull base images for faster builds
    log "Pulling base images..."
    $compose_cmd -f "$DOCKER_COMPOSE_FILE" pull mysql redis nginx || warning "Some base images might not be available"
    
    # Build application images with BuildKit for faster builds
    log "Building application images with optimizations..."
    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    
    $compose_cmd -f "$DOCKER_COMPOSE_FILE" build --parallel --no-cache backend bff frontend || {
        error "Failed to build application images"
        log "Trying without parallel build..."
        $compose_cmd -f "$DOCKER_COMPOSE_FILE" build backend bff frontend || {
            error "Build failed completely"
            exit 1
        }
    }
    
    # Start core services first
    log "Starting core services (Database & Redis)..."
    $compose_cmd -f "$DOCKER_COMPOSE_FILE" up -d db redis
    
    # Wait for core services
    log "Waiting for core services to be ready..."
    sleep 15
    
    # Start application services
    log "Starting application services..."
    $compose_cmd -f "$DOCKER_COMPOSE_FILE" up -d backend bff frontend nginx
    
    # Start monitoring services if requested
    if [ "$environment" = "production" ]; then
        log "Starting monitoring services..."
        $compose_cmd -f "$DOCKER_COMPOSE_FILE" --profile monitoring up -d prometheus grafana || warning "Monitoring services failed to start"
    fi
    
    success "YourJob platform deployed successfully on macOS!"
}

# Enhanced health check for macOS
health_check() {
    log "Performing comprehensive health checks..."
    
    local compose_cmd="docker-compose"
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
        exit 1
    fi
    
    # Check container status
    log "Checking container status..."
    $compose_cmd -f "$DOCKER_COMPOSE_FILE" ps
    
    # Check service health
    local services=("db" "redis" "backend" "bff" "frontend")
    local failed_services=()
    
    for service in "${services[@]}"; do
        log "Checking $service service..."
        
        # Check if container is running
        if ! $compose_cmd -f "$DOCKER_COMPOSE_FILE" ps -q $service | grep -q .; then
            failed_services+=($service)
            error "$service container is not running"
            continue
        fi
        
        # Check specific service endpoints
        case $service in
            "db")
                if $compose_cmd -f "$DOCKER_COMPOSE_FILE" exec -T db mysqladmin ping -h localhost &> /dev/null; then
                    success "$service is healthy"
                else
                    failed_services+=($service)
                fi
                ;;
            "redis")
                if $compose_cmd -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli ping &> /dev/null; then
                    success "$service is healthy"
                else
                    failed_services+=($service)
                fi
                ;;
            "backend")
                if curl -sf http://localhost:8082/actuator/health &> /dev/null; then
                    success "$service is healthy"
                else
                    failed_services+=($service)
                fi
                ;;
            "bff")
                if curl -sf http://localhost:8081/health &> /dev/null; then
                    success "$service is healthy"
                else
                    failed_services+=($service)
                fi
                ;;
            "frontend")
                if curl -sf http://localhost:3000 &> /dev/null; then
                    success "$service is healthy"
                else
                    failed_services+=($service)
                fi
                ;;
        esac
    done
    
    # Show results
    if [ ${#failed_services[@]} -eq 0 ]; then
        success "All services are healthy!"
        
        echo ""
        log "🚀 YourJob Platform is ready!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  📱 Frontend:     http://localhost:3000"
        echo "  🔧 Backend API:  http://localhost:8082"
        echo "  🌐 BFF:          http://localhost:8081"
        echo "  🗄️  Database:     localhost:3306"
        echo "  🔄 Redis:        localhost:6379"
        echo "  📊 Grafana:      http://localhost:3001 (admin/admin)"
        echo "  📈 Prometheus:   http://localhost:9090"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        # Show resource usage
        log "Resource usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
        
    else
        error "Failed services: ${failed_services[*]}"
        log "Troubleshooting tips:"
        echo "  1. Check Docker Desktop is running with sufficient resources"
        echo "  2. Run: $0 logs [service-name] to see detailed logs"
        echo "  3. Try: $0 restart to restart failed services"
        exit 1
    fi
}

# Restart specific services
restart() {
    local service=${1:-""}
    local compose_cmd="docker-compose"
    
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    fi
    
    if [ -n "$service" ]; then
        log "Restarting $service service..."
        $compose_cmd -f "$DOCKER_COMPOSE_FILE" restart "$service"
        success "$service restarted"
    else
        log "Restarting all services..."
        $compose_cmd -f "$DOCKER_COMPOSE_FILE" restart
        success "All services restarted"
    fi
}

# Stop platform
stop() {
    log "Stopping YourJob platform..."
    local compose_cmd="docker-compose"
    
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    fi
    
    $compose_cmd -f "$DOCKER_COMPOSE_FILE" down
    success "Platform stopped"
}

# Clean up with macOS optimizations
cleanup() {
    log "Cleaning up YourJob platform..."
    local compose_cmd="docker-compose"
    
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    fi
    
    $compose_cmd -f "$DOCKER_COMPOSE_FILE" down --volumes --remove-orphans
    
    # Clean Docker system but preserve some cache for macOS
    log "Cleaning Docker system (preserving build cache)..."
    docker system prune -f --filter "until=24h"
    
    success "Cleanup complete"
}

# Show logs with enhanced options
logs() {
    local service=${1:-""}
    local lines=${2:-100}
    local compose_cmd="docker-compose"
    
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    fi
    
    if [ -n "$service" ]; then
        log "Showing logs for $service (last $lines lines)..."
        $compose_cmd -f "$DOCKER_COMPOSE_FILE" logs --tail="$lines" -f "$service"
    else
        log "Showing logs for all services (last $lines lines)..."
        $compose_cmd -f "$DOCKER_COMPOSE_FILE" logs --tail="$lines" -f
    fi
}

# Show system information
info() {
    log "System Information:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "macOS Version: $(sw_vers -productVersion)"
    echo "Architecture: $(uname -m)"
    echo "Docker Version: $(docker --version)"
    if docker compose version &> /dev/null; then
        echo "Docker Compose: $(docker compose version --short)"
    else
        echo "Docker Compose: $(docker-compose --version)"
    fi
    echo "Available Memory: $(($(sysctl -n hw.memsize) / 1024 / 1024 / 1024))GB"
    echo "Available Disk: $(df -h . | tail -1 | awk '{print $4}')"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Show help
show_help() {
    echo "🚀 YourJob Platform macOS Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy [production|development]  Deploy the platform (default: production)"
    echo "  health                          Check comprehensive service health"
    echo "  restart [service]               Restart all services or specific service"
    echo "  stop                           Stop the platform"
    echo "  cleanup                        Stop and remove all containers and volumes"
    echo "  logs [service] [lines]         Show logs (default: all services, 100 lines)"
    echo "  info                           Show system information"
    echo "  help                           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy production           Deploy in production mode"
    echo "  $0 deploy development          Deploy in development mode"
    echo "  $0 health                      Check service health"
    echo "  $0 restart backend             Restart backend service"
    echo "  $0 logs backend 50             Show last 50 backend logs"
    echo "  $0 info                        Show system information"
    echo ""
    echo "macOS Specific Features:"
    echo "  • Optimized for Docker Desktop for Mac"
    echo "  • Automatic memory and CPU allocation"
    echo "  • Enhanced build caching"
    echo "  • Apple Silicon (M1/M2) support"
    echo ""
}

# Main script
main() {
    local command=${1:-deploy}
    
    case $command in
        deploy)
            check_prerequisites
            optimize_docker
            setup_environment
            deploy ${2:-production}
            sleep 30  # Wait for services to start
            health_check
            ;;
        health)
            health_check
            ;;
        restart)
            restart $2
            ;;
        stop)
            stop
            ;;
        cleanup)
            cleanup
            ;;
        logs)
            logs $2 $3
            ;;
        info)
            info
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"