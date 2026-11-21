import { audit } from '@/ledger/account/audit';
import { AccountId } from '@/ledger/account/types';
import type { Money } from '@/ledger/money/money';

export class Account {
  readonly id: AccountId;
  #balance: Money;

  private constructor(id: AccountId, balance: Money) {
    this.id = id;
    this.#balance = balance;
  }

  static open(balance: Money): Account {
    return new Account(AccountId.mint(), balance);
  }

  get balance(): Money {
    return this.#balance;
  }

  @audit
  credit(amount: Money): void {
    Account.#assertMovable(amount);
    this.#balance = this.#balance.plus(amount);
  }

  @audit
  debit(amount: Money): void {
    Account.#assertMovable(amount);

    // Check first so an overdraft gets a domain error, not minus()'s underflow
    if (!this.#balance.covers(amount)) {
      throw new Error(`Insufficient funds in ${this.id}`);
    }

    this.#balance = this.#balance.minus(amount);
  }

  static #assertMovable(amount: Money): void {
    if (!amount.isPositive()) {
      throw new Error('Amount must be positive');
    }
  }
}
