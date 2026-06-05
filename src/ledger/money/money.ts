import type { Currency } from '@/ledger/money/types';

// Minor-unit decimal places per currency (USD cents → 2, yen → 0).
const DECIMALS: Record<Currency, number> = {
  USD: 2,
  EUR: 2,
  JPY: 0,
};

export class Money {
  readonly #minor: number;
  readonly currency: Currency;

  private constructor(minor: number, currency: Currency) {
    this.#minor = minor;
    this.currency = currency;
  }

  // Build from integer minor units: Money.of(100, 'USD') is $1.00.
  static of(minor: number, currency: Currency): Money {
    if (!Number.isInteger(minor)) {
      throw new Error(`minor units must be an integer, got ${minor}`);
    }

    return new Money(minor, currency);
  }

  plus(other: Money): Money {
    this.#assertSameCurrency(other);
    return new Money(this.#minor + other.#minor, this.currency);
  }

  minus(other: Money): Money {
    this.#assertSameCurrency(other);
    return new Money(this.#minor - other.#minor, this.currency);
  }

  isNegative(): boolean {
    return this.#minor < 0;
  }

  format(locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.#minor / 10 ** DECIMALS[this.currency]);
  }

  #assertSameCurrency(other: Money): void {
    if (other.currency !== this.currency) {
      throw new Error(
        `currency mismatch: ${this.currency} vs ${other.currency}`
      );
    }
  }
}
