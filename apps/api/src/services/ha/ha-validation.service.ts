import { PrismaClient, UserRole } from '@prisma/client';
import { ApiError } from '../../utils/response';

const prisma = new PrismaClient();

export class HAValidationService {
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
   * Validate if user can create a house association
   */
  static async validateHACreation(managerId: string): Promise<void> {
    // Check if user exists and has HA_MANAGER role
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
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
  }

  /**
   * Validate registration number uniqueness
   */
  static async validateRegistrationNumber(
    registrationNum: string,
    excludeHAId?: string
  ): Promise<void> {
    const whereClause: any = { registrationNum };

    if (excludeHAId) {
      whereClause.id = { not: excludeHAId };
    }

    const existingHA = await prisma.houseAssociation.findFirst({
      where: whereClause,
    });

    if (existingHA) {
      throw new ApiError(
        409,
        'House association with this registration number already exists'
      );
    }
  }

  /**
   * Validate if user is manager of the house association
   */
  static async validateManagerAccess(
    haId: string,
    userId: string
  ): Promise<void> {
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
        'Only the manager can update house association details'
      );
    }
  }

  /**
   * Validate if user is manager of the house association (for delete operations)
   */
  static async validateManagerAccessForDelete(
    haId: string,
    userId: string
  ): Promise<void> {
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
  }

  /**
   * Validate house association exists and user has access
   */
  static async validateHAAccessForUser(
    haId: string,
    userId: string,
    userRole: UserRole
  ): Promise<void> {
    const houseAssociation = await prisma.houseAssociation.findUnique({
      where: { id: haId },
      select: { id: true },
    });

    if (!houseAssociation) {
      throw new ApiError(404, 'House association not found');
    }

    const hasAccess = await this.checkHAAccess(haId, userId, userRole);
    if (!hasAccess) {
      throw new ApiError(
        403,
        'You do not have access to this house association'
      );
    }
  }
}

export default HAValidationService;
