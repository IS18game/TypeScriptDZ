import { IAccount } from './IAccount';

export interface IAccountManager {
  readonly accounts: readonly IAccount[];
  addAccount(account: IAccount): void;
  removeAccount(accountId: string): boolean;
  getAccount(accountId: string): IAccount | undefined;
  getAllAccounts(): readonly IAccount[];
}

