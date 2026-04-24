describe('main bootstrap', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
    jest.resetModules();
  });

  async function loadMainWithMocks(nodeEnv?: string, port?: string) {
    if (nodeEnv !== undefined) {
      process.env.NODE_ENV = nodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }

    if (port !== undefined) {
      process.env.PORT = port;
    } else {
      delete process.env.PORT;
    }

    const appMock = {
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    const createMock = jest.fn().mockResolvedValue(appMock);

    jest.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: createMock,
      },
    }));

    jest.doMock('./app.module', () => ({
      AppModule: class MockAppModule {},
    }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('./main');
    await new Promise((resolve) => setImmediate(resolve));

    return { appMock, createMock };
  }

  it('configures app bootstrap defaults', async () => {
    const { appMock, createMock } = await loadMainWithMocks(undefined, undefined);

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(appMock.enableCors).toHaveBeenCalledTimes(1);
    expect(appMock.useGlobalPipes).toHaveBeenCalledTimes(1);
    expect(appMock.listen).toHaveBeenCalledWith(3000);
  });

  it('allows localhost origin in non-production CORS', async () => {
    const { appMock } = await loadMainWithMocks('development', '3007');

    const corsConfig = appMock.enableCors.mock.calls[0][0];
    const callback = jest.fn();

    corsConfig.origin('http://localhost:3001', callback);

    expect(callback).toHaveBeenCalledWith(null, true);
    expect(appMock.listen).toHaveBeenCalledWith('3007');
  });

  it('blocks non-localhost origins in production CORS', async () => {
    const { appMock } = await loadMainWithMocks('production', '4000');

    const corsConfig = appMock.enableCors.mock.calls[0][0];
    const callback = jest.fn();

    corsConfig.origin('https://example.com', callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error), false);
    expect(appMock.listen).toHaveBeenCalledWith('4000');
  });

  it('allows requests with no origin header', async () => {
    const { appMock } = await loadMainWithMocks('production', undefined);

    const corsConfig = appMock.enableCors.mock.calls[0][0];
    const callback = jest.fn();

    corsConfig.origin(undefined, callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });
});
