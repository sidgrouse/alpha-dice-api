export class InvoiceDto{
    constructor(public invoiceId: number, public itemName: string, public project: string, public invoiceName: string, public amount: number){
    }

    toString(identificationalAmount = 0): string{
        return `${this.project}${this.project === this.itemName ? ' ' : '('+this.itemName+') '} ${this.invoiceName}(${this.amount + identificationalAmount})`
    }
}