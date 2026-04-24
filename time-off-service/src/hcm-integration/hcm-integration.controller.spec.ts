import { Test, TestingModule } from '@nestjs/testing';
import { HcmIntegrationController } from './hcm-integration.controller';
import { HcmIntegrationService } from './hcm-integration.service';

describe('HcmIntegrationController', () => {
  let controller: HcmIntegrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HcmIntegrationController],
      providers: [
        {
          provide: HcmIntegrationService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<HcmIntegrationController>(HcmIntegrationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
