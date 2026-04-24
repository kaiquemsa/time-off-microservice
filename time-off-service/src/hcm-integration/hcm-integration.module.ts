import { Module } from '@nestjs/common';
import { HcmIntegrationController } from './hcm-integration.controller';
import { HcmIntegrationService } from './hcm-integration.service';

@Module({
  controllers: [HcmIntegrationController],
  providers: [HcmIntegrationService]
})
export class HcmIntegrationModule {}
