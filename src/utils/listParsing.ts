export interface ParsedWordListResult {
  parsedWords: string[];
  removedDuplicateCount: number;
  ignoredInvalidCount: number;
}

const VALID_WORD_PATTERN = /[\p{L}\p{N}]/u;

export function parseWordList(rawInput: string): ParsedWordListResult {
  if (!rawInput.trim()) {
    return {
      parsedWords: [],
      removedDuplicateCount: 0,
      ignoredInvalidCount: 0,
    };
  }

  const seenWords = new Set<string>();
  const parsedWords: string[] = [];
  let removedDuplicateCount = 0;
  let ignoredInvalidCount = 0;

  for (const line of rawInput.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      ignoredInvalidCount += 1;
      continue;
    }

    if (!VALID_WORD_PATTERN.test(trimmedLine)) {
      ignoredInvalidCount += 1;
      continue;
    }

    const normalizedWord = trimmedLine.toLowerCase();

    if (seenWords.has(normalizedWord)) {
      removedDuplicateCount += 1;
      continue;
    }

    seenWords.add(normalizedWord);
    parsedWords.push(trimmedLine);
  }

  return {
    parsedWords,
    removedDuplicateCount,
    ignoredInvalidCount,
  };
}

export function buildWordInputFromList(words: string[]): string {
  return words.join('\n');
}
