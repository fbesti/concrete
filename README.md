# concrete
To create an empty project with only CLAUDE.md file use input:
Initilize a pnpm project called <projectName>

This should start everything defined inside CLAUDE.md
Example:
Update Todos
  ⎿  ☐ Initialize pnpm workspace with root package.json
     ☐ Create pnpm-workspace.yaml configuration
     ☐ Set up Node.js version with .nvmrc
     ☐ Create project directory structure
     ☐ Initialize apps/api package
     ☐ Initialize apps/web package
     ☐ Initialize packages/database package
     ☐ Initialize packages/shared package
     ☐ Set up ESLint configurations
     ☐ Set up pre-commit hooks with Husky

✅ Workspace Structure: Apps (api, web) and packages (database, shared)
✅ TypeScript Configuration: Strict mode with proper compiler options
✅ Database Schema: Prisma models for users, house associations, and related entities
✅ Code Quality: ESLint configs (Google for API, Airbnb for web) + Prettier
✅ Pre-commit Hooks: Husky with linting, type  checking, and unit tests
✅ Docker Setup: Multi-service compose with PostgreSQL
✅ Environment: Example env file with database and API configuration
