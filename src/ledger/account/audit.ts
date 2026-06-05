import type { Money } from '@/ledger/money/money';

// Structural shape the decorator needs from `this` (avoids importing Account).
export interface Auditable {
  readonly id: string;
}

export function audit<This extends Auditable>(
  method: (this: This, amount: Money) => void,
  context: ClassMethodDecoratorContext<
    This,
    (this: This, amount: Money) => void
  >
) {
  const operation = String(context.name);

  return function (this: This, amount: Money): void {
    method.call(this, amount);
    console.log(`${this.id} ${operation} ${amount.format()}`);
  };
}
