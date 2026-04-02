export type StartingPracticeMode = 'learn-first' | 'mixed-practice';
export type PracticeMode = 'type' | 'missing' | 'scramble';

export interface PracticeSettings {
  startingMode: StartingPracticeMode;
  hintSupport: boolean;
}

export interface PracticeWord {
  id: string;
  prompt: string;
  answer: string;
}

export interface SpellingList {
  id: string;
  name: string;
  accessCode: string;
  wordCount: number;
  teacherName: string;
  practiceWords: PracticeWord[];
  settings?: PracticeSettings;
  source?: 'mock' | 'local';
}

export interface SessionSummaryRecord {
  id: string;
  listId: string;
  listName: string;
  accessCode: string;
  completedAt: string;
  totalWords: number;
  masteredCount: number;
  reviewCount: number;
  quickQuizScore: number;
  mostMissedWords: string[];
}
