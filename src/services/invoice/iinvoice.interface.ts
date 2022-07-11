import { InvoiceStatus } from 'src/constants/invoice-status';

export interface IInvoice {
  name: string;
  item: string;
  amount: number;
  comment: string;
  total: number;
  status: InvoiceStatus;
  date: string;

  save();
}