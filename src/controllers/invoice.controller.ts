import { Controller, Get } from '@nestjs/common';
import { DebtDto as DebptDto } from 'src/dto/debt.dto';
import { FinanceService } from 'src/services/finance.service';

@Controller('invoice')
export class FinanceController {
  constructor(private readonly _fnanceService: FinanceService) {}

  @Get()
  async getDebpts(): Promise<DebptDto[]> {
    return this._fnanceService.getDebptors();
  }
}
