import { InvoiceStatus } from "./invoice.dto";

export class InvoiceDto{
    id: number;
    userId: string;
    pledjeId: number;
    status: InvoiceStatus;
}