import { IsDateString, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class RealtimeBalanceSyncDto {
  @IsString()
  employeeId: string;

  @IsString()
  locationId: string;

  @IsNumber()
  @IsPositive()
  availableBalance: number;

  @IsOptional()
  @IsDateString()
  syncedAt?: string;
}
