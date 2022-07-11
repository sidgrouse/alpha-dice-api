export interface IPayment {
  telegramName: string;
  amount: number;
  check: number;
  project: string;
  category: string;
  payDate: string;

  save();
}