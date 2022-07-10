import { Injectable } from '@nestjs/common';
import { INVOICE_SHEET_NAME } from 'src/constants';
import { InvoiceStatus } from 'src/constants/invoice-status';
import { InvoiceDto } from 'src/dto/invoice.dto';
import { SpreadsheetService } from 'src/sheets/spreadsheet.service';
import { UserService } from './user.service';

@Injectable()
export class InvoiceService {
  constructor(
    private _spreadsheetService: SpreadsheetService,
    private _userService: UserService,
  ) {}

  public async getNewInvoices(): Promise<InvoiceDto[]> {
    const users = await this._spreadsheetService.getRows<IInvoice>(INVOICE_SHEET_NAME);
    const newInvoices = users.filter(
      (inv) => inv.status == InvoiceStatus.WAITING,
    );
    const ret = await Promise.all(
      newInvoices.map(async (x) => {
        const telegramId = await this._userService.getTelegramIdByName(x.name);
        x.status = InvoiceStatus.NOTIFIED; //TODO: change status later
        x.save();
        return new InvoiceDto(telegramId, x.name, x.item, x.comment, x.total);
      }),
    );

    console.log('new invoices', ret);
    return ret;
  }
}

export interface IInvoice {
  name: string;
  item: string;
  amount: number;
  comment: string;
  total: number;
  status: InvoiceStatus;

  save();
}
