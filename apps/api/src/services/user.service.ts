import { PrismaClient, User, UserRole } from '@prisma/client';
import { AuthService } from './auth.service';

const prisma = new PrismaClient();

export interface UpdateUserProfileData {
  firstName?: string | null;
  lastName?: string | null;
  kennitala?: string | null;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserSearchFilters {
  role?: UserRole | null;
  search?: string | null; // Search in email, firstName, lastName
  page?: number;
  limit?: number;
}

export interface PaginatedUsers {
  users: Omit<User, 'password'>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class UserService {
  /**
   * Get user profile by ID
   */
  static async getUserProfile(
    userId: string
  ): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        kennitala: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updateData: UpdateUserProfileData
  ): Promise<Omit<User, 'password'>> {
    // Check if kennitala is being updated and if it's already in use
    if (updateData.kennitala) {
      const existingUser = await prisma.user.findFirst({
        where: {
          kennitala: updateData.kennitala,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new Error('This kennitala is already in use by another user');
      }

      // Validate kennitala format
      if (!AuthService.validateKennitala(updateData.kennitala)) {
        throw new Error('Invalid kennitala format');
      }
    }

    // Filter out null values
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== null)
    );

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: filteredData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        kennitala: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    passwordData: ChangePasswordData
  ): Promise<void> {
    const { currentPassword, newPassword } = passwordData;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await AuthService.comparePassword(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation =
      AuthService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(
        `Password validation failed: ${passwordValidation.errors.join(', ')}`
      );
    }

    // Hash new password
    const hashedNewPassword = await AuthService.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }

  /**
   * Get users with filtering and pagination (admin only)
   */
  static async getUsers(filters: UserSearchFilters): Promise<PaginatedUsers> {
    const { role, search, page = 1, limit = 10 } = filters;

    // Build where clause
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count and users
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          kennitala: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Delete user account
   */
  static async deleteUser(userId: string): Promise<void> {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is managing any house associations
    const managedHAs = await prisma.houseAssociation.count({
      where: { managerId: userId },
    });

    if (managedHAs > 0) {
      throw new Error(
        'Cannot delete user who is managing house associations. Transfer management first.'
      );
    }

    // Delete user (cascade will handle memberships, announcements, messages)
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Get user statistics
   */
  static async getUserStatistics(): Promise<{
    totalUsers: number;
    usersByRole: Record<UserRole, number>;
    recentRegistrations: number; // Last 7 days
  }> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalUsers, usersByRole, recentRegistrations] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
    ]);

    // Convert array to object for easier consumption
    const roleStats = usersByRole.reduce(
      (acc: Record<UserRole, number>, item: any) => {
        acc[item.role as UserRole] = item._count._all;
        return acc;
      },
      {} as Record<UserRole, number>
    );

    // Ensure all roles are represented
    Object.values(UserRole).forEach((role: UserRole) => {
      if (!(role in roleStats)) {
        roleStats[role] = 0;
      }
    });

    return {
      totalUsers,
      usersByRole: roleStats,
      recentRegistrations,
    };
  }

  /**
   * Check if user exists by email
   */
  static async getUserByEmail(
    email: string
  ): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        kennitala: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Check if user exists by kennitala
   */
  static async getUserByKennitala(
    kennitala: string
  ): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({
      where: { kennitala },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        kennitala: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Get user's house association memberships
   */
  static async getUserHAMemberships(userId: string): Promise<any[]> {
    const memberships = await prisma.hAMembership.findMany({
      where: { userId },
      include: {
        ha: {
          select: {
            id: true,
            name: true,
            address: true,
            registrationNum: true,
            createdAt: true,
          },
        },
      },
    });

    return memberships.map((membership: any) => ({
      id: membership.id,
      houseAssociation: membership.ha,
      joinedAt: membership.id, // Using membership ID as a proxy for join date
    }));
  }

  /**
   * Get house associations managed by user
   */
  static async getUserManagedHAs(userId: string): Promise<any[]> {
    const managedHAs = await prisma.houseAssociation.findMany({
      where: { managerId: userId },
      select: {
        id: true,
        name: true,
        address: true,
        registrationNum: true,
        createdAt: true,
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

    return managedHAs;
  }

  /**
   * Validate user access to resource
   */
  static async canUserAccessResource(
    userId: string,
    resourceUserId: string,
    requiredRole?: UserRole
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return false;
    }

    // User can always access their own resources
    if (userId === resourceUserId) {
      return true;
    }

    // Check role-based access
    if (requiredRole && user.role === requiredRole) {
      return true;
    }

    // HA Managers can access property owner resources
    if (user.role === UserRole.HA_MANAGER) {
      return true;
    }

    return false;
  }
}

export default UserService;
