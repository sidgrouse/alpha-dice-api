import { InvoiceStatus } from "../constants/invoice-status";

export class InvoiceDto{
    constructor(public userId: string, public pledjeName: string, public priceToPay: number, public status: InvoiceStatus){
    }
}