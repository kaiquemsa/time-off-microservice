import { IsIn, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '../time-off-request-status';

export class FindTimeOffRequestsQueryDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsIn(Object.values(RequestStatus))
  status?: RequestStatus;
}
