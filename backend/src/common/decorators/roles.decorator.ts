import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type RoleType = 'SECURITY_OFFICER' | 'ADMIN' | 'VIEWER' | 'OWNER' | 'MEMBER';

/**
 * @Roles() decorator
 * Enforces Role-Based Access Control (RBAC) at the API layer.
 *
 * Usage:
 *   @Roles('SECURITY_OFFICER', 'ADMIN')
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   deleteDomain() { ... }
 */
export const Roles = (...roles: (RoleType | string)[]) => SetMetadata(ROLES_KEY, roles);
