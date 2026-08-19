import { describe, it, expect } from 'vitest';
import { formatPrice, calculateDiscountPercentage } from '../../src/lib/utils';

describe('AURA Core Utility Functions', () => {
  it('should correctly format currency numbers to USD format', () => {
    expect(formatPrice(100)).toBe('$100.00');
    expect(formatPrice(1299.99)).toBe('$1,299.99');
  });

  it('should accurately calculate discount percentage', () => {
    expect(calculateDiscountPercentage(200, 150)).toBe(25);
    expect(calculateDiscountPercentage(100, 50)).toBe(50);
  });
});
