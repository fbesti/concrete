# Project Structure and File Naming Guidelines

## Table of Contents
1. [Folder Structure](#folder-structure)
2. [File Naming Conventions](#file-naming-conventions)
3. [File Type Specifications](#file-type-specifications)
4. [Example Implementation](#example-implementation)

---

## Folder Structure

### Root Level Organization
```
project-root/
├── src/                    # Source code
├── public/                 # Static assets
├── tests/                  # Test files
├── docs/                   # Documentation
├── config/                 # Configuration files
├── scripts/                # Build/deployment scripts
├── .github/                # GitHub workflows
└── dist/                   # Build output (generated)
```

### Source Code Structure (`src/`)
```
src/
├── pages/                  # Page components/views
├── components/             # Reusable UI components
├── layouts/                # Layout components
├── api/                    # API routes/endpoints
├── services/               # Business logic services
├── models/                 # Data models/schemas
├── controllers/            # Request handlers
├── middleware/             # Middleware functions
├── utils/                  # Utility functions
├── hooks/                  # Custom hooks (React/Vue)
├── stores/                 # State management
├── types/                  # TypeScript definitions
├── constants/              # Application constants
├── assets/                 # Images, fonts, etc.
├── styles/                 # Global styles
└── lib/                    # Third-party integrations
```

### Component Organization
```
components/
├── ui/                     # Basic UI components
│   ├── Button/
│   ├── Input/
│   └── Modal/
├── forms/                  # Form-specific components
│   ├── UserForm/
│   └── ContactForm/
├── layout/                 # Layout-specific components
│   ├── Header/
│   ├── Footer/
│   └── Sidebar/
└── features/               # Feature-specific components
    ├── auth/
    ├── dashboard/
    └── profile/
```

### Database Structure
```
database/
├── migrations/             # Database migrations
├── seeds/                  # Sample data
├── schemas/                # Database schemas
└── queries/                # Reusable queries
```

### Configuration Structure
```
config/
├── environments/           # Environment-specific configs
│   ├── development.ts
│   ├── staging.ts
│   └── production.ts
├── database.ts             # Database configuration
├── api.ts                  # API configuration
└── app.ts                  # Application configuration
```

---

## File Naming Conventions

### Overview of Naming Cases

| Case Type | Example | Usage |
|-----------|---------|--------|
| **kebab-case** | `user-profile.tsx` | Files, URLs, API endpoints |
| **PascalCase** | `UserProfile.tsx` | Components, Classes, Types |
| **camelCase** | `getUserData()` | Variables, functions, methods |
| **snake_case** | `user_id` | Database fields, environment variables |
| **SCREAMING_SNAKE_CASE** | `API_BASE_URL` | Constants, environment variables |

### File Extension Guidelines

| File Type | Extension | Example |
|-----------|-----------|---------|
| React Components | `.tsx` | `UserCard.tsx` |
| Vue Components | `.vue` | `UserCard.vue` |
| TypeScript | `.ts` | `user-service.ts` |
| JavaScript | `.js` | `utils.js` |
| Styles | `.css`, `.scss`, `.module.css` | `button.module.css` |
| Tests | `.test.ts`, `.spec.ts` | `UserService.test.ts` |
| Types | `.d.ts`, `.types.ts` | `api.types.ts` |

---

## File Type Specifications

### 1. Pages
- **Naming Convention**: kebab-case
- **Location**: `src/pages/`
- **Purpose**: Route-level components, main application views

```
pages/
├── home-page.tsx
├── user-profile.tsx
├── product-detail.tsx
├── order-history.tsx
└── not-found.tsx
```

**Rationale**: Pages often become URLs, kebab-case is web-standard and URL-friendly.

### 2. Components
- **Naming Convention**: PascalCase
- **Location**: `src/components/`
- **Purpose**: Reusable UI building blocks

```
components/
├── ui/
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── LoadingSpinner.tsx
├── UserCard.tsx
├── ProductList.tsx
└── NavigationBar.tsx
```

**Rationale**: Matches React/Vue component naming, JSX requires capitalized component names.

### 3. API Routes/Endpoints
- **Naming Convention**: kebab-case
- **Location**: `src/api/`
- **Purpose**: Backend API endpoints and route handlers

```
api/
├── user-management.ts
├── product-catalog.ts
├── order-processing.ts
└── auth-handlers.ts
```

**Rationale**: Becomes URL endpoints, follows REST API conventions.

### 4. Models/Schemas
- **Naming Convention**: PascalCase
- **Location**: `src/models/`
- **Purpose**: Data models, database schemas, entity definitions

```
models/
├── User.ts
├── Product.ts
├── Order.ts
├── OrderItem.ts
└── Category.ts
```

**Rationale**: Represents entities/classes, matches ORM and database conventions.

### 5. Services
- **Naming Convention**: PascalCase
- **Location**: `src/services/`
- **Purpose**: Business logic, external API integration

```
services/
├── UserService.ts
├── PaymentService.ts
├── EmailService.ts
├── NotificationService.ts
└── AnalyticsService.ts
```

**Rationale**: Class-like behavior, clear distinction from utilities.

### 6. Controllers
- **Naming Convention**: PascalCase
- **Location**: `src/controllers/`
- **Purpose**: Request handlers, route controllers

```
controllers/
├── UserController.ts
├── ProductController.ts
├── OrderController.ts
└── AuthController.ts
```

**Rationale**: Class-based, handles business logic and request processing.

### 7. Middleware
- **Naming Convention**: kebab-case
- **Location**: `src/middleware/`
- **Purpose**: Request/response processing functions

```
middleware/
├── auth-middleware.ts
├── error-handler.ts
├── rate-limiter.ts
├── cors-handler.ts
└── request-logger.ts
```

**Rationale**: Function-based, follows middleware naming conventions.

### 8. Utilities/Helpers
- **Naming Convention**: kebab-case
- **Location**: `src/utils/`
- **Purpose**: Pure functions, helper utilities

```
utils/
├── date-formatter.ts
├── api-client.ts
├── validation-helpers.ts
├── string-utils.ts
└── math-helpers.ts
```

**Rationale**: Function collections, not classes, utility naming standard.

### 9. Types/Interfaces
- **Naming Convention**: kebab-case (files), PascalCase (exports)
- **Location**: `src/types/`
- **Purpose**: TypeScript type definitions

```
types/
├── user-types.ts          // exports: User, UserProfile, UserSettings
├── api-types.ts           // exports: ApiResponse, ApiError, ApiEndpoint
├── database-types.ts      // exports: DbConnection, DbQuery
└── common-types.ts        // exports: ID, Timestamp, Status
```

**Rationale**: File containers use kebab-case, exported types follow TypeScript conventions.

### 10. Configuration
- **Naming Convention**: kebab-case
- **Location**: `config/` or `src/config/`
- **Purpose**: Application configuration settings

```
config/
├── database-config.ts
├── api-config.ts
├── environment-config.ts
├── auth-config.ts
└── app-config.ts
```

**Rationale**: Configuration files, lowercase standard, environment-friendly.

### 11. Constants/Enums
- **Naming Convention**: SCREAMING_SNAKE_CASE (files), PascalCase (exports)
- **Location**: `src/constants/`
- **Purpose**: Application-wide constants

```
constants/
├── API_ENDPOINTS.ts       // exports: ApiEndpoints enum
├── ERROR_MESSAGES.ts      // exports: ErrorMessages
├── STATUS_CODES.ts        // exports: HttpStatusCodes
└── APP_CONSTANTS.ts       // exports: AppSettings
```

**Rationale**: Global constants, clear identification, matches constant naming conventions.

### 12. Database Migrations
- **Naming Convention**: kebab-case with timestamp
- **Location**: `database/migrations/`
- **Purpose**: Database schema changes

```
migrations/
├── 2024-01-15-create-users-table.sql
├── 2024-01-16-add-user-email-index.sql
├── 2024-01-17-create-products-table.sql
└── 2024-01-18-add-foreign-keys.sql
```

**Rationale**: Chronological order, descriptive actions, migration naming standard.

### 13. Tests
- **Naming Convention**: Match source file + `.test` or `.spec`
- **Location**: `tests/` or alongside source files
- **Purpose**: Unit, integration, and e2e tests

```
tests/
├── unit/
│   ├── UserService.test.ts
│   ├── api-client.test.ts
│   └── date-formatter.test.ts
├── integration/
│   ├── user-api.test.ts
│   └── database.test.ts
└── e2e/
    ├── user-flow.test.ts
    └── checkout-flow.test.ts
```

**Rationale**: Easy identification of what's being tested, standard testing conventions.

### 14. Hooks (React/Vue)
- **Naming Convention**: camelCase with `use` prefix
- **Location**: `src/hooks/`
- **Purpose**: Custom hooks for state and side effects

```
hooks/
├── useAuth.ts
├── useLocalStorage.ts
├── useApiData.ts
├── useDebounce.ts
└── useWindowSize.ts
```

**Rationale**: React/Vue hook naming conventions, functional programming style.

### 15. Stores (State Management)
- **Naming Convention**: kebab-case (files), camelCase (exports)
- **Location**: `src/stores/`
- **Purpose**: State management (Redux, Vuex, Zustand)

```
stores/
├── user-store.ts          // exports: userStore, useUserStore
├── product-store.ts       // exports: productStore
├── auth-store.ts          // exports: authStore
└── app-store.ts           // exports: appStore
```

**Rationale**: Store files use kebab-case, exported stores follow library conventions.

---

## Example Implementation

### Complete Project Structure
```
my-ecommerce-app/
├── src/
│   ├── pages/
│   │   ├── home-page.tsx
│   │   ├── product-detail.tsx
│   │   ├── shopping-cart.tsx
│   │   └── user-profile.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ShoppingCart.tsx
│   │   └── UserNavigation.tsx
│   ├── api/
│   │   ├── user-management.ts
│   │   ├── product-catalog.ts
│   │   └── order-processing.ts
│   ├── services/
│   │   ├── UserService.ts
│   │   ├── ProductService.ts
│   │   └── PaymentService.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   └── Order.ts
│   ├── controllers/
│   │   ├── UserController.ts
│   │   ├── ProductController.ts
│   │   └── OrderController.ts
│   ├── middleware/
│   │   ├── auth-middleware.ts
│   │   ├── error-handler.ts
│   │   └── request-logger.ts
│   ├── utils/
│   │   ├── date-formatter.ts
│   │   ├── price-calculator.ts
│   │   └── validation-helpers.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useProducts.ts
│   ├── stores/
│   │   ├── user-store.ts
│   │   ├── cart-store.ts
│   │   └── product-store.ts
│   ├── types/
│   │   ├── user-types.ts
│   │   ├── product-types.ts
│   │   └── api-types.ts
│   ├── constants/
│   │   ├── API_ENDPOINTS.ts
│   │   ├── ERROR_MESSAGES.ts
│   │   └── APP_CONSTANTS.ts
│   └── config/
│       ├── database-config.ts
│       ├── api-config.ts
│       └── app-config.ts
├── tests/
│   ├── unit/
│   │   ├── UserService.test.ts
│   │   ├── ProductService.test.ts
│   │   └── price-calculator.test.ts
│   ├── integration/
│   │   ├── user-api.test.ts
│   │   └── product-api.test.ts
│   └── e2e/
│       ├── checkout-flow.test.ts
│       └── user-registration.test.ts
├── database/
│   ├── migrations/
│   │   ├── 2024-01-15-create-users-table.sql
│   │   ├── 2024-01-16-create-products-table.sql
│   │   └── 2024-01-17-create-orders-table.sql
│   └── seeds/
│       ├── users-seed.sql
│       └── products-seed.sql
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── docs/
│   ├── api-documentation.md
│   ├── setup-guide.md
│   └── architecture-overview.md
└── config/
    ├── environments/
    │   ├── development.env
    │   ├── staging.env
    │   └── production.env
    └── docker-compose.yml
```

## Key Benefits

### Consistency
- Predictable file locations
- Uniform naming across team
- Easier onboarding for new developers

### Maintainability
- Clear separation of concerns
- Easy to locate and modify files
- Scalable structure as project grows

### Tooling Support
- Better IDE organization and search
- Improved build tool configuration
- Enhanced linting and formatting rules

### Standards Compliance
- Follows industry best practices
- Compatible with popular frameworks
- Works well with deployment tools

## Implementation Tips

1. **Document your conventions** - Keep this guide updated and accessible
2. **Use linting rules** - Enforce naming conventions with ESLint/Prettier
3. **Create templates** - Set up file templates for consistent structure
4. **Regular reviews** - Ensure team follows conventions during code reviews
5. **Tool integration** - Configure IDEs to auto-format according to conventions