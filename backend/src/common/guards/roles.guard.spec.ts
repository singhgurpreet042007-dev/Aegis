import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (userRole?: string) => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: userRole ? { role: userRole } : undefined,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if no roles are specified on endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext('MEMBER');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has required role (SECURITY_OFFICER)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SECURITY_OFFICER', 'ADMIN']);
    const context = createMockContext('SECURITY_OFFICER');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user is ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SECURITY_OFFICER']);
    const context = createMockContext('ADMIN');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SECURITY_OFFICER', 'ADMIN']);
    const context = createMockContext('VIEWER');

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
