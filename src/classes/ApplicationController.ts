import inquirer from 'inquirer';
import { AccountManager } from './AccountManager';
import { Account } from './Account';
import { Transaction } from './Transaction';
import { TransactionType } from '../interfaces/TransactionType';
import { IAccount } from '../interfaces/IAccount';
import { ITransaction } from '../interfaces/ITransaction';

export class ApplicationController {
  public accountManager: AccountManager;

  constructor() {
    this.accountManager = new AccountManager();
    this.initializeAccounts();
  }

  private initializeAccounts(): void {
    const account1 = new Account('CringeLordik');
    const account2 = new Account('ArtemSuslov');
    account1.addTransaction(new Transaction(
      200000,
      TransactionType.INCOME,
      new Date('2025-12-20'),
      'Nike',
      undefined
    ));
    account1.addTransaction(new Transaction(
      50000,
      TransactionType.EXPENSE,
      new Date('2025-12-21'),
      'Adidas',
      undefined
    ));
    account1.addTransaction(new Transaction(
      50000,
      TransactionType.EXPENSE,
      new Date('2025-12-23'),
      'Steam',
      undefined
    ));

    account2.addTransaction(new Transaction(
      500000,
      TransactionType.INCOME,
      new Date('2025-12-23'),
      'Проект Манюня',
      undefined
    ));
    account2.addTransaction(new Transaction(
      700000,
      TransactionType.INCOME,
      new Date('2025-12-24'),
      'Проект Чупапи',
      undefined
    ));
    account2.addTransaction(new Transaction(
      200000,
      TransactionType.EXPENSE,
      new Date('2025-12-20'),
      'крылышки кфс',
      undefined
    ));

    this.accountManager.addAccount(account1);
    this.accountManager.addAccount(account2);
  }

  public async start(): Promise<void> {
    console.clear();
    await this.showMainMenu();
  }

  private async showMainMenu(): Promise<void> {
    try {
      const accounts: readonly IAccount[] = this.accountManager.getAllAccounts();
      
      const choices: Array<{ name: string; value: string }> = [
        ...accounts.map((account: IAccount): { name: string; value: string } => ({
          name: account.toString(),
          value: account.id
        })),
        { name: '➕ Создать новый счёт', value: 'create' },
        { name: '❌ Выход', value: 'exit' }
      ];

      const answer: { action: string } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Выберите счёт или действие:',
          choices: choices
        }
      ]);

      if (answer.action === 'exit') {
        console.log('До свидания!');
        process.exit(0);
      } else if (answer.action === 'create') {
        await this.createAccount();
      } else {
        await this.watchAccount(answer.action);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error(`\n❌ Ошибка: ${errorMessage}\n`);
      await new Promise<void>((resolve: () => void): void => {
        setTimeout((): void => resolve(), 2000);
      });
      await this.showMainMenu();
    }
  }

  public async createAccount(): Promise<void> {
    try {
      console.clear();
      const answer: { name: string } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Введите название нового счёта:',
          validate: (input: string): boolean | string => {
            if (!input.trim()) {
              return 'Название счёта не может быть пустым';
            }
            return true;
          }
        }
      ]);

      const newAccount: Account = new Account(answer.name.trim());
      this.accountManager.addAccount(newAccount);
      
      console.log(`\n✅ Счёт "${newAccount.name}" успешно создан!\n`);
      await new Promise<void>((resolve: () => void): void => {
        setTimeout((): void => resolve(), 1500);
      });
      await this.showMainMenu();
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error(`\n❌ Ошибка при создании счёта: ${errorMessage}\n`);
      await new Promise<void>((resolve: () => void): void => {
        setTimeout((): void => resolve(), 2000);
      });
      await this.showMainMenu();
    }
  }

  public async watchAccount(accountId: string): Promise<void> {
    try {
      console.clear();
      const account: IAccount | undefined = this.accountManager.getAccount(accountId);
      
      if (!account) {
        console.log('❌ Счёт не найден\n');
        await new Promise<void>((resolve: () => void): void => {
          setTimeout((): void => resolve(), 1500);
        });
        await this.showMainMenu();
        return;
      }

      console.log(account.getSummaryString());
      console.log('\n--- Транзакции ---');
      
      if (account.transactions.length === 0) {
        console.log('Транзакций нет');
      } else {
        account.transactions.forEach((transaction: ITransaction, index: number): void => {
          console.log(`${index + 1}. ${transaction.toString()}`);
        });
      }

      const choices: Array<{ name: string; value: string }> = [
        { name: '➕ Добавить транзакцию', value: 'add' },
        { name: '🗑️  Удалить транзакцию', value: 'remove' },
        { name: '📥 Экспортировать в CSV', value: 'export' },
        { name: '🗑️  Удалить счёт', value: 'delete' },
        { name: '⬅️  Вернуться к списку счетов', value: 'back' }
      ];

      const answer: { action: string } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: '\nВыберите действие:',
          choices: choices
        }
      ]);

      switch (answer.action) {
        case 'add':
          await this.addTransaction(accountId);
          break;
        case 'remove':
          await this.removeTransaction(accountId);
          break;
        case 'export':
          await this.exportTransactionsToCSV(accountId);
          break;
        case 'delete':
          await this.removeAccount(accountId);
          break;
        case 'back':
          await this.showMainMenu();
          break;
        default:
          await this.showMainMenu();
          break;
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error(`\n❌ Ошибка: ${errorMessage}\n`);
      await new Promise<void>((resolve: () => void): void => {
        setTimeout((): void => resolve(), 2000);
      });
      await this.showMainMenu();
    }
  }

  public async addTransaction(accountId: string): Promise<void> {
    try {
      console.clear();
      const account: IAccount | undefined = this.accountManager.getAccount(accountId);
      
      if (!account) {
        console.log('❌ Счёт не найден\n');
        await new Promise<void>((resolve: () => void): void => {
          setTimeout((): void => resolve(), 1500);
        });
        await this.showMainMenu();
        return;
      }

      const answers: { amount: string; type: TransactionType; date: string; description: string } = await inquirer.prompt([
        {
          type: 'input',
          name: 'amount',
          message: 'Введите сумму транзакции:',
          validate: (input: string): boolean | string => {
            const amount: number = parseFloat(input);
            if (isNaN(amount) || amount <= 0) {
              return 'Сумма должна быть положительным числом';
            }
            return true;
          }
        },
        {
          type: 'list',
          name: 'type',
          message: 'Выберите тип транзакции:',
          choices: [
            { name: 'Доход', value: TransactionType.INCOME },
            { name: 'Расход', value: TransactionType.EXPENSE }
          ]
        },
        {
          type: 'input',
          name: 'date',
          message: 'Введите дату транзакции (YYYY-MM-DD):',
          default: new Date().toISOString().split('T')[0],
          validate: (input: string): boolean | string => {
            const dateRegex: RegExp = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(input)) {
              return 'Дата должна быть в формате YYYY-MM-DD';
            }
            const date: Date = new Date(input);
            if (isNaN(date.getTime())) {
              return 'Некорректная дата';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'description',
          message: 'Введите описание транзакции:',
          validate: (input: string): boolean | string => {
            if (!input.trim()) {
              return 'Описание не может быть пустым';
            }
            return true;
          }
        }
      ]);

      const transaction: Transaction = new Transaction(
        parseFloat(answers.amount),
        answers.type,
        new Date(answers.date),
        answers.description.trim()
      );

      account.addTransaction(transaction);
      
      console.log(`\n✅ Транзакция успешно добавлена!\n`);
      await new Promise<void>((resolve: () => void): void => {
        setTimeout((): void => resolve(), 1500);
      });
      await this.watchAccount(accountId);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error(`\n❌ Ошибка при добавлении транзакции: ${errorMessage}\n`);
      await new Promise<void>((resolve: () => void): void => {
        setTimeout((): void => resolve(), 2000);
      });
      if (accountId) {
        await this.watchAccount(accountId);
      } else {
        await this.showMainMenu();
      }
    }
  }

  public async removeTransaction(accountId: string): Promise<void> {
    try {
      console.clear();
      const account: IAccount | undefined = this.accountManager.getAccount(accountId);
      
      if (!account) {
        console.log('❌ Счёт не найден\n');
        await new Promise<void>((resolve: () => void): void => {
          setTimeout((): void => resolve(), 1500);
        });
        await this.showMainMenu();
        return;
      }

      if (account.transactions.length === 0) {
        console.log('❌ Транзакций нет для удаления\n');
        await new Promise<void>((resolve: () => void): void => {
          setTimeout((): void => resolve(), 1500);
        });
        await this.watchAccount(accountId);
        return;
      }

      const choices: Array<{ name: string; value: string }> = account.transactions.map((transaction: ITransaction, index: number): { name: string; value: string } => ({
        name: `${index + 1}. ${transaction.toString()}`,
        value: transaction.id
      }));

      const answer: { transactionId: string; confirm: boolean } = await inquirer.prompt([
        {
          type: 'list',
          name: 'transactionId',
          message: 'Выберите транзакцию для удаления:',
          choices: choices
        },
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Вы уверены, что хотите удалить эту транзакцию?',
          default: false
        }
      ]);

      if (answer.confirm) {
        const removed: boolean = account.removeTransaction(answer.transactionId);
        if (removed) {
          console.log('\n✅ Транзакция успешно удалена!\n');
        } else {
          console.log('\n❌ Ошибка при удалении транзакции\n');
        }
      } else {
        console.log('\n❌ Удаление отменено\n');
      }

      await new Promise<void>((resolve: () => void): void => {
        setTimeout((): void => resolve(), 1500);
      });
      await this.watchAccount(accountId);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error(`\n❌ Ошибка при удалении транзакции: ${errorMessage}\n`);
      await new Promise<void>((resolve: () => void): void => {
        setTimeout((): void => resolve(), 2000);
      });
      if (accountId) {
        await this.watchAccount(accountId);
      } else {
        await this.showMainMenu();
      }
    }
  }

  public async removeAccount(accountId: string): Promise<void> {
    try {
      console.clear();
      const account: IAccount | undefined = this.accountManager.getAccount(accountId);
      
      if (!account) {
        console.log('❌ Счёт не найден\n');
        await new Promise<void>((resolve: () => void): void => {
          setTimeout((): void => resolve(), 1500);
        });
        await this.showMainMenu();
        return;
      }

      const answer: { confirm: boolean } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Вы уверены, что хотите удалить счёт "${account.name}"? Все транзакции будут удалены.`,
          default: false
        }
      ]);

      if (answer.confirm) {
        const removed: boolean = this.accountManager.removeAccount(accountId);
        if (removed) {
          console.log(`\n✅ Счёт "${account.name}" успешно удалён!\n`);
        } else {
          console.log('\n❌ Ошибка при удалении счёта\n');
        }
      } else {
        console.log('\n❌ Удаление отменено\n');
      }

      await new Promise<void>((resolve: () => void): void => {
        setTimeout((): void => resolve(), 1500);
      });
      await this.showMainMenu();
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error(`\n❌ Ошибка при удалении счёта: ${errorMessage}\n`);
      await new Promise<void>((resolve: () => void): void => {
        setTimeout((): void => resolve(), 2000);
      });
      await this.showMainMenu();
    }
  }

  public async exportTransactionsToCSV(accountId: string): Promise<void> {
    try {
      console.clear();
      const account: IAccount | undefined = this.accountManager.getAccount(accountId);
      
      if (!account) {
        console.log('❌ Счёт не найден\n');
        await new Promise<void>((resolve: () => void): void => {
          setTimeout((): void => resolve(), 1500);
        });
        await this.showMainMenu();
        return;
      }

      if (account.transactions.length === 0) {
        console.log('❌ Нет транзакций для экспорта\n');
        await new Promise<void>((resolve: () => void): void => {
          setTimeout((): void => resolve(), 1500);
        });
        await this.watchAccount(accountId);
        return;
      }

      const answer: { filename: string } = await inquirer.prompt([
        {
          type: 'input',
          name: 'filename',
          message: 'Введите имя файла (без расширения):',
          validate: (input: string): boolean | string => {
            if (!input.trim()) {
              return 'Имя файла не может быть пустым';
            }
            const invalidCharsRegex: RegExp = /[<>:"/\\|?*]/;
            if (invalidCharsRegex.test(input)) {
              return 'Имя файла содержит недопустимые символы';
            }
            return true;
          }
        }
      ]);

      try {
        account.exportToCSV(answer.filename.trim());
        console.log(`\n✅ Транзакции успешно экспортированы в файл "${answer.filename.trim()}.csv"\n`);
      } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : 'Неизвестная ошибка';
        console.log(`\n❌ Ошибка при экспорте: ${errorMessage}\n`);
      }

      await new Promise<void>((resolve: () => void): void => {
        setTimeout((): void => resolve(), 1500);
      });
      await this.watchAccount(accountId);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error(`\n❌ Ошибка: ${errorMessage}\n`);
      await new Promise<void>((resolve: () => void): void => {
        setTimeout((): void => resolve(), 2000);
      });
      if (accountId) {
        await this.watchAccount(accountId);
      } else {
        await this.showMainMenu();
      }
    }
  }
}

