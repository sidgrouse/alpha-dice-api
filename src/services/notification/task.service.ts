import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  CRON_BALANCE_NOTIFICATIONS,
  CRON_INVOICE_NOTIFICATIONS,
} from '../../constants';
import { NotificationService } from './notification.service';

@Injectable()
export class TasksService {
  constructor(private _notificationService: NotificationService) {}

  @Cron(CRON_BALANCE_NOTIFICATIONS)
  async handleDebptors() {
    console.log('===depbtors==');
    this._notificationService.notifyDebtsToPay();
  }

  @Cron(CRON_INVOICE_NOTIFICATIONS)
  async handleNewInvoices() {
    console.log('===invoices==');
    this._notificationService.notifyNewInvoices();
  }
}
