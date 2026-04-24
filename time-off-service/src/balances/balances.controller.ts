import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { UpsertBalanceDto } from './dto/upsert-balance.dto';

@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Get(':employeeId/:locationId')
  getByEmployeeAndLocation(
    @Param('employeeId') employeeId: string,
    @Param('locationId') locationId: string,
  ) {
    return this.balancesService.getByEmployeeAndLocation(employeeId, locationId);
  }

  @Put(':employeeId/:locationId')
  upsertByEmployeeAndLocation(
    @Param('employeeId') employeeId: string,
    @Param('locationId') locationId: string,
    @Body() body: UpsertBalanceDto,
  ) {
    return this.balancesService.upsertByEmployeeAndLocation(
      employeeId,
      locationId,
      body,
    );
  }
}
