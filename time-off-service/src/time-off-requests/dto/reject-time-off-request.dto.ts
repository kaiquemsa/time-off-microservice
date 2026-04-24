import { IsString, MinLength } from 'class-validator';

export class RejectTimeOffRequestDto {
  @IsString()
  @MinLength(3)
  reason: string;
}
