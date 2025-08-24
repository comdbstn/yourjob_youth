#!/bin/bash

# YourJob Platform macOS 배포 검증 스크립트
# 프로젝트가 완벽하게 배포 가능한 상태인지 확인

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

check_title() {
    echo ""
    echo -e "${CYAN}━━━ $1 ━━━${NC}"
}

# Check function with pass/fail tracking
check() {
    local description="$1"
    local command="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if eval "$command" &>/dev/null; then
        echo -e "✅ $description"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "❌ $description"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Check system requirements
check_system() {
    check_title "시스템 요구사항 확인"
    
    # macOS version
    local macos_version=$(sw_vers -productVersion | cut -d'.' -f1-2)
    if [[ $(echo "$macos_version >= 11.0" | bc -l) -eq 1 ]] 2>/dev/null; then
        echo "✅ macOS $macos_version (요구사항: 11.0+)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo "❌ macOS $macos_version (요구사항: 11.0+)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    # Architecture
    local arch=$(uname -m)
    echo "ℹ️  Architecture: $arch"
    
    # Memory
    local memory_gb=$(($(sysctl -n hw.memsize) / 1024 / 1024 / 1024))
    if [ $memory_gb -ge 8 ]; then
        echo "✅ Memory: ${memory_gb}GB (요구사항: 8GB+)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo "❌ Memory: ${memory_gb}GB (요구사항: 8GB+)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    # Disk space
    local disk_space=$(df -g . | tail -1 | awk '{print $4}')
    if [ $disk_space -ge 20 ]; then
        echo "✅ Disk Space: ${disk_space}GB (요구사항: 20GB+)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo "❌ Disk Space: ${disk_space}GB (요구사항: 20GB+)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
}

# Check required software
check_software() {
    check_title "필수 소프트웨어 확인"
    
    check "Docker 설치" "command -v docker"
    check "Docker 실행" "docker info"
    check "Docker Compose 사용 가능" "docker compose version || docker-compose --version"
    check "Node.js 설치" "command -v node"
    check "Node.js 버전 (18+)" "[[ \$(node -v | cut -d'v' -f2 | cut -d'.' -f1) -ge 18 ]]"
    check "npm 설치" "command -v npm"
    check "Java 설치" "command -v java"
    check "Java 버전 (17+)" "java -version 2>&1 | grep -E '(17|18|19|20|21)'"
    check "Git 설치" "command -v git"
    check "curl 설치" "command -v curl"
}

# Check project structure
check_project_structure() {
    check_title "프로젝트 구조 확인"
    
    check "backend 디렉토리 존재" "[ -d backend ]"
    check "bff 디렉토리 존재" "[ -d bff ]"
    check "frontend 디렉토리 존재" "[ -d frontend ]"
    check "docker 디렉토리 존재" "[ -d docker ]"
    check "backend Dockerfile 존재" "[ -f backend/Dockerfile ]"
    check "bff Dockerfile 존재" "[ -f bff/Dockerfile ]"
    check "frontend Dockerfile 존재" "[ -f frontend/Dockerfile ]"
    check "backend gradlew 실행 가능" "[ -x backend/gradlew ]"
    check "bff gradlew 실행 가능" "[ -x bff/gradlew ]"
    check "frontend package.json 존재" "[ -f frontend/package.json ]"
}

# Check configuration files
check_configuration() {
    check_title "설정 파일 확인"
    
    check "Docker Compose (기본)" "[ -f docker-compose.yml ]"
    check "Docker Compose (macOS)" "[ -f docker-compose.macos.yml ]"
    check "환경 변수 템플릿" "[ -f .env.example ]"
    check "macOS 환경 변수" "[ -f .env.macos ]"
    check "완전한 환경 변수" "[ -f .env.complete ]"
    check "Frontend 환경 변수 (macOS)" "[ -f frontend/.env.macos ]"
    check "Backend application.yml" "[ -f backend/src/main/resources/application.yml ]"
    check "Backend application-local.yml" "[ -f backend/src/main/resources/application-local.yml ]"
    check "BFF application.yml" "[ -f bff/src/main/resources/application.yml ]"
    check "Nginx 설정" "[ -f docker/nginx/nginx.conf ] || [ -f frontend/nginx.conf ]"
}

# Check scripts
check_scripts() {
    check_title "스크립트 확인"
    
    check "dev.sh 존재" "[ -f dev.sh ]"
    check "dev.sh 실행 가능" "[ -x dev.sh ]"
    check "deploy.macos.sh 존재" "[ -f deploy.macos.sh ]"
    check "deploy.macos.sh 실행 가능" "[ -x deploy.macos.sh ]"
    check "setup.macos.sh 존재" "[ -f setup.macos.sh ]"
    check "setup.macos.sh 실행 가능" "[ -x setup.macos.sh ]"
    check "dev.sh help 동작" "./dev.sh help"
    check "deploy.macos.sh help 동작" "./deploy.macos.sh help"
}

# Check environment variables
check_environment() {
    check_title "환경 변수 설정 확인"
    
    if [ -f .env ]; then
        echo "✅ .env 파일 존재"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        
        # Check critical environment variables
        check "DB_HOST 설정" "grep -q '^DB_HOST=' .env"
        check "DB_NAME 설정" "grep -q '^DB_NAME=' .env"
        check "DB_USER 설정" "grep -q '^DB_USER=' .env"
        check "DB_PASSWORD 설정" "grep -q '^DB_PASSWORD=' .env"
        check "JWT_SECRET 설정" "grep -q '^JWT_SECRET=' .env"
        check "REACT_APP_API_BASE_URL 설정" "grep -q '^REACT_APP_API_BASE_URL=' .env"
        
    else
        echo "❌ .env 파일 없음"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        warning "다음 명령으로 생성하세요: cp .env.complete .env"
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -f frontend/.env ]; then
        echo "✅ frontend/.env 파일 존재"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo "❌ frontend/.env 파일 없음"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        warning "다음 명령으로 생성하세요: cp frontend/.env.macos frontend/.env"
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
}

# Check documentation
check_documentation() {
    check_title "문서 확인"
    
    check "README.md" "[ -f README.md ]"
    check "macOS 배포 가이드" "[ -f MACOS_DEPLOYMENT_GUIDE.md ]"
    check "빠른 시작 가이드" "[ -f QUICK_START_MACOS.md ]"
    check "배포 체크리스트" "[ -f DEPLOYMENT_CHECKLIST.md ]"
}

# Check dependencies (if possible)
check_dependencies() {
    check_title "의존성 확인"
    
    if [ -d frontend/node_modules ]; then
        echo "✅ Frontend dependencies 설치됨"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo "⚠️  Frontend dependencies 미설치"
        echo "   설치 방법: cd frontend && npm install"
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    # Check critical Docker images availability
    check "MySQL 이미지 사용 가능" "docker pull mysql:8.0 --quiet"
    check "Redis 이미지 사용 가능" "docker pull redis:7-alpine --quiet"
    check "Nginx 이미지 사용 가능" "docker pull nginx:alpine --quiet"
}

# Security check
check_security() {
    check_title "보안 설정 확인"
    
    if [ -f .env ]; then
        # Check for default/weak passwords
        if grep -q "password.*123\|password.*test\|password.*admin" .env; then
            echo "⚠️  기본 패스워드 발견 - 운영 환경에서는 변경 필요"
        else
            echo "✅ 기본 패스워드 사용하지 않음"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        fi
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        
        # Check JWT secret strength
        local jwt_secret=$(grep "^JWT_SECRET=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        if [ ${#jwt_secret} -ge 32 ]; then
            echo "✅ JWT 시크릿 길이 충분 (${#jwt_secret} 문자)"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            echo "⚠️  JWT 시크릿이 너무 짧음 (${#jwt_secret} 문자, 권장: 32+)"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    fi
}

# Generate deployment readiness report
generate_report() {
    check_title "배포 준비 상태 리포트"
    
    local success_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    
    echo "📊 검증 결과:"
    echo "   총 검사 항목: $TOTAL_CHECKS"
    echo "   성공: $PASSED_CHECKS"
    echo "   실패: $FAILED_CHECKS"
    echo "   성공률: $success_rate%"
    echo ""
    
    if [ $success_rate -ge 90 ]; then
        success "🎉 배포 준비 완료! 모든 시스템이 정상입니다."
        echo ""
        echo "다음 단계:"
        echo "  1. 환경 변수 최종 점검: vim .env"
        echo "  2. 개발 환경 시작: ./dev.sh start"
        echo "  3. 또는 전체 배포: ./deploy.macos.sh deploy development"
        echo ""
        return 0
        
    elif [ $success_rate -ge 70 ]; then
        warning "⚠️  배포 가능하지만 일부 개선 필요 ($success_rate% 완료)"
        echo ""
        echo "권장 사항:"
        echo "  - 실패한 항목들을 확인하고 수정하세요"
        echo "  - 기본 패스워드를 보안이 강화된 값으로 변경하세요"
        echo ""
        return 0
        
    else
        error "❌ 배포 준비 미완료 ($success_rate% 완료)"
        echo ""
        echo "필수 수정 사항:"
        echo "  - 실패한 항목들을 모두 수정해야 합니다"
        echo "  - 필수 소프트웨어를 설치하세요: ./setup.macos.sh"
        echo "  - 환경 변수를 설정하세요: cp .env.complete .env"
        echo ""
        return 1
    fi
}

# Show usage
show_help() {
    echo "YourJob Platform macOS 배포 검증 스크립트"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  all       전체 검증 수행 (기본값)"
    echo "  system    시스템 요구사항만 확인"
    echo "  software  필수 소프트웨어만 확인"
    echo "  project   프로젝트 구조만 확인"
    echo "  config    설정 파일만 확인"
    echo "  security  보안 설정만 확인"
    echo "  help      도움말 표시"
    echo ""
}

# Main verification process
main() {
    echo "🔍 YourJob Platform macOS 배포 검증"
    echo "======================================"
    echo ""
    
    case ${1:-all} in
        all)
            check_system
            check_software
            check_project_structure
            check_configuration
            check_scripts
            check_environment
            check_documentation
            check_dependencies
            check_security
            generate_report
            ;;
        system)
            check_system
            ;;
        software)
            check_software
            ;;
        project)
            check_project_structure
            ;;
        config)
            check_configuration
            check_environment
            ;;
        security)
            check_security
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run the verification
main "$@"