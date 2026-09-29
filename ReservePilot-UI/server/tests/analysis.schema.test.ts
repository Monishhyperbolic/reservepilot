import { describe, expect, it } from 'vitest';
import { scenarioQuerySchema, snapshotCompareQuerySchema } from '../src/schemas/analysis.schema.js';

describe('analysis query validation', () => {
  it('preserves a zero percent scenario', () => {
    expect(scenarioQuerySchema.parse({ scenario: '0' }).scenario).toBe(0);
  });

  it('requires both snapshot comparison ids', () => {
    expect(() => snapshotCompareQuerySchema.parse({ left: 'snapshot-1' })).toThrow();
    expect(snapshotCompareQuerySchema.parse({ left: 'snapshot-1', right: 'snapshot-2' })).toEqual({ left: 'snapshot-1', right: 'snapshot-2' });
  });
});