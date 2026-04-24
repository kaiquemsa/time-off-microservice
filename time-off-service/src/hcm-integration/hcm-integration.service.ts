import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BatchSyncBalancesDto } from './dto/batch-sync-balances.dto';
import { RealtimeBalanceSyncDto } from './dto/realtime-balance-sync.dto';
import { TimeOffSyncResultDto } from './dto/time-off-sync-result.dto';
import { SyncStatus } from '../time-off-requests/time-off-request-status';

@Injectable()
export class HcmIntegrationService {
  constructor(private readonly prisma: PrismaService) {}

  async syncRealtimeBalance(dto: RealtimeBalanceSyncDto) {
    return this.prisma.balance.upsert({
      where: {
        employeeId_locationId: {
          employeeId: dto.employeeId,
          locationId: dto.locationId,
        },
      },
      update: {
        availableBalance: dto.availableBalance,
        lastSyncedAt: dto.syncedAt ? new Date(dto.syncedAt) : new Date(),
        version: { increment: 1 },
      },
      create: {
        employeeId: dto.employeeId,
        locationId: dto.locationId,
        availableBalance: dto.availableBalance,
        lastSyncedAt: dto.syncedAt ? new Date(dto.syncedAt) : new Date(),
      },
    });
  }

  async syncBatchBalances(dto: BatchSyncBalancesDto) {
    const results = await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.balance.upsert({
          where: {
            employeeId_locationId: {
              employeeId: item.employeeId,
              locationId: item.locationId,
            },
          },
          update: {
            availableBalance: item.availableBalance,
            lastSyncedAt: item.syncedAt ? new Date(item.syncedAt) : new Date(),
            version: { increment: 1 },
          },
          create: {
            employeeId: item.employeeId,
            locationId: item.locationId,
            availableBalance: item.availableBalance,
            lastSyncedAt: item.syncedAt ? new Date(item.syncedAt) : new Date(),
          },
        }),
      ),
    );

    return {
      total: dto.items.length,
      upserted: results.length,
    };
  }

  async handleTimeOffSyncResult(requestId: string, dto: TimeOffSyncResultDto) {
    const request = await this.prisma.timeOffRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Time off request not found');
    }

    return this.prisma.timeOffRequest.update({
      where: { id: requestId },
      data: {
        syncStatus: dto.success ? SyncStatus.SYNCED : SyncStatus.FAILED,
        hcmReference: dto.hcmReference ?? request.hcmReference,
        rejectionReason: dto.success
          ? request.rejectionReason
          : dto.errorMessage ?? request.rejectionReason,
      },
    });
  }
}
