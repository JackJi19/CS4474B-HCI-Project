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
}
