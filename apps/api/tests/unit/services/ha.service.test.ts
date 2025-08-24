import { HAService } from '../../../src/services/ha.service';
import { ApiError } from '../../../src/utils/response';
import { UserRole } from '@prisma/client';
import {
  mockUsers,
  mockHouseAssociations,
  mockHAWithManager,
  mockMembershipWithUser,
  validHAData,
  validKennitala,
  invalidKennitala,
} from '../../fixtures/ha-test-data';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    houseAssociation: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    hAMembership: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    document: {
      deleteMany: jest.fn(),
    },
    announcement: {
      deleteMany: jest.fn(),
    },
    meeting: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    UserRole: {
      HA_MANAGER: 'HA_MANAGER',
      PROPERTY_OWNER: 'PROPERTY_OWNER',
    },
  };
});

// Get mock instance for test assertions
const { PrismaClient } = require('@prisma/client');
const mockPrisma = new PrismaClient();

describe('HAService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createHA', () => {
    it('should create a house association successfully', async () => {
      // Mock manager exists and has correct role
      mockPrisma.user.findUnique.mockResolvedValue(mockUsers.manager1);

      // Mock no existing HA with same registration number
      mockPrisma.houseAssociation.findUnique.mockResolvedValue(null);

      // Mock successful HA creation
      mockPrisma.houseAssociation.create.mockResolvedValue(mockHAWithManager);

      const result = await HAService.createHA(validHAData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: validHAData.managerId },
        select: { id: true, role: true },
      });

      expect(mockPrisma.houseAssociation.findFirst).toHaveBeenCalledWith({
        where: { registrationNum: validHAData.registrationNum },
      });

      expect(mockPrisma.houseAssociation.create).toHaveBeenCalledWith({
        data: validHAData,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              documents: true,
              announcements: true,
              meetings: true,
            },
          },
        },
      });

      expect(result).toEqual(mockHAWithManager);
    });

    it('should throw error if manager not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(HAService.createHA(validHAData)).rejects.toThrow(
        new ApiError(404, 'Manager not found')
      );
    });

    it('should throw error if user is not HA_MANAGER', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUsers.propertyOwner1,
        role: UserRole.PROPERTY_OWNER,
      });

      await expect(HAService.createHA(validHAData)).rejects.toThrow(
        new ApiError(
          403,
          'Only users with HA_MANAGER role can create house associations'
        )
      );
    });

    it('should throw error if registration number already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUsers.manager1);
      mockPrisma.houseAssociation.findFirst.mockResolvedValue(
        mockHouseAssociations.ha1
      );

      await expect(HAService.createHA(validHAData)).rejects.toThrow(
        new ApiError(
          409,
          'House association with this registration number already exists'
        )
      );
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));
      mockPrisma.houseAssociation.findFirst.mockResolvedValue(null);

      await expect(HAService.createHA(validHAData)).rejects.toThrow(
        new ApiError(500, 'Unexpected error: Database error')
      );
    });
  });

  describe('getHAById', () => {
    it('should return HA details for authorized user', async () => {
      // Mock HA exists
      mockPrisma.houseAssociation.findUnique.mockResolvedValue(
        mockHAWithManager
      );

      // Mock validation service
      const {
        HAValidationService,
      } = require('../../../src/services/ha/ha-validation.service');
      const validateAccessSpy = jest
        .spyOn(HAValidationService, 'validateHAAccessForUser')
        .mockResolvedValue(undefined);

      const result = await HAService.getHAById(
        mockHouseAssociations.ha1.id,
        mockUsers.manager1.id,
        UserRole.HA_MANAGER
      );

      expect(mockPrisma.houseAssociation.findUnique).toHaveBeenCalledWith({
        where: { id: mockHouseAssociations.ha1.id },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              documents: true,
              announcements: true,
              meetings: true,
            },
          },
        },
      });

      expect(validateAccessSpy).toHaveBeenCalledWith(
        mockHouseAssociations.ha1.id,
        mockUsers.manager1.id,
        UserRole.HA_MANAGER
      );

      expect(result).toEqual(mockHAWithManager);

      validateAccessSpy.mockRestore();
    });

    it('should throw error if HA not found', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue(null);

      await expect(
        HAService.getHAById(
          'nonexistent_id',
          mockUsers.manager1.id,
          UserRole.HA_MANAGER
        )
      ).rejects.toThrow(new ApiError(404, 'House association not found'));
    });

    it('should throw error if user has no access', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue(
        mockHAWithManager
      );
      const checkAccessSpy = jest
        .spyOn(HAService, 'checkHAAccess')
        .mockResolvedValue(false);

      await expect(
        HAService.getHAById(
          mockHouseAssociations.ha1.id,
          mockUsers.propertyOwner1.id,
          UserRole.PROPERTY_OWNER
        )
      ).rejects.toThrow(
        new ApiError(403, 'You do not have access to this house association')
      );

      checkAccessSpy.mockRestore();
    });
  });

  describe('listHAs', () => {
    const listOptions = {
      page: 1,
      limit: 10,
      userId: mockUsers.manager1.id,
      userRole: UserRole.HA_MANAGER,
    };

    it('should list HAs for HA manager', async () => {
      const mockResult = [mockHAWithManager];
      mockPrisma.houseAssociation.findMany.mockResolvedValue(mockResult);
      mockPrisma.houseAssociation.count.mockResolvedValue(1);

      const result = await HAService.listHAs(listOptions);

      expect(mockPrisma.houseAssociation.findMany).toHaveBeenCalledWith({
        where: { managerId: mockUsers.manager1.id },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              documents: true,
              announcements: true,
              meetings: true,
            },
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual({
        houseAssociations: mockResult,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('should list HAs for property owner (member filter)', async () => {
      const propertyOwnerOptions = {
        ...listOptions,
        userId: mockUsers.propertyOwner1.id,
        userRole: UserRole.PROPERTY_OWNER,
      };

      mockPrisma.houseAssociation.findMany.mockResolvedValue([
        mockHAWithManager,
      ]);
      mockPrisma.houseAssociation.count.mockResolvedValue(1);

      await HAService.listHAs(propertyOwnerOptions);

      expect(mockPrisma.houseAssociation.findMany).toHaveBeenCalledWith({
        where: {
          members: {
            some: {
              userId: mockUsers.propertyOwner1.id,
            },
          },
        },
        include: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should include search filter when provided', async () => {
      const searchOptions = {
        ...listOptions,
        search: 'Reykjavík',
      };

      mockPrisma.houseAssociation.findMany.mockResolvedValue([]);
      mockPrisma.houseAssociation.count.mockResolvedValue(0);

      await HAService.listHAs(searchOptions);

      expect(mockPrisma.houseAssociation.findMany).toHaveBeenCalledWith({
        where: {
          managerId: mockUsers.manager1.id,
          OR: [
            { name: { contains: 'Reykjavík', mode: 'insensitive' } },
            { address: { contains: 'Reykjavík', mode: 'insensitive' } },
            { registrationNum: { contains: 'Reykjavík', mode: 'insensitive' } },
          ],
        },
        include: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle pagination correctly', async () => {
      const paginatedOptions = {
        ...listOptions,
        page: 2,
        limit: 5,
      };

      mockPrisma.houseAssociation.findMany.mockResolvedValue([]);
      mockPrisma.houseAssociation.count.mockResolvedValue(12);

      const result = await HAService.listHAs(paginatedOptions);

      expect(mockPrisma.houseAssociation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page 2 - 1) * limit 5
          take: 5,
        })
      );

      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 12,
        totalPages: 3, // Math.ceil(12/5)
      });
    });
  });

  describe('updateHA', () => {
    const updateData = {
      name: 'Updated HA Name',
      address: 'Updated Address',
    };

    it('should update HA successfully', async () => {
      // Mock HA exists and user is manager
      mockPrisma.houseAssociation.findUnique
        .mockResolvedValueOnce({
          id: mockHouseAssociations.ha1.id,
          managerId: mockUsers.manager1.id,
          registrationNum: mockHouseAssociations.ha1.registrationNum,
        })
        .mockResolvedValueOnce(null); // No conflict with registration number

      mockPrisma.houseAssociation.update.mockResolvedValue({
        ...mockHAWithManager,
        ...updateData,
      });

      const result = await HAService.updateHA(
        mockHouseAssociations.ha1.id,
        updateData,
        mockUsers.manager1.id
      );

      expect(mockPrisma.houseAssociation.update).toHaveBeenCalledWith({
        where: { id: mockHouseAssociations.ha1.id },
        data: { name: 'Updated HA Name', address: 'Updated Address' },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              documents: true,
              announcements: true,
              meetings: true,
            },
          },
        },
      });

      expect(result).toEqual({
        ...mockHAWithManager,
        ...updateData,
      });
    });

    it('should throw error if HA not found', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue(null);

      await expect(
        HAService.updateHA('nonexistent_id', updateData, mockUsers.manager1.id)
      ).rejects.toThrow(new ApiError(404, 'House association not found'));
    });

    it('should throw error if user is not the manager', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue({
        id: mockHouseAssociations.ha1.id,
        managerId: mockUsers.manager2.id, // Different manager
        registrationNum: mockHouseAssociations.ha1.registrationNum,
      });

      await expect(
        HAService.updateHA(
          mockHouseAssociations.ha1.id,
          updateData,
          mockUsers.manager1.id
        )
      ).rejects.toThrow(
        new ApiError(
          403,
          'Only the manager can update house association details'
        )
      );
    });

    it('should throw error if registration number conflicts', async () => {
      const updateWithRegNum = {
        ...updateData,
        registrationNum: '701999-8888',
      };

      // Mock HA exists and user is manager
      mockPrisma.houseAssociation.findUnique.mockResolvedValue({
        id: mockHouseAssociations.ha1.id,
        managerId: mockUsers.manager1.id,
        registrationNum: mockHouseAssociations.ha1.registrationNum,
      });

      // Mock registration number conflict
      mockPrisma.houseAssociation.findFirst.mockResolvedValue(
        mockHouseAssociations.ha2
      );

      await expect(
        HAService.updateHA(
          mockHouseAssociations.ha1.id,
          updateWithRegNum,
          mockUsers.manager1.id
        )
      ).rejects.toThrow(
        new ApiError(
          409,
          'House association with this registration number already exists'
        )
      );
    });
  });

  describe('addMember', () => {
    it('should add member successfully', async () => {
      // Mock HA exists and user is manager
      mockPrisma.houseAssociation.findUnique.mockResolvedValueOnce({
        id: mockHouseAssociations.ha1.id,
        managerId: mockUsers.manager1.id,
      });

      // Mock user with kennitala exists
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: mockUsers.propertyOwner1.id,
        firstName: mockUsers.propertyOwner1.firstName,
        lastName: mockUsers.propertyOwner1.lastName,
        email: mockUsers.propertyOwner1.email,
        kennitala: mockUsers.propertyOwner1.kennitala,
      });

      // Mock no existing membership
      mockPrisma.hAMembership.findUnique.mockResolvedValue(null);

      // Mock successful membership creation
      mockPrisma.hAMembership.create.mockResolvedValue(mockMembershipWithUser);

      const result = await HAService.addMember(
        mockHouseAssociations.ha1.id,
        validKennitala,
        mockUsers.manager1.id
      );

      expect(mockPrisma.hAMembership.create).toHaveBeenCalledWith({
        data: {
          userId: mockUsers.propertyOwner1.id,
          haId: mockHouseAssociations.ha1.id,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              kennitala: true,
            },
          },
        },
      });

      expect(result).toEqual(mockMembershipWithUser);
    });

    it('should throw error if HA not found', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue(null);

      await expect(
        HAService.addMember(
          'nonexistent_id',
          validKennitala,
          mockUsers.manager1.id
        )
      ).rejects.toThrow(new ApiError(404, 'House association not found'));
    });

    it('should throw error if user is not the manager', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue({
        id: mockHouseAssociations.ha1.id,
        managerId: mockUsers.manager2.id, // Different manager
      });

      await expect(
        HAService.addMember(
          mockHouseAssociations.ha1.id,
          validKennitala,
          mockUsers.manager1.id
        )
      ).rejects.toThrow(
        new ApiError(
          403,
          'Only the manager can add members to the house association'
        )
      );
    });

    it('should throw error if user with kennitala not found', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue({
        id: mockHouseAssociations.ha1.id,
        managerId: mockUsers.manager1.id,
      });

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        HAService.addMember(
          mockHouseAssociations.ha1.id,
          invalidKennitala,
          mockUsers.manager1.id
        )
      ).rejects.toThrow(
        new ApiError(
          404,
          'User with this kennitala not found. User must register first.'
        )
      );
    });

    it('should throw error if user is already a member', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue({
        id: mockHouseAssociations.ha1.id,
        managerId: mockUsers.manager1.id,
      });

      mockPrisma.user.findUnique.mockResolvedValue({
        id: mockUsers.propertyOwner1.id,
        firstName: mockUsers.propertyOwner1.firstName,
        lastName: mockUsers.propertyOwner1.lastName,
        email: mockUsers.propertyOwner1.email,
        kennitala: mockUsers.propertyOwner1.kennitala,
      });

      mockPrisma.hAMembership.findUnique.mockResolvedValue(
        mockMembershipWithUser
      );

      await expect(
        HAService.addMember(
          mockHouseAssociations.ha1.id,
          validKennitala,
          mockUsers.manager1.id
        )
      ).rejects.toThrow(
        new ApiError(409, 'User is already a member of this house association')
      );
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      // Mock HA exists and user is manager
      mockPrisma.houseAssociation.findUnique.mockResolvedValue({
        id: mockHouseAssociations.ha1.id,
        managerId: mockUsers.manager1.id,
      });

      // Mock membership exists
      mockPrisma.hAMembership.findUnique.mockResolvedValue(
        mockMembershipWithUser
      );

      mockPrisma.hAMembership.delete.mockResolvedValue(mockMembershipWithUser);

      await HAService.removeMember(
        mockHouseAssociations.ha1.id,
        mockUsers.propertyOwner1.id,
        mockUsers.manager1.id
      );

      expect(mockPrisma.hAMembership.delete).toHaveBeenCalledWith({
        where: {
          userId_haId: {
            userId: mockUsers.propertyOwner1.id,
            haId: mockHouseAssociations.ha1.id,
          },
        },
      });
    });

    it('should throw error if user is not the manager', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue({
        id: mockHouseAssociations.ha1.id,
        managerId: mockUsers.manager2.id, // Different manager
      });

      await expect(
        HAService.removeMember(
          mockHouseAssociations.ha1.id,
          mockUsers.propertyOwner1.id,
          mockUsers.manager1.id
        )
      ).rejects.toThrow(
        new ApiError(
          403,
          'Only the manager can remove members from the house association'
        )
      );
    });

    it('should throw error if membership not found', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue({
        id: mockHouseAssociations.ha1.id,
        managerId: mockUsers.manager1.id,
      });

      mockPrisma.hAMembership.findUnique.mockResolvedValue(null);

      await expect(
        HAService.removeMember(
          mockHouseAssociations.ha1.id,
          mockUsers.propertyOwner1.id,
          mockUsers.manager1.id
        )
      ).rejects.toThrow(
        new ApiError(404, 'User is not a member of this house association')
      );
    });
  });

  describe('checkHAAccess', () => {
    it('should return true for HA manager', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue({
        ...mockHouseAssociations.ha1,
        members: [],
      });

      const hasAccess = await HAService.checkHAAccess(
        mockHouseAssociations.ha1.id,
        mockUsers.manager1.id,
        UserRole.HA_MANAGER
      );

      expect(hasAccess).toBe(true);
    });

    it('should return true for property owner who is a member', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue({
        ...mockHouseAssociations.ha1,
        members: [{ id: 'mem_001' }], // Non-empty members array
      });

      const hasAccess = await HAService.checkHAAccess(
        mockHouseAssociations.ha1.id,
        mockUsers.propertyOwner1.id,
        UserRole.PROPERTY_OWNER
      );

      expect(hasAccess).toBe(true);
    });

    it('should return false for property owner who is not a member', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue({
        ...mockHouseAssociations.ha1,
        members: [], // Empty members array
      });

      const hasAccess = await HAService.checkHAAccess(
        mockHouseAssociations.ha1.id,
        mockUsers.propertyOwner2.id,
        UserRole.PROPERTY_OWNER
      );

      expect(hasAccess).toBe(false);
    });

    it('should return false if HA not found', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue(null);

      const hasAccess = await HAService.checkHAAccess(
        'nonexistent_id',
        mockUsers.manager1.id,
        UserRole.HA_MANAGER
      );

      expect(hasAccess).toBe(false);
    });

    it('should return false on database error', async () => {
      mockPrisma.houseAssociation.findUnique.mockRejectedValue(
        new Error('Database error')
      );

      const hasAccess = await HAService.checkHAAccess(
        mockHouseAssociations.ha1.id,
        mockUsers.manager1.id,
        UserRole.HA_MANAGER
      );

      expect(hasAccess).toBe(false);
    });
  });

  describe('deleteHA', () => {
    it('should delete HA and related data successfully', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue({
        id: mockHouseAssociations.ha1.id,
        managerId: mockUsers.manager1.id,
      });

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return await callback({
          hAMembership: { deleteMany: jest.fn() },
          document: { deleteMany: jest.fn() },
          announcement: { deleteMany: jest.fn() },
          meeting: { deleteMany: jest.fn() },
          houseAssociation: { delete: jest.fn() },
        });
      });

      await HAService.deleteHA(
        mockHouseAssociations.ha1.id,
        mockUsers.manager1.id
      );

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw error if user is not the manager', async () => {
      mockPrisma.houseAssociation.findUnique.mockResolvedValue({
        id: mockHouseAssociations.ha1.id,
        managerId: mockUsers.manager2.id, // Different manager
      });

      await expect(
        HAService.deleteHA(mockHouseAssociations.ha1.id, mockUsers.manager1.id)
      ).rejects.toThrow(
        new ApiError(403, 'Only the manager can delete the house association')
      );
    });
  });
});
