# HA Management MVP

House Association Management system built with Next.js, Node.js, and PostgreSQL.

## 🏗️ Project Structure

```
├── apps/
│   ├── api/                 # Node.js API server
│   └── web/                 # Next.js frontend
├── packages/
│   ├── database/            # Prisma schema and migrations
│   └── shared/              # Shared TypeScript types and utilities
├── tests/                   # E2E tests
└── infrastructure/          # Infrastructure as code
```

## 🚀 **Development Commands**

```bash
# Install all dependencies across workspace
pnpm install

# Start development servers
pnpm dev                    # Start web frontend (Next.js)
pnpm --filter api dev       # Start API server only
pnpm --filter web dev       # Start web frontend only

# Build all packages
pnpm build                  # Build all apps and packages
pnpm --filter api build     # Build API only
pnpm --filter web build     # Build web only
```

## 🧪 **Testing Commands**

```bash
# Run all tests
pnpm test                   # All package tests
pnpm test:all              # All tests + E2E

# Specific test types
pnpm test:unit             # API unit tests only
pnpm test:integration      # API integration tests only
pnpm test:e2e              # End-to-end tests (Playwright)

# Watch mode
pnpm --filter api test:watch
```

## 🔍 **Code Quality Commands**

```bash
# Linting
pnpm lint                  # Lint all packages
pnpm lint:fix              # Fix linting issues
pnpm --filter api lint     # Lint API only
pnpm --filter web lint     # Lint web only

# Formatting
pnpm format                # Format all code with Prettier

# Type checking
pnpm type-check            # TypeScript check all packages
```

## 🗄️ **Database Commands**

```bash
# Prisma operations
pnpm --filter database db:generate    # Generate Prisma client
pnpm --filter database db:migrate     # Run migrations
pnpm --filter database db:studio      # Open Prisma Studio
pnpm --filter database db:seed        # Seed database
```

## 🐳 **Docker Commands**

```bash
# Start services
docker-compose up          # Start all services
docker-compose up -d       # Start in background
docker-compose up postgres # Start only database

# Stop services
docker-compose down        # Stop all services
docker-compose down -v     # Stop and remove volumes
```

## 📦 **Package Management**

```bash
# Add dependencies
pnpm --filter api add express           # Add to API
pnpm --filter web add react-query       # Add to web
pnpm --filter shared add zod            # Add to shared
pnpm add -w husky                       # Add to workspace root

# Remove dependencies
pnpm --filter api remove express
```

## 🔧 **Setup Commands**

```bash
# First time setup
cp .env.example .env       # Copy environment file
pnpm install              # Install dependencies
docker-compose up postgres # Start database
pnpm --filter database db:migrate # Setup database
```

## 📋 **Quick Start Sequence**

```bash
# 1. Environment setup
cp .env.example .env

# 2. Install dependencies
pnpm install

# 3. Start database
docker-compose up postgres -d

# 4. Setup database
pnpm --filter database db:migrate

# 5. Start development
pnpm dev
```

## 🌐 **Access URLs**

- **API**: http://localhost:3001
- **Web App**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (after running `db:studio`)

## 🛠️ **Tech Stack**

- **Frontend**: Next.js 13, React 18, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Testing**: Jest, Playwright
- **Code Quality**: ESLint, Prettier, Husky
- **Package Manager**: pnpm
- **Containerization**: Docker, Docker Compose

## 📚 **Development Guidelines**

- Follow the patterns defined in `CLAUDE.md`
- Use strict TypeScript configuration
- Write tests for all new features
- Run linting and type checking before commits
- Keep functions under 50 lines
- Follow the established file naming conventions

## 🤝 **Contributing**

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and write tests
3. Run quality checks: `pnpm lint && pnpm type-check && pnpm test`
4. Commit changes with descriptive message
5. Push and create a pull request

## 📄 **License**

Private project - All rights reserved.
