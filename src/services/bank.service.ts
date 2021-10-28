import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Payment } from 'src/storage/entities/payment.entity';
import { Debt } from 'src/storage/entities/debt.entity';
import { User } from 'src/storage/entities/user.entity';
import { DebtStatus } from 'src/constants/debt-status';
import { Repository } from 'typeorm';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Payment)
    private _paymentRepository: Repository<Payment>,
    @InjectRepository(Debt)
    private _debtRepository: Repository<Debt>,
    @InjectRepository(User)
    private _userRepository: Repository<User>,
  ) {}

  async parseLogs(logs: string): Promise<number> {
    const tinkoffRegex = new RegExp(
      '^[^;]+?;[^;]+?;[^;]+?;"OK";"(?<sum>[\\d]+,[\\d]{2})";"RUB";[^;]+?;"RUB";[^;]+?;[^;]+?;[^;]+?;"(?<from>[^;"]+?)"',
      'gm',
    ); //TODO: move to appsettings

    const matches = [...logs.matchAll(tinkoffRegex)];
    const newPayments = await this.getPayments(matches);
    const debtsByUser = await this.getUnconfirmedDebtsByUser();

    const paymentsByUser = this.groupPaymentsByUser(newPayments);
    //console.log('p----', userPayments);
    //console.log('d----', userDebts);

    //TODO:
    //TODO: join name arrays
    for (const user in paymentsByUser) {
      console.log('>', user);
      const payments = paymentsByUser[user];
      const debts = debtsByUser[user];
      const userPaymentAmount = payments.reduce(
        (sum, p) => (sum += p.amount),
        0,
      );
      const userDebtAmount = debts.reduce(
        (sum, d) => (sum += d.invoice.amount),
        0,
      );
      const userBalance = userPaymentAmount - userDebtAmount;
      if (userBalance >= 0) {
        debts.forEach((d) => (d.status = DebtStatus.PAYMENT_CONFIRMED));
        debtsByUser[user] = [];
      } else {
        debts.forEach((d) => (d.status = DebtStatus.ERROR));
      }

      await this._debtRepository.save(debts);
      await this._paymentRepository.save(payments);
    }

    return 3;
  }

  private async getPayments(matches: RegExpMatchArray[]): Promise<Payment[]> {
    const ret = await Promise.all(
      matches.map(async (match) => {
        const paymentAmount = parseFloat(match.groups['sum'].replace(/,/, '.'));
        const fractionalPart = paymentAmount % 10;
        const userTempId = Math.round(fractionalPart * 100);
        if (userTempId > 0) {
          const user = await this._userRepository.findOne({
            where: { utid: userTempId },
            relations: ['payments'],
          });
          if (user) {
            const payment = new Payment();
            payment.amount = paymentAmount;
            payment.nameFrom = match.groups['from'];
            payment.log = match.toString();
            payment.user = user;
            return payment;
          } else {
            console.log(`User not found for ${match}`);
          }
        }
      }),
    );
    return ret.filter((p) => p);
  }

  private groupPaymentsByUser(pmnts: Payment[]): Dictionary<Payment[]> {
    const ret: { [user: string]: Payment[] } = {};
    return pmnts.reduce((usrGprs, pmnt) => {
      usrGprs[pmnt.user.telegramName] = usrGprs[pmnt.user.telegramName] || [];
      usrGprs[pmnt.user.telegramName].push(pmnt);
      return usrGprs;
    }, ret);
  }

  private async getUnconfirmedDebtsByUser(): Promise<Dictionary<Debt[]>> {
    const ret: { [user: string]: Debt[] } = {};
    const debts = await this._debtRepository.find({
      where: { status: DebtStatus.PAYMENT_DECLARED },
      relations: ['invoice', 'order', 'order.user'],
    });
    return debts.reduce((usrGprs, debt) => {
      usrGprs[debt.order.user.telegramName] =
        usrGprs[debt.order.user.telegramName] || [];
      usrGprs[debt.order.user.telegramName].push(debt);
      return usrGprs;
    }, ret);
  }
}
