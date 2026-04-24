import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SyncStatus } from '../time-off-requests/time-off-request-status';
import { HcmIntegrationService } from './hcm-integration.service';

describe('HcmIntegrationService', () => {
  let service: HcmIntegrationService;

  const prismaMock = {
    balance: {
      upsert: jest.fn(),
    },
    timeOffRequest: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HcmIntegrationService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<HcmIntegrationService>(HcmIntegrationService);
  });

  it('syncRealtimeBalance upserts balance and increments version', async () => {
    prismaMock.balance.upsert.mockResolvedValue({ id: 'bal-1' });

    const result = await service.syncRealtimeBalance({
      employeeId: 'emp-1',
      locationId: 'loc-1',
      availableBalance: 12,
      syncedAt: '2026-04-24T10:00:00.000Z',
    });

    expect(prismaMock.balance.upsert).toHaveBeenCalledWith({
      where: {
        employeeId_locationId: {
          employeeId: 'emp-1',
          locationId: 'loc-1',
        },
      },
      update: {
        availableBalance: 12,
        lastSyncedAt: new Date('2026-04-24T10:00:00.000Z'),
        version: { increment: 1 },
      },
      create: {
        employeeId: 'emp-1',
        locationId: 'loc-1',
        availableBalance: 12,
        lastSyncedAt: new Date('2026-04-24T10:00:00.000Z'),
      },
    });
    expect(result).toEqual({ id: 'bal-1' });
  });

  it('syncBatchBalances executes transaction and returns counters', async () => {
    prismaMock.$transaction.mockResolvedValue([{ id: 'b1' }, { id: 'b2' }]);

    const payload = {
      items: [
        { employeeId: 'emp-1', locationId: 'loc-1', availableBalance: 10 },
        { employeeId: 'emp-2', locationId: 'loc-2', availableBalance: 6 },
      ],
    };

    const result = await service.syncBatchBalances(payload);

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    const ops = prismaMock.$transaction.mock.calls[0][0];
    expect(Array.isArray(ops)).toBe(true);
    expect(ops).toHaveLength(2);
    expect(result).toEqual({ total: 2, upserted: 2 });
  });

  it('handleTimeOffSyncResult throws when request does not exist', async () => {
    prismaMock.timeOffRequest.findUnique.mockResolvedValue(null);

    await expect(
      service.handleTimeOffSyncResult('req-1', { success: true }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('handleTimeOffSyncResult marks request as SYNCED on success', async () => {
    prismaMock.timeOffRequest.findUnique.mockResolvedValue({
      id: 'req-1',
      hcmReference: null,
      rejectionReason: null,
    });
    prismaMock.timeOffRequest.update.mockResolvedValue({
      id: 'req-1',
      syncStatus: SyncStatus.SYNCED,
    });

    const result = await service.handleTimeOffSyncResult('req-1', {
      success: true,
      hcmReference: 'HCM-REF-1',
    });

    expect(prismaMock.timeOffRequest.update).toHaveBeenCalledWith({
      where: { id: 'req-1' },
      data: {
        syncStatus: SyncStatus.SYNCED,
        hcmReference: 'HCM-REF-1',
        rejectionReason: null,
      },
    });
    expect(result).toEqual({ id: 'req-1', syncStatus: SyncStatus.SYNCED });
  });

  it('handleTimeOffSyncResult marks request as FAILED and persists error message', async () => {
    prismaMock.timeOffRequest.findUnique.mockResolvedValue({
      id: 'req-1',
      hcmReference: 'HCM-OLD',
      rejectionReason: null,
    });
    prismaMock.timeOffRequest.update.mockResolvedValue({
      id: 'req-1',
      syncStatus: SyncStatus.FAILED,
    });

    const result = await service.handleTimeOffSyncResult('req-1', {
      success: false,
      errorMessage: 'Invalid dimensions',
    });

    expect(prismaMock.timeOffRequest.update).toHaveBeenCalledWith({
      where: { id: 'req-1' },
      data: {
        syncStatus: SyncStatus.FAILED,
        hcmReference: 'HCM-OLD',
        rejectionReason: 'Invalid dimensions',
      },
    });
    expect(result).toEqual({ id: 'req-1', syncStatus: SyncStatus.FAILED });
  });
});
