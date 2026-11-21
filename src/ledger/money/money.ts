import type { Currency } from '@/ledger/money/types';

export class Money {
  readonly #minor: number;
  readonly currency: Currency;

  private constructor(minor: number, currency: Currency) {
    this.#minor = minor;
    this.currency = currency;
  }

  // Build from integer minor units: Money.of(100, 'USD') is $1.00
  static of(minor: number, currency: Currency): Money {
    if (!Number.isSafeInteger(minor)) {
      throw new Error(`Minor units must be a safe integer, got ${minor}`);
    }

    if (minor < 0) {
      throw new Error(`Amount cannot be negative, got ${minor}`);
    }

    return new Money(minor, currency);
  }

  plus(other: Money): Money {
    this.#assertSameCurrency(other);
    return Money.of(this.#minor + other.#minor, this.currency);
  }

  minus(other: Money): Money {
    this.#assertSameCurrency(other);

    if (other.#minor > this.#minor) {
      throw new Error(
        `Cannot subtract ${other.format()} from ${this.format()}: result would be negative`,
      );
    }

    return Money.of(this.#minor - other.#minor, this.currency);
  }

  isPositive(): boolean {
    return this.#minor > 0;
  }

  covers(other: Money): boolean {
    this.#assertSameCurrency(other);
    return this.#minor >= other.#minor;
  }

  format(): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
    });

    // ISO 4217 fraction digits come from the formatter; no second currency table
    const { maximumFractionDigits = 0 } = formatter.resolvedOptions();
    return formatter.format(this.#minor / 10 ** maximumFractionDigits);
  }

  #assertSameCurrency(other: Money): void {
    if (other.currency !== this.currency) {
      throw new Error(
        `Currency mismatch: ${this.currency} vs ${other.currency}`,
      );
    }
  }
}
