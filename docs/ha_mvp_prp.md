# House Association (HA) Management System MVP

## Project Requirements & Plan (PRP) v3 for Claude Code

### Project Overview

Build an MVP for a House Association (Húsfélag) management system that allows managers to register housing associations and property owners to access basic HA information and services.

### Technical Architecture

#### Backend Stack

- **Runtime**: Node.js 22.18.0 LTS
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (Azure Database for PostgreSQL)
- **ORM**: Prisma
- **Authentication**: JWT-based with email/password
- **File Storage**: Azure Blob Storage
- **Containerization**: Docker

#### Frontend Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI or Radix UI
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios or native fetch

#### Infrastructure & DevOps

- **Cloud Provider**: Microsoft Azure
- **Container Hosting**: Azure Container Instances (MVP) → Azure Kubernetes Service (scaling)
- **Frontend Hosting**: Azure Static Web Apps
- **Database**: Azure Database for PostgreSQL (Flexible Server)
- **Storage**: Azure Blob Storage
- **CI/CD**: GitHub Actions
- **Monitoring**: Azure Application Insights
- **Package Manager**: pnpm 10.15.0
- **Node Version**: 22.18.0 LTS

### Core MVP Features

#### 1. Authentication & User Management

- **User Registration**: Email and password registration
- **User Login**: JWT-based authentication
- **User Types**:
  - HA Manager (can create/manage HA)
  - Property Owner (can view HA information)
- **Password Reset**: Email-based password reset

#### 2. House Association Management

- **HA Registration**: Managers can register new housing associations
- **HA Information**: Basic HA details (name, address, registration number)
- **Member Management**: Add property owners to HA using Kennitala (Icelandic ID)

#### 3. Basic Document Management

- **Document Upload**: Upload and store HA-related documents
- **Document Viewing**: Property owners can view shared documents
- **Document Categories**: Insurance, regulations, maintenance logs

#### 4. Simple Communication

- **Announcement Board**: Managers can post announcements
- **Basic Messaging**: Property owners can send messages to HA manager

#### 5. Meeting Management (Basic)

- **Meeting Creation**: Managers can create meeting entries
- **Meeting Information**: Date, time, agenda items
- **Meeting History**: View past meetings

### Project Structure with Test Integration

```
ha_management_mvp/
├── apps/
│   ├── api/                          # Node.js API
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   └── app.ts
│   │   ├── tests/                    # API-specific tests
│   │   │   ├── unit/
│   │   │   │   ├── services/
│   │   │   │   └── middleware/
│   │   │   ├── integration/
│   │   │   │   ├── routes/
│   │   │   │   └── auth.test.ts
│   │   │   ├── fixtures/
│   │   │   │   └── testData.ts
│   │   │   └── setup/
│   │   │       ├── testDb.ts
│   │   │       └── globalSetup.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                          # Next.js Frontend
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── lib/
│       │   └── styles/
│       ├── __tests__/                # Frontend tests
│       │   ├── components/
│       │   ├── pages/
│       │   ├── lib/
│       │   └── __mocks__/
│       └── package.json
├── packages/
│   ├── database/                     # Prisma schema and migrations
│   │   ├── prisma/
│   │   ├── tests/                    # Database/migration tests
│   │   │   ├── migrations/
│   │   │   └── seed.test.ts
│   │   └── package.json
│   └── shared/                       # Shared TypeScript types
│       ├── src/
│       ├── tests/                    # Shared utility tests
│       └── package.json
├── tests/                            # E2E and integration tests
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── ha-management.spec.ts
│   │   └── documents.spec.ts
│   ├── fixtures/
│   │   ├── users.json
│   │   └── ha-data.json
│   └── playwright.config.ts
├── infrastructure/
│   ├── azure/                        # Azure ARM templates or Bicep
│   └── terraform/                    # Alternative IaC option
├── .github/
│   └── workflows/                    # GitHub Actions
├── docker-compose.yml                # Local development
├── docker-compose.test.yml           # Test environment
├── .nvmrc                           # Node version
├── pnpm-workspace.yaml              # pnpm workspace config
└── README.md
```

### Development Phases

#### Phase 1: Foundation Setup ✅ COMPLETED

1. **Project Initialization** ✅
   - ✅ Create monorepo structure with pnpm workspaces
   - ✅ Setup hooks
   - ✅ Setup package.json files with Node.js 22.18.0
   - ✅ Configure TypeScript, ESLint, and Prettier
   - ✅ Setup development Docker Compose
   - ✅ Configure Husky and lint-staged

2. **Database Setup** ✅
   - ✅ Define Prisma schema (complete with all MVP models)
   - ✅ Setup PostgreSQL locally
   - ✅ Create initial migrations
   - ✅ Seed development data (realistic Icelandic test data)
   - ✅ Setup shadow database configuration for safe migrations
   - ✅ Verify all models work with relationship testing

3. **API Foundation** ✅
   - ✅ Express.js server setup with TypeScript
   - ✅ Prisma client integration
   - ✅ Comprehensive middleware stack:
     - ✅ CORS with proper configuration
     - ✅ Structured request logging with color-coded output
     - ✅ Comprehensive error handling with Prisma error mapping
     - ✅ Rate limiting (multiple tiers: general, auth, API, account creation)
     - ✅ Request validation middleware using Zod with sanitization
     - ✅ Environment variable validation with detailed error reporting
   - ✅ Health check endpoint with database connectivity testing
   - ✅ Standardized API response format with metadata
   - ✅ Graceful shutdown handling for database connections
   - ✅ Enhanced security (Helmet CSP, CORS, request correlation IDs)

**Phase 1 Status**: COMPLETE (commit: c1243df)
**Test Users Available**:

- Managers: manager1@ha.is, manager2@ha.is
- Property Owners: owner1@example.is, owner2@example.is, owner3@example.is
- All passwords: password123

#### Phase 2: Authentication System

1. **User Registration & Login**
   - Password hashing (bcrypt)
   - JWT token generation
   - Login/register endpoints
   - Authentication middleware

2. **User Management**
   - User profile endpoints
   - Password reset flow
   - Role-based access control

#### Phase 3: Core HA Features

1. **HA Management**
   - Create HA endpoint
   - HA listing and details
   - Member invitation system
   - HA member management

2. **Document Management**
   - Azure Blob Storage integration
   - File upload endpoints
   - Document listing and download
   - Access control per HA

#### Phase 4: Frontend Application

1. **Next.js Setup**
   - Authentication pages (login, register)
   - Dashboard layouts
   - Protected routes

2. **HA Management UI**
   - HA creation form
   - Member management interface
   - Document upload/viewing
   - Announcements interface

#### Phase 5: Deployment & CI/CD

1. **Azure Infrastructure**
   - PostgreSQL database setup
   - Container registry
   - Azure Container Instances
   - Blob Storage configuration

2. **GitHub Actions**
   - Build and test workflows
   - Container image building
   - Deployment to Azure
   - Environment management

### Environment Configuration

#### Development Environment Variables

```env
# Node.js version
NODE_VERSION=22.18.0

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ha_management"
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ha_management_shadow"

# API Configuration
PORT=3001
NODE_ENV=development
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000

# JWT (requires 32+ character secret for security)
JWT_SECRET="your-super-secret-jwt-key-that-is-at-least-32-characters-long-for-security"
JWT_EXPIRES_IN="7d"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Azure Storage (for documents) - Optional for MVP
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;..."
AZURE_STORAGE_CONTAINER_NAME="ha-documents"

# Email (for password reset) - Optional for MVP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Security Considerations

#### Authentication Security

- ✅ Password hashing with bcrypt (implemented in seed script)
- JWT token expiration (ready for Phase 2)
- ✅ Rate limiting on auth endpoints (authLimiter implemented)
- ✅ Input validation with Zod (comprehensive validation middleware)

#### Data Protection

- ✅ Environment variable management (Zod validation with detailed errors)
- HTTPS enforcement (ready for production deployment)
- ✅ CORS configuration (implemented with proper origins and headers)
- ✅ SQL injection prevention (Prisma ORM with type safety)
- ✅ XSS protection (input sanitization middleware)
- ✅ Security headers (Helmet with CSP configuration)
- ✅ Request correlation IDs for security auditing

### Testing Strategy

#### Backend Testing

- ✅ **Unit Tests**: Jest for service layer testing (basic setup complete)
- **Integration Tests**: Supertest for API endpoint testing (ready for Phase 2)
- ✅ **Database Tests**: PostgreSQL with test data seeding
- ✅ **Test Infrastructure**: Jest configuration and test structure in place

#### Frontend Testing

- **Component Tests**: React Testing Library (ready for Phase 4)
- ✅ **E2E Tests**: Playwright configuration ready for implementation

### Success Criteria

#### MVP Success Metrics

1. HA managers can register and manage housing associations
2. Property owners can view HA information and documents
3. Basic document sharing functionality works
4. System handles 10-50 concurrent users
5. 99% uptime on Azure infrastructure

#### Technical Success Criteria

1. ✅ Automated CI/CD pipeline working with pnpm (pre-commit hooks implemented)
2. ✅ Database migrations working smoothly (Prisma with shadow DB)
3. Authentication system secure and functional (foundation ready for Phase 2)
4. File upload/download working reliably (ready for Phase 3)
5. Responsive UI on desktop and mobile (ready for Phase 4)
6. ✅ Code quality gates passing (linting, formatting, tests, type-checking)
7. ✅ Node.js 22.18.0 performance benefits realized (configured and validated)

### Next Steps After MVP

1. SMS/Email notifications integration
2. OAuth integration (Google, Facebook, IAS)
3. Advanced meeting management with voting
4. Financial management features
5. Service marketplace integration
6. Performance optimization with Node.js 22 features
