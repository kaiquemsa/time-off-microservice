import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BalancesService } from './balances.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BalancesService', () => {
  let service: BalancesService;

  const prismaMock = {
    balance: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalancesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<BalancesService>(BalancesService);
  });

  it('returns balance with effectiveAvailable', async () => {
    prismaMock.balance.findUnique.mockResolvedValue({
      id: 'bal-1',
      employeeId: 'emp-1',
      locationId: 'loc-1',
      availableBalance: 10,
      reservedBalance: 2,
      usedBalance: 1,
      version: 3,
    });

    const result = await service.getByEmployeeAndLocation('emp-1', 'loc-1');

    expect(result.effectiveAvailable).toBe(8);
    expect(prismaMock.balance.findUnique).toHaveBeenCalledWith({
      where: { employeeId_locationId: { employeeId: 'emp-1', locationId: 'loc-1' } },
    });
  });

  it('throws NotFoundException when balance does not exist', async () => {
    prismaMock.balance.findUnique.mockResolvedValue(null);

    await expect(service.getByEmployeeAndLocation('emp-1', 'loc-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates with expectedVersion and increments version', async () => {
    prismaMock.balance.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.balance.findUnique.mockResolvedValue({
      id: 'bal-1',
      employeeId: 'emp-1',
      locationId: 'loc-1',
      availableBalance: 12,
      reservedBalance: 2,
      usedBalance: 1,
      version: 4,
    });

    const result = await service.upsertByEmployeeAndLocation('emp-1', 'loc-1', {
      availableBalance: 12,
      expectedVersion: 3,
      lastSyncedAt: '2026-04-24T00:00:00.000Z',
    });

    expect(prismaMock.balance.updateMany).toHaveBeenCalledWith({
      where: {
        employeeId: 'emp-1',
        locationId: 'loc-1',
        version: 3,
      },
      data: {
        availableBalance: 12,
        lastSyncedAt: new Date('2026-04-24T00:00:00.000Z'),
        version: { increment: 1 },
      },
    });
    expect(result.effectiveAvailable).toBe(10);
  });

  it('throws ConflictException on expectedVersion mismatch', async () => {
    prismaMock.balance.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.upsertByEmployeeAndLocation('emp-1', 'loc-1', {
        availableBalance: 12,
        expectedVersion: 9,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('upserts without expectedVersion and returns effectiveAvailable', async () => {
    prismaMock.balance.upsert.mockResolvedValue({
      id: 'bal-1',
      employeeId: 'emp-1',
      locationId: 'loc-1',
      availableBalance: 20,
      reservedBalance: 4,
      usedBalance: 2,
      version: 6,
    });

    const result = await service.upsertByEmployeeAndLocation('emp-1', 'loc-1', {
      availableBalance: 20,
    });

    expect(prismaMock.balance.upsert).toHaveBeenCalled();
    expect(result.effectiveAvailable).toBe(16);
  });
});
