import { describe, expect, it } from 'vitest';
import { treasurySchema } from '../src/schemas/treasury.schema.js';
const valid = { name: 'Treasury', organizationType: 'dao', reportingCurrency: 'USD', monthlyExpenses: 1, oneTimeExpenses: 0, targetReserveMonths: 3, minimumProtectedReservePercent: 60, riskTolerance: 'balanced', holdings: [{ symbol: 'BTC', name: 'Bitcoin', quantity: 1 }] };
describe('treasury validation', () => { it('rejects duplicate holdings', () => expect(() => treasurySchema.parse({ ...valid, holdings: [...valid.holdings, { symbol: 'BTC', name: 'Bitcoin', quantity: 2 }] })).toThrow()); it('rejects negative quantities', () => expect(() => treasurySchema.parse({ ...valid, holdings: [{ symbol: 'BTC', name: 'Bitcoin', quantity: -1 }] })).toThrow()); });
