import { Controller, Get } from '@nestjs/common';
import { DebptDto as DebptDto } from 'src/dto/debpt.dto';
import { BalanceService } from 'src/services/balance/balance.service';

@Controller('invoices')
export class FinanceController {
  constructor(private readonly _financeService: BalanceService) {}

  @Get()
  async getDebpts(): Promise<DebptDto[]> {
    return this._financeService.getDebptors();
  }
}
