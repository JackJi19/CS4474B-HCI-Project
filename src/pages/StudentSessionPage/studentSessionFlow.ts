import type { PracticeMode, PracticeWord } from '../../types/spelling';
import type {
  FeedbackState,
  SessionStage,
  StudentPrimaryActionInput,
  StudentPromptContent,
  StudentTitleInput,
} from './studentSession.types';

export const studentSessionStageOrder: SessionStage[] = ['learn', 'practice', 'review', 'quiz', 'summary'];

export const idleFeedbackState: FeedbackState = {
  status: 'idle',
  submittedAnswer: '',
  correctAnswer: '',
  addedToReview: false,
  message: '',
  progressMessage: '',
  comparison: [],
  nextStepMessage: '',
};

function shuffleWord(word: string) {
  if (word.length < 3) {
    return word;
  }

  return `${word.slice(1)}${word[0]}`;
}

function buildMissingPattern(answer: string) {
  const indexesToHide: number[] = [];

  for (let index = 1; index < answer.length - 1; index += 2) {
    indexesToHide.push(index);
  }

  if (indexesToHide.length === 0 && answer.length > 1) {
    indexesToHide.push(answer.length - 1);
  }

  const pattern = answer
    .split('')
    .map((letter, index) => (indexesToHide.includes(index) ? '_' : letter))
    .join(' ');

  const expectedMissingLetters = indexesToHide.map((index) => answer[index]).join('');

  return {
    pattern,
    expectedMissingLetters,
  };
}

export function buildStudentHint(word: PracticeWord) {
  const chunks = word.answer.match(/.{1,3}/g)?.join(' - ') ?? word.answer;
  return `Starts with ${word.answer[0].toUpperCase()}, has ${word.answer.length} letters, and can be chunked as ${chunks}.`;
}

export function getPracticeModeForStage(stage: SessionStage, index: number): PracticeMode {
  if (stage === 'quiz' || stage === 'review') {
    return 'type';
  }

  return ['type', 'missing', 'scramble'][index % 3] as PracticeMode;
}

export function getStudentStageLabel(stage: SessionStage) {
  switch (stage) {
    case 'learn':
      return 'Learn';
    case 'practice':
      return 'Practice';
    case 'review':
      return 'Review Mistakes';
    case 'quiz':
      return 'Quick Quiz';
    default:
      return 'Summary';
  }
}

export function getStudentStageDescription(stage: SessionStage) {
  switch (stage) {
    case 'learn':
      return 'Preview each word before the main practice loop begins.';
    case 'practice':
      return 'Work through one focused interaction at a time with immediate feedback.';
    case 'review':
      return 'Revisit the words that still need attention.';
    case 'quiz':
      return 'Finish with a short recall check after practice and review.';
    default:
      return 'Use the summary to decide whether to restart or finish.';
  }
}

export function getNextStudentStage(stage: SessionStage, reviewCount: number): SessionStage {
  switch (stage) {
    case 'learn':
      return 'practice';
    case 'practice':
      return reviewCount > 0 ? 'review' : 'quiz';
    case 'review':
      return 'quiz';
    case 'quiz':
      return 'summary';
    default:
      return 'summary';
  }
}

export function getStudentNextStepLabel(stage: SessionStage, reviewCount: number) {
  switch (stage) {
    case 'learn':
      return 'Practice';
    case 'practice':
      return reviewCount > 0 ? 'Review Mistakes' : 'Quick Quiz';
    case 'review':
      return 'Quick Quiz';
    case 'quiz':
      return 'Summary';
    default:
      return 'Back to Home';
  }
}

export function getStudentPromptContent(
  stage: SessionStage,
  practiceMode: PracticeMode,
  word: PracticeWord,
): StudentPromptContent {
  if (stage === 'learn') {
    return {
      promptLabel: 'Study word',
      prompt: word.answer,
      instruction: 'Take a moment to study the spelling, then move to the next word when you are ready.',
      inputLabel: '',
      inputPlaceholder: '',
      inputHelpText: '',
      expectedAnswer: word.answer,
      showInput: false,
    };
  }

  if (practiceMode === 'missing') {
    const missing = buildMissingPattern(word.answer);
    return {
      promptLabel: 'Complete the pattern',
      prompt: missing.pattern,
      instruction: 'Enter only the missing letters in order.',
      inputLabel: 'Missing letters',
      inputPlaceholder: 'Type the missing letters',
      inputHelpText: 'Use the visible pattern to reconstruct the word.',
      expectedAnswer: missing.expectedMissingLetters,
      showInput: true,
    };
  }

  if (practiceMode === 'scramble') {
    return {
      promptLabel: 'Unscramble the letters',
      prompt: shuffleWord(word.answer),
      instruction: 'Unscramble the letters and type the full word.',
      inputLabel: 'Unscrambled word',
      inputPlaceholder: 'Type the full word',
      inputHelpText: 'Use the letter order clue and the prompt to reconstruct the spelling.',
      expectedAnswer: word.answer,
      showInput: true,
    };
  }

  return {
    promptLabel: 'Prompt',
    prompt: word.prompt,
    instruction: 'Spell the word that matches the prompt.',
    inputLabel: 'Your answer',
    inputPlaceholder: 'Type your spelling here',
    inputHelpText: 'Capital letters do not matter in this phase.',
    expectedAnswer: word.answer,
    showInput: true,
  };
}

export function getStudentPrimaryActionLabel({
  stage,
  stageIndex,
  stageWordCount,
  hasSubmittedCurrentWord,
  reviewCount,
}: StudentPrimaryActionInput) {
  if (stage === 'learn') {
    return stageIndex === stageWordCount - 1 ? 'Begin Practice' : 'Next Study Word';
  }

  if (hasSubmittedCurrentWord) {
    return stageIndex === stageWordCount - 1
      ? `Go to ${getStudentNextStepLabel(stage, reviewCount)}`
      : 'Next Word';
  }

  return 'Submit Answer';
}

export function getStudentStageEyebrow({ stage, practiceMode }: StudentTitleInput) {
  return stage === 'learn'
    ? 'Learn stage'
    : stage === 'practice'
      ? `${getStudentStageLabel(stage)} - ${practiceMode}`
      : getStudentStageLabel(stage);
}

export function getStudentPracticeTitle({ stage, practiceMode }: StudentTitleInput) {
  if (stage === 'learn') {
    return 'Study the word before you practice';
  }

  if (stage === 'review') {
    return 'Review a missed word';
  }

  if (stage === 'quiz') {
    return 'Quick Quiz';
  }

  if (practiceMode === 'missing') {
    return 'Fill in the missing letters';
  }

  if (practiceMode === 'scramble') {
    return 'Unscramble the word';
  }

  return 'Spell this word';
}
