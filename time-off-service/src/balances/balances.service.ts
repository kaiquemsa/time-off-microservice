import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertBalanceDto } from './dto/upsert-balance.dto';

@Injectable()
export class BalancesService {
  constructor(private readonly prisma: PrismaService) {}

  async getByEmployeeAndLocation(employeeId: string, locationId: string) {
    const balance = await this.prisma.balance.findUnique({
      where: { employeeId_locationId: { employeeId, locationId } },
    });

    if (!balance) {
      throw new NotFoundException('Balance not found for employee/location');
    }

    return {
      ...balance,
      effectiveAvailable: balance.availableBalance - balance.reservedBalance,
    };
  }

  async upsertByEmployeeAndLocation(
    employeeId: string,
    locationId: string,
    dto: UpsertBalanceDto,
  ) {
    try {
      if (dto.expectedVersion != null) {
        const updated = await this.prisma.balance.updateMany({
          where: {
            employeeId,
            locationId,
            version: dto.expectedVersion,
          },
          data: {
            availableBalance: dto.availableBalance,
            lastSyncedAt: dto.lastSyncedAt ? new Date(dto.lastSyncedAt) : null,
            version: { increment: 1 },
          },
        });

        if (updated.count === 0) {
          throw new ConflictException(
            'Balance version conflict or balance does not exist',
          );
        }

        return this.getByEmployeeAndLocation(employeeId, locationId);
      }

      const balance = await this.prisma.balance.upsert({
        where: { employeeId_locationId: { employeeId, locationId } },
        update: {
          availableBalance: dto.availableBalance,
          lastSyncedAt: dto.lastSyncedAt ? new Date(dto.lastSyncedAt) : null,
          version: { increment: 1 },
        },
        create: {
          employeeId,
          locationId,
          availableBalance: dto.availableBalance,
          lastSyncedAt: dto.lastSyncedAt ? new Date(dto.lastSyncedAt) : null,
        },
      });

      return {
        ...balance,
        effectiveAvailable: balance.availableBalance - balance.reservedBalance,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Balance already exists');
      }

      throw error;
    }
  }
}
