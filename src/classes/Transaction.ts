import { ITransaction } from '../interfaces/ITransaction';
import { TransactionType } from '../interfaces/TransactionType';

export class Transaction implements ITransaction {
  public readonly id: string;
  public readonly amount: number;
  public readonly type: TransactionType;
  public readonly date: Date;
  public readonly description: string;

  constructor(amount: number, type: TransactionType, date: Date, description: string, id?: string) {
    if (amount <= 0) {
      throw new Error('Сумма транзакции должна быть положительным числом');
    }
    if (!description.trim()) {
      throw new Error('Описание транзакции не может быть пустым');
    }
    this.amount = amount;
    this.type = type;
    this.date = date;
    this.description = description.trim();
    this.id = id || this.generateId();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  public toString(): string {
    const dateStr: string = this.date.toISOString().split('T')[0];
    const typeStr: string = this.type === TransactionType.INCOME ? 'Доход' : 'Расход';
    return `${this.id.substring(0, 8)} | ${dateStr} | ${typeStr} | ${this.amount} | ${this.description}`;
  }
}

