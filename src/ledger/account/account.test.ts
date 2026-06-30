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

describe('Account', () => {
  let log: Mock<typeof console.log>;

  beforeEach(() => {
    log = spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    log.mockRestore();
  });

  it('open() generates an acct-prefixed id', () => {
    expect(Account.open(Money.of(0, 'USD')).id).toStartWith('acct_');
  });

  it('each opened account gets a distinct id', () => {
    expect(Account.open(Money.of(0, 'USD')).id).not.toBe(
      Account.open(Money.of(0, 'USD')).id,
    );
  });

  it('deposit increases the balance', () => {
    const account = Account.open(Money.of(0, 'USD'));
    account.deposit(Money.of(2500, 'USD'));
    expect(account.balance.format()).toBe('$25.00');
  });

  it('withdraw decreases the balance', () => {
    const account = Account.open(Money.of(5000, 'USD'));
    account.withdraw(Money.of(2000, 'USD'));
    expect(account.balance.format()).toBe('$30.00');
  });

  it('withdraw beyond the balance throws and leaves it unchanged', () => {
    const account = Account.open(Money.of(1000, 'USD'));
    expect(() => account.withdraw(Money.of(1500, 'USD'))).toThrow(
      'Insufficient funds',
    );
    expect(account.balance.format()).toBe('$10.00');
  });

  it('rejects a zero-amount deposit and leaves the balance unchanged', () => {
    const account = Account.open(Money.of(1000, 'USD'));
    expect(() => account.deposit(Money.of(0, 'USD'))).toThrow(
      'Amount must be positive',
    );
    expect(account.balance.format()).toBe('$10.00');
  });

  it('rejects a zero-amount withdraw and leaves the balance unchanged', () => {
    const account = Account.open(Money.of(1000, 'USD'));
    expect(() => account.withdraw(Money.of(0, 'USD'))).toThrow(
      'Amount must be positive',
    );
    expect(account.balance.format()).toBe('$10.00');
  });

  it('the @audit decorator logs each successful operation', () => {
    const account = Account.open(Money.of(0, 'USD'));
    account.deposit(Money.of(500, 'USD'));
    account.withdraw(Money.of(200, 'USD'));
    expect(log.mock.calls).toEqual([
      [`${account.id} deposit $5.00`],
      [`${account.id} withdraw $2.00`],
    ]);
  });

  it('a throwing operation is not logged', () => {
    const account = Account.open(Money.of(100, 'USD'));
    expect(() => account.withdraw(Money.of(9900, 'USD'))).toThrow();
    expect(log).not.toHaveBeenCalled();
  });
});
