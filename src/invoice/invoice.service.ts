import { Inject, Injectable } from '@nestjs/common';
import { INVOICE_REPOSITORY } from 'src/constants';
import { InvoiceStatus } from './invoice-status';
import { Invoice } from './invoice.entity';
import { InvoiceDto } from 'src/dto/invoice.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateInvoiceDto } from 'src/dto/create-invoice.dto';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
      ) {}
      
    async addInvoice(dto: CreateInvoiceDto): Promise<InvoiceDto> {
        let invoice = new Invoice();
        invoice.pledjeId = dto.pledjeId;
        invoice.userId = dto.userId;
        invoice.status = InvoiceStatus.noInfo;
        
        let ret = await this.invoiceRepository.save(invoice);
        return new InvoiceDto(ret.id, ret.userId, ret.pledjeId, ret.status);
    }

    async getAllInvoices(): Promise<InvoiceDto[]> {
        return await this.invoiceRepository.find();
    }
}
