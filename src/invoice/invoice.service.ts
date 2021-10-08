import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { InvoiceDto } from 'src/dto/invoice.dto';
import { UserDto } from 'src/dto/user.dto';
import { CreateInvoiceDto } from 'src/dto/create-invoice.dto';
import { InvoiceStatus } from 'src/constants/invoice-status';

import { User } from 'src/storage/entities/user.entity';
import { Pledge } from 'src/storage/entities/pledge.entity';
import { Invoice } from '../storage/entities/invoice.entity';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Pledge)
        private pledgeRepository: Repository<Pledge>,
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
      ) {}

    async addUser(name: string, telegramId : number): Promise<void> { // TODO: be changed ?
        const user = new User();
        user.telegramName = name;
        user.telegramId = telegramId;
        const ret = await this.userRepository.save(user);
        console.log(ret);
    }

    async addInvoice(dto: CreateInvoiceDto): Promise<InvoiceDto> {
        //this.userRepository.preload()
        const pledge = await this.pledgeRepository.findOneOrFail({where: { pledgeName: dto.pledjeName } });
        let user = await this.userRepository.findOne({where: { telegramName: dto.userName } });

        if (!user){
            user = new User();
            user.telegramName = dto.userName;
            console.log(`There is no user named ${dto.userName} in system`);
        }

        const invoice = new Invoice();
        invoice.pledge = pledge;
        invoice.user = user;
        invoice.status = InvoiceStatus.NOTIFICATION_NEEDED; //TODO: make it no_info, change after pay date
        
        const invEntity = await this.invoiceRepository.save(invoice);

        // TODO: check if the one with ret.id-1000 is paid 
        //      (to avoid overlapses in bank logs since it has the same additional fraction number)

        console.log('add', invEntity);
        return new InvoiceDto(invEntity.user.telegramName, invEntity.pledge.pledgeName, InvoiceService.getFullPrice(invEntity), invEntity.status);
    }

    async getAllInvoices(): Promise<InvoiceDto[]> {
        return await (await this.invoiceRepository.find({relations: ["user"]}))
        .map(inv => new InvoiceDto(inv.user.telegramName, inv.pledge.pledgeName, InvoiceService.getFullPrice(inv), inv.status));
    }

    async getDebptors(): Promise<UserDto[]> {
        const allInvoices = await await this.invoiceRepository.find({relations: ["user"]})
        return allInvoices
            .filter(inv => inv.status === InvoiceStatus.NOTIFICATION_NEEDED)
            .filter((v, i, a) => a.indexOf(v) === i) // distinct
            .map(inv => new UserDto(inv.user.telegramId, inv.user.telegramName));
    }
    
    async getAllUserInvoices(telegramId: number): Promise<InvoiceDto[]> {
        const user = await this.userRepository.findOne({relations: ["invoices"], where: {telegramId: telegramId}});
        
        console.log('get user invs', user);
        return user.invoices.map(inv => new InvoiceDto(user.telegramName, inv.pledge.pledgeName, InvoiceService.getFullPrice(inv), inv.status ));
    }

    //TODO: fractional parts
    private static getFullPrice(invoice: Invoice) : number {
        const intPart = invoice.pledge.fullPrice;
        const fractionalPartForPaymentIdentification = (invoice.id % 1000) / 10;
        return intPart + fractionalPartForPaymentIdentification;
    }
}