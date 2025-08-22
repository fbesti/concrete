import { UserRole } from '@prisma/client';

export const mockUsers = {
  manager1: {
    id: 'usr_manager_001',
    email: 'manager1@ha.is',
    password: 'hashedPassword123',
    firstName: 'Jón',
    lastName: 'Jónsson',
    role: UserRole.HA_MANAGER,
    kennitala: '1234567890',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  manager2: {
    id: 'usr_manager_002',
    email: 'manager2@ha.is',
    password: 'hashedPassword123',
    firstName: 'Anna',
    lastName: 'Sigurdsdóttir',
    role: UserRole.HA_MANAGER,
    kennitala: '0987654321',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  propertyOwner1: {
    id: 'usr_owner_001',
    email: 'owner1@example.is',
    password: 'hashedPassword123',
    firstName: 'Gunnar',
    lastName: 'Einarsson',
    role: UserRole.PROPERTY_OWNER,
    kennitala: '1122334455',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  propertyOwner2: {
    id: 'usr_owner_002',
    email: 'owner2@example.is',
    password: 'hashedPassword123',
    firstName: 'María',
    lastName: 'Pétursdóttir',
    role: UserRole.PROPERTY_OWNER,
    kennitala: '5566778899',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  propertyOwner3: {
    id: 'usr_owner_003',
    email: 'owner3@example.is',
    password: 'hashedPassword123',
    firstName: 'Ólafur',
    lastName: 'Ragnarsson',
    role: UserRole.PROPERTY_OWNER,
    kennitala: '9988776655',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
};

export const mockHouseAssociations = {
  ha1: {
    id: 'ha_001',
    name: 'Reykjavík Húsfélag',
    address: 'Laugavegur 12, 101 Reykjavík',
    registrationNum: '701123-4567',
    managerId: mockUsers.manager1.id,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  ha2: {
    id: 'ha_002',
    name: 'Hafnarfjörður Íbúðafélag',
    address: 'Strandgata 5, 220 Hafnarfjörður',
    registrationNum: '701987-6543',
    managerId: mockUsers.manager2.id,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  ha3: {
    id: 'ha_003',
    name: 'Kópavogur Sameignarfélag',
    address: 'Dalvegur 18, 200 Kópavogur',
    registrationNum: '701555-9999',
    managerId: mockUsers.manager1.id,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
};

export const mockHAMemberships = [
  {
    id: 'mem_001',
    userId: mockUsers.propertyOwner1.id,
    haId: mockHouseAssociations.ha1.id,
  },
  {
    id: 'mem_002',
    userId: mockUsers.propertyOwner2.id,
    haId: mockHouseAssociations.ha1.id,
  },
  {
    id: 'mem_003',
    userId: mockUsers.propertyOwner3.id,
    haId: mockHouseAssociations.ha2.id,
  },
];

export const mockHAWithManager = {
  ...mockHouseAssociations.ha1,
  manager: {
    id: mockUsers.manager1.id,
    firstName: mockUsers.manager1.firstName,
    lastName: mockUsers.manager1.lastName,
    email: mockUsers.manager1.email,
  },
  _count: {
    members: 2,
    documents: 0,
    announcements: 0,
    meetings: 0,
  },
};

export const mockMembershipWithUser = {
  id: 'mem_001',
  userId: mockUsers.propertyOwner1.id,
  haId: mockHouseAssociations.ha1.id,
  user: {
    id: mockUsers.propertyOwner1.id,
    firstName: mockUsers.propertyOwner1.firstName,
    lastName: mockUsers.propertyOwner1.lastName,
    email: mockUsers.propertyOwner1.email,
    kennitala: mockUsers.propertyOwner1.kennitala,
  },
};

export const validHAData = {
  name: 'Test Húsfélag',
  address: 'Testgata 1, 101 Reykjavík',
  registrationNum: '701111-2222',
  managerId: mockUsers.manager1.id,
};

export const invalidHAData = {
  name: '', // Invalid: empty name
  address: 'Test Address',
  registrationNum: 'invalid-format', // Invalid: wrong format
  managerId: 'invalid_user_id',
};

export const validKennitala = '1234567890';
export const invalidKennitala = '99999999999'; // Invalid: wrong length
export const invalidKennitalaFormat = 'abcd567890'; // Invalid: contains letters

export const createMockPrismaResponse = (data: any, count = 0) => ({
  ...data,
  _count: count ? { members: count } : data._count,
});

export const paginationDefaults = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export default {
  mockUsers,
  mockHouseAssociations,
  mockHAMemberships,
  mockHAWithManager,
  mockMembershipWithUser,
  validHAData,
  invalidHAData,
  validKennitala,
  invalidKennitala,
  invalidKennitalaFormat,
  createMockPrismaResponse,
  paginationDefaults,
};
