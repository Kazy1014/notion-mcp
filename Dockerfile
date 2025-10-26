# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S notion && \
    adduser -S notion -u 1001

# Change ownership
RUN chown -R notion:notion /app

# Switch to non-root user
USER notion

# Set environment variables
ENV NODE_ENV=production

# The MCP server will communicate via stdio
# No EXPOSE needed as it uses stdin/stdout

# Start the MCP server
ENTRYPOINT ["node", "dist/index.js"]

