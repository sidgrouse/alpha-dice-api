import { Controller, Get } from '@nestjs/common';
import { DebtDto as DebptDto } from 'src/dto/debt.dto';
import { BalanceService } from 'src/services/balance.service';

@Controller('invoice')
export class FinanceController {
  constructor(private readonly _fnanceService: BalanceService) {}

  @Get()
  async getDebpts(): Promise<DebptDto[]> {
    return this._fnanceService.getDebptors();
  }
}
