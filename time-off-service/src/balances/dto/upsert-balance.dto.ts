import { IsDateString, IsNumber, IsOptional, IsPositive, IsInt } from 'class-validator';

export class UpsertBalanceDto {
  @IsNumber()
  @IsPositive()
  availableBalance: number;

  @IsOptional()
  @IsDateString()
  lastSyncedAt?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  expectedVersion?: number;
}
