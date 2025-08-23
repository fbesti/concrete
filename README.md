# HA Management MVP

House Association (Húsfélag) Management system built with Next.js, Node.js, and PostgreSQL.

## 🎯 **Project Status**

✅ **Phase 1: Foundation Setup** - Complete  
✅ **Phase 2: Authentication System** - Complete  
🔄 **Phase 3: Core HA Features** - Next  
⏳ **Phase 4: Frontend Application** - Planned  
⏳ **Phase 5: Deployment & CI/CD** - Planned

### Current Features (Phase 2 Complete)

- ✅ Complete JWT-based authentication system
- ✅ User registration and login with secure password hashing
- ✅ Role-based access control (HA Manager, Property Owner)
- ✅ User profile management and password changes
- ✅ Comprehensive input validation and security measures
- ✅ Full test coverage with unit and integration tests

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
pnpm --filter api test:unit        # API unit tests (39 tests)
pnpm --filter api test:integration # API integration tests
pnpm test:e2e                      # End-to-end tests (Playwright)
pnpm --filter api test:coverage    # Test coverage report

# Watch mode
pnpm --filter api test:watch

# Extensive Tests and lint
pnpm type-check
pnpm lint
pnpm format:check
```

## 🔒 **Security Features**

The authentication system includes comprehensive security measures:

- **Password Security**: bcrypt hashing with 12 salt rounds
- **JWT Tokens**: Access tokens (15min) + refresh tokens (7d)
- **Input Validation**: Zod schemas with XSS protection
- **Rate Limiting**: Multiple tiers (general, auth, account creation)
- **CORS Configuration**: Proper origins and headers
- **Security Headers**: Helmet with CSP configuration
- **Password Requirements**: 8+ chars, uppercase, lowercase, number, special char
- **Kennitala Validation**: Format validation for Icelandic ID numbers

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
# Prisma operations (require DATABASE_URL environment variable)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ha_management" pnpm --filter database db:generate    # Generate Prisma client
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ha_management" pnpm --filter database db:migrate     # Run migrations
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ha_management" pnpm --filter database db:studio      # Open Prisma Studio
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ha_management" pnpm --filter database db:seed        # Seed database
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
cp apps/api/.env.example apps/api/.env  # Copy API environment file
pnpm install                           # Install dependencies
docker-compose up -d postgres          # Start database
pnpm --filter database db:migrate      # Setup database
pnpm --filter database db:seed         # Seed with test data
```

## 📋 **Quick Start Sequence**

```bash
# 1. Environment setup
cp apps/api/.env.example apps/api/.env

# 2. Install dependencies
pnpm install

# 3. Start database
docker-compose up -d postgres

# 4. Setup database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ha_management" pnpm --filter database db:migrate
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ha_management" pnpm --filter database db:seed

# 5. Start development
pnpm --filter api dev      # Start API server
# In another terminal:
pnpm --filter web dev      # Start web app (when ready)

# 6. Test the API
curl http://localhost:3001/health

# 7. Test the login
curl -X POST http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email": "manager1@ha.is", "password": "password123"}'
```

## 🌐 **Access URLs**

- **API**: http://localhost:3001
- **Web App**: http://localhost:3000
- **API Health Check**: http://localhost:3001/health
- **Prisma Studio**: http://localhost:5555 (after running `db:studio`)

## 🔐 **Authentication Endpoints**

The API now includes a complete authentication system:

```bash
# User Registration
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PROPERTY_OWNER",
  "kennitala": "010170-1234" // Optional Icelandic ID
}

# User Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Get Current User
GET /api/v1/auth/me
Authorization: Bearer <access-token>

# Refresh Token
POST /api/v1/auth/refresh
{
  "refreshToken": "<refresh-token>"
}

# Update Profile
PUT /api/v1/users/profile
Authorization: Bearer <access-token>
{
  "firstName": "Jane",
  "lastName": "Smith"
}

# Change Password
PUT /api/v1/users/password
Authorization: Bearer <access-token>
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmNewPassword": "NewPass123!"
}
```

## 👥 **Test Users**

For development and testing, the database is seeded with test users:

```bash
# HA Managers
Email: manager1@ha.is | Password: password123
Email: manager2@ha.is | Password: password123

# Property Owners
Email: owner1@example.is | Password: password123
Email: owner2@example.is | Password: password123
Email: owner3@example.is | Password: password123
```

## 🛠️ **Tech Stack**

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Node.js 22.18.0, Express, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: JWT tokens, bcrypt password hashing
- **Validation**: Zod schemas with comprehensive input validation
- **Testing**: Jest (unit/integration), Playwright (E2E), Supertest
- **Code Quality**: ESLint, Prettier, Husky
- **Package Manager**: pnpm 10.15.0
- **Containerization**: Docker, Docker Compose

## 📚 **Development Guidelines**

- Follow the patterns defined in `CLAUDE.md`
- Use strict TypeScript configuration
- Write tests for all new features (aim for 80%+ coverage)
- Run linting and type checking before commits
- Keep functions under 50 lines, files under 500 lines
- Follow established naming conventions (kebab-case files, PascalCase components)
- Use Zod schemas for all API validation
- Implement proper error handling with structured responses
- Add authentication middleware to protected routes

## 🤝 **Contributing**

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and write tests
3. Run quality checks: `pnpm lint && pnpm type-check && pnpm test`
4. Commit changes with descriptive message
5. Push and create a pull request

## 📄 **License**

Private project - All rights reserved.
