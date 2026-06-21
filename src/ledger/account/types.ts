import type { Brand } from '@/ledger/brand';

export type AccountId = Brand<string, 'AccountId'>;

export const AccountId = {
  mint: (): AccountId => `acct_${Bun.randomUUIDv7()}` as AccountId,
};
