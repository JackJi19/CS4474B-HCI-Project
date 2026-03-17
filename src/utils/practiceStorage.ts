import { mockLists } from '../data/mockLists';
import type { PracticeWord, SpellingList } from '../types/spelling';

export type StartingPracticeMode = 'learn-first' | 'mixed-practice';

export interface StoredListSetupOptions {
  startingMode: StartingPracticeMode;
  hintSupport: boolean;
}

export interface StoredPracticeList extends SpellingList {
  isCustom?: boolean;
  setupOptions?: StoredListSetupOptions;
}

export interface PracticeSessionSummary {
  listId: string;
  listName: string;
  sessionsCompleted: number;
  sessionsEndedEarly: number;
  totalWordsSeen: number;
  totalReviewWords: number;
  mostMissedWords: Array<{ word: string; misses: number }>;
  lastUpdatedAt: string;
}

interface PersistedCustomList {
  id: string;
  name: string;
  accessCode: string;
  teacherName: string;
  words: string[];
  setupOptions: StoredListSetupOptions;
}

interface PersistedSummaryRecord {
  [listId: string]: PracticeSessionSummary;
}

const CUSTOM_LISTS_KEY = 'spelling-practice-studio.custom-lists';
const SUMMARY_KEY = 'spelling-practice-studio.summaries';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeWordToPracticeWord(word: string, index: number): PracticeWord {
  const cleanWord = word.trim();
  return {
    id: `${cleanWord.toLowerCase().replace(/[^a-z0-9]+/giu, '-') || 'word'}-${index}`,
    prompt: `Spell the word "${cleanWord}" after studying it in the guided practice flow.`,
    answer: cleanWord,
  };
}

function toStoredPracticeList(list: PersistedCustomList): StoredPracticeList {
  const practiceWords = list.words.map((word, index) => normalizeWordToPracticeWord(word, index));

  return {
    id: list.id,
    name: list.name,
    accessCode: list.accessCode,
    wordCount: practiceWords.length,
    teacherName: list.teacherName,
    practiceWords,
    isCustom: true,
    setupOptions: list.setupOptions,
  };
}

export function loadCustomLists(): StoredPracticeList[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(CUSTOM_LISTS_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as PersistedCustomList[];
    return parsed.map(toStoredPracticeList);
  } catch {
    return [];
  }
}

export function saveCustomList(input: {
  sessionName: string;
  accessCode: string;
  words: string[];
  setupOptions: StoredListSetupOptions;
}) {
  if (!canUseStorage()) {
    return null;
  }

  const nextList: PersistedCustomList = {
    id: `custom-${input.accessCode.toLowerCase()}`,
    name: input.sessionName.trim() || 'Untitled list',
    accessCode: input.accessCode,
    teacherName: 'Teacher',
    words: input.words,
    setupOptions: input.setupOptions,
  };

  const existing = loadCustomLists().filter((list) => list.id !== nextList.id);
  const persistedExisting: PersistedCustomList[] = existing.map((list) => ({
    id: list.id,
    name: list.name,
    accessCode: list.accessCode,
    teacherName: list.teacherName,
    words: list.practiceWords.map((word) => word.answer),
    setupOptions: list.setupOptions ?? { startingMode: 'learn-first', hintSupport: true },
  }));

  window.localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify([nextList, ...persistedExisting]));
  return toStoredPracticeList(nextList);
}

export function getAllAvailableLists(): StoredPracticeList[] {
  return [...mockLists, ...loadCustomLists()];
}

export function findAvailableListByEntry(rawValue: string): StoredPracticeList | undefined {
  const loweredValue = rawValue.trim().toLowerCase();
  return getAllAvailableLists().find((list) => {
    return (
      list.accessCode.toLowerCase() === loweredValue ||
      list.name.toLowerCase() === loweredValue ||
      list.id.toLowerCase() === loweredValue
    );
  });
}

export function getAvailableListById(listId?: string | null): StoredPracticeList | null {
  if (!listId) {
    return null;
  }

  return getAllAvailableLists().find((list) => list.id === listId) ?? null;
}

function loadSummaryRecord(): PersistedSummaryRecord {
  if (!canUseStorage()) {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(SUMMARY_KEY);
    if (!rawValue) {
      return {};
    }

    return JSON.parse(rawValue) as PersistedSummaryRecord;
  } catch {
    return {};
  }
}

export function readPracticeSessionSummary(listId?: string | null): PracticeSessionSummary | null {
  if (!listId) {
    return null;
  }

  const summaries = loadSummaryRecord();
  return summaries[listId] ?? null;
}

export function savePracticeSessionSummary(input: {
  listId: string;
  listName: string;
  completed: boolean;
  totalWordsSeen: number;
  reviewWords: string[];
  missedCounts: Record<string, number>;
}) {
  if (!canUseStorage()) {
    return;
  }

  const summaries = loadSummaryRecord();
  const existing = summaries[input.listId];
  const mergedMisses = new Map<string, number>();

  existing?.mostMissedWords.forEach((entry) => {
    mergedMisses.set(entry.word, entry.misses);
  });

  Object.entries(input.missedCounts).forEach(([word, misses]) => {
    mergedMisses.set(word, (mergedMisses.get(word) ?? 0) + misses);
  });

  const nextSummary: PracticeSessionSummary = {
    listId: input.listId,
    listName: input.listName,
    sessionsCompleted: (existing?.sessionsCompleted ?? 0) + (input.completed ? 1 : 0),
    sessionsEndedEarly: (existing?.sessionsEndedEarly ?? 0) + (input.completed ? 0 : 1),
    totalWordsSeen: (existing?.totalWordsSeen ?? 0) + input.totalWordsSeen,
    totalReviewWords: (existing?.totalReviewWords ?? 0) + input.reviewWords.length,
    mostMissedWords: [...mergedMisses.entries()]
      .map(([word, misses]) => ({ word, misses }))
      .sort((left, right) => right.misses - left.misses || left.word.localeCompare(right.word))
      .slice(0, 5),
    lastUpdatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    SUMMARY_KEY,
    JSON.stringify({
      ...summaries,
      [input.listId]: nextSummary,
    }),
  );
}
