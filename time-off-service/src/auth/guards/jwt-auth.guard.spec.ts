import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const contextMock = {
    getHandler: jest.fn().mockReturnValue('handler'),
    getClass: jest.fn().mockReturnValue('class'),
  } as unknown as ExecutionContext;

  it('returns true for @Public routes', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as unknown as Reflector;

    const guard = new JwtAuthGuard(reflector);
    const result = guard.canActivate(contextMock);

    expect(reflector.getAllAndOverride).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('delegates to passport AuthGuard when route is not public', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;

    const guard = new JwtAuthGuard(reflector);

    const parentProto = Object.getPrototypeOf(JwtAuthGuard.prototype) as {
      canActivate: (ctx: ExecutionContext) => boolean;
    };
    const superSpy = jest.spyOn(parentProto, 'canActivate').mockReturnValue(true);

    const result = guard.canActivate(contextMock);

    expect(superSpy).toHaveBeenCalledWith(contextMock);
    expect(result).toBe(true);

    superSpy.mockRestore();
  });
});
