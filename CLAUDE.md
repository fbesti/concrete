# CLAUDE.md

This file provides comprehensive guidance to Claude Code when working with code in this repository.

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they might be useful in the future.

## Critical Thinking and Feedback

**IMPORTANT: Always critically evaluate and challenge user suggestions, even when they seem reasonable.**

**USE BRUTAL HONESTY**: Don't try to be polite or agreeable. Be direct, challenge assumptions, and point out flaws immediately.

- **Question assumptions**: Don't just agree - analyze if there are better approaches
- **Offer alternative perspectives**: Suggest different solutions or point out potential issues
- **Challenge organization decisions**: If something doesn't fit logically, speak up
- **Point out inconsistencies**: Help catch logical errors or misplaced components
- **Research thoroughly**: Never skim documentation or issues - read them completely before responding
- **Use proper tools**: For GitHub issues, always use `gh` cli instead of WebFetch (WebFetch may miss critical content)
- **Admit ignorance**: Say "I don't know" instead of guessing or agreeing without understanding

This critical feedback helps improve decision-making and ensures robust solutions. Being agreeable is less valuable than being thoughtful and analytical.

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
Concrete House Association Management/
├── .github/                        # Github Actions Workflow
├── .husky/                         # Git commit hooks
├── apps/
│   ├── api/                          # Node.js API
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   ├── controllers/
│   │   │   ├── schemas/
│   │   │   ├── config/
│   │   │   ├── utils/
│   │   │   └── app.ts
│   │   ├── tests/                    # API-specific tests
│   │   │   ├── unit/
│   │   │   │   ├── services/
│   │   │   │   └── middleware/
│   │   │   ├── integration/
│   │   │   │   └── {routes}/
│   │   │   ├── fixtures/
│   │   │   │   └── ha-test-data.ts
│   │   │   └── setup/
│   │   │       └── test-env.ts
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
│   │   │   ├── migrations/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── tests/                    # Database/migration tests
│   │   │   ├── client.test.ts
│   │   │   └── {migrations}/
│   │   └── package.json
│   └── shared/                       # Shared TypeScript types
│       ├── src/
│       │   ├── index.ts
│       │   ├── types/
│       │   │   ├── user.ts
│       │   │   └── house-association.ts
│       │   └── schemas/
│       │       └── validation.ts
│       ├── tests/                    # Shared utility tests
│       │   └── types.test.ts
│       └── package.json
├── tests/                            # E2E and integration tests
│   ├── e2e/
│   └── fixtures/
├── infrastructure/
│   └── azure/                        # Terraform IaC code
├── docs/
├── .github/                          # GitHub Actions workflows
│   └── workflows/
│       ├── pr-tests.yml              # PR test workflow
│       └── way_to_much/
│           └── extensive.yml
├── .husky/                           # Git hooks configuration
│   └── pre-commit                    # Pre-commit hook script
├── docker-compose.yml
├── pnpm-workspace.yaml
├── .nvmrc
└── README.md
```

### Package Manager & Node.js Configuration

#### pnpm-workspace.yaml

```yaml
packages:
  - apps/*
  - packages/*

ignoredBuiltDependencies:
  - '@prisma/client'
  - '@prisma/engines'
  - bcrypt
  - esbuild
  - prisma
  - unrs-resolver
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
- **File Naming**: kebab-case for pages, PascalCase for components, kebab-case for API routes, PascalCase for models, PascalCase for services (e.g., `auth.service.ts`), PascalCase for controllers (e.g., `auth.controller.ts`), kebab-case for middleware, kebab-case for utilities, kebab-case for type files, kebab-case for config, SCREAMING_SNAKE_CASE for constant files, kebab-case for migrations, match source file for tests, camelCase for hooks, kebab-case for stores
- **Import Order**: External libraries → Internal modules → Relative imports

#### Backend Style Guide (Node.js/Express)

- **Primary**: [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- **Function Documentation**: TSDoc comments for public APIs (JSDoc not required for internal functions)
- **Error Handling**: Explicit error types, no `any` types
- **Unused Variables**: Prefix with `_` (underscore) to indicate intentionally unused
- **File Naming**: Services use dot notation (e.g., `auth.service.ts`), controllers use dot notation (e.g., `auth.controller.ts`), schemas use dot notation (e.g., `auth.schemas.ts`), other files use kebab-case
- **Import Order**: Node modules → Local modules → Types
- **Variable Destructuring**: Use `_` prefix for destructured variables that won't be used

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
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};
```

#### Backend (.eslintrc.js)

```javascript
module.exports = {
  extends: ['@typescript-eslint/recommended', 'google', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'max-len': ['error', { code: 100 }],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    'new-cap': [
      'error',
      {
        capIsNewExceptions: ['Router'],
      },
    ],
  },
};
```

### Pre-commit Hooks Configuration

Pre-commit hooks are configured with Husky and include optimizations for documentation-only commits.

#### .husky/pre-commit

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Check if only .md files are being committed
staged_files=$(git diff --cached --name-only)
non_md_files=$(echo "$staged_files" | grep -v '\.md$' || true)

# Always run lint-staged (handles formatting for all files including .md)
npx lint-staged

# Skip heavy checks if only .md files are being committed
if [ -z "$non_md_files" ]; then
  echo "Only .md files detected, skipping type-check and tests"
  exit 0
fi

# Run type checking
pnpm -r type-check

# Run unit tests (fast feedback)
pnpm --filter api test:unit
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

- **Maintain consistent error handling** across the entire API
- **Specific error messages** instead of generic failures
- **Proper HTTP status codes** based on error types
- **Better debugging** with meaningful error messages
- **Reduced code duplication** - single source of truth for errors

## 🔄 Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test additions or fixes

### Model-Database Alignment

- Use Shadow database for development.
- Apply the current state from your main dev database
- Tests the new migration on the shadow database
- Validates the migration works correctly
- Apply to main dev database only if successful
- Deletes the shadow database

## 📝 Documentation Standards

### Code Documentation

- Every module should have a brief comment explaining its purpose
- Public APIs should have TSDoc comments when appropriate
- Complex logic should have inline comments explaining the reasoning
- JSDoc is not required for internal functions (ESLint rule disabled)
- Keep README.md updated with setup instructions and examples
- Maintain CHANGELOG.md for version history

### Unused Variables and Parameters

Follow ESLint conventions for unused variables:

```typescript
// ✅ Correct: Prefix unused variables with underscore
const { password: _password, ...userWithoutPassword } = user;
const { confirmPassword: _, ...userData } = registrationData;

// ✅ Correct: Unused function parameters
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction // Prefixed because Express requires 4 params
): void => {
  // Implementation
};

// ✅ Correct: Destructuring with unused values
const [first, , third] = array; // Middle element intentionally skipped

// ❌ Incorrect: Unused variables without underscore prefix
const { password, ...userWithoutPassword } = user; // ESLint error
```

## 🛡️ Security Best Practices

### Security Guidelines

- Never commit secrets - use environment variables
- Use parameterized queries for database operations (Prisma ORM provides this)
- Implement rate limiting for APIs (configured in middleware)
- Use HTTPS for all external communications
- Implement proper authentication and authorization (JWT-based system implemented)
- Password hashing with bcrypt (12 salt rounds minimum)
- Input validation with Zod schemas and XSS protection
- Structured error responses without sensitive information leakage

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

---

_This document is a living guide. Update it as the project evolves and new patterns emerge._
