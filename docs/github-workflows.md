# GitHub Actions Workflows

## Pull Request Testing Workflow

### Overview

The `pr-tests.yml` workflow runs comprehensive tests on all pull requests to ensure code quality and functionality.

### Workflow Structure

#### 🔍 **Code Quality** (10 min)

- TypeScript type checking across all packages
- ESLint compliance verification
- Prettier format checking
- Runs in parallel with other jobs for speed

#### 🧪 **API Tests** (15 min)

- **Unit Tests**: 70+ tests for all services and middleware
- **Integration Tests**: Real API endpoint testing with database
- **Test Coverage**: Generates coverage reports uploaded to Codecov
- **Database Setup**: PostgreSQL service with migrations and seeding
- **Environment**: Isolated test environment with proper JWT secrets

#### 🌐 **Web App Tests** (10 min)

- Next.js build verification
- React component testing
- TypeScript compilation for frontend

#### 🗄️ **Database Tests** (10 min)

- Prisma migration testing
- Database schema validation
- Seed data verification

#### 📦 **Shared Package Tests** (5 min)

- Shared utilities and types testing
- Cross-package compatibility verification

#### 🔐 **Security Audit** (5 min)

- npm/pnpm security vulnerability scanning
- Dependency audit with moderate-level security requirements

#### 🏗️ **Build Verification** (10 min)

- Full monorepo build testing
- Output verification for all packages
- Production readiness validation

#### 📊 **PR Summary** (2 min)

- Automated comment with test results
- Coverage reports and status overview
- Build success confirmation

### Trigger Conditions

**Runs on**:

- Pull requests to `main` or `develop` branches
- Changes to any code in `apps/`, `packages/`, or workflow files
- Skips draft pull requests automatically

**Concurrency**:

- Cancels previous runs when new commits are pushed
- Prevents resource waste and speeds up feedback

### Environment Variables

The workflow uses these environment variables for testing:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ha_management_test
SHADOW_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ha_management_shadow_test
NODE_ENV=test
JWT_SECRET=test-secret-key-that-is-at-least-32-characters-long-for-github-actions
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000
PORT=3001
```

### Services

**PostgreSQL 15**:

- Health checks with 10s intervals
- Isolated test database per workflow run
- Automatic cleanup after tests complete

### Success Criteria

All jobs must pass for the PR to be considered ready:

- ✅ Code quality checks (typing, linting, formatting)
- ✅ All unit tests passing (70+ tests)
- ✅ All integration tests passing
- ✅ Database migrations successful
- ✅ Security audit clean
- ✅ Build outputs generated successfully

### Failure Handling

**If tests fail**:

1. Workflow stops execution
2. Detailed error logs available in Actions tab
3. PR cannot be merged until issues resolved
4. Coverage reports show test gaps

**Common failure scenarios**:

- TypeScript compilation errors
- Test failures (unit/integration)
- ESLint rule violations
- Database migration issues
- Security vulnerabilities found
- Build process failures

### Performance Optimization

**Parallel Execution**:

- Jobs run concurrently where possible
- Dependencies only where necessary (build after code quality)
- Total runtime ~15-20 minutes

**Caching**:

- Node.js dependencies cached between runs
- pnpm cache for faster installs
- Docker layer caching for database services

**Resource Limits**:

- 10-15 minute timeouts per job
- Prevents hanging workflows
- Automatic cleanup of resources

### Usage Examples

**Creating a PR**:

```bash
git checkout -b feature/my-feature
# Make changes
git commit -m "feat: add new feature"
git push origin feature/my-feature
# Create PR through GitHub UI
# Workflow automatically triggers
```

**Monitoring Progress**:

1. Go to GitHub repository
2. Click "Actions" tab
3. Find your workflow run
4. View real-time progress and logs
5. Check PR for automated summary comment

### Integration with Development

**Pre-commit Hooks**:

- Local validation before pushing
- Faster feedback loop
- Reduces CI/CD failures

**Branch Protection**:

- Require status checks to pass
- Prevent direct pushes to main
- Ensure code review process

This workflow ensures high code quality and prevents breaking changes from reaching the main branch.
