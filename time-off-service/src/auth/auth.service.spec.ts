import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { hashSync } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    $queryRaw: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('throws UnauthorizedException when user does not exist', async () => {
    prismaMock.$queryRaw.mockResolvedValueOnce([]);

    await expect(service.login('admin', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException when password is invalid', async () => {
    prismaMock.$queryRaw.mockResolvedValueOnce([
      {
        id: 'u-1',
        username: 'admin',
        passwordHash: hashSync('admin1234', 10),
        role: 'ADMIN',
      },
    ]);

    await expect(service.login('admin', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns JWT payload response when credentials are valid', async () => {
    prismaMock.$queryRaw.mockResolvedValueOnce([
      {
        id: 'u-1',
        username: 'admin',
        passwordHash: hashSync('admin1234', 10),
        role: 'ADMIN',
      },
    ]);
    jwtServiceMock.signAsync.mockResolvedValue('token-123');

    const result = await service.login('admin', 'admin1234');

    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
      {
        sub: 'u-1',
        username: 'admin',
        role: 'ADMIN',
      },
      {
        expiresIn: expect.any(String),
      },
    );
    expect(result).toEqual(
      expect.objectContaining({
        access_token: 'token-123',
        token_type: 'Bearer',
        user: {
          id: 'u-1',
          username: 'admin',
          role: 'ADMIN',
        },
      }),
    );
  });

  it('findById returns user or null', async () => {
    prismaMock.$queryRaw.mockResolvedValueOnce([
      {
        id: 'u-1',
        username: 'admin',
        passwordHash: 'hash',
        role: 'ADMIN',
      },
    ]);

    const found = await service.findById('u-1');
    expect(found).toEqual({
      id: 'u-1',
      username: 'admin',
      passwordHash: 'hash',
      role: 'ADMIN',
    });

    prismaMock.$queryRaw.mockResolvedValueOnce([]);
    const missing = await service.findById('missing');
    expect(missing).toBeNull();
  });
});
