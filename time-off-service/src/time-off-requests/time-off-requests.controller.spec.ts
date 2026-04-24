import { Test, TestingModule } from '@nestjs/testing';
import { TimeOffRequestsController } from './time-off-requests.controller';
import { TimeOffRequestsService } from './time-off-requests.service';

describe('TimeOffRequestsController', () => {
  let controller: TimeOffRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeOffRequestsController],
      providers: [
        {
          provide: TimeOffRequestsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<TimeOffRequestsController>(TimeOffRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
