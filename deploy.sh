#!/bin/bash

# YourJob Platform Deployment Script
# This script deploys the entire YourJob platform using Docker Compose

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
DOCKER_COMPOSE_FILE="docker-compose.yml"

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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Setup environment
setup_environment() {
    log "Setting up environment..."
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f "${ENV_FILE}.example" ]; then
            log "Creating .env file from .env.example..."
            cp "${ENV_FILE}.example" "$ENV_FILE"
            warning "Please review and update the .env file with your configuration"
        else
            error ".env file not found and no .env.example available"
            exit 1
        fi
    fi
    
    success "Environment setup complete"
}

# Build and deploy
deploy() {
    local environment=${1:-production}
    
    log "Deploying YourJob platform (environment: $environment)..."
    
    # Set build target based on environment
    export BUILD_TARGET=$environment
    
    # Pull latest images for external services
    log "Pulling external service images..."
    docker-compose pull db redis prometheus grafana elasticsearch logstash kibana || warning "Some images might not be available"
    
    # Build application images
    log "Building application images..."
    docker-compose build --parallel backend bff frontend || {
        error "Failed to build application images"
        exit 1
    }
    
    # Start the platform
    log "Starting YourJob platform..."
    docker-compose up -d || {
        error "Failed to start the platform"
        exit 1
    }
    
    success "YourJob platform deployed successfully!"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    local services=("db:3306" "redis:6379" "backend:8082" "bff:8081" "frontend:80")
    local failed_services=()
    
    for service in "${services[@]}"; do
        local name=$(echo $service | cut -d: -f1)
        local port=$(echo $service | cut -d: -f2)
        
        log "Checking $name service..."
        
        # Wait for service to be ready (max 60 seconds)
        local count=0
        while ! docker-compose exec -T $name sh -c "nc -z localhost $port" 2>/dev/null; do
            if [ $count -ge 60 ]; then
                failed_services+=($name)
                break
            fi
            sleep 1
            ((count++))
        done
        
        if [[ ! " ${failed_services[@]} " =~ " ${name} " ]]; then
            success "$name service is healthy"
        fi
    done
    
    if [ ${#failed_services[@]} -eq 0 ]; then
        success "All services are healthy!"
        
        log "Service URLs:"
        echo "  Frontend: http://localhost"
        echo "  Backend API: http://localhost/api"
        echo "  BFF: http://localhost/bff"
        echo "  Grafana: http://localhost:3001 (admin/admin)"
        echo "  Prometheus: http://localhost:9090"
        echo "  Kibana: http://localhost:5601"
    else
        error "Failed services: ${failed_services[*]}"
        exit 1
    fi
}

# Stop platform
stop() {
    log "Stopping YourJob platform..."
    docker-compose down
    success "Platform stopped"
}

# Clean up
cleanup() {
    log "Cleaning up YourJob platform..."
    docker-compose down --volumes --remove-orphans
    docker system prune -f
    success "Cleanup complete"
}

# Show logs
logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        docker-compose logs -f "$service"
    else
        docker-compose logs -f
    fi
}

# Show help
show_help() {
    echo "YourJob Platform Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy [production|development]  Deploy the platform (default: production)"
    echo "  health                          Check service health"
    echo "  stop                           Stop the platform"
    echo "  cleanup                        Stop and remove all containers and volumes"
    echo "  logs [service]                 Show logs (all services or specific service)"
    echo "  help                           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy production           Deploy in production mode"
    echo "  $0 deploy development          Deploy in development mode"
    echo "  $0 health                      Check service health"
    echo "  $0 logs backend                Show backend logs"
    echo ""
}

# Main script
main() {
    local command=${1:-deploy}
    
    case $command in
        deploy)
            check_prerequisites
            setup_environment
            deploy ${2:-production}
            sleep 30  # Wait for services to start
            health_check
            ;;
        health)
            health_check
            ;;
        stop)
            stop
            ;;
        cleanup)
            cleanup
            ;;
        logs)
            logs $2
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