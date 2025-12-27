import { ITransaction } from './ITransaction';
import { ISummary } from './ISummary';

export interface IAccount {
  readonly id: string;
  name: string;
  readonly transactions: readonly ITransaction[];
  getBalance(): number;
  getSummary(): ISummary;
  addTransaction(transaction: ITransaction): void;
  removeTransaction(transactionId: string): boolean;
  exportToCSV(filename: string): void;
  toString(): string;
  getSummaryString(): string;
}

