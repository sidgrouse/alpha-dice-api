import { Injectable } from '@nestjs/common';
import { BALANCE_SHEET_NAME } from 'src/constants';
import { DebtDto } from 'src/dto/debt.dto';
import { SpreadsheetService } from 'src/sheets/spreadsheet.service';
import { UserService } from './user.service';

@Injectable()
export class BalanceService {
  constructor(
    private _spreadsheetService: SpreadsheetService,
    private _userService: UserService,
  ) {}

  async getDebptors(): Promise<DebtDto[]> {
    const users = await this._spreadsheetService.getRows<IUserBalance>(BALANCE_SHEET_NAME);
    const debptors = users.filter((u) => u.debpt > 0);
    const ret = await Promise.all(
      debptors.map(async (d) => {
        const telegramName = await this._userService.getTelegramIdByName(d.name);
        return new DebtDto(d.name, telegramName, d.debpt);
      }),
    );

    console.log('ret', ret);
    return ret;
  }
}

export interface IUserBalance {
  name: string;
  debpt: number;
  save();
}
