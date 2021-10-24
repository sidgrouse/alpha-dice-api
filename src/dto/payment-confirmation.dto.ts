import { InvoiceDto } from "./invoice.dto";

export class PaymentConfirmationDto{
    constructor(
        public telegramName: string,
        public isFulfilled: boolean,
        public invoices: InvoiceDto[],
        public payments: PaymentDto[]){
    }
}

export class PaymentDto{
    constructor(public telegramId: number, public amount: number, public log: string){
    }
}