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
- **Package Manager**: pnpm 8.x
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

#### Phase 1: Foundation Setup
1. **Project Initialization**
   - Create monorepo structure with pnpm workspaces
   - Setup hooks
   - Setup package.json files with Node.js 22.18.0
   - Configure TypeScript, ESLint, and Prettier
   - Setup development Docker Compose
   - Configure Husky and lint-staged

2. **Database Setup**
   - Define Prisma schema
   - Setup PostgreSQL locally
   - Create initial migrations
   - Seed development data

3. **API Foundation**
   - Express.js server setup with TypeScript
   - Prisma client integration
   - Basic middleware (CORS, logging, error handling)
   - Health check endpoint

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
DATABASE_URL="postgresql://user:pass@localhost:5432/ha_management"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Azure Storage (for documents)
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;..."
AZURE_STORAGE_CONTAINER_NAME="ha-documents"

# Email (for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```
### Security Considerations

#### Authentication Security
- Password hashing with bcrypt
- JWT token expiration
- Rate limiting on auth endpoints
- Input validation with Zod

#### Data Protection
- Environment variable management
- HTTPS enforcement
- CORS configuration
- SQL injection prevention (Prisma ORM)

### Testing Strategy

#### Backend Testing
- **Unit Tests**: Jest for service layer testing
- **Integration Tests**: Supertest for API endpoint testing
- **Database Tests**: In-memory SQLite for fast testing

#### Frontend Testing
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright for critical user journeys

### Success Criteria

#### MVP Success Metrics
1. HA managers can register and manage housing associations
2. Property owners can view HA information and documents
3. Basic document sharing functionality works
4. System handles 10-50 concurrent users
5. 99% uptime on Azure infrastructure

#### Technical Success Criteria
1. Automated CI/CD pipeline working with pnpm
2. Database migrations working smoothly
3. Authentication system secure and functional
4. File upload/download working reliably
5. Responsive UI on desktop and mobile
6. Code quality gates passing (linting, formatting, tests)
7. Node.js 22.18.0 performance benefits realized

### Next Steps After MVP
1. SMS/Email notifications integration
2. OAuth integration (Google, Facebook, IAS)
3. Advanced meeting management with voting
4. Financial management features
5. Service marketplace integration
6. Performance optimization with Node.js 22 features