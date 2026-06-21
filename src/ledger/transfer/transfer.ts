import type { Account } from '@/ledger/account/account';
import type { Money } from '@/ledger/money/money';

// Disposable scope: on `using` exit (including an exception unwinding the
// stack), it replays the recorded undos in reverse unless it was committed.
class Transaction implements Disposable {
  readonly #undos: Array<() => void> = [];
  #committed = false;

  stage(action: () => void, undo: () => void): void {
    action();
    this.#undos.push(undo);
  }

  commit(): void {
    this.#committed = true;
  }

  [Symbol.dispose](): void {
    if (this.#committed) return;

    for (const undo of this.#undos.reverse()) undo();
  }
}

/** Move `amount` from one account to another, atomically. */
export function transfer(from: Account, to: Account, amount: Money): void {
  if (from.id === to.id) {
    throw new Error('Cannot transfer to the same account');
  }

  using tx = new Transaction();

  tx.stage(
    () => from.withdraw(amount),
    () => from.deposit(amount)
  );

  tx.stage(
    () => to.deposit(amount),
    () => to.withdraw(amount)
  );

  tx.commit();
}
