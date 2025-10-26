#!/bin/bash

# Notion MCP Server Docker Run Script
# This script simplifies running the Notion MCP Server in Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="notion-mcp:latest"
CONTAINER_NAME="notion-mcp-server"

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if NOTION_API_KEY is set
if [ -z "$NOTION_API_KEY" ]; then
    print_error "NOTION_API_KEY environment variable is not set."
    echo "Usage: export NOTION_API_KEY=your_api_key"
    echo "       $0"
    exit 1
fi

print_info "Starting Notion MCP Server..."

# Check if image exists
if ! docker image inspect $IMAGE_NAME &> /dev/null; then
    print_warning "Image $IMAGE_NAME not found locally."
    print_info "Building image..."
    docker build -t $IMAGE_NAME .
fi

# Run the container
print_info "Running container..."
docker run -it --rm \
    --name $CONTAINER_NAME \
    -e NOTION_API_KEY="$NOTION_API_KEY" \
    $IMAGE_NAME

print_info "Container stopped."

