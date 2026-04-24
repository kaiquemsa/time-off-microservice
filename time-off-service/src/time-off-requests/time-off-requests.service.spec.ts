import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TimeOffRequestsService } from './time-off-requests.service';
import { RequestStatus, SyncStatus } from './time-off-request-status';

describe('TimeOffRequestsService', () => {
  let service: TimeOffRequestsService;

  const prismaMock = {
    $transaction: jest.fn(),
    timeOffRequest: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeOffRequestsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<TimeOffRequestsService>(TimeOffRequestsService);
  });

  it('findAll forwards filters and ordering', async () => {
    prismaMock.timeOffRequest.findMany.mockResolvedValue([{ id: 'r-1' }]);

    const result = await service.findAll({ employeeId: 'emp-1', locationId: 'loc-1', status: 'PENDING' as never });

    expect(prismaMock.timeOffRequest.findMany).toHaveBeenCalledWith({
      where: {
        employeeId: 'emp-1',
        locationId: 'loc-1',
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual([{ id: 'r-1' }]);
  });

  it('create rejects invalid date ranges', async () => {
    await expect(
      service.create({
        employeeId: 'emp-1',
        locationId: 'loc-1',
        startDate: '2026-05-10',
        endDate: '2026-05-01',
        requestedDays: 2,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('create rejects when balance does not exist', async () => {
    const tx = {
      balance: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
      timeOffRequest: {
        create: jest.fn(),
      },
    };
    prismaMock.$transaction.mockImplementation(async (cb: (client: typeof tx) => unknown) => cb(tx));

    await expect(
      service.create({
        employeeId: 'emp-1',
        locationId: 'loc-1',
        startDate: '2026-05-01',
        endDate: '2026-05-02',
        requestedDays: 2,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create rejects when effective balance is insufficient', async () => {
    const tx = {
      balance: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'bal-1',
          availableBalance: 5,
          reservedBalance: 4,
        }),
        update: jest.fn(),
      },
      timeOffRequest: {
        create: jest.fn(),
      },
    };
    prismaMock.$transaction.mockImplementation(async (cb: (client: typeof tx) => unknown) => cb(tx));

    await expect(
      service.create({
        employeeId: 'emp-1',
        locationId: 'loc-1',
        startDate: '2026-05-01',
        endDate: '2026-05-02',
        requestedDays: 2,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create reserves balance and creates pending request in one transaction', async () => {
    const created = { id: 'req-1', status: RequestStatus.PENDING };
    const tx = {
      balance: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'bal-1',
          availableBalance: 10,
          reservedBalance: 2,
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      timeOffRequest: {
        create: jest.fn().mockResolvedValue(created),
      },
    };
    prismaMock.$transaction.mockImplementation(async (cb: (client: typeof tx) => unknown) => cb(tx));

    const result = await service.create({
      employeeId: 'emp-1',
      locationId: 'loc-1',
      startDate: '2026-05-01',
      endDate: '2026-05-02',
      requestedDays: 2,
    });

    expect(tx.balance.update).toHaveBeenCalledWith({
      where: { id: 'bal-1' },
      data: {
        reservedBalance: { increment: 2 },
        version: { increment: 1 },
      },
    });
    expect(tx.timeOffRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        employeeId: 'emp-1',
        locationId: 'loc-1',
        requestedDays: 2,
        status: RequestStatus.PENDING,
        syncStatus: SyncStatus.NOT_SYNCED,
      }),
    });
    expect(result).toEqual(created);
  });

  it('approve rejects when request is not found', async () => {
    const tx = {
      timeOffRequest: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
      balance: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    prismaMock.$transaction.mockImplementation(async (cb: (client: typeof tx) => unknown) => cb(tx));

    await expect(service.approve('req-1', {})).rejects.toBeInstanceOf(NotFoundException);
  });

  it('approve rejects non-pending requests', async () => {
    const tx = {
      timeOffRequest: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'req-1',
          status: RequestStatus.APPROVED,
        }),
        update: jest.fn(),
      },
      balance: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    prismaMock.$transaction.mockImplementation(async (cb: (client: typeof tx) => unknown) => cb(tx));

    await expect(service.approve('req-1', {})).rejects.toBeInstanceOf(BadRequestException);
  });

  it('approve updates balance and request status', async () => {
    const updatedRequest = { id: 'req-1', status: RequestStatus.APPROVED };
    const tx = {
      timeOffRequest: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'req-1',
          employeeId: 'emp-1',
          locationId: 'loc-1',
          requestedDays: 2,
          status: RequestStatus.PENDING,
        }),
        update: jest.fn().mockResolvedValue(updatedRequest),
      },
      balance: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'bal-1',
          reservedBalance: 3,
        }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    prismaMock.$transaction.mockImplementation(async (cb: (client: typeof tx) => unknown) => cb(tx));

    const result = await service.approve('req-1', { hcmReference: 'HCM-1' });

    expect(tx.balance.update).toHaveBeenCalledWith({
      where: { id: 'bal-1' },
      data: {
        reservedBalance: { decrement: 2 },
        usedBalance: { increment: 2 },
        availableBalance: { decrement: 2 },
        version: { increment: 1 },
      },
    });
    expect(tx.timeOffRequest.update).toHaveBeenCalledWith({
      where: { id: 'req-1' },
      data: {
        status: RequestStatus.APPROVED,
        syncStatus: SyncStatus.NOT_SYNCED,
        hcmReference: 'HCM-1',
      },
    });
    expect(result).toEqual(updatedRequest);
  });

  it('reject updates status and releases reserved balance', async () => {
    const updatedRequest = { id: 'req-1', status: RequestStatus.REJECTED };
    const tx = {
      timeOffRequest: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'req-1',
          employeeId: 'emp-1',
          locationId: 'loc-1',
          requestedDays: 2,
          status: RequestStatus.PENDING,
        }),
        update: jest.fn().mockResolvedValue(updatedRequest),
      },
      balance: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'bal-1',
          reservedBalance: 2,
        }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    prismaMock.$transaction.mockImplementation(async (cb: (client: typeof tx) => unknown) => cb(tx));

    const result = await service.reject('req-1', { reason: 'Team capacity' });

    expect(tx.balance.update).toHaveBeenCalledWith({
      where: { id: 'bal-1' },
      data: {
        reservedBalance: { decrement: 2 },
        version: { increment: 1 },
      },
    });
    expect(tx.timeOffRequest.update).toHaveBeenCalledWith({
      where: { id: 'req-1' },
      data: {
        status: RequestStatus.REJECTED,
        rejectionReason: 'Team capacity',
        syncStatus: SyncStatus.NOT_SYNCED,
      },
    });
    expect(result).toEqual(updatedRequest);
  });
});
