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
      '^(?<date>[^;]+?);[^;]+?;[^;]+?;"OK";"(?<sum>[\\d]+,[\\d]{2})";"RUB";[^;]+?;"RUB";[^;]+?;[^;]+?;[^;]+?;"(?<from>[^;"]+?)"',
      'gm',
    ); //TODO: move to appsettings

    const matches = [...logs.matchAll(tinkoffRegex)];
    const allNewPayments = await this.getPayments(matches);
    const declaredDebtsByUser = await this.getDeclaredDebtsByUser();

    const newPaymentsByUser = this.groupPaymentsByUser(allNewPayments);
    console.log('p----', newPaymentsByUser);
    console.log('all----', allNewPayments);

    for (const userName in declaredDebtsByUser) {
      console.log('>', userName);
      const newPayments = newPaymentsByUser[userName];
      const declaredDebts = declaredDebtsByUser[userName];
      const userBalance = this.getUserBalance(newPayments, declaredDebts);
      if (userBalance === 0) {
        declaredDebts.forEach((d) => (d.status = DebtStatus.PAID));
      } else if (userBalance < 0) {
        const totalBalance = await this.getTotalUserBalance(userName);
        if (totalBalance > 0) {
          declaredDebts.forEach((d) => (d.status = DebtStatus.PAID));
        } else {
          declaredDebts.forEach((d) => (d.status = DebtStatus.ERROR));
        }
      } else {
        newPayments.forEach((p) => (p.checkNeeded = true));
      }

      await this._debtRepository.save(declaredDebts);
      await this._paymentRepository.save(newPayments);
    }

    return allNewPayments.length;
  }

  private async getPayments(matches: RegExpMatchArray[]): Promise<Payment[]> {
    const ret = await Promise.all(
      matches.map(async (match) => {
        const paymentAmount = parseFloat(match.groups['sum'].replace(/,/, '.'));
        console.log('===', paymentAmount);
        const fractionalPart = paymentAmount % 10;
        const userTempId = Math.round(fractionalPart * 100);
        console.log('=====', userTempId);
        if (userTempId > 0) {
          const user = await this._userRepository.findOne({
            where: { utid: userTempId },
            relations: ['payments'],
          });
          if (user) {
            const payment = new Payment();
            payment.amount = paymentAmount;
            payment.payDate = new Date(match.groups['date']);
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

  private async getDeclaredDebtsByUser(): Promise<Dictionary<Debt[]>> {
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

  private async getDebtsHistory(userName: string): Promise<Debt[]> {
    const result = await this._debtRepository.find({
      relations: ['invoice', 'order', 'order.user'],
    });
    return result.filter((d) => d.order.user.telegramName == userName);
  }

  private async getTotalUserBalance(userName: string): Promise<number> {
    const user = await this._userRepository.findOneOrFail({
      where: { telegramId: userName },
      relations: ['payments'],
    });
    console.log('<<<<', user);
    const totalPayment = user.payments.reduce((sum, p) => (sum += p.amount), 0);
    const debtsHistory = await this.getDebtsHistory(userName);
    const totalDebt = debtsHistory.reduce(
      (sum, d) => (sum += d.invoice.amount),
      0,
    );
    return totalPayment - totalDebt;
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
}
