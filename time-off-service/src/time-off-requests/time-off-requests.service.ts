import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApproveTimeOffRequestDto } from './dto/approve-time-off-request.dto';
import { CreateTimeOffRequestDto } from './dto/create-time-off-request.dto';
import { RejectTimeOffRequestDto } from './dto/reject-time-off-request.dto';
import { FindTimeOffRequestsQueryDto } from './dto/find-time-off-requests-query.dto';
import { RequestStatus, SyncStatus } from './time-off-request-status';

@Injectable()
export class TimeOffRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTimeOffRequestDto) {
    if (new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException('endDate cannot be before startDate');
    }

    return this.prisma.$transaction(async (tx) => {
      const balance = await tx.balance.findUnique({
        where: {
          employeeId_locationId: {
            employeeId: dto.employeeId,
            locationId: dto.locationId,
          },
        },
      });

      if (!balance) {
        throw new NotFoundException(
          'Balance not found for employee/location combination',
        );
      }

      const effectiveAvailable =
        balance.availableBalance - balance.reservedBalance;
      if (effectiveAvailable < dto.requestedDays) {
        throw new BadRequestException('Insufficient available balance');
      }

      await tx.balance.update({
        where: { id: balance.id },
        data: {
          reservedBalance: { increment: dto.requestedDays },
          version: { increment: 1 },
        },
      });

      return tx.timeOffRequest.create({
        data: {
          employeeId: dto.employeeId,
          locationId: dto.locationId,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          requestedDays: dto.requestedDays,
          status: RequestStatus.PENDING,
          syncStatus: SyncStatus.NOT_SYNCED,
        },
      });
    });
  }

  findAll(query: FindTimeOffRequestsQueryDto) {
    return this.prisma.timeOffRequest.findMany({
      where: {
        employeeId: query.employeeId,
        locationId: query.locationId,
        status: query.status,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(requestId: string, dto: ApproveTimeOffRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.timeOffRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new NotFoundException('Time off request not found');
      }

      if (request.status !== RequestStatus.PENDING) {
        throw new BadRequestException(
          'Only pending requests can be approved',
        );
      }

      const balance = await tx.balance.findUnique({
        where: {
          employeeId_locationId: {
            employeeId: request.employeeId,
            locationId: request.locationId,
          },
        },
      });

      if (!balance) {
        throw new NotFoundException(
          'Balance not found for employee/location combination',
        );
      }

      if (balance.reservedBalance < request.requestedDays) {
        throw new BadRequestException(
          'Reserved balance is lower than request amount',
        );
      }

      await tx.balance.update({
        where: { id: balance.id },
        data: {
          reservedBalance: { decrement: request.requestedDays },
          usedBalance: { increment: request.requestedDays },
          availableBalance: { decrement: request.requestedDays },
          version: { increment: 1 },
        },
      });

      return tx.timeOffRequest.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.APPROVED,
          syncStatus: SyncStatus.NOT_SYNCED,
          hcmReference: dto.hcmReference ?? null,
        },
      });
    });
  }

  async reject(requestId: string, dto: RejectTimeOffRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.timeOffRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new NotFoundException('Time off request not found');
      }

      if (request.status !== RequestStatus.PENDING) {
        throw new BadRequestException(
          'Only pending requests can be rejected',
        );
      }

      const balance = await tx.balance.findUnique({
        where: {
          employeeId_locationId: {
            employeeId: request.employeeId,
            locationId: request.locationId,
          },
        },
      });

      if (!balance) {
        throw new NotFoundException(
          'Balance not found for employee/location combination',
        );
      }

      if (balance.reservedBalance < request.requestedDays) {
        throw new BadRequestException(
          'Reserved balance is lower than request amount',
        );
      }

      await tx.balance.update({
        where: { id: balance.id },
        data: {
          reservedBalance: { decrement: request.requestedDays },
          version: { increment: 1 },
        },
      });

      return tx.timeOffRequest.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.REJECTED,
          rejectionReason: dto.reason,
          syncStatus: SyncStatus.NOT_SYNCED,
        },
      });
    });
  }
}
