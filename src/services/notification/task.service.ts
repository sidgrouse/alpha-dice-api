import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  CRON_BALANCE_NOTIFICATIONS,
  CRON_INVOICE_NOTIFICATIONS,
  CRON_WH_NOTIFICATIONS,
} from '../../constants';
import { NotificationService } from './notification.service';

@Injectable()
export class TasksService {
  constructor(private _notificationService: NotificationService) {}

  @Cron(CRON_BALANCE_NOTIFICATIONS)
  async handleDebptors() {
    console.log('===depbtors==');
    await this._notificationService
      .notifyDebtsToPay()
      .catch(() =>
        this._notificationService.notifyError('handleDebptors failed'),
      );
  }

  @Cron(CRON_INVOICE_NOTIFICATIONS)
  async handleNewInvoices() {
    console.log('===invoices==');
    await this._notificationService
      .notifyNewInvoices()
      .catch(() =>
        this._notificationService.notifyError('handleNewInvoices failed'),
      );
  }

  @Cron(CRON_WH_NOTIFICATIONS)
  async handleNewWHouseOrders() {
    console.log('===wh==');
    await this._notificationService
      .notifyNewWHouseOrders()
      .catch(() =>
        this._notificationService.notifyError('handleNewWHouseOrders failed'),
      );
  }
}
