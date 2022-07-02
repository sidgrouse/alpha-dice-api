import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DebtDto } from 'src/dto/debt.dto';

@Injectable()
export class FinanceService {
  constructor(private _configService: ConfigService) {}

  async getDebptors(): Promise<DebtDto[]> {
    return [new DebtDto('k_matroskin', 100)];
  }
}
