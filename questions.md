  1. Project Location & Naming
  - Should I create the ha-management-mvp/ directory within the current /home/freyr/homeprojects/concrete folder, or alongside it?
  - Any preference for the exact project name (the PRP suggests ha-management-mvp)?

  2. Package Manager
  - npm, yarn, or pnpm? (This affects workspace configuration and lock files)
  - Do you have a preference for package manager for this project?

  3. Node.js Version
  - What Node.js version should I target? (affects package.json engines field)
  - Should I add .nvmrc for version management?

  Database Configuration

  4. Local Database Setup
  - PostgreSQL version preference for local development?
  - Database name convention (the PRP suggests ha_management)?
  - Default credentials for local development?

  5. Prisma Configuration
  - Should I set up Prisma with shadow database for development?
  - Any specific naming conventions for database tables vs. Prisma models?

  Development Environment

  6. Docker Preferences
  - Full Docker setup (database + API) or just database in Docker?
  - Should the API run in Docker for development or locally with Docker DB?

  7. Environment Variables
  - Which environment variables do you want configured from the start?
  - Preference for .env file structure/naming?

  Code Quality & Testing

  8. Testing Setup
  - Should I include basic test setup in Phase 1, or wait for Phase 2?
  - Jest configuration preferences if including tests?

  9. Git Configuration
  - Should I initialize git repo and set up initial commit structure?
  - Any specific branch protection or workflow requirements?

  Dependencies & Tooling

  10. Package Versions
  - Any specific version constraints for key dependencies (Express, Prisma, TypeScript)?
  - Preference for latest stable vs. specific LTS versions?

  11. Development Scripts
  - Beyond the standard scripts, any specific development commands you'd find useful?
