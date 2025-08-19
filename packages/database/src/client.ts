// Prisma client setup
// Run `pnpm --filter database db:generate` to generate the client

let PrismaClient: any;

try {
  // Try to import Prisma client (may not exist until generated)
  PrismaClient = require('@prisma/client').PrismaClient;
} catch {
  // Create a mock client if Prisma hasn't been generated yet
  PrismaClient = class MockPrismaClient {
    constructor() {
      console.warn('Prisma client not generated. Run `pnpm --filter database db:generate`');
    }
  };
}

declare global {
  var __prisma: any | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}