import { Injectable } from '@nestjs/common';
import { BALANCE_SHEET_NAME } from 'src/constants';
import { BalanceDto } from 'src/dto/balance.dto';
import { DebptDto } from 'src/dto/debpt.dto';
import { SpreadsheetService } from 'src/sheets/spreadsheet.service';
import { UserService } from '../user/user.service';

@Injectable()
export class BalanceService {
  constructor(
    private _spreadsheetService: SpreadsheetService,
    private _userService: UserService,
  ) {}

  async getDebptors(): Promise<DebptDto[]> {
    const users = await this._spreadsheetService.getRows<IUserBalance>(BALANCE_SHEET_NAME);
    const debptors = users.filter((u) => u.debpt > 0);
    const ret = await Promise.all(
      debptors.map(async (d) => {
        const telegramId = await this._userService.getTelegramIdByName(d.name);
        return new DebptDto(d.name, telegramId, d.debpt);
      }),
    );

    return ret;
  }

  async getBalanceInfo(telegramName: string): Promise<BalanceDto> {
    telegramName = telegramName.toLowerCase();
    const users = await this._spreadsheetService.getRows<IUserBalance>(BALANCE_SHEET_NAME);
    const user = users.find(
      (u) =>
        u.name.toLowerCase() == '@' + telegramName ||
        u.name.toLowerCase() == telegramName,
    );

    return new BalanceDto(user.debpt, user.bPlus, user.bMinus);
  }
}

export interface IUserBalance {
  name: string;
  debpt: number;
  bPlus: number;
  bMinus: number;
  save();
}
