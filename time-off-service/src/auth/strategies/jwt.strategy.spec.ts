import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const originalSecret = process.env.JWT_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  it('throws when JWT_SECRET is missing', () => {
    delete process.env.JWT_SECRET;

    expect(() => new JwtStrategy({ findById: jest.fn() } as never)).toThrow('JWT_SECRET is required');
  });

  it('returns normalized payload when user exists', async () => {
    process.env.JWT_SECRET = 'test-secret';

    const authService = {
      findById: jest.fn().mockResolvedValue({
        id: 'u-1',
        username: 'admin',
        role: 'ADMIN',
      }),
    };

    const strategy = new JwtStrategy(authService as never);

    const result = await strategy.validate({ sub: 'u-1', username: 'x', role: 'USER' });

    expect(authService.findById).toHaveBeenCalledWith('u-1');
    expect(result).toEqual({ sub: 'u-1', username: 'admin', role: 'ADMIN' });
  });

  it('throws UnauthorizedException when user does not exist', async () => {
    process.env.JWT_SECRET = 'test-secret';

    const authService = {
      findById: jest.fn().mockResolvedValue(null),
    };

    const strategy = new JwtStrategy(authService as never);

    await expect(
      strategy.validate({ sub: 'missing', username: 'x', role: 'USER' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
