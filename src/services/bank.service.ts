import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Payment } from 'src/storage/entities/payment.entity';
import { Debt } from 'src/storage/entities/debt.entity';

@Injectable()
export class BankService {
    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        @InjectRepository(Debt)
        private debtRepository: Repository<Debt>) {
    }

    async parseLogs(logs: string): Promise<number>{
        const tinkoffRegex = /^[^;]+?;[^;]+?;[^;]+?;"OK";"(?<sum>[\d]+,[\d]{2})";"RUB"/m; //TODO: move to appsettings. why new Regex doesn't work?
        const matches = tinkoffRegex.exec(logs);
        console.log(matches[2]);
        console.log(matches.groups['sum']);
        return 0;
    }
}