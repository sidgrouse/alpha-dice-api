import { WhouseOrderStatus } from 'src/constants/warehous-order-status';

export interface IOrder {
  telegramName: string;
  item: string;
  status: WhouseOrderStatus;

  save();
}