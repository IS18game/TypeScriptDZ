import { IAccountManager } from '../interfaces/IAccountManager';
import { IAccount } from '../interfaces/IAccount';

export class AccountManager implements IAccountManager {
  private readonly _accounts: IAccount[];

  constructor() {
    this._accounts = [];
  }

  public get accounts(): readonly IAccount[] {
    return this._accounts;
  }

  public addAccount(account: IAccount): void {
    if (!account) {
      throw new Error('Счёт не может быть пустым');
    }
    this._accounts.push(account);
  }

  public removeAccount(accountId: string): boolean {
    if (!accountId || !accountId.trim()) {
      return false;
    }
    const index: number = this._accounts.findIndex((account: IAccount): boolean => account.id === accountId);
    if (index !== -1) {
      this._accounts.splice(index, 1);
      return true;
    }
    return false;
  }

  public getAccount(accountId: string): IAccount | undefined {
    if (!accountId || !accountId.trim()) {
      return undefined;
    }
    return this._accounts.find((account: IAccount): boolean => account.id === accountId);
  }

  public getAllAccounts(): readonly IAccount[] {
    return this._accounts;
  }
}

