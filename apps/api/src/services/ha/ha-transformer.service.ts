import { UserRole } from '@prisma/client';

export interface HAWithManager {
  id: string;
  name: string;
  address: string;
  registrationNum: string;
  managerId: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface ListHAOptions {
  page: number;
  limit: number;
  search?: string | undefined;
  userId?: string;
  userRole?: UserRole;
}

export class HATransformerService {
  /**
   * Build where clause for house association queries based on role and search
   */
  static buildHAWhereClause(options: ListHAOptions): any {
    const { search, userId, userRole } = options;
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

    return whereClause;
  }

  /**
   * Standard include clause for house association queries
   */
  static getHAIncludeClause() {
    return {
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
    };
  }

  /**
   * Build pagination response object
   */
  static buildPaginationResponse(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Filter out undefined values from update data
   */
  static filterUpdateData<T extends Record<string, any>>(data: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    ) as Partial<T>;
  }

  /**
   * Calculate pagination skip value
   */
  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}

export default HATransformerService;
