import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { hashSync } from 'bcryptjs';
import { existsSync, rmSync } from 'fs';
import path from 'path';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';

const e2eDbPath = path.join(process.cwd(), 'test', 'e2e.db');

process.env.DATABASE_URL = 'file:./test/e2e.db';
process.env.JWT_SECRET = 'e2e-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AppModule } = require('../src/app.module');

describe('Time-Off flow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken = '';
  let userToken = '';

  async function login(username: string, password: string) {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password })
      .expect(201);

    return response.body.access_token as string;
  }

  async function resetAndSeedDb() {
    await prisma.$executeRawUnsafe('DELETE FROM "TimeOffRequest";');
    await prisma.$executeRawUnsafe('DELETE FROM "Balance";');
    await prisma.$executeRawUnsafe('DELETE FROM "User";');

    await prisma.$executeRawUnsafe(
      'INSERT INTO "User" (id, username, passwordHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);',
      'u-admin',
      'admin',
      hashSync('admin1234', 10),
      'ADMIN',
    );

    await prisma.$executeRawUnsafe(
      'INSERT INTO "User" (id, username, passwordHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);',
      'u-user',
      'user',
      hashSync('user1234', 10),
      'USER',
    );

    await prisma.$executeRawUnsafe(
      'INSERT INTO "Balance" (id, employeeId, locationId, availableBalance, reservedBalance, usedBalance, version, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);',
      'bal-emp1-loc1',
      'emp-1',
      'loc-1',
      10,
      0,
      0,
      1,
    );
  }

  beforeAll(async () => {
    if (existsSync(e2eDbPath)) {
      rmSync(e2eDbPath);
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "username" TEXT NOT NULL UNIQUE,
        "passwordHash" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Balance" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "employeeId" TEXT NOT NULL,
        "locationId" TEXT NOT NULL,
        "availableBalance" REAL NOT NULL,
        "reservedBalance" REAL NOT NULL DEFAULT 0,
        "usedBalance" REAL NOT NULL DEFAULT 0,
        "version" INTEGER NOT NULL DEFAULT 1,
        "lastSyncedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(
      'CREATE UNIQUE INDEX IF NOT EXISTS "Balance_employeeId_locationId_key" ON "Balance"("employeeId", "locationId");',
    );

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TimeOffRequest" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "employeeId" TEXT NOT NULL,
        "locationId" TEXT NOT NULL,
        "startDate" DATETIME NOT NULL,
        "endDate" DATETIME NOT NULL,
        "requestedDays" REAL NOT NULL,
        "status" TEXT NOT NULL,
        "syncStatus" TEXT NOT NULL DEFAULT 'NOT_SYNCED',
        "rejectionReason" TEXT,
        "hcmReference" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  });

  beforeEach(async () => {
    await resetAndSeedDb();
    adminToken = await login('admin', 'admin1234');
    userToken = await login('user', 'user1234');
  });

  it('creates a request and keeps balance reserved while pending', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/time-off-requests')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        employeeId: 'emp-1',
        locationId: 'loc-1',
        startDate: '2026-06-01',
        endDate: '2026-06-02',
        requestedDays: 2,
      })
      .expect(201);

    expect(createResponse.body.status).toBe('PENDING');

    const balanceResponse = await request(app.getHttpServer())
      .get('/balances/emp-1/loc-1')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(balanceResponse.body.availableBalance).toBe(10);
    expect(balanceResponse.body.reservedBalance).toBe(2);
    expect(balanceResponse.body.effectiveAvailable).toBe(8);
  });

  it('allows only ADMIN to approve', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/time-off-requests')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        employeeId: 'emp-1',
        locationId: 'loc-1',
        startDate: '2026-06-01',
        endDate: '2026-06-02',
        requestedDays: 2,
      })
      .expect(201);

    const requestId = createResponse.body.id;

    await request(app.getHttpServer())
      .patch(`/time-off-requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ hcmReference: 'HCM-123' })
      .expect(403);

    const approveResponse = await request(app.getHttpServer())
      .patch(`/time-off-requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ hcmReference: 'HCM-123' })
      .expect(200);

    expect(approveResponse.body.status).toBe('APPROVED');
    expect(approveResponse.body.hcmReference).toBe('HCM-123');

    const balanceResponse = await request(app.getHttpServer())
      .get('/balances/emp-1/loc-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(balanceResponse.body.availableBalance).toBe(8);
    expect(balanceResponse.body.reservedBalance).toBe(0);
    expect(balanceResponse.body.usedBalance).toBe(2);
  });

  it('reject flow releases reserved balance', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/time-off-requests')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        employeeId: 'emp-1',
        locationId: 'loc-1',
        startDate: '2026-06-01',
        endDate: '2026-06-01',
        requestedDays: 1,
      })
      .expect(201);

    const rejectResponse = await request(app.getHttpServer())
      .patch(`/time-off-requests/${createResponse.body.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Team calendar conflict' })
      .expect(200);

    expect(rejectResponse.body.status).toBe('REJECTED');
    expect(rejectResponse.body.rejectionReason).toBe('Team calendar conflict');

    const balanceResponse = await request(app.getHttpServer())
      .get('/balances/emp-1/loc-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(balanceResponse.body.availableBalance).toBe(10);
    expect(balanceResponse.body.reservedBalance).toBe(0);
    expect(balanceResponse.body.usedBalance).toBe(0);
  });

  it('handles HCM realtime + batch sync and reflects on balances', async () => {
    await request(app.getHttpServer())
      .post('/hcm-integration/balances/realtime')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: 'emp-1',
        locationId: 'loc-1',
        availableBalance: 15,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/hcm-integration/balances/batch')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [
          { employeeId: 'emp-1', locationId: 'loc-1', availableBalance: 12 },
          { employeeId: 'emp-2', locationId: 'loc-2', availableBalance: 7 },
        ],
      })
      .expect(201)
      .expect({ total: 2, upserted: 2 });

    const emp1Balance = await request(app.getHttpServer())
      .get('/balances/emp-1/loc-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const emp2Balance = await request(app.getHttpServer())
      .get('/balances/emp-2/loc-2')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(emp1Balance.body.availableBalance).toBe(12);
    expect(emp2Balance.body.availableBalance).toBe(7);
  });

  it('updates sync result callback status for a request', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/time-off-requests')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        employeeId: 'emp-1',
        locationId: 'loc-1',
        startDate: '2026-06-01',
        endDate: '2026-06-01',
        requestedDays: 1,
      })
      .expect(201);

    const callbackResponse = await request(app.getHttpServer())
      .post(`/hcm-integration/requests/${createResponse.body.id}/sync-result`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        success: false,
        errorMessage: 'HCM validation failed',
      })
      .expect(201);

    expect(callbackResponse.body.syncStatus).toBe('FAILED');
    expect(callbackResponse.body.rejectionReason).toBe('HCM validation failed');
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    if (existsSync(e2eDbPath)) {
      rmSync(e2eDbPath);
    }
  });
});
