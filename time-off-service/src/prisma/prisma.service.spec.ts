import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    process.env.DATABASE_URL = 'file:./test/prisma-unit.db';
  });

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  it('throws when DATABASE_URL is not defined', () => {
    delete process.env.DATABASE_URL;

    expect(() => new PrismaService()).toThrow('DATABASE_URL is required to initialize PrismaClient.');
  });

  it('calls $connect on module init', async () => {
    const service = new PrismaService();
    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue(undefined as never);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
  });

  it('registers shutdown hook and closes app on beforeExit', async () => {
    const service = new PrismaService();
    const app = {
      close: jest.fn().mockResolvedValue(undefined),
    };

    await service.enableShutdownHooks(app as never);

    process.emit('beforeExit', 0);
    await new Promise((resolve) => setImmediate(resolve));

    expect(app.close).toHaveBeenCalled();
  });
});
