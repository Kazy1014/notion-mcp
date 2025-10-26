#!/bin/bash

# Notion MCP Server Docker Build Script
# This script builds and optionally pushes the Docker image

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_section() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
print_info "Building version: $VERSION"

# Default values
IMAGE_NAME="notion-mcp"
REGISTRY_USERNAME=${DOCKER_USERNAME:-""}
PLATFORMS="linux/amd64,linux/arm64"

# Parse arguments
PUSH=false
MULTI_PLATFORM=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --push)
            PUSH=true
            shift
            ;;
        --multi-platform)
            MULTI_PLATFORM=true
            shift
            ;;
        --username)
            REGISTRY_USERNAME="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --push              Push image to Docker Hub after building"
            echo "  --multi-platform    Build for multiple platforms (amd64, arm64)"
            echo "  --username USERNAME Docker Hub username"
            echo "  --help              Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Build the image
print_section "Building Docker Image"

if [ "$MULTI_PLATFORM" = true ]; then
    print_info "Building multi-platform image..."
    
    # Check if buildx is available
    if ! docker buildx version &> /dev/null; then
        print_error "Docker Buildx is not available. Please update Docker."
        exit 1
    fi
    
    # Create builder if it doesn't exist
    if ! docker buildx inspect multiarch-builder &> /dev/null; then
        print_info "Creating multi-platform builder..."
        docker buildx create --name multiarch-builder --use
        docker buildx inspect --bootstrap
    else
        docker buildx use multiarch-builder
    fi
    
    BUILD_CMD="docker buildx build --platform $PLATFORMS"
    
    if [ "$PUSH" = true ]; then
        BUILD_CMD="$BUILD_CMD --push"
    else
        BUILD_CMD="$BUILD_CMD --load"
    fi
else
    BUILD_CMD="docker build"
fi

# Build with tags
TAGS="-t $IMAGE_NAME:latest -t $IMAGE_NAME:$VERSION"

if [ -n "$REGISTRY_USERNAME" ]; then
    TAGS="$TAGS -t $REGISTRY_USERNAME/$IMAGE_NAME:latest -t $REGISTRY_USERNAME/$IMAGE_NAME:$VERSION"
fi

print_info "Building with tags: $TAGS"

eval "$BUILD_CMD $TAGS ."

if [ $? -eq 0 ]; then
    print_info "Build successful!"
else
    print_error "Build failed!"
    exit 1
fi

# Push if requested and not multi-platform (multi-platform pushes automatically)
if [ "$PUSH" = true ] && [ "$MULTI_PLATFORM" = false ]; then
    if [ -z "$REGISTRY_USERNAME" ]; then
        print_error "Registry username is required for pushing. Use --username option."
        exit 1
    fi
    
    print_section "Pushing to Docker Hub"
    
    # Check if logged in to Docker Hub
    if ! docker info | grep -q "Username"; then
        print_warning "Not logged in to Docker Hub. Logging in..."
        docker login
    fi
    
    print_info "Pushing $REGISTRY_USERNAME/$IMAGE_NAME:latest..."
    docker push "$REGISTRY_USERNAME/$IMAGE_NAME:latest"
    
    print_info "Pushing $REGISTRY_USERNAME/$IMAGE_NAME:$VERSION..."
    docker push "$REGISTRY_USERNAME/$IMAGE_NAME:$VERSION"
    
    print_info "Push successful!"
fi

print_section "Build Summary"
echo "Image Name: $IMAGE_NAME"
echo "Version: $VERSION"
echo "Multi-platform: $MULTI_PLATFORM"
echo "Pushed: $PUSH"

if [ "$PUSH" = false ]; then
    echo ""
    print_info "To push the image, run:"
    echo "  docker login"
    echo "  docker push $REGISTRY_USERNAME/$IMAGE_NAME:latest"
    echo "  docker push $REGISTRY_USERNAME/$IMAGE_NAME:$VERSION"
    echo ""
    print_info "Or run this script with --push --username kazuyaoda"
fi

print_section "Next Steps"
echo "Run the server:"
echo "  docker run -it -e NOTION_API_KEY=your_key $IMAGE_NAME:latest"
echo ""
echo "Or use the convenience script:"
echo "  ./scripts/docker-run.sh"

