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
    userName = userName.toLowerCase();
    const rows = await this._dataService.getRows<IPayment>(PAYMENT_SHEET_NAME);
    const payments = rows
      .filter(
        (p) =>
          (p.telegramName?.toLowerCase() === userName ||
            p.telegramName?.toLowerCase() === '@' + userName) &&
          p.check == 1,
      )
      .slice(-limit);

    return payments;
  }
}
