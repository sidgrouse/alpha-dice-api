import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { DebtDto } from 'src/dto/debt.dto';
import { UserDto } from 'src/dto/user.dto';
import { InvoiceStatus } from 'src/constants/invoice-status';

import { User } from 'src/storage/entities/user.entity';
import { Pledge } from 'src/storage/entities/pledge.entity';
import { Order } from '../storage/entities/order.entity';
import { Invoice } from 'src/storage/entities/invoice.entity';
import { Payment } from 'src/storage/entities/payment.entity';
import { PaymentStatus } from 'src/constants/payment-status';
import { TempIdentifier } from 'src/storage/entities/temp-identifier.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,        
        @InjectRepository(User)
        private tempIdRepository: Repository<TempIdentifier>
      ) {}

    async addUser(name: string, telegramId : number): Promise<void> {
        const existedUser = this.userRepository.findOne({where: {telegramId: telegramId}})

        if(!existedUser){
            const user = new User();
            user.telegramName = name;
            user.telegramId = telegramId;
            await this.userRepository.save(user);
        }
    }

    async assignNewTempId(telegramId: number){
        this.tempIdRepository.find
    }

    async releaseTempId(telegramId: number){
        let user = await this.userRepository.findOneOrFail({where: {telegramId: telegramId}});
        user.fractionalAddition
    }
}