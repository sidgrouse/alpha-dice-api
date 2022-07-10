export class InvoiceDto {
  constructor(
    public telegramId: number,
    public name: string,
    public item: string,
    public comment: string,
    public total: number,
  ) {}
}
