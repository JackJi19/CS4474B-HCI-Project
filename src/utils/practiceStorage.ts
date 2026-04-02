import { mockLists } from '../data/mockLists';
import type { PracticeSettings, PracticeWord, SessionSummaryRecord, SpellingList } from '../types/spelling';

const LISTS_STORAGE_KEY = 'spelling-practice-studio/custom-lists';
const SESSIONS_STORAGE_KEY = 'spelling-practice-studio/session-summaries';

const defaultSettings: PracticeSettings = {
  startingMode: 'learn-first',
  hintSupport: true,
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function buildPromptFromWord(word: string) {
  return `Study word from the spelling list (${word.length} letters).`;
}

function enrichList(list: SpellingList): SpellingList {
  return {
    ...list,
    source: list.source ?? 'mock',
    settings: {
      ...defaultSettings,
      ...(list.settings ?? {}),
    },
    wordCount: list.practiceWords.length,
  };
}

export function getStoredLists(): SpellingList[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(LISTS_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as SpellingList[];
    return parsed.map((list) => enrichList({ ...list, source: 'local' }));
  } catch {
    return [];
  }
}

export function getAllLists(): SpellingList[] {
  const baseLists = mockLists.map((list) => enrichList({ ...list, source: 'mock' }));
  return [...baseLists, ...getStoredLists()];
}

export function findListByEntry(rawValue: string): SpellingList | undefined {
  const normalizedValue = rawValue.trim().toLowerCase();
  return getAllLists().find((list) => {
    return (
      list.accessCode.toLowerCase() === normalizedValue ||
      list.name.toLowerCase() === normalizedValue
    );
  });
}

export function saveCustomList(input: {
  sessionName: string;
  teacherName?: string;
  accessCode: string;
  words: string[];
  settings: PracticeSettings;
}): SpellingList {
  const trimmedName = input.sessionName.trim() || 'Untitled list';
  const practiceWords: PracticeWord[] = input.words.map((word, index) => ({
    id: `${slugify(trimmedName)}-${index + 1}`,
    prompt: buildPromptFromWord(word),
    answer: word,
  }));

  const nextList: SpellingList = enrichList({
    id: `${slugify(trimmedName)}-${input.accessCode.toLowerCase()}`,
    name: trimmedName,
    accessCode: input.accessCode,
    teacherName: input.teacherName?.trim() || 'Teacher',
    practiceWords,
    wordCount: practiceWords.length,
    settings: input.settings,
    source: 'local',
  });

  if (!canUseStorage()) {
    return nextList;
  }

  const existingLists = getStoredLists().filter(
    (list) =>
      list.id !== nextList.id && list.accessCode.toLowerCase() !== nextList.accessCode.toLowerCase(),
  );

  window.localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify([...existingLists, nextList]));
  return nextList;
}

export function getSessionSummaries(): SessionSummaryRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as SessionSummaryRecord[];
    return parsed.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  } catch {
    return [];
  }
}

export function saveSessionSummary(summary: SessionSummaryRecord) {
  if (!canUseStorage()) {
    return;
  }

  const existing = getSessionSummaries();
  const next = [summary, ...existing].slice(0, 12);
  window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(next));
}
