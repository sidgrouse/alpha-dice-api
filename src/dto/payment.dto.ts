import { UserDto } from './user.dto';

export class PaymentDto {
  constructor(
    public id: number,
    public amount: number,
    public user: UserDto,
    public debtIds: number[],
    public log: string = null,
    public nameFrom: string = null,
    public payDate: Date = null,
    public checked: boolean = false,
  ) {}
}
