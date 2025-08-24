#!/bin/bash

# YourJob Platform macOS 환경 설정 스크립트
# 필수 소프트웨어 설치 및 환경 구성

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

# Check if Homebrew is installed
check_homebrew() {
    if ! command -v brew &> /dev/null; then
        log "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH for Apple Silicon Macs
        if [[ $(uname -m) == "arm64" ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
    else
        success "Homebrew is already installed"
    fi
}

# Install Docker Desktop
install_docker() {
    if ! command -v docker &> /dev/null; then
        log "Installing Docker Desktop for Mac..."
        brew install --cask docker
        
        warning "Please start Docker Desktop from Applications folder"
        warning "You may need to grant permissions and restart this script"
        
        # Wait for user to start Docker
        read -p "Press Enter after starting Docker Desktop..."
        
        # Wait for Docker to start
        log "Waiting for Docker to start..."
        while ! docker info &> /dev/null; do
            sleep 2
            echo -n "."
        done
        echo ""
        success "Docker is now running"
    else
        if docker info &> /dev/null; then
            success "Docker is already installed and running"
        else
            warning "Docker is installed but not running. Please start Docker Desktop"
            exit 1
        fi
    fi
}

# Install Node.js
install_nodejs() {
    if ! command -v node &> /dev/null; then
        log "Installing Node.js..."
        brew install node@18
        
        # Link Node.js if needed
        brew link --force node@18
    else
        local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -lt 18 ]; then
            log "Upgrading Node.js to version 18..."
            brew install node@18
            brew link --force node@18
        else
            success "Node.js $(node -v) is already installed"
        fi
    fi
}

# Install Java 17
install_java() {
    if ! command -v java &> /dev/null; then
        log "Installing Java 17..."
        brew install --cask temurin17
    else
        local java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
        if [ "$java_version" -lt 17 ]; then
            log "Upgrading Java to version 17..."
            brew install --cask temurin17
        else
            success "Java $(java -version 2>&1 | head -n 1) is already installed"
        fi
    fi
}

# Install additional tools
install_tools() {
    log "Installing additional development tools..."
    
    # Git (usually pre-installed on macOS)
    if ! command -v git &> /dev/null; then
        brew install git
    fi
    
    # curl (usually pre-installed on macOS)
    if ! command -v curl &> /dev/null; then
        brew install curl
    fi
    
    # MySQL client (optional)
    if ! command -v mysql &> /dev/null; then
        log "Installing MySQL client..."
        brew install mysql-client
    fi
    
    success "Additional tools installed"
}

# Setup project environment
setup_project() {
    log "Setting up project environment..."
    
    # Make scripts executable
    chmod +x dev.sh deploy.macos.sh
    
    # Copy environment files
    if [ ! -f .env ]; then
        log "Creating .env file..."
        cp .env.complete .env
        success ".env file created from .env.complete"
    fi
    
    if [ ! -f frontend/.env ]; then
        log "Creating frontend .env file..."
        cp frontend/.env.macos frontend/.env
        success "Frontend .env file created"
    fi
    
    # Create necessary directories
    mkdir -p logs/nginx logs/backend logs/bff
    mkdir -p ssl
    
    success "Project environment setup complete"
}

# Configure Docker Desktop settings
configure_docker() {
    log "Configuring Docker Desktop for optimal performance..."
    
    # Get system memory
    local total_memory=$(sysctl -n hw.memsize)
    local memory_gb=$((total_memory / 1024 / 1024 / 1024))
    
    warning "Please configure Docker Desktop with the following settings:"
    echo "  Resources -> Memory: $((memory_gb > 16 ? 8 : 4))GB"
    echo "  Resources -> CPUs: 4 cores (if available)"
    echo "  Resources -> Swap: 1GB"
    echo "  Resources -> Disk image size: 100GB"
    
    if [[ $(uname -m) == "arm64" ]]; then
        echo "  General -> Use VirtioFS: ✅"
        echo "  General -> Use Rosetta for x86/amd64 emulation: ✅"
    fi
    
    warning "Access these settings via Docker Desktop > Preferences > Resources"
}

# Verify installation
verify_installation() {
    log "Verifying installation..."
    
    # Check Docker
    if docker --version &> /dev/null && docker info &> /dev/null; then
        success "✅ Docker: $(docker --version)"
    else
        error "❌ Docker is not working properly"
        return 1
    fi
    
    # Check Node.js
    if node --version &> /dev/null; then
        success "✅ Node.js: $(node --version)"
    else
        error "❌ Node.js is not working properly"
        return 1
    fi
    
    # Check npm
    if npm --version &> /dev/null; then
        success "✅ npm: $(npm --version)"
    else
        error "❌ npm is not working properly"
        return 1
    fi
    
    # Check Java
    if java --version &> /dev/null; then
        success "✅ Java: $(java --version | head -n 1)"
    else
        error "❌ Java is not working properly"
        return 1
    fi
    
    success "All tools are installed and working correctly!"
}

# Show next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. 🔧 Configure your environment variables:"
    echo "   vim .env"
    echo ""
    echo "2. 🚀 Start development environment:"
    echo "   ./dev.sh start"
    echo ""
    echo "3. 🌐 Or deploy the complete application:"
    echo "   ./deploy.macos.sh deploy development"
    echo ""
    echo "4. 📊 Check service health:"
    echo "   ./deploy.macos.sh health"
    echo ""
    echo "5. 📖 Read the complete guide:"
    echo "   cat MACOS_DEPLOYMENT_GUIDE.md"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Main installation process
main() {
    echo "🍎 YourJob Platform - macOS Setup Script"
    echo "========================================"
    echo ""
    
    # System info
    log "System Information:"
    echo "  macOS Version: $(sw_vers -productVersion)"
    echo "  Architecture: $(uname -m)"
    echo "  Available Memory: $(($(sysctl -n hw.memsize) / 1024 / 1024 / 1024))GB"
    echo ""
    
    # Check prerequisites and install
    check_homebrew
    install_docker
    install_nodejs
    install_java
    install_tools
    setup_project
    configure_docker
    
    # Verify everything works
    if verify_installation; then
        show_next_steps
    else
        error "Installation completed with errors. Please check the output above."
        exit 1
    fi
}

# Check if script is run with arguments
case ${1:-install} in
    install)
        main
        ;;
    verify)
        verify_installation
        ;;
    help|--help|-h)
        echo "YourJob Platform macOS Setup Script"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  install  Complete installation (default)"
        echo "  verify   Verify current installation"
        echo "  help     Show this help message"
        ;;
    *)
        error "Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac