import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class TimeOffSyncResultDto {
  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsString()
  hcmReference?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}
