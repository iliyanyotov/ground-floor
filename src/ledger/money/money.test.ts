import { describe, expect, it } from 'bun:test';
import { Money } from '@/ledger/money/money';

describe('Money', () => {
  it('adds two amounts', () => {
    expect(Money.of(1000, 'USD').plus(Money.of(500, 'USD')).format()).toBe(
      '$15.00'
    );
  });

  it('subtracts two amounts', () => {
    expect(Money.of(1000, 'USD').minus(Money.of(300, 'USD')).format()).toBe(
      '$7.00'
    );
  });

  it('reports a negative balance', () => {
    expect(Money.of(500, 'USD').minus(Money.of(800, 'USD')).isNegative()).toBe(
      true
    );
  });

  it('rejects non-integer minor units', () => {
    expect(() => Money.of(10.5, 'USD')).toThrow('must be an integer');
  });

  it('formats minor units as a currency amount', () => {
    expect(Money.of(0, 'USD').format()).toBe('$0.00');
    expect(Money.of(4223, 'USD').format()).toBe('$42.23');
  });

  it('exposes its currency', () => {
    expect(Money.of(1000, 'USD').currency).toBe('USD');
  });

  it('formats other currencies by their symbol', () => {
    expect(Money.of(4200, 'EUR').format()).toBe('€42.00');
  });

  it('formats zero-decimal currencies without a fractional part', () => {
    expect(Money.of(1000, 'JPY').format()).toBe('¥1,000');
  });

  it('throws when mixing currencies in arithmetic', () => {
    expect(() => Money.of(100, 'USD').plus(Money.of(100, 'EUR'))).toThrow(
      'currency mismatch'
    );
  });
});
