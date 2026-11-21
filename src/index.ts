import { Account } from '@/ledger/account/account';
import { Money } from '@/ledger/money/money';
import { transfer } from '@/ledger/transfer/transfer';

const alice = Account.open(Money.of(10000, 'USD'));
const bob = Account.open(Money.of(0, 'USD'));
const hans = Account.open(Money.of(0, 'EUR'));

console.log('Transfer $30.00  alice to bob');
transfer(alice, bob, Money.of(3000, 'USD'));
console.log('Committed\n');

console.log('Transfer $30.00  alice to hans');
try {
  transfer(alice, hans, Money.of(3000, 'USD'));
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error);
  console.log(`Rolled back - ${reason}\n`);
}

console.log('Final balances');
for (const account of [alice, bob, hans]) {
  console.log(`  ${account.id}  ${account.balance.format()}`);
}
