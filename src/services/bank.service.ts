import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Payment } from 'src/storage/entities/payment.entity';
import { Debt } from 'src/storage/entities/debt.entity';
import { User } from 'src/storage/entities/user.entity';
import { PaymentConfirmationDto, PaymentDto } from 'src/dto/payment-confirmation.dto';
import { pay } from 'telegraf/typings/button';
import { match } from 'assert';
import { DebtStatus } from 'src/constants/debt-status';

@Injectable()
export class BankService {
    constructor(
        @InjectRepository(Payment)
        private _paymentRepository: Repository<Payment>,
        @InjectRepository(Debt)
        private _debtRepository: Repository<Debt>,
        @InjectRepository(User)
        private _userRepository: Repository<User>) {
    }

    async parseLogs(logs: string): Promise<number>{
        const tinkoffRegex = new RegExp('^[^;]+?;[^;]+?;[^;]+?;"OK";"(?<sum>[\\d]+,[\\d]{2})";"RUB";[^;]+?;"RUB";[^;]+?;[^;]+?;[^;]+?;"(?<from>[^;"]+?)"', 'gm'); //TODO: move to appsettings

        const matches = [...logs.matchAll(tinkoffRegex)];
        const allPayments = await this.getPayments(matches);
        const userDebts = await this.getUnconfirmedDebtsByUser();

        const userPayments = this.groupPaymentsByUser(allPayments);
        //console.log('p----', userPayments);
        //console.log('d----', userDebts);
        
        //TODO: 
        //TODO: join name arrays
        for(let user in userDebts){
            console.log('>', user);
            let pmnts = userPayments[user] as any; //WTF?!
            let debts = userDebts[user] as any;
            console.log('>>>', pmnts);
            const userPaymentAmount  = pmnts.reduce((sum, p) => sum += p.amount, 0);
            const userDebtAmount = debts.reduce((sum, d) => sum += d.invoice.amount, 0);
            if(userPaymentAmount >= userDebtAmount){
                debts.forEach(d => d.status = DebtStatus.PAYMENT_CONFIRMED);
                await this._paymentRepository.save(pmnts); //TODO: status?
                await this._debtRepository.save(debts);
            }
            else{
                debts.forEach(d => d.status = DebtStatus.ERROR);
                await this._debtRepository.save(debts);
            }
            
        }
        userDebts.forEach(element => {
            const t = userDebts[element.toString()]
        });

        return userPayments.length;
    }

    private async getPayments(matches: RegExpMatchArray[]) : Promise<Payment[]> {
        const ret = await Promise.all(matches.map(async match => {
            const paymentAmount = parseFloat(match.groups['sum'].replace(/,/, '.'));
            const fractionalPart = paymentAmount % 10;
            const userTempId = Math.round(fractionalPart * 100);
            if(paymentAmount){
                const user = await this._userRepository.findOne({
                    where: {utid:userTempId},
                    relations:["payments"]
                });
                if(user){
                    const payment = new Payment();
                    payment.amount = paymentAmount;
                    payment.nameFrom = match.groups['from'];
                    payment.log = match.toString();
                    payment.user = user;
                    return payment;
                }
                else{
                    console.log(`User not found for ${match}`)
                }
            }
        }));
        return ret.filter(p => p);
    }

    private groupPaymentsByUser(pmnts: Payment[]) {
        const ret : {[user: string]: Payment[]}[] = [];
        return pmnts.reduce((usrGprs, pmnt) => {
            usrGprs[pmnt.user.telegramName] = usrGprs[pmnt.user.telegramName] || [];
            usrGprs[pmnt.user.telegramName].push(pmnt);
            return usrGprs;
        }, ret);
      }

      private async getUnconfirmedDebtsByUser() : Promise<{[user: string] : Debt[]}[]>{
          const ret : {[user: string] : Debt[]}[] = [];
          const debts = await this._debtRepository.find({
              where: {status: DebtStatus.PAYMENT_DECLARED},
              relations: ["invoice", "order", "order.user"]
            });
          return debts.reduce((usrGprs, debt) => {
            usrGprs[debt.order.user.telegramName] = usrGprs[debt.order.user.telegramName] || [];
            usrGprs[debt.order.user.telegramName].push(debt);
            return usrGprs;
        }, ret);
      }
}