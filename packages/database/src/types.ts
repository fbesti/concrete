// Placeholder types until Prisma client is generated
// Run `pnpm --filter database db:generate` to generate proper types

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  kennitala?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HouseAssociation {
  id: string;
  name: string;
  address: string;
  registrationNum: string;
  managerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HAMembership {
  id: string;
  userId: string;
  haId: string;
}

export enum UserRole {
  HA_MANAGER = 'HA_MANAGER',
  PROPERTY_OWNER = 'PROPERTY_OWNER',
}