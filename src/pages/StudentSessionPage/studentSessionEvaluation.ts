import type { PracticeMode } from '../../types/spelling';
import {
  getStudentNextStepLabel,
} from './studentSessionFlow';
import type { ComparedLetter, FeedbackState, SessionStage } from './studentSession.types';

interface EvaluateStudentAnswerInput {
  stage: SessionStage;
  practiceMode: PracticeMode;
  rawAnswer: string;
  expectedAnswer: string;
  correctAnswer: string;
  currentWordId: string;
  queueLength: number;
  stageIndex: number;
  reviewWordIds: string[];
  masteredWordIds: string[];
}

export type StudentSubmissionResult =
  | {
      kind: 'invalid';
      errorMessage: string;
    }
  | {
      kind: 'evaluated';
      isCorrect: boolean;
      shouldAddToReview: boolean;
      shouldIncrementMissCount: boolean;
      shouldIncrementQuizScore: boolean;
      shouldMarkMastered: boolean;
      feedback: FeedbackState;
    };

function compareLetters(submittedAnswer: string, correctAnswer: string): ComparedLetter[] {
  const length = Math.max(submittedAnswer.length, correctAnswer.length);
  return Array.from({ length }, (_, index) => {
    const submittedLetter = submittedAnswer[index] ?? ' ';
    const correctLetter = correctAnswer[index] ?? ' ';
    return {
      value: submittedLetter,
      matches: submittedLetter.toLowerCase() === correctLetter.toLowerCase(),
    };
  });
}

function getEmptySubmissionMessage(stage: SessionStage, practiceMode: PracticeMode) {
  if (stage === 'practice' && practiceMode === 'missing') {
    return 'Enter the missing letters before continuing.';
  }

  return 'Enter your answer before continuing.';
}

function buildProgressMessage(stageIndex: number, queueLength: number) {
  return `Word ${Math.min(stageIndex + 1, queueLength)} of ${queueLength} completed.`;
}

function buildReviewMessage(stage: SessionStage, addedToReview: boolean) {
  if (stage === 'quiz') {
    return 'Words in Review stay the same during Quick Quiz.';
  }

  if (addedToReview) {
    return 'Added to Review.';
  }

  return 'Still in Review.';
}

function buildNextStepMessage(stage: SessionStage, stageIndex: number, queueLength: number, reviewCount: number) {
  if (stageIndex === queueLength - 1) {
    switch (stage) {
      case 'learn':
        return 'Learn complete. Next Step: Student Practice.';
      case 'practice':
        return reviewCount > 0
          ? 'Practice complete. Next Step: Review Missed Words.'
          : 'Practice complete. Next Step: Quick Quiz.';
      case 'review':
        return 'Review complete. Next Step: Quick Quiz.';
      case 'quiz':
        return 'Quick Quiz complete. Next Step: Session Summary.';
      default:
        return `Next Step: ${getStudentNextStepLabel(stage, reviewCount)}.`;
    }
  }

  return 'Next Step: Select Next Word.';
}

export function evaluateStudentAnswer({
  stage,
  practiceMode,
  rawAnswer,
  expectedAnswer,
  correctAnswer,
  currentWordId,
  queueLength,
  stageIndex,
  reviewWordIds,
  masteredWordIds,
}: EvaluateStudentAnswerInput): StudentSubmissionResult {
  const normalizedAnswer = rawAnswer.trim();

  if (!normalizedAnswer) {
    return {
      kind: 'invalid',
      errorMessage: getEmptySubmissionMessage(stage, practiceMode),
    };
  }

  const isCorrect = normalizedAnswer.toLowerCase() === expectedAnswer.toLowerCase();
  const alreadyInReview = reviewWordIds.includes(currentWordId);
  const alreadyMastered = masteredWordIds.includes(currentWordId);
  const addedToReview = stage !== 'quiz' && !alreadyInReview;
  const comparison = compareLetters(
    isCorrect && practiceMode === 'missing' ? expectedAnswer : normalizedAnswer,
    expectedAnswer,
  );

  if (isCorrect) {
    return {
      kind: 'evaluated',
      isCorrect: true,
      shouldAddToReview: false,
      shouldIncrementMissCount: false,
      shouldIncrementQuizScore: stage === 'quiz',
      shouldMarkMastered: stage !== 'quiz' && !alreadyMastered,
      feedback: {
        status: 'correct',
        submittedAnswer: normalizedAnswer,
        correctAnswer,
        addedToReview: false,
        message: 'The spelling is correct.',
        progressMessage: buildProgressMessage(stageIndex, queueLength),
        comparison,
        nextStepMessage: buildNextStepMessage(stage, stageIndex, queueLength, reviewWordIds.length),
      },
    };
  }

  return {
    kind: 'evaluated',
    isCorrect: false,
    shouldAddToReview: addedToReview,
    shouldIncrementMissCount: stage !== 'quiz',
    shouldIncrementQuizScore: false,
    shouldMarkMastered: false,
    feedback: {
      status: 'incorrect',
      submittedAnswer: normalizedAnswer,
      correctAnswer,
      addedToReview,
      reviewMessage: buildReviewMessage(stage, addedToReview),
      message:
        stage === 'quiz'
          ? 'Check the correct spelling before you move to the next quiz word.'
          : practiceMode === 'missing'
          ? 'The missing letters are not correct yet.'
          : 'This spelling is not correct yet.',
      progressMessage: buildProgressMessage(stageIndex, queueLength),
      comparison,
      nextStepMessage: buildNextStepMessage(stage, stageIndex, queueLength, reviewWordIds.length),
    },
  };
}
