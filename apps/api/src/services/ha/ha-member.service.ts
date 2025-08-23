import { PrismaClient, UserRole } from '@prisma/client';
import { ApiError } from '../../utils/response';

const prisma = new PrismaClient();

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

export interface ListMembersOptions {
  page: number;
  limit: number;
}

export class HAMemberService {
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
      // Import the access check from validation service
      const { HAValidationService } = await import('./ha-validation.service');

      // Check access to this HA
      const hasAccess = await HAValidationService.checkHAAccess(
        haId,
        userId,
        userRole
      );
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
}

export default HAMemberService;
