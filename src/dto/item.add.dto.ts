export class AddItemDto {
  constructor(
    public name: string,
    public originalPrice: number,
    public discountPrice: number,
  ) {}
}
