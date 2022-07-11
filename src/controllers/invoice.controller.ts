import { Controller, Get } from '@nestjs/common';
import { DebptDto as DebptDto } from 'src/dto/debpt.dto';
import { BalanceService } from 'src/services/balance/balance.service';

@Controller('invoice')
export class FinanceController {
  constructor(private readonly _fnanceService: BalanceService) {}

  @Get()
  async getDebpts(): Promise<DebptDto[]> {
    return this._fnanceService.getDebptors();
  }
}
