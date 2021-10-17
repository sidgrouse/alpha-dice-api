import { InvoiceDto } from "./invoice.dto";

export class DebtDto{
    constructor(public invoices: InvoiceDto[], public identificationalAmount: number){
    }
}