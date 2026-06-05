import { audit } from '@/ledger/account/audit';
import type { AccountId } from '@/ledger/account/types';
import type { Money } from '@/ledger/money/money';

export class Account {
  readonly id: AccountId;
  #balance: Money;

  private constructor(id: AccountId, balance: Money) {
    this.id = id;
    this.#balance = balance;
  }

  static open(balance: Money): Account {
    return new Account(`acct_${Bun.randomUUIDv7()}` as AccountId, balance);
  }

  get balance(): Money {
    return this.#balance;
  }

  @audit
  deposit(amount: Money): void {
    this.#balance = this.#balance.plus(amount);
  }

  @audit
  withdraw(amount: Money): void {
    const next = this.#balance.minus(amount);

    if (next.isNegative()) {
      throw new Error(`insufficient funds in ${this.id}`);
    }

    this.#balance = next;
  }
}
