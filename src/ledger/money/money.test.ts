import { describe, expect, it } from 'bun:test';
import { Money } from '@/ledger/money/money';

describe('Money', () => {
  it('adds two amounts', () => {
    expect(Money.of(1000, 'USD').plus(Money.of(500, 'USD')).format()).toBe(
      '$15.00',
    );
  });

  it('subtracts two amounts', () => {
    expect(Money.of(1000, 'USD').minus(Money.of(300, 'USD')).format()).toBe(
      '$7.00',
    );
  });

  it('subtracts down to exactly zero', () => {
    expect(Money.of(800, 'USD').minus(Money.of(800, 'USD')).format()).toBe(
      '$0.00',
    );
  });

  it('rejects a subtraction that would go below zero', () => {
    expect(() => Money.of(500, 'USD').minus(Money.of(800, 'USD'))).toThrow(
      'Cannot subtract $8.00 from $5.00: result would be negative',
    );
  });

  it('rejects a negative amount at construction', () => {
    expect(() => Money.of(-1, 'USD')).toThrow('Amount cannot be negative');
  });

  it('reports whether an amount is strictly positive', () => {
    expect(Money.of(1, 'USD').isPositive()).toBe(true);
    expect(Money.of(0, 'USD').isPositive()).toBe(false);
  });

  it('reports whether it covers another amount', () => {
    expect(Money.of(1000, 'USD').covers(Money.of(800, 'USD'))).toBe(true);
    expect(Money.of(1000, 'USD').covers(Money.of(1000, 'USD'))).toBe(true);
    expect(Money.of(800, 'USD').covers(Money.of(1000, 'USD'))).toBe(false);
  });

  it('rejects non-integer minor units', () => {
    expect(() => Money.of(10.5, 'USD')).toThrow('must be a safe integer');
  });

  it('rejects minor units beyond the safe-integer range', () => {
    expect(() => Money.of(Number.MAX_SAFE_INTEGER + 2, 'USD')).toThrow(
      'must be a safe integer',
    );
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
      'Currency mismatch',
    );
  });

  it('throws when comparing across currencies', () => {
    expect(() => Money.of(100, 'USD').covers(Money.of(100, 'EUR'))).toThrow(
      'Currency mismatch',
    );
  });
});
