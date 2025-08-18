export enum UserRole {
  HA_MANAGER = 'HA_MANAGER',
  PROPERTY_OWNER = 'PROPERTY_OWNER',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  kennitala?: string;
  createdAt: Date;
  updatedAt: Date;
}