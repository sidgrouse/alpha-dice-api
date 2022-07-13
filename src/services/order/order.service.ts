import { Injectable } from '@nestjs/common';
import { LOCAL_WHOUSE_SHEET_NAME } from 'src/constants';
import { WhouseOrderStatus } from 'src/constants/warehous-order-status';
import { SpreadsheetService } from 'src/sheets/spreadsheet.service';
import { Envelope } from '../envelope.model';
import { UserService } from '../user/user.service';
import { IOrder } from './order.interface';

@Injectable()
export class OrderService {
  constructor(
    private _dataService: SpreadsheetService,
    private _userService: UserService,
  ) {}

  public async getNewWHouseOrders(): Promise<Envelope<IOrder>[]> {
    const users = await this._dataService.getRows<IOrder>(LOCAL_WHOUSE_SHEET_NAME);
    const newInvoices = users.filter((inv) => inv.status == WhouseOrderStatus.NEW);
    const ret = await Promise.all(
      newInvoices.slice(0, 30).map(async (x) => {
        const telegramId = await this._userService.getTelegramIdByName(x.telegramName);
        return new Envelope(telegramId, x);
      }),
    );

    return ret;
  }

  public async getUserWHouseOrders(userName: string): Promise<IOrder[]> {
    userName = userName.toLowerCase();
    const rows = await this._dataService.getRows<IOrder>(LOCAL_WHOUSE_SHEET_NAME);
    const payments = rows.filter(
      (x) =>
        x.telegramName?.toLowerCase() === userName ||
        x.telegramName?.toLowerCase() === '@' + userName,
    );

    return payments;
  }
}
