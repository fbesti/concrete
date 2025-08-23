import { PrismaClient, UserRole } from '@prisma/client';
import { ApiError } from '../../utils/response';
import { HAValidationService } from './ha-validation.service';
import {
  HATransformerService,
  HAWithManager,
  ListHAOptions,
} from './ha-transformer.service';
import { HAMemberService } from './ha-member.service';

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

export class HAService {
  /**
   * Create a new house association
   */
  static async createHA(data: CreateHAData): Promise<HAWithManager> {
    try {
      // Validate manager can create HA
      await HAValidationService.validateHACreation(data.managerId);

      // Validate registration number uniqueness
      await HAValidationService.validateRegistrationNumber(
        data.registrationNum
      );

      // Create the house association
      const houseAssociation = await prisma.houseAssociation.create({
        data: {
          name: data.name,
          address: data.address,
          registrationNum: data.registrationNum,
          managerId: data.managerId,
        },
        include: HATransformerService.getHAIncludeClause(),
      });

      return houseAssociation as HAWithManager;
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
      // Validate access
      await HAValidationService.validateHAAccessForUser(haId, userId, userRole);

      const houseAssociation = await prisma.houseAssociation.findUnique({
        where: { id: haId },
        include: HATransformerService.getHAIncludeClause(),
      });

      if (!houseAssociation) {
        throw new ApiError(404, 'House association not found');
      }

      return houseAssociation as HAWithManager;
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
      const { page, limit } = options;
      const skip = HATransformerService.calculateSkip(page, limit);
      const whereClause = HATransformerService.buildHAWhereClause(options);

      const [houseAssociations, total] = await Promise.all([
        prisma.houseAssociation.findMany({
          where: whereClause,
          include: HATransformerService.getHAIncludeClause(),
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.houseAssociation.count({ where: whereClause }),
      ]);

      return {
        houseAssociations: houseAssociations as HAWithManager[],
        pagination: HATransformerService.buildPaginationResponse(
          page,
          limit,
          total
        ),
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
      // Validate manager access
      await HAValidationService.validateManagerAccess(haId, userId);

      // Validate registration number if being updated
      if (data.registrationNum) {
        await HAValidationService.validateRegistrationNumber(
          data.registrationNum,
          haId
        );
      }

      // Filter out undefined values before updating
      const updateData: any = HATransformerService.filterUpdateData(data);

      const updatedHA = await prisma.houseAssociation.update({
        where: { id: haId },
        data: updateData,
        include: HATransformerService.getHAIncludeClause(),
      });

      return updatedHA as HAWithManager;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to update house association');
    }
  }

  /**
   * Delete house association (manager only)
   */
  static async deleteHA(haId: string, userId: string): Promise<void> {
    try {
      // Validate manager access
      await HAValidationService.validateManagerAccessForDelete(haId, userId);

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

  // Re-export member service methods for backward compatibility
  static addMember = HAMemberService.addMember;
  static removeMember = HAMemberService.removeMember;
  static listMembers = HAMemberService.listMembers;

  // Re-export validation methods for backward compatibility
  static checkHAAccess = HAValidationService.checkHAAccess;
}

export default HAService;
