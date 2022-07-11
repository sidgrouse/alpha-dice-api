import { Injectable } from '@nestjs/common';
import { PAYMENT_SHEET_NAME } from 'src/constants';
import { SpreadsheetService } from 'src/sheets/spreadsheet.service';
import { IPayment } from './payment.interface';

@Injectable()
export class PaymentService {
  constructor(private _dataService: SpreadsheetService) {}

  public async getUserPayments(
    userName: string,
    limit = 100,
  ): Promise<IPayment[]> {
    const rows = await this._dataService.getRows<IPayment>(PAYMENT_SHEET_NAME);
    const payments = rows
      .filter(
        (p) =>
          (p.telegramName == userName || p.telegramName == '@' + userName) &&
          p.check == 1,
      )
      .slice(-limit);

    return payments;
  }
}
