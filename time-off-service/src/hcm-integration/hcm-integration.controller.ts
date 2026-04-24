import { Body, Controller, Param, Post } from '@nestjs/common';
import { HcmIntegrationService } from './hcm-integration.service';
import { RealtimeBalanceSyncDto } from './dto/realtime-balance-sync.dto';
import { BatchSyncBalancesDto } from './dto/batch-sync-balances.dto';
import { TimeOffSyncResultDto } from './dto/time-off-sync-result.dto';

@Controller('hcm-integration')
export class HcmIntegrationController {
  constructor(private readonly hcmIntegrationService: HcmIntegrationService) {}

  @Post('balances/realtime')
  syncRealtimeBalance(@Body() body: RealtimeBalanceSyncDto) {
    return this.hcmIntegrationService.syncRealtimeBalance(body);
  }

  @Post('balances/batch')
  syncBatchBalances(@Body() body: BatchSyncBalancesDto) {
    return this.hcmIntegrationService.syncBatchBalances(body);
  }

  @Post('requests/:requestId/sync-result')
  handleTimeOffSyncResult(
    @Param('requestId') requestId: string,
    @Body() body: TimeOffSyncResultDto,
  ) {
    return this.hcmIntegrationService.handleTimeOffSyncResult(requestId, body);
  }
}
