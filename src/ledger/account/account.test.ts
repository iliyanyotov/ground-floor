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

  it('credit increases the balance', () => {
    const account = Account.open(Money.of(0, 'USD'));
    account.credit(Money.of(2500, 'USD'));
    expect(account.balance.format()).toBe('$25.00');
  });

  it('debit decreases the balance', () => {
    const account = Account.open(Money.of(5000, 'USD'));
    account.debit(Money.of(2000, 'USD'));
    expect(account.balance.format()).toBe('$30.00');
  });

  it('debit beyond the balance throws and leaves it unchanged', () => {
    const account = Account.open(Money.of(1000, 'USD'));
    expect(() => account.debit(Money.of(1500, 'USD'))).toThrow(
      'Insufficient funds',
    );
    expect(account.balance.format()).toBe('$10.00');
  });

  it('rejects a zero-amount credit and leaves the balance unchanged', () => {
    const account = Account.open(Money.of(1000, 'USD'));
    expect(() => account.credit(Money.of(0, 'USD'))).toThrow(
      'Amount must be positive',
    );
    expect(account.balance.format()).toBe('$10.00');
  });

  it('rejects a zero-amount debit and leaves the balance unchanged', () => {
    const account = Account.open(Money.of(1000, 'USD'));
    expect(() => account.debit(Money.of(0, 'USD'))).toThrow(
      'Amount must be positive',
    );
    expect(account.balance.format()).toBe('$10.00');
  });

  it('the @audit decorator logs each successful operation', () => {
    const account = Account.open(Money.of(0, 'USD'));
    account.credit(Money.of(500, 'USD'));
    account.debit(Money.of(200, 'USD'));
    expect(log.mock.calls).toEqual([
      [`${account.id} credit $5.00`],
      [`${account.id} debit $2.00`],
    ]);
  });

  it('a throwing operation is not logged', () => {
    const account = Account.open(Money.of(100, 'USD'));
    expect(() => account.debit(Money.of(9900, 'USD'))).toThrow();
    expect(log).not.toHaveBeenCalled();
  });
});
