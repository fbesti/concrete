// Main user controller exports
export {
  getProfile,
  updateProfile,
  getUserMemberships,
  getManagedHAs,
} from './user.controller';
export {
  getUsers,
  getUserById,
  getUserStatistics,
  deleteUser,
} from './user-admin.controller';
export { changePassword } from './user-password.controller';

// Combined default export for backward compatibility
import userController from './user.controller';
import userAdminController from './user-admin.controller';
import userPasswordController from './user-password.controller';

export default {
  ...userController,
  ...userAdminController,
  ...userPasswordController,
};
