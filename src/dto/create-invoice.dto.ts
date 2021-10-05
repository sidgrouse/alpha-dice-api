import { InvoiceStatus } from "../constants/invoice-status";

export class CreateInvoiceDto{
    constructor(public userId: string, public pledjeId: number){
    }
}