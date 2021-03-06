import { Injectable } from '@nestjs/common';
import { INVOICE_SHEET_NAME } from 'src/constants';
import { InvoiceStatus } from 'src/constants/invoice-status';
import { SpreadsheetService } from 'src/sheets/spreadsheet.service';
import { Envelope } from '../envelope.model';
import { UserService } from '../user/user.service';
import { IInvoice } from './iinvoice.interface';

@Injectable()
export class InvoiceService {
  constructor(
    private _dataService: SpreadsheetService,
    private _userService: UserService,
  ) {}

  public async getNewInvoices(): Promise<Envelope<IInvoice>[]> {
    const users = await this._dataService.getRows<IInvoice>(INVOICE_SHEET_NAME);
    const newInvoices = users.filter((inv) => inv.status == InvoiceStatus.NEW);
    const ret = await Promise.all(
      newInvoices.slice(0, 20).map(async (x) => {
        const telegramId = await this._userService.getTelegramIdByName(x.name);
        return new Envelope(telegramId, x);
      }),
    );

    return ret;
  }

  public async getUserInvoices(
    userName: string,
    limit = 100,
  ): Promise<IInvoice[]> {
    userName = userName.toLowerCase();
    const rows = await this._dataService.getRows<IInvoice>(INVOICE_SHEET_NAME);
    const payments = rows
      .filter(
        (x) =>
          x.name?.toLowerCase() === userName ||
          x.name?.toLowerCase() === '@' + userName,
      )
      .slice(-limit);

    return payments;
  }
}
