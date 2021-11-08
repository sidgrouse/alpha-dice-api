export class ItemDto {
  constructor(
    public id: number,
    public name: string,
    public originalPrice: number,
    public userOrders: string[],
  ) {}
}
