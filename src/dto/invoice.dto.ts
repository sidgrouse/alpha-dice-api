import { InvoiceStatus } from "../constants/invoice-status";

export class InvoiceDto{
    constructor(public id: number, public userId: string, public pledjeId: number, public status: InvoiceStatus){
    }
}