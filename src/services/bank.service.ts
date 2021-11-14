import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Payment } from 'src/storage/entities/payment.entity';
import { Debt } from 'src/storage/entities/debt.entity';
import { User } from 'src/storage/entities/user.entity';
import { Repository } from 'typeorm';
import { InvoiceService } from './invoice.service';
import { ConfigService } from '@nestjs/config';
import { InvoiceStatus } from 'src/constants/invoice-status';
import { PaymentDto } from 'src/dto/payment.dto';
import { UserDto } from 'src/dto/user.dto';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Debt)
    private debtRepository: Repository<Debt>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private invoiceService: InvoiceService,
    private configService: ConfigService, //private _notificationService: NotificationService,
  ) {}

  async parseLogs(logs: string): Promise<PaymentDto[]> {
    const tinkoffRegexText = this.configService.get('REGEXP_TINKOFF_LOGS');
    const tinkoffRegex = new RegExp(tinkoffRegexText, 'gm');

    const matches = [...logs.matchAll(tinkoffRegex)];
    const actualPayments = await this.getPaymentsFromMatches(matches);
    let expectedPaymentsToAssign = await this.paymentRepository.find({
      where: { confirmed: false },
      relations: ['user', 'debts', 'debts.invoice'],
    });
    actualPayments.forEach(async (pmntLog) => {
      const paymentEntity = expectedPaymentsToAssign.find((entity) => {
        return (
          entity.user.id === pmntLog.user.id &&
          // eslint-disable-next-line prettier/prettier
          entity.debts.reduce((sum, d) => sum + d.invoice.amount, 0) === pmntLog.amount          
        );
      });
      expectedPaymentsToAssign = expectedPaymentsToAssign.filter(
        (itm) => itm.id !== paymentEntity.id,
      );
      pmntLog.id = paymentEntity.id;
      pmntLog.debtIds = paymentEntity.debts.map((d) => d.id);
    });

    return actualPayments.concat(
      expectedPaymentsToAssign.map((pmnt) => {
        const total = pmnt.debts.reduce((sum, d) => sum + d.invoice.amount, 0);
        return new PaymentDto(
          pmnt.id,
          total,
          new UserDto(
            pmnt.user.id,
            pmnt.user.telegramId,
            pmnt.user.telegramName,
          ),
          pmnt.debts.map((d) => d.id),
        );
      }),
    );
  }

  // eslint-disable-next-line prettier/prettier
  private async getPaymentsFromMatches(matches: RegExpMatchArray[]): Promise<PaymentDto[]> {
    const ret = await Promise.all(
      matches.map(async (match) => {
        const paymentAmount = parseFloat(match.groups['sum'].replace(/,/, '.'));
        console.log('===', paymentAmount);
        const fractionalPart = paymentAmount % 10;
        const userTempId = Math.round(fractionalPart * 100);
        if (userTempId > 0) {
          const user = await this.userRepository.findOne({
            where: { utid: userTempId },
            relations: ['payments'],
          });
          if (user) {
            return new PaymentDto(
              undefined,
              paymentAmount - fractionalPart,
              new UserDto(user.id, user.telegramId, user.telegramName),
              [],
              match.toString(),
              match.groups['from'],
              this.getDate(match.groups['date']),
            );
          } else {
            console.log(`User not found for ${match}`);
          }
        }
      }),
    );
    return ret.filter((p) => p);
  }

  private async getDebtsHistory(userName: string): Promise<Debt[]> {
    const result = await this.debtRepository.find({
      relations: ['invoice', 'order', 'order.user'],
    });
    return result.filter((d) => d.order.user.telegramName == userName);
  }

  private async getUserTotal(
    userName: string,
    newPayments: Payment[],
  ): Promise<number> {
    const user = await this.userRepository.findOneOrFail({
      where: { telegramName: userName },
      relations: ['payments'],
    });
    console.log('<<<<', user);
    const pmntAmount = user.payments.reduce((sum, p) => (sum += p.amount), 0);
    const newPmntAmount = newPayments.reduce((sum, p) => (sum += p.amount), 0);
    const debtsHistory = (await this.getDebtsHistory(userName)).filter(
      (d) =>
        d.invoice.status === InvoiceStatus.TO_PAY ||
        d.invoice.status === InvoiceStatus.CLOSED,
    );
    const totalDebt = debtsHistory.reduce(
      (sum, d) => (sum += d.invoice.amount),
      0,
    );
    return pmntAmount + newPmntAmount - totalDebt;
  }

  private getUserBalance(payments: Payment[], debts: Debt[]): number {
    const userNewPaymentAmount = payments.reduce(
      (sum, p) => (sum += p.amount),
      0,
    );
    const userDeclaredDebtAmount = debts.reduce(
      (sum, d) => (sum += d.invoice.amount),
      0,
    );
    return userNewPaymentAmount - userDeclaredDebtAmount;
  }

  getDate(dateString: string): Date {
    const segments =
      /(\d{1,2})\.(\d{1,2})\.(\d{1,4}) (\d{1,2}):(\d{1,2}):(\d{1,2})/gm.exec(
        dateString,
      );
    const num = segments.map((itm) => Number.parseInt(itm));
    return new Date(num[3], num[2], num[1], num[4], num[5], num[6]);
  }
}
