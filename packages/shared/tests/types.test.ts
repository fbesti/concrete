import { UserRole } from '../src/types/user';

describe('Shared Types', () => {
  it('should export UserRole enum', () => {
    expect(UserRole.HA_MANAGER).toBe('HA_MANAGER');
    expect(UserRole.PROPERTY_OWNER).toBe('PROPERTY_OWNER');
  });
});