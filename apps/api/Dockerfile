# Multi-stage build for Node.js API
FROM node:22.18.0-alpine AS base

# Install pnpm and TypeScript globally
RUN npm install -g pnpm@10.15.0 typescript@5.9.2

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies and allow build scripts for Prisma, bcrypt, etc.
RUN pnpm install --no-frozen-lockfile && pnpm rebuild typescript

# Generate Prisma client explicitly
RUN npx prisma generate || echo "Prisma generate skipped - no schema found"

# Development stage
FROM base AS development
COPY . .
EXPOSE 3001
CMD ["pnpm", "dev"]

