import type { PracticeMode } from '../../types/spelling';
import {
  getStudentNextStepLabel,
  getStudentStageLabel,
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

function buildProgressMessage(stage: SessionStage, stageIndex: number, queueLength: number) {
  return `You have completed ${Math.min(stageIndex + 1, queueLength)} of ${queueLength} words in ${getStudentStageLabel(stage)}.`;
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
        message: `Good work. "${correctAnswer}" is correct.`,
        progressMessage: buildProgressMessage(stage, stageIndex, queueLength),
        comparison,
        nextStepMessage:
          stageIndex === queueLength - 1
            ? `Move to ${getStudentNextStepLabel(stage, reviewWordIds.length)}.`
            : 'Continue to the next word.',
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
      message:
        practiceMode === 'missing'
          ? 'Those letters do not complete the word correctly yet.'
          : `"${normalizedAnswer}" is not the correct spelling for this prompt.`,
      progressMessage: buildProgressMessage(stage, stageIndex, queueLength),
      comparison,
      nextStepMessage:
        stage === 'quiz'
          ? 'Finish the quiz, then review the summary.'
          : 'Continue and this word will remain visible in Review Mistakes.',
    },
  };
}
