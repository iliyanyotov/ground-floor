import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  spyOn,
} from 'bun:test';
import { Account } from '@/ledger/account/account';
import { Money } from '@/ledger/money/money';
import { transfer } from '@/ledger/transfer/transfer';

describe('transfer', () => {
  // Silence the audit output the account operations produce.
  let log: Mock<typeof console.log>;

  beforeEach(() => {
    log = spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    log.mockRestore();
  });

  it('moves money between accounts when both legs succeed', () => {
    const alice = Account.open(Money.of(10000, 'USD'));
    const bob = Account.open(Money.of(0, 'USD'));

    transfer(alice, bob, Money.of(3000, 'USD'));

    expect(alice.balance.format()).toBe('$70.00');
    expect(bob.balance.format()).toBe('$30.00');
  });

  it('rejects a transfer to the same account', () => {
    const alice = Account.open(Money.of(10000, 'USD'));

    expect(() => transfer(alice, alice, Money.of(3000, 'USD'))).toThrow(
      'Cannot transfer to the same account',
    );

    expect(alice.balance.format()).toBe('$100.00');
  });

  it('rolls back when the payer has insufficient funds', () => {
    const alice = Account.open(Money.of(5000, 'USD'));
    const bob = Account.open(Money.of(0, 'USD'));

    expect(() => transfer(alice, bob, Money.of(8000, 'USD'))).toThrow(
      'Insufficient funds',
    );

    // The withdrawal threw before mutating, so neither side moved.
    expect(alice.balance.format()).toBe('$50.00');
    expect(bob.balance.format()).toBe('$0.00');
  });

  it('rolls back the first leg when the second leg throws', () => {
    const alice = Account.open(Money.of(10000, 'USD'));
    const hans = Account.open(Money.of(0, 'EUR'));

    // Leg 1 (alice withdraws USD) succeeds; leg 2 (deposit USD into a EUR
    // account) throws on currency mismatch. The using-disposer replays the
    // recorded undo, so alice's debit is reversed.
    expect(() => transfer(alice, hans, Money.of(3000, 'USD'))).toThrow(
      'Currency mismatch',
    );

    expect(alice.balance.format()).toBe('$100.00');
    expect(hans.balance.format()).toBe('€0.00');
  });
});
