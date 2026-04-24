import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('login delegates credentials to auth service', async () => {
    authServiceMock.login.mockResolvedValue({ access_token: 'token' });

    const result = await controller.login({ username: 'admin', password: 'admin1234' });

    expect(authServiceMock.login).toHaveBeenCalledWith('admin', 'admin1234');
    expect(result).toEqual({ access_token: 'token' });
  });

  it('me returns authenticated user payload', () => {
    const req = { user: { sub: 'u-1', username: 'admin', role: 'ADMIN' } };
    expect(controller.me(req)).toEqual(req.user);
  });
});
