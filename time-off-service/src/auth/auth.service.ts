import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from './types/role.enum';

type AuthDbUser = {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(username: string, password: string) {
    const users = await this.prisma.$queryRaw<AuthDbUser[]>`
      SELECT id, username, passwordHash, role
      FROM "User"
      WHERE username = ${username}
      LIMIT 1
    `;
    const user = users[0];

    const isPasswordValid = user
      ? await compare(password, user.passwordHash)
      : false;

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      role: user.role,
    }, {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as never,
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES_IN ?? '1h',
      user: {
        id: user.id,
        username: user.username,
        role: user.role as Role,
      },
    };
  }

  async findById(id: string) {
    const users = await this.prisma.$queryRaw<AuthDbUser[]>`
      SELECT id, username, passwordHash, role
      FROM "User"
      WHERE id = ${id}
      LIMIT 1
    `;
    return users[0] ?? null;
  }
}
