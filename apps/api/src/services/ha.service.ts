import { PrismaClient, HouseAssociation, UserRole } from '@prisma/client';
import { ApiError } from '../utils/response';

const prisma = new PrismaClient();

export interface CreateHAData {
  name: string;
  address: string;
  registrationNum: string;
  managerId: string;
}

export interface UpdateHAData {
  name?: string | undefined;
  address?: string | undefined;
  registrationNum?: string | undefined;
}

export interface HAWithManager extends HouseAssociation {
  manager: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count: {
    members: number;
    documents: number;
    announcements: number;
    meetings: number;
  };
}

export interface HAMemberWithUser {
  id: string;
  userId: string;
  haId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    kennitala: string | null;
  };
}

export interface ListHAOptions {
  page: number;
  limit: number;
  search?: string | undefined;
  userId?: string;
  userRole?: UserRole;
}

export interface ListMembersOptions {
  page: number;
  limit: number;
}

export class HAService {
  /**
   * Create a new house association
   */
  static async createHA(data: CreateHAData): Promise<HAWithManager> {
    try {
      // Check if user exists and has HA_MANAGER role
      const manager = await prisma.user.findUnique({
        where: { id: data.managerId },
        select: { id: true, role: true },
      });

      if (!manager) {
        throw new ApiError(404, 'Manager not found');
      }

      if (manager.role !== UserRole.HA_MANAGER) {
        throw new ApiError(
          403,
          'Only users with HA_MANAGER role can create house associations'
        );
      }

      // Check if registration number is unique
      const existingHA = await prisma.houseAssociation.findUnique({
        where: { registrationNum: data.registrationNum },
      });

      if (existingHA) {
        throw new ApiError(
          409,
          'House association with this registration number already exists'
        );
      }

      // Create the house association
      const houseAssociation = await prisma.houseAssociation.create({
        data: {
          name: data.name,
          address: data.address,
          registrationNum: data.registrationNum,
          managerId: data.managerId,
        },
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

      return houseAssociation;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to create house association');
    }
  }

  /**
   * Get house association by ID with access control
   */
  static async getHAById(
    haId: string,
    userId: string,
    userRole: UserRole
  ): Promise<HAWithManager> {
    try {
      const houseAssociation = await prisma.houseAssociation.findUnique({
        where: { id: haId },
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

      if (!houseAssociation) {
        throw new ApiError(404, 'House association not found');
      }

      // Check access rights
      const hasAccess = await this.checkHAAccess(haId, userId, userRole);
      if (!hasAccess) {
        throw new ApiError(
          403,
          'You do not have access to this house association'
        );
      }

      return houseAssociation;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to get house association');
    }
  }

  /**
   * List house associations with role-based filtering
   */
  static async listHAs(options: ListHAOptions): Promise<{
    houseAssociations: HAWithManager[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { page, limit, search, userId, userRole } = options;
      const skip = (page - 1) * limit;

      const whereClause: any = {};

      // Role-based filtering
      if (userRole === UserRole.HA_MANAGER && userId) {
        whereClause.managerId = userId;
      } else if (userRole === UserRole.PROPERTY_OWNER && userId) {
        whereClause.members = {
          some: {
            userId: userId,
          },
        };
      }

      // Add search filter
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { registrationNum: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [houseAssociations, total] = await Promise.all([
        prisma.houseAssociation.findMany({
          where: whereClause,
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
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.houseAssociation.count({ where: whereClause }),
      ]);

      return {
        houseAssociations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to list house associations');
    }
  }

  /**
   * Update house association (manager only)
   */
  static async updateHA(
    haId: string,
    data: UpdateHAData,
    userId: string
  ): Promise<HAWithManager> {
    try {
      // Check if HA exists and user is the manager
      const existingHA = await prisma.houseAssociation.findUnique({
        where: { id: haId },
        select: { id: true, managerId: true, registrationNum: true },
      });

      if (!existingHA) {
        throw new ApiError(404, 'House association not found');
      }

      if (existingHA.managerId !== userId) {
        throw new ApiError(
          403,
          'Only the manager can update house association details'
        );
      }

      // Check registration number uniqueness if being updated
      if (
        data.registrationNum &&
        data.registrationNum !== existingHA.registrationNum
      ) {
        const existingRegNum = await prisma.houseAssociation.findUnique({
          where: { registrationNum: data.registrationNum },
        });

        if (existingRegNum) {
          throw new ApiError(
            409,
            'House association with this registration number already exists'
          );
        }
      }

      // Filter out undefined values before updating
      const updateData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      );

      const updatedHA = await prisma.houseAssociation.update({
        where: { id: haId },
        data: updateData,
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

      return updatedHA;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to update house association');
    }
  }

  /**
   * Add member to house association by kennitala
   */
  static async addMember(
    haId: string,
    kennitala: string,
    managerId: string
  ): Promise<HAMemberWithUser> {
    try {
      // Check if user is the manager of this HA
      const houseAssociation = await prisma.houseAssociation.findUnique({
        where: { id: haId },
        select: { id: true, managerId: true },
      });

      if (!houseAssociation) {
        throw new ApiError(404, 'House association not found');
      }

      if (houseAssociation.managerId !== managerId) {
        throw new ApiError(
          403,
          'Only the manager can add members to the house association'
        );
      }

      // Find user by kennitala
      const user = await prisma.user.findUnique({
        where: { kennitala },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          kennitala: true,
        },
      });

      if (!user) {
        throw new ApiError(
          404,
          'User with this kennitala not found. User must register first.'
        );
      }

      // Check if user is already a member
      const existingMembership = await prisma.hAMembership.findUnique({
        where: {
          userId_haId: {
            userId: user.id,
            haId: haId,
          },
        },
      });

      if (existingMembership) {
        throw new ApiError(
          409,
          'User is already a member of this house association'
        );
      }

      // Create membership
      const membership = await prisma.hAMembership.create({
        data: {
          userId: user.id,
          haId: haId,
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

      return membership;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to add member to house association');
    }
  }

  /**
   * Remove member from house association
   */
  static async removeMember(
    haId: string,
    userId: string,
    managerId: string
  ): Promise<void> {
    try {
      // Check if user is the manager of this HA
      const houseAssociation = await prisma.houseAssociation.findUnique({
        where: { id: haId },
        select: { id: true, managerId: true },
      });

      if (!houseAssociation) {
        throw new ApiError(404, 'House association not found');
      }

      if (houseAssociation.managerId !== managerId) {
        throw new ApiError(
          403,
          'Only the manager can remove members from the house association'
        );
      }

      // Check if membership exists
      const membership = await prisma.hAMembership.findUnique({
        where: {
          userId_haId: {
            userId: userId,
            haId: haId,
          },
        },
      });

      if (!membership) {
        throw new ApiError(
          404,
          'User is not a member of this house association'
        );
      }

      // Remove membership
      await prisma.hAMembership.delete({
        where: {
          userId_haId: {
            userId: userId,
            haId: haId,
          },
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to remove member from house association');
    }
  }

  /**
   * List house association members
   */
  static async listMembers(
    haId: string,
    options: ListMembersOptions,
    userId: string,
    userRole: UserRole
  ): Promise<{
    members: HAMemberWithUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      // Check access to this HA
      const hasAccess = await this.checkHAAccess(haId, userId, userRole);
      if (!hasAccess) {
        throw new ApiError(
          403,
          'You do not have access to this house association'
        );
      }

      const { page, limit } = options;
      const skip = (page - 1) * limit;

      const [members, total] = await Promise.all([
        prisma.hAMembership.findMany({
          where: { haId },
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
          skip,
          take: limit,
          orderBy: { user: { firstName: 'asc' } },
        }),
        prisma.hAMembership.count({ where: { haId } }),
      ]);

      return {
        members,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to list house association members');
    }
  }

  /**
   * Check if user has access to a house association
   */
  static async checkHAAccess(
    haId: string,
    userId: string,
    userRole: UserRole
  ): Promise<boolean> {
    try {
      const houseAssociation = await prisma.houseAssociation.findUnique({
        where: { id: haId },
        include: {
          members: {
            where: { userId },
            select: { id: true },
          },
        },
      });

      if (!houseAssociation) {
        return false;
      }

      // Manager always has access
      if (houseAssociation.managerId === userId) {
        return true;
      }

      // Property owner has access if they are a member
      if (userRole === UserRole.PROPERTY_OWNER) {
        return houseAssociation.members.length > 0;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete house association (manager only)
   */
  static async deleteHA(haId: string, userId: string): Promise<void> {
    try {
      const houseAssociation = await prisma.houseAssociation.findUnique({
        where: { id: haId },
        select: { id: true, managerId: true },
      });

      if (!houseAssociation) {
        throw new ApiError(404, 'House association not found');
      }

      if (houseAssociation.managerId !== userId) {
        throw new ApiError(
          403,
          'Only the manager can delete the house association'
        );
      }

      // Delete in transaction to maintain data integrity
      await prisma.$transaction(async (tx) => {
        // Delete all memberships first
        await tx.hAMembership.deleteMany({
          where: { haId },
        });

        // Delete all related data
        await tx.document.deleteMany({
          where: { haId },
        });

        await tx.announcement.deleteMany({
          where: { haId },
        });

        await tx.meeting.deleteMany({
          where: { haId },
        });

        // Finally delete the house association
        await tx.houseAssociation.delete({
          where: { id: haId },
        });
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to delete house association');
    }
  }
}

export default HAService;
