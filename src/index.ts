import { Account } from '@/ledger/account/account';
import { Money } from '@/ledger/money/money';
import { transfer } from '@/ledger/transfer/transfer';

const alice = Account.open(Money.of(10000, 'USD'));
const bob = Account.open(Money.of(0, 'USD'));
const hans = Account.open(Money.of(0, 'EUR'));

// A transfer that settles
console.log('transfer $30.00  alice → bob');
transfer(alice, bob, Money.of(3000, 'USD'));
console.log('  ✓ committed\n');

// A transfer that can't settle: paying USD into a euro account fails on the
// second leg, so the whole thing rolls back — alice is made whole.
console.log('transfer $30.00  alice → hans');
try {
  transfer(alice, hans, Money.of(3000, 'USD'));
} catch (error) {
  console.log(`  ✗ rolled back: ${(error as Error).message}\n`);
}

console.log('final balances');
for (const account of [alice, bob, hans]) {
  console.log(`  ${account.id}  ${account.balance.format()}`);
}
