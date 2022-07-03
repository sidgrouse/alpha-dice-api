import { Injectable } from '@nestjs/common';
import { DebtDto } from 'src/dto/debt.dto';
import { SpreadsheetService } from 'src/sheets/spreadsheet.service';

@Injectable()
export class FinanceService {
  constructor(private _spreadsheetService: SpreadsheetService) {}

  async getDebptors(): Promise<DebtDto[]> {
    const users = await this._spreadsheetService.getRows();
    console.log('users', users.map);
    const debptors = users.filter((u) => Number.parseFloat(u.debpt) > 0);
    console.log('debptors', debptors);
    const ret = debptors.map(
      (u) => new DebtDto(u.contact_id, u.telegram_id, u.debpt),
    );
    console.log('ret', ret);
    return ret;
  }
}
