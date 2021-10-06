import { InvoiceStatus } from "./invoice-status";

export class CreateInvoiceDto{
    constructor(public userId: string, public pledjeId: number){
    }
}