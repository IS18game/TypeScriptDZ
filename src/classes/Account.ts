import { IAccount } from '../interfaces/IAccount';
import { ITransaction } from '../interfaces/ITransaction';
import { ISummary } from '../interfaces/ISummary';
import { TransactionType } from '../interfaces/TransactionType';
import { escapeCsvValue } from '../utils/escapeCsvValue';
import * as fs from 'fs';
import * as path from 'path';

export class Account implements IAccount {
  public readonly id: string;
  public name: string;

  private _transactions: ITransaction[];

  constructor(name: string, id?: string) {
    this.name = name;
    this.id = id || this.generateId();
    this._transactions = [];
  }

  public get transactions(): readonly ITransaction[] {
    return this._transactions;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  public getBalance(): number {
    return this._transactions.reduce((balance: number, transaction: ITransaction): number => {
      if (transaction.type === TransactionType.INCOME) {
        return balance + transaction.amount;
      } else {
        return balance - transaction.amount;
      }
    }, 0);
  }

  public getSummary(): ISummary {
    const totalIncome: number = this._transactions
      .filter((t: ITransaction): boolean => t.type === TransactionType.INCOME)
      .reduce((sum: number, t: ITransaction): number => sum + t.amount, 0);
    
    const totalExpense: number = this._transactions
      .filter((t: ITransaction): boolean => t.type === TransactionType.EXPENSE)
      .reduce((sum: number, t: ITransaction): number => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }

  public addTransaction(transaction: ITransaction): void {
    this._transactions.push(transaction);
  }

  public removeTransaction(transactionId: string): boolean {
    const index: number = this._transactions.findIndex((t: ITransaction): boolean => t.id === transactionId);
    if (index !== -1) {
      this._transactions.splice(index, 1);
      return true;
    }
    return false;
  }

  public exportToCSV(filename: string): void {
    try {
      const csvLines: string[] = [];
      csvLines.push('ID,Дата,Тип,Сумма,Описание');
      
      this._transactions.forEach((transaction: ITransaction): void => {
        const dateStr: string = transaction.date.toISOString().split('T')[0];
        const typeStr: string = transaction.type === TransactionType.INCOME ? 'Доход' : 'Расход';
        csvLines.push(
          `${escapeCsvValue(transaction.id.substring(0, 8))},` +
          `${escapeCsvValue(dateStr)},` +
          `${escapeCsvValue(typeStr)},` +
          `${transaction.amount},` +
          `${escapeCsvValue(transaction.description)}`
        );
      });

      const csvContent: string = csvLines.join('\n');
      const filePath: string = path.join(process.cwd(), `${filename}.csv`);
      fs.writeFileSync(filePath, csvContent, 'utf-8');
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Неизвестная ошибка';
      throw new Error(`Ошибка при экспорте в CSV: ${errorMessage}`);
    }
  }

  public toString(): string {
    const balance: number = this.getBalance();
    return `${this.id.substring(0, 8)} | ${this.name} | Баланс: ${balance}`;
  }

  public getSummaryString(): string {
    const summary: ISummary = this.getSummary();
    return `Счёт: ${this.name}\n` +
           `ID: ${this.id.substring(0, 8)}\n` +
           `Общий доход: ${summary.totalIncome}\n` +
           `Общий расход: ${summary.totalExpense}\n` +
           `Баланс: ${summary.balance}`;
  }
}

