#!/bin/bash

# YourJob Platform Development Script
# This script helps with development tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Start development environment
dev_start() {
    log "Starting development environment..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker Desktop for macOS"
        echo "Visit: https://docs.docker.com/desktop/mac/install/"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker Desktop"
        exit 1
    fi
    
    # Set development build target
    export BUILD_TARGET=development
    
    # Use macOS optimized Docker Compose file
    local compose_file="docker-compose.macos.yml"
    if [ ! -f "$compose_file" ]; then
        log "Using default docker-compose.yml file"
        compose_file="docker-compose.yml"
    fi
    
    # Start essential services only for development
    docker-compose -f "$compose_file" up -d db redis
    
    log "Database and Redis are starting up..."
    log "You can now run the backend and frontend locally for development"
    log "Backend: ./gradlew bootRun (in backend directory)"
    log "BFF: ./gradlew bootRun (in bff directory)"  
    log "Frontend: npm start (in frontend directory)"
    
    success "Development environment started!"
}

# Stop development environment
dev_stop() {
    log "Stopping development environment..."
    
    # Use macOS optimized compose file if available
    local compose_file="docker-compose.macos.yml"
    if [ ! -f "$compose_file" ]; then
        compose_file="docker-compose.yml"
    fi
    
    docker-compose -f "$compose_file" down
    success "Development environment stopped"
}

# Database operations
db_reset() {
    log "Resetting database..."
    
    docker-compose stop db
    docker-compose rm -f db
    docker volume rm yourjob_mysql_data 2>/dev/null || true
    docker-compose up -d db
    
    log "Waiting for database to be ready..."
    sleep 30
    
    success "Database reset complete"
}

# Run database migrations/setup
db_setup() {
    log "Setting up database..."
    
    # Wait for DB to be ready
    while ! docker-compose exec db mysqladmin ping -h localhost --silent; do
        log "Waiting for database..."
        sleep 2
    done
    
    log "Database is ready!"
    
    # Show database connection info
    echo ""
    echo "Database connection info:"
    echo "  Host: localhost"
    echo "  Port: 3306"
    echo "  Database: yourjobdb"
    echo "  Username: urjob"
    echo "  Password: (check your .env file)"
    echo ""
}

# Backend development
backend_dev() {
    log "Starting backend development setup..."
    
    cd backend || { error "Backend directory not found"; exit 1; }
    
    # Make gradlew executable
    chmod +x ./gradlew
    
    # Check Java version for macOS compatibility
    if ! command -v java &> /dev/null; then
        error "Java is not installed. Please install Java 17+ for macOS"
        echo "Visit: https://adoptium.net/temurin/releases/"
        exit 1
    fi
    
    case ${1:-run} in
        build)
            log "Building backend..."
            ./gradlew build --no-daemon --parallel
            ;;
        test)
            log "Running backend tests..."
            ./gradlew test --no-daemon
            ;;
        run)
            log "Running backend in development mode..."
            export SPRING_PROFILES_ACTIVE=local
            ./gradlew bootRun --no-daemon
            ;;
        debug)
            log "Running backend in debug mode..."
            export SPRING_PROFILES_ACTIVE=local
            ./gradlew bootRun --debug-jvm --no-daemon
            ;;
        *)
            error "Unknown backend command: $1"
            exit 1
            ;;
    esac
}

# BFF development  
bff_dev() {
    log "Starting BFF development setup..."
    
    cd bff || { error "BFF directory not found"; exit 1; }
    
    case ${1:-run} in
        build)
            log "Building BFF..."
            ./gradlew build
            ;;
        test)
            log "Running BFF tests..."
            ./gradlew test
            ;;
        run)
            log "Running BFF in development mode..."
            ./gradlew bootRun --args='--spring.profiles.active=local'
            ;;
        *)
            error "Unknown BFF command: $1"
            exit 1
            ;;
    esac
}

# Frontend development
frontend_dev() {
    log "Starting frontend development setup..."
    
    cd frontend || { error "Frontend directory not found"; exit 1; }
    
    # Check Node.js version for macOS compatibility
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18+ for macOS"
        echo "Visit: https://nodejs.org/en/download/"
        exit 1
    fi
    
    # Check Node.js version
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        warning "Node.js version is $node_version. Recommended: 18+"
    fi
    
    case ${1:-run} in
        install)
            log "Installing frontend dependencies..."
            # Use npm ci for faster, reliable installs on macOS
            if [ -f "package-lock.json" ]; then
                npm ci
            else
                npm install
            fi
            ;;
        build)
            log "Building frontend..."
            npm run build
            ;;
        test)
            log "Running frontend tests..."
            npm test
            ;;
        run)
            log "Running frontend development server..."
            # Set environment for development
            export NODE_ENV=development
            npm start
            ;;
        lint)
            log "Linting frontend code..."
            npx eslint src --ext .js,.jsx,.ts,.tsx || warning "ESLint not configured"
            ;;
        *)
            error "Unknown frontend command: $1"
            exit 1
            ;;
    esac
}

# Generate sample data
generate_data() {
    log "Generating sample data..."
    
    # This would typically call a data generation script
    # For now, just show what would be done
    log "Sample data generation would include:"
    echo "  - Sample users (job seekers and employers)"
    echo "  - Sample job postings"
    echo "  - Sample applications"
    echo "  - Sample payments"
    echo "  - Sample crawler data"
    
    warning "Implement data generation script in the backend"
}

# Clean development environment
clean() {
    log "Cleaning development environment..."
    
    # Stop all containers
    docker-compose down --volumes --remove-orphans
    
    # Clean Docker
    docker system prune -f
    
    # Clean backend
    if [ -d "backend" ]; then
        cd backend
        ./gradlew clean || true
        cd ..
    fi
    
    # Clean BFF
    if [ -d "bff" ]; then
        cd bff
        ./gradlew clean || true
        cd ..
    fi
    
    # Clean frontend
    if [ -d "frontend" ]; then
        cd frontend
        rm -rf node_modules || true
        rm -rf build || true
        cd ..
    fi
    
    success "Development environment cleaned"
}

# Show logs for development
dev_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        docker-compose logs -f "$service"
    else
        docker-compose logs -f db redis
    fi
}

# Show help
show_help() {
    echo "YourJob Platform Development Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Environment Commands:"
    echo "  start                          Start development environment (DB + Redis)"
    echo "  stop                           Stop development environment"
    echo "  clean                          Clean all development artifacts"
    echo "  logs [service]                 Show logs for development services"
    echo ""
    echo "Database Commands:"
    echo "  db:reset                       Reset database (removes all data)"
    echo "  db:setup                       Setup database and show connection info"
    echo ""
    echo "Application Commands:"
    echo "  backend [build|test|run]       Backend development tasks"
    echo "  bff [build|test|run]          BFF development tasks"
    echo "  frontend [install|build|test|run] Frontend development tasks"
    echo ""
    echo "Data Commands:"
    echo "  data:generate                  Generate sample data for development"
    echo ""
    echo "Examples:"
    echo "  $0 start                       Start development environment"
    echo "  $0 backend run                 Run backend locally"
    echo "  $0 frontend install            Install frontend dependencies"
    echo "  $0 db:reset                    Reset database"
    echo ""
}

# Main script
main() {
    local command=${1:-start}
    
    case $command in
        start)
            dev_start
            ;;
        stop)
            dev_stop
            ;;
        clean)
            clean
            ;;
        logs)
            dev_logs $2
            ;;
        db:reset)
            db_reset
            ;;
        db:setup)
            db_setup
            ;;
        backend)
            backend_dev $2
            ;;
        bff)
            bff_dev $2
            ;;
        frontend)
            frontend_dev $2
            ;;
        data:generate)
            generate_data
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