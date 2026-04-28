import { expect, describe, it, beforeEach } from 'vitest';
import {
  saveProgress,
  loadProgress,
  clearProgress,
  utcDateKey,
} from './persistence';

const KEY = '2025-01-01';

beforeEach(() => {
  localStorage.clear();
});

describe('utcDateKey', () => {
  it('formats a UTC date as YYYY-MM-DD', () => {
    expect(utcDateKey(new Date('2025-01-01T00:00:00Z'))).toBe('2025-01-01');
  });

  it('pads month and day with leading zeros', () => {
    expect(utcDateKey(new Date('2025-03-05T00:00:00Z'))).toBe('2025-03-05');
  });

  it('uses UTC date, not local date', () => {
    // midnight UTC on Jan 1 — local date might be Dec 31 in UTC-negative zones
    const result = utcDateKey(new Date('2025-01-01T00:00:00Z'));
    expect(result).toBe('2025-01-01');
  });
});

describe('loadProgress', () => {
  it('returns null when nothing is stored for the key', () => {
    expect(loadProgress(KEY)).toBeNull();
  });

  it('returns null for a different key even when data exists', () => {
    saveProgress(KEY, new Set(['CAVE']), 1);
    expect(loadProgress('2025-01-02')).toBeNull();
  });

  it('returns null when stored value is malformed JSON', () => {
    localStorage.setItem('spelling-bee:progress:' + KEY, '{bad json');
    expect(loadProgress(KEY)).toBeNull();
  });
});

describe('saveProgress / loadProgress roundtrip', () => {
  it('restores foundWords as a Set', () => {
    saveProgress(KEY, new Set(['CAVE', 'CLOVE']), 6);
    const result = loadProgress(KEY);
    expect(result).not.toBeNull();
    expect(result!.foundWords).toBeInstanceOf(Set);
    expect(result!.foundWords.has('CAVE')).toBe(true);
    expect(result!.foundWords.has('CLOVE')).toBe(true);
  });

  it('restores score correctly', () => {
    saveProgress(KEY, new Set(['CAVE']), 42);
    expect(loadProgress(KEY)!.score).toBe(42);
  });

  it('restores an empty foundWords set', () => {
    saveProgress(KEY, new Set(), 0);
    const result = loadProgress(KEY);
    expect(result!.foundWords.size).toBe(0);
    expect(result!.score).toBe(0);
  });

  it('overwrites previous progress when saved again', () => {
    saveProgress(KEY, new Set(['CAVE']), 1);
    saveProgress(KEY, new Set(['CAVE', 'CLOVE']), 6);
    const result = loadProgress(KEY);
    expect(result!.foundWords.size).toBe(2);
    expect(result!.score).toBe(6);
  });
});

describe('clearProgress', () => {
  it('removes saved progress so loadProgress returns null', () => {
    saveProgress(KEY, new Set(['CAVE']), 1);
    clearProgress(KEY);
    expect(loadProgress(KEY)).toBeNull();
  });

  it('does nothing when no progress is stored', () => {
    expect(() => clearProgress(KEY)).not.toThrow();
  });
});
