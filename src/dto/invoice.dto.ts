import { InvoiceStatus } from "./invoice-status";

export class InvoiceDto{
    constructor(public id: number, public userId: string, public pledjeId: number, public status: InvoiceStatus){
    }
}