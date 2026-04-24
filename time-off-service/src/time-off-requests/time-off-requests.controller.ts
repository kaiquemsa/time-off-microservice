import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TimeOffRequestsService } from './time-off-requests.service';
import { CreateTimeOffRequestDto } from './dto/create-time-off-request.dto';
import { ApproveTimeOffRequestDto } from './dto/approve-time-off-request.dto';
import { RejectTimeOffRequestDto } from './dto/reject-time-off-request.dto';
import { FindTimeOffRequestsQueryDto } from './dto/find-time-off-requests-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/types/role.enum';

@Controller('time-off-requests')
export class TimeOffRequestsController {
  constructor(private readonly timeOffRequestsService: TimeOffRequestsService) {}

  @Post()
  create(@Body() body: CreateTimeOffRequestDto) {
    return this.timeOffRequestsService.create(body);
  }

  @Get()
  findAll(@Query() query: FindTimeOffRequestsQueryDto) {
    return this.timeOffRequestsService.findAll(query);
  }

  @Patch(':requestId/approve')
  @Roles(Role.ADMIN)
  approve(
    @Param('requestId') requestId: string,
    @Body() body: ApproveTimeOffRequestDto,
  ) {
    return this.timeOffRequestsService.approve(requestId, body);
  }

  @Patch(':requestId/reject')
  reject(
    @Param('requestId') requestId: string,
    @Body() body: RejectTimeOffRequestDto,
  ) {
    return this.timeOffRequestsService.reject(requestId, body);
  }
}
