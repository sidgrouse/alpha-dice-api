import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CRON_INVOICE_NOTIFICATIONS } from '../constants';
import { NotificationService } from './notification.service';

@Injectable()
export class TasksService {
  constructor(private _notificationService: NotificationService) {}

  @Cron(CRON_INVOICE_NOTIFICATIONS)
  async handleInvoicesToPayCron() {
    console.log('===cron==');
    this._notificationService.notifyDebtsToPay();
  }
}
