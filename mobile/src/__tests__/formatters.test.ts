import {
  formatPrice,
  formatDistance,
  formatDeliveryTime,
  formatRating,
  truncate,
} from '../utils/formatters';

describe('formatPrice', () => {
  it('formats a whole number correctly', () => {
    expect(formatPrice(10)).toBe('$10.00');
  });

  it('formats a decimal correctly', () => {
    expect(formatPrice(9.99)).toBe('$9.99');
  });

  it('formats zero correctly', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('supports custom currency symbol', () => {
    expect(formatPrice(5.5, '£')).toBe('£5.50');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatPrice(3.999)).toBe('$4.00');
  });
});

describe('formatDistance', () => {
  it('returns empty string for null', () => {
    expect(formatDistance(null)).toBe('');
  });

  it('shows metres for distances under 1km', () => {
    expect(formatDistance(0.5)).toBe('500 m');
  });

  it('shows km for distances 1km and over', () => {
    expect(formatDistance(2.3)).toBe('2.3 km');
  });

  it('rounds metres correctly', () => {
    expect(formatDistance(0.8)).toBe('800 m');
  });
});

describe('formatDeliveryTime', () => {
  it('returns a time range string', () => {
    const result = formatDeliveryTime(30);
    expect(result).toContain('min');
    expect(result).toContain('–');
  });

  it('buffer is ~20% of minutes', () => {
    const result = formatDeliveryTime(30);
    // 30 * 0.2 = 6, so expect "24–36 min"
    expect(result).toBe('24–36 min');
  });
});

describe('formatRating', () => {
  it('formats rating to 1 decimal', () => {
    expect(formatRating(4.5)).toBe('4.5');
    expect(formatRating(4)).toBe('4.0');
    expect(formatRating(4.567)).toBe('4.6');
  });
});

describe('truncate', () => {
  it('does not truncate short text', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('truncates long text with ellipsis', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});
