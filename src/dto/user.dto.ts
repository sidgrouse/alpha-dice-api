import { InvoiceStatus } from "../constants/invoice-status";

export class UserDto{
    constructor(public telegramId: number, public telegramName: string){
    }
}