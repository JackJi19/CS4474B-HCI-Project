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
  reviewMessage: '',
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

export function getStudentModeLabel(practiceMode: PracticeMode) {
  switch (practiceMode) {
    case 'missing':
      return 'Missing Letters';
    case 'scramble':
      return 'Unscramble';
    default:
      return 'Type the Word';
  }
}

export function getStudentStageHeading(stage: SessionStage) {
  switch (stage) {
    case 'learn':
    case 'practice':
      return 'Student Practice';
    case 'review':
      return 'Review Mistakes';
    case 'quiz':
      return 'Quick Quiz';
    default:
      return 'Session Summary';
  }
}

export function getStudentStageStepLabel(stage: SessionStage) {
  switch (stage) {
    case 'learn':
      return 'Learn';
    case 'practice':
      return 'Student Practice';
    case 'review':
      return 'Review Mistakes';
    case 'quiz':
      return 'Quick Quiz';
    default:
      return 'Session Summary';
  }
}

export function getStudentStageDescription(stage: SessionStage) {
  switch (stage) {
    case 'learn':
      return 'Study each word first so the spelling is clear before Student Practice begins.';
    case 'practice':
      return 'Work through one word at a time with immediate feedback. Missed words are added to review.';
    case 'review':
      return 'Practice the words that are still in review before you move to the Quick Quiz.';
    case 'quiz':
      return 'Use this short check to finish the session before you open the Session Summary.';
    default:
      return 'Review what was mastered, what is still in review, and choose the next step.';
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
      return 'Student Practice';
    case 'practice':
      return reviewCount > 0 ? 'Review Missed Words' : 'Quick Quiz';
    case 'review':
      return 'Quick Quiz';
    case 'quiz':
      return 'Session Summary';
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
    return stageIndex === stageWordCount - 1 ? 'Begin Student Practice' : 'Next Study Word';
  }

  if (hasSubmittedCurrentWord) {
    if (stageIndex === stageWordCount - 1) {
      if (stage === 'practice' && reviewCount > 0) {
        return 'Review Missed Words';
      }

      if (stage === 'quiz') {
        return 'View Session Summary';
      }

      return `Begin ${getStudentNextStepLabel(stage, reviewCount)}`;
    }

    return 'Next Word';
  }

  return 'Submit Answer';
}

export function getStudentStageEyebrow({ stage, practiceMode }: StudentTitleInput) {
  return stage === 'learn'
    ? 'Student Practice'
    : stage === 'practice'
      ? `${getStudentStageHeading(stage)} - ${getStudentModeLabel(practiceMode)}`
      : getStudentStageHeading(stage);
}

export function getStudentPracticeTitle({ stage, practiceMode }: StudentTitleInput) {
  if (stage === 'learn') {
    return 'Study this word';
  }

  if (stage === 'review') {
    return 'Practice this word again';
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
