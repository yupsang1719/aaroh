import { describe, expect, it } from 'vitest';
import { formatDate, paragraphs } from './format';

describe('formatDate', () => {
  it('formats calendar dates in en-GB', () => {
    expect(formatDate('2026-10-30')).toBe('30 October 2026');
    expect(formatDate('2026-01-01')).toBe('1 January 2026');
  });
});

describe('paragraphs', () => {
  it('splits on blank lines and drops empties', () => {
    expect(paragraphs('One\nstill one\n\n  Two  \n\n\n')).toEqual(['One\nstill one', 'Two']);
  });
});
