# Multi-stage build for Node.js API
FROM node:22.18.0-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@10.15.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies including dev dependencies for build
RUN pnpm install --no-frozen-lockfile --ignore-scripts=false

# Development stage
FROM base AS development
COPY . .
EXPOSE 3001
CMD ["pnpm", "dev"]

# Build stage
FROM base AS build
COPY . .
RUN pnpm build

# Production stage
FROM node:22.18.0-alpine AS production

# Install pnpm globally
RUN npm install -g pnpm@10.15.0

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apiuser -u 1001

WORKDIR /app

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN pnpm install --no-frozen-lockfile --prod

# Copy built application from build stage
COPY --from=build --chown=apiuser:nodejs /app/dist ./dist
COPY --chown=apiuser:nodejs .env* ./

# Change to non-root user
USER apiuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

# Start the application
CMD ["pnpm", "start"]