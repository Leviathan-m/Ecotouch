#!/bin/bash

# Ecotouch Production Deployment Script
# This script handles the deployment process for production environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Ecotouch"
ENVIRONMENT=${1:-"production"}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."

    # Check if required tools are installed
    command -v node >/dev/null 2>&1 || { log_error "Node.js is required but not installed."; exit 1; }
    command -v npm >/dev/null 2>&1 || { log_error "npm is required but not installed."; exit 1; }
    command -v git >/dev/null 2>&1 || { log_error "git is required but not installed."; exit 1; }

    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 18+ is required. Current version: $(node --version)"
        exit 1
    fi

    # Check if we're in the correct directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Are you in the project root directory?"
        exit 1
    fi

    # Check if environment file exists
    if [ ! -f ".env.${ENVIRONMENT}" ]; then
        log_warning ".env.${ENVIRONMENT} not found. Make sure to create it with production values."
    fi

    log_success "Pre-deployment checks passed"
}

# Backup current state
create_backup() {
    log_info "Creating backup..."

    mkdir -p "$BACKUP_DIR"

    # Backup package-lock.json and environment files (excluding secrets)
    cp package-lock.json "$BACKUP_DIR/package-lock.json.$TIMESTAMP" 2>/dev/null || true

    log_success "Backup created in $BACKUP_DIR"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."

    # Clean npm cache
    npm cache clean --force

    # Install dependencies
    npm ci --legacy-peer-deps

    log_success "Dependencies installed"
}

# Run tests
run_tests() {
    log_info "Running tests..."

    # Run backend tests
    if [ -d "backend" ]; then
        cd backend
        npm test
        cd ..
    fi

    # Run frontend tests
    if [ -d "frontend" ]; then
        cd frontend
        npm test -- --coverage --watchAll=false
        cd ..
    fi

    log_success "Tests passed"
}

# Build application
build_application() {
    log_info "Building application..."

    # Build backend
    if [ -d "backend" ]; then
        cd backend
        npm run build
        cd ..
    fi

    # Build frontend
    if [ -d "frontend" ]; then
        cd frontend
        npm run build
        cd ..
    fi

    log_success "Application built successfully"
}

# Health check
health_check() {
    log_info "Running health checks..."

    # Start application in background for testing
    if [ -d "backend" ]; then
        cd backend
        npm start &
        SERVER_PID=$!
        cd ..

        # Wait for server to start
        sleep 10

        # Test health endpoint
        if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
            log_success "Backend health check passed"
        else
            log_error "Backend health check failed"
            kill $SERVER_PID 2>/dev/null || true
            exit 1
        fi

        # Stop test server
        kill $SERVER_PID 2>/dev/null || true
    fi
}

# Deploy to production
deploy_to_production() {
    log_info "Deploying to production..."

    # Here you would add your specific deployment commands
    # For example:
    # - Docker deployment
    # - Cloud platform deployment (Vercel, AWS, etc.)
    # - Server deployment

    case $DEPLOY_TARGET in
        "docker")
            log_info "Deploying with Docker..."
            docker compose -f docker-compose.prod.yml up -d --build
            ;;
        "vercel")
            log_info "Deploying to Vercel..."
            # Add Vercel deployment commands
            ;;
        "aws")
            log_info "Deploying to AWS..."
            # Add AWS deployment commands
            ;;
        *)
            log_warning "No deployment target specified. Manual deployment required."
            ;;
    esac

    log_success "Deployment completed"
}

# Post-deployment verification
post_deployment_verification() {
    log_info "Running post-deployment verification..."

    # Wait for deployment to be ready
    sleep 30

    # Test production endpoints
    if [ ! -z "$PRODUCTION_URL" ]; then
        if curl -f "$PRODUCTION_URL/api/health" >/dev/null 2>&1; then
            log_success "Production health check passed"
        else
            log_warning "Production health check failed - please verify manually"
        fi
    fi
}

# Main deployment process
main() {
    log_info "Starting $PROJECT_NAME deployment to $ENVIRONMENT environment"
    log_info "Timestamp: $TIMESTAMP"

    pre_deployment_checks
    create_backup
    install_dependencies
    run_tests
    build_application
    health_check
    deploy_to_production
    post_deployment_verification

    log_success "$PROJECT_NAME deployment completed successfully! 🎉"
    log_info "Deployment timestamp: $TIMESTAMP"
}

# Help function
show_help() {
    echo "Ecotouch Production Deployment Script"
    echo ""
    echo "Usage: $0 [environment] [options]"
    echo ""
    echo "Environments:"
    echo "  production    Deploy to production (default)"
    echo "  staging       Deploy to staging"
    echo ""
    echo "Options:"
    echo "  -t, --target  Deployment target (docker, vercel, aws)"
    echo "  -u, --url     Production URL for health checks"
    echo "  -h, --help    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 production -t docker"
    echo "  $0 staging -t vercel -u https://staging.ecotouch.com"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--target)
            DEPLOY_TARGET="$2"
            shift 2
            ;;
        -u|--url)
            PRODUCTION_URL="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            ENVIRONMENT="$1"
            shift
            ;;
    esac
done

# Run main function
main
