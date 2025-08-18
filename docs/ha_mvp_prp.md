# House Association (HA) Management System MVP
## Project Requirements & Plan (PRP) for Claude Code

### Project Overview
Build an MVP for a House Association (Húsfélag) management system that allows managers to register housing associations and property owners to access basic HA information and services.

### Technical Architecture

#### Backend Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
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

### Database Schema (Prisma Models)

```prisma
// User authentication and roles
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  role      UserRole @default(PROPERTY_OWNER)
  kennitala String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  managedHAs     HouseAssociation[]
  memberships    HAMembership[]
  announcements  Announcement[]
  messages       Message[]
}

model HouseAssociation {
  id               String   @id @default(cuid())
  name             String
  address          String
  registrationNum  String   @unique
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  // Relationships
  manager          User     @relation(fields: [managerId], references: [id])
  managerId        String
  members          HAMembership[]
  documents        Document[]
  announcements    Announcement[]
  meetings         Meeting[]
}

model HAMembership {
  id     String @id @default(cuid())
  user   User   @relation(fields: [userId], references: [id])
  userId String
  ha     HouseAssociation @relation(fields: [haId], references: [id])
  haId   String
  
  @@unique([userId, haId])
}

enum UserRole {
  HA_MANAGER
  PROPERTY_OWNER
}
```

### Project Structure

```
ha-management-mvp/
├── apps/
│   ├── api/                          # Node.js API
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   └── app.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                          # Next.js Frontend
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── lib/
│       │   └── styles/
│       └── package.json
├── packages/
│   ├── database/                     # Prisma schema and migrations
│   │   ├── prisma/
│   │   └── package.json
│   └── shared/                       # Shared TypeScript types
├── infrastructure/
│   ├── azure/                        # Azure ARM templates or Bicep
│   └── terraform/                    # Alternative IaC option
├── .github/
│   └── workflows/                    # GitHub Actions
├── docker-compose.yml                # Local development
└── README.md
```

### Development Phases

#### Phase 1: Foundation Setup
1. **Project Initialization**
   - Create monorepo structure
   - Setup package.json files
   - Configure TypeScript and ESLint
   - Setup development Docker Compose

2. **Database Setup**
   - Define Prisma schema
   - Setup PostgreSQL locally
   - Create initial migrations
   - Seed development data

3. **API Foundation**
   - Express.js server setup
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

### Testing Strategy

#### Backend Testing
- **Unit Tests**: Jest for service layer testing
- **Integration Tests**: Supertest for API endpoint testing
- **Database Tests**: In-memory SQLite for fast testing

#### Frontend Testing
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright (optional for MVP)

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

### Deployment Strategy

#### MVP Deployment (Simple)
- **Frontend**: Azure Static Web Apps
- **Backend**: Azure Container Instances
- **Database**: Azure Database for PostgreSQL

#### Future Scaling Path
- **Frontend**: CDN integration
- **Backend**: Azure Kubernetes Service
- **Database**: Read replicas, connection pooling
- **Monitoring**: Application Insights, Log Analytics

### Code Style Guidelines

#### Frontend Style Guide (Next.js/React)
- **Primary**: [Airbnb JavaScript/React Style Guide](https://github.com/airbnb/javascript)
- **TypeScript**: [Airbnb TypeScript Config](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-typescript)
- **Component Naming**: PascalCase for components, camelCase for utilities
- **File Naming**: kebab-case for pages, PascalCase for components
- **Import Order**: External libraries → Internal modules → Relative imports

#### Backend Style Guide (Node.js/Express)
- **Primary**: [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- **Function Documentation**: TSDoc comments for public APIs
- **Error Handling**: Explicit error types, no `any` types
- **File Naming**: kebab-case for all files
- **Import Order**: Node modules → Local modules → Types

#### Database Style Guide (Prisma)
- **Model Naming**: PascalCase for models
- **Field Naming**: camelCase for fields
- **Enum Naming**: SCREAMING_SNAKE_CASE for enum values
- **Relation Naming**: Descriptive names (e.g., `authoredPosts`, not `posts`)

#### General TypeScript Rules
- **Strict Mode**: All TypeScript strict flags enabled
- **No `any`**: Explicit types required
- **Return Types**: Required for all public functions
- **Interface vs Type**: Interfaces for object shapes, types for unions

### Code Quality Tools

#### Linting & Formatting
```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint-config-airbnb": "^19.0.4",
    "eslint-config-airbnb-typescript": "^17.1.0",
    "eslint-config-google": "^0.14.0",
    "eslint-config-prettier": "^9.0.0",
    "prettier": "^3.0.0",
    "husky": "^8.0.3",
    "lint-staged": "^14.0.1"
  }
}
```

#### Pre-commit Hooks (`.husky/pre-commit`)
```bash
#!/usr/bin/env sh
npx lint-staged
npm run test:unit
```

#### Lint-staged Configuration (`package.json`)
```json
{
  "lint-staged": {
    "apps/web/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "apps/api/**/*.{ts}": [
      "eslint --fix",
      "prettier --write"
    ],
    "**/*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Success Criteria

#### MVP Success Metrics
1. HA managers can register and manage housing associations
2. Property owners can view HA information and documents
3. Basic document sharing functionality works
4. System handles 10-50 concurrent users
5. 99% uptime on Azure infrastructure

#### Technical Success Criteria
1. Automated CI/CD pipeline working
2. Database migrations working smoothly
3. Authentication system secure and functional
4. File upload/download working reliably
5. Responsive UI on desktop and mobile
6. Code quality gates passing (linting, formatting, tests)

### Next Steps After MVP
1. SMS/Email notifications
2. OAuth integration (Google, Facebook)
3. Advanced meeting management with voting
4. Financial management features
5. Service marketplace integration