import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { RealtimeBalanceSyncDto } from './realtime-balance-sync.dto';

export class BatchSyncBalancesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RealtimeBalanceSyncDto)
  items: RealtimeBalanceSyncDto[];
}
