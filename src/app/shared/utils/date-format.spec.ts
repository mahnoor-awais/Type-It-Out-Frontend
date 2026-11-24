import { formatArticleDate } from './date-format';

describe('formatArticleDate', () => {
  it('formats valid article dates for display', () => {
    expect(formatArticleDate('2026-11-23T12:00:00Z')).toBe('Nov 23, 2026');
  });

  it('handles invalid and missing dates', () => {
    expect(formatArticleDate('not-a-date')).toBe('Date unavailable');
    expect(formatArticleDate(null)).toBe('Date unavailable');
    expect(formatArticleDate(undefined)).toBe('Date unavailable');
  });
});
