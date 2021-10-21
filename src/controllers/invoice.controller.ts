import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';
import { InvoiceService } from '../services/invoice.service';

@Controller('invoice')
export class InvoiceController {

    constructor(private readonly invoiceService: InvoiceService) {}
    
    @Get()
    async getAllInvoices(): Promise<UserDto[]> {
        return this.invoiceService.getDebptors();
    }
}