import type { PracticeMode } from '../../types/spelling';

export type FeedbackStatus = 'idle' | 'correct' | 'incorrect';
export type SessionStage = 'learn' | 'practice' | 'review' | 'quiz' | 'summary';

export interface ComparedLetter {
  value: string;
  matches: boolean;
}

export interface FeedbackState {
  status: FeedbackStatus;
  submittedAnswer: string;
  correctAnswer: string;
  addedToReview: boolean;
  message: string;
  progressMessage: string;
  comparison: ComparedLetter[];
  nextStepMessage?: string;
}

export interface StudentPromptContent {
  promptLabel: string;
  prompt: string;
  instruction: string;
  inputLabel: string;
  inputPlaceholder: string;
  inputHelpText: string;
  expectedAnswer: string;
  showInput: boolean;
}

export interface StudentPrimaryActionInput {
  stage: SessionStage;
  stageIndex: number;
  stageWordCount: number;
  hasSubmittedCurrentWord: boolean;
  reviewCount: number;
}

export interface StudentTitleInput {
  stage: SessionStage;
  practiceMode: PracticeMode;
}
