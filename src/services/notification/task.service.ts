import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  CRON_DEBPT_NOTIFICATIONS,
  CRON_INVOICE_NOTIFICATIONS,
  CRON_WH_NOTIFICATIONS,
} from '../../constants';
import { NotificationService } from './notification.service';

@Injectable()
export class TasksService {
  constructor(private _notificationService: NotificationService) {}

  @Cron(CRON_DEBPT_NOTIFICATIONS)
  async handleDebptors() {
    console.log('===depbtors==');
    try {
      await this._notificationService.notifyDebtsToPay();
    } catch (e) {
      this._notificationService.notifyError('handleDebptors failed with ' + e);
    }
  }

  @Cron(CRON_INVOICE_NOTIFICATIONS)
  async handleNewInvoices() {
    console.log('===invoices==');
    try {
      await this._notificationService.notifyNewInvoices();
    } catch (e) {
      this._notificationService.notifyError(
        'handleNewInvoices failed with ' + e,
      );
    }
  }

  @Cron(CRON_WH_NOTIFICATIONS)
  async handleNewWHouseOrders() {
    console.log('===wh==');
    try {
      await this._notificationService.notifyNewWHouseOrders();
    } catch (e) {
      this._notificationService.notifyError(
        'handleNewWHouseOrders failed with ' + e,
      );
    }
  }
}
