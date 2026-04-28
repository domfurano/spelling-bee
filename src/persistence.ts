const STORAGE_PREFIX = 'spelling-bee:progress:';

interface SavedProgress {
  foundWords: string[];
  score: number;
}

export function utcDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function saveProgress(
  dateKey: string,
  foundWords: Set<string>,
  score: number
): void {
  const data: SavedProgress = { foundWords: [...foundWords], score };
  localStorage.setItem(STORAGE_PREFIX + dateKey, JSON.stringify(data));
}

export function loadProgress(
  dateKey: string
): { foundWords: Set<string>; score: number } | null {
  const raw = localStorage.getItem(STORAGE_PREFIX + dateKey);
  if (raw === null) return null;
  try {
    const data = JSON.parse(raw) as SavedProgress;
    return { foundWords: new Set(data.foundWords), score: data.score };
  } catch {
    return null;
  }
}

export function clearProgress(dateKey: string): void {
  localStorage.removeItem(STORAGE_PREFIX + dateKey);
}
