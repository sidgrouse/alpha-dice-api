export class InvoiceDto{
    constructor(public invoiceId: number, public pledjeName: string, public invoiceName: string, public amount: number){
    }

    toString(identificationalAmount = 0): string{
        return `${this.pledjeName} ${this.invoiceName}(${this.amount + identificationalAmount})`
    }
}