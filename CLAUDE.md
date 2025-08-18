# CLAUDE.md

This file provides comprehensive guidance to Claude Code when working with code in this repository.

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they might be useful in the future.

### Design Principles

- **Dependency Inversion**: High-level modules should not depend on low-level modules. Both should depend on abstractions.
- **Open/Closed Principle**: Software entities should be open for extension but closed for modification.
- **Single Responsibility**: Each function, class, and module should have one clear purpose.
- **Fail Fast**: Check for potential errors early and raise exceptions immediately when issues occur.

## 🧱 Code Structure & Modularity

### File and Function Limits

- **Never create a file longer than 500 lines of code**. If approaching this limit, refactor by splitting into modules.
- **Functions should be under 50 lines** with a single, clear responsibility.
- **Classes should be under 100 lines** and represent a single concept or entity.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.

### Project Structure

Follow strict vertical slice architecture with tests living next to the code they test:

```
src/
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
├── .github/
│   └── workflows/
│       ├── test.yml                  # Test workflow
│       ├── build.yml
│       └── deploy.yml
├── docker-compose.yml
├── docker-compose.test.yml           # Test environment
└── README.md
```

### Package Manager & Node.js Configuration

#### Root package.json
```json
{
  "name": "ha-management-mvp",
  "private": true,
  "engines": {
    "node": ">=22.18.0 <23.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.1",
  "scripts": {
    "prepare": "husky install",
    "dev": "pnpm --filter web dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "test:unit": "pnpm --filter api test:unit",
    "test:integration": "pnpm --filter api test:integration", 
    "test:e2e": "playwright test",
    "test:all": "pnpm run test && pnpm run test:e2e",
    "lint": "pnpm -r lint",
    "lint:fix": "pnpm -r lint:fix",
    "format": "pnpm -r format",
    "type-check": "pnpm -r type-check"
  },
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "lint-staged": {
    "apps/web/**/*.{ts,tsx}": [
      "pnpm --filter web lint:fix",
      "pnpm --filter web format"
    ],
    "apps/api/**/*.{ts}": [
      "pnpm --filter api lint:fix", 
      "pnpm --filter api format"
    ],
    "**/*.{json,md}": [
      "prettier --write"
    ]
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint-config-airbnb": "^19.0.4",
    "eslint-config-airbnb-typescript": "^17.1.0",
    "eslint-config-google": "^0.14.0",
    "eslint-config-prettier": "^9.0.0",
    "prettier": "^3.0.0",
    "husky": "^8.0.3",
    "lint-staged": "^14.0.1",
    "@playwright/test": "^1.40.0"
  }
}
```

#### pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

#### .nvmrc
```
22.18.0
```

### Code Style Guidelines

#### Frontend Style Guide (Next.js/React)
- **Primary**: [Airbnb JavaScript/React Style Guide](https://github.com/airbnb/javascript)
- **TypeScript**: [Airbnb TypeScript Config](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-typescript)
- **Component Naming**: PascalCase for components, camelCase for utilities
- **File Naming**: kebab-case for pages, PascalCase for components, kebab-case for API routes, PascalCase for models, PascalCase for services, PascalCase for controllers, kebab-case for middleware, kebab-case for utilities, kebab-case for type files, kebab-case for config, SCREAMING_SNAKE_CASE for constant files, kebab-case for migrations, match source file for tests, camelCase for hooks, kebab-case for stores
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

### ESLint Configuration

#### Frontend (.eslintrc.js)
```javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function'
      }
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  }
}
```

#### Backend (.eslintrc.js)
```javascript
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'google',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'require-jsdoc': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'max-len': ['error', { code: 100 }]
  }
}
```

### Pre-commit Hooks Configuration

#### .husky/pre-commit
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged (handles linting and formatting)
npx lint-staged

# Run type checking
pnpm -r type-check

# Run unit tests (fast feedback)
pnpm --filter api test:unit
```

#### Individual App Scripts

**apps/web/package.json:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

**apps/api/package.json:**
```json
{
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "lint": "eslint src/ --ext .ts",
    "lint:fix": "eslint src/ --ext .ts --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:coverage": "jest --coverage"
  }
}
```

## 🧪 Testing Strategy

### Test-Driven Development (TDD)

1. **Write the test first** - Define expected behavior before implementation
2. **Watch it fail** - Ensure the test actually tests something
3. **Write minimal code** - Just enough to make the test pass
4. **Refactor** - Improve code while keeping tests green
5. **Repeat** - One test at a time

### Testing Best Practices

### Test Organization

- Unit tests: Test individual functions/methods in isolation
- Integration tests: Test component interactions
- End-to-end tests: Test complete user workflows
- Keep test files next to the code they test
- Aim for 80%+ code coverage, but focus on critical paths

## 🚨 Error Handling

### Exception Best Practices

### Logging Strategy

## 🔧 Configuration Management

### Environment Variables and Settings

## 🏗️ Data Models and Validation


## 🔄 Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test additions or fixes

### Commit Message Format

Never include claude code, or written by claude code in commit messages

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

### Model-Database Alignment
- Use Shadow database for development.
- Apply the current state from your main dev database
- Tests the new migration on the shadow database
- Validates the migration works correctly
- Apply to main dev database only if successful
- Deletes the shadow database
## 📝 Documentation Standards

### Code Documentation

- Every module should have a docstring explaining its purpose
- Public functions must have complete docstrings
- Complex logic should have inline comments with `# Reason:` prefix
- Keep README.md updated with setup instructions and examples
- Maintain CHANGELOG.md for version history

### API Documentation


## 🚀 Performance Considerations

### Optimization Guidelines


### Example Optimization

## 🛡️ Security Best Practices

### Security Guidelines
- Never commit secrets - use environment variables
- Use parameterized queries for database operations
- Implement rate limiting for APIs
- Use HTTPS for all external communications
- Implement proper authentication and authorization

### Example Security Implementation

## 🔍 Debugging Tools

### Debugging Commands


## 📊 Monitoring and Observability

### Structured Logging



## 📚 Useful Resources

### Essential Tools

- NodeJS Latest LTS Release: https://nodejs.org/en/blog/release/v22.18.0
- PNPM Package Manager: https://pnpm.io/
- Prisma ORM: https://www.prisma.io/orm


## ⚠️ Important Notes

- **NEVER ASSUME OR GUESS** - When in doubt, ask for clarification
- **Always verify file paths and module names** before use
- **Keep CLAUDE.md updated** when adding new patterns or dependencies
- **Test your code** - No feature is complete without tests
- **Document your decisions** - Future developers (including yourself) will thank you

## 🔍 Search Command Requirements

**CRITICAL**: Always use `rg` (ripgrep) instead of traditional `grep` and `find` commands:

```bash
# ❌ Don't use grep
grep -r "pattern" .

# ✅ Use rg instead
rg "pattern"

# ❌ Don't use find with name
find . -name "*.py"

# ✅ Use rg with file filtering
rg --files | rg "\.py$"
# or
rg --files -g "*.py"
```

**Enforcement Rules:**

```
(
    r"^grep\b(?!.*\|)",
    "Use 'rg' (ripgrep) instead of 'grep' for better performance and features",
),
(
    r"^find\s+\S+\s+-name\b",
    "Use 'rg --files | rg pattern' or 'rg --files -g pattern' instead of 'find -name' for better performance",
),
```

## 🚀 GitHub Flow Workflow Summary

main (protected) ←── PR ←── feature/your-feature
↓ ↑
deploy development

### Daily Workflow:

1. git checkout main && git pull origin main
2. git checkout -b feature/new-feature
3. Make changes + tests
4. git push origin feature/new-feature
5. Create PR → Review → Merge to main

---

_This document is a living guide. Update it as the project evolves and new patterns emerge._