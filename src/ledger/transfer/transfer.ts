import type { Account } from '@/ledger/account/account';
import type { Money } from '@/ledger/money/money';

// Replays undos in reverse on `using` exit, including a throw, unless committed
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
    () => from.debit(amount),
    () => from.credit(amount),
  );

  // No up-front currency check, so a cross-currency transfer shows the rollback
  tx.stage(
    () => to.credit(amount),
    () => to.debit(amount),
  );

  tx.commit();
}
