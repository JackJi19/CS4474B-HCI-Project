import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { PracticeWord } from '../../types/spelling';
import {
  getAvailableListById,
  savePracticeSessionSummary,
  type StoredPracticeList,
} from '../../utils/practiceStorage';
import { EndSessionPanel } from './components/EndSessionPanel';
import { FeedbackPanel } from './components/FeedbackPanel';
import { PracticeCard } from './components/PracticeCard';
import { ProgressSummary } from './components/ProgressSummary';
import './StudentSessionPage.css';

interface StudentSessionRouteState {
  listId?: string;
}

type FeedbackStatus = 'idle' | 'correct' | 'incorrect';
type SessionPhase = 'learn' | 'practice' | 'review' | 'quiz' | 'complete';
type PracticeMode = 'type-word' | 'missing-letters' | 'scramble';

interface FeedbackState {
  status: FeedbackStatus;
  submittedAnswer: string;
  correctAnswer: string;
  addedToReview: boolean;
  message: string;
  progressMessage: string;
  answerComparison: Array<{ character: string; isCorrect: boolean }>;
}

interface ExerciseView {
  mode: PracticeMode;
  modeLabel: string;
  title: string;
  prompt: string;
  inputLabel: string;
  placeholder: string;
  expectedAnswer: string;
  submittedValueResolver?: (value: string) => string;
  hintText?: string;
}

const idleFeedbackState: FeedbackState = {
  status: 'idle',
  submittedAnswer: '',
  correctAnswer: '',
  addedToReview: false,
  message: '',
  progressMessage: '',
  answerComparison: [],
};

const practiceModeCycle: PracticeMode[] = ['type-word', 'missing-letters', 'scramble'];

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

function buildMissingLetters(answer: string) {
  const letters = answer.split('');
  const hiddenIndexes: number[] = [];

  letters.forEach((character, index) => {
    const isLetter = /[a-z]/iu.test(character);
    if (!isLetter || index === 0 || index === letters.length - 1) {
      return;
    }

    if (index % 2 === 1) {
      hiddenIndexes.push(index);
    }
  });

  if (hiddenIndexes.length === 0 && letters.length > 2) {
    hiddenIndexes.push(1);
  }

  const pattern = letters
    .map((character, index) => (hiddenIndexes.includes(index) ? '_' : character))
    .join(' ');
  const missingLetters = hiddenIndexes.map((index) => letters[index]).join('');

  return {
    pattern,
    missingLetters,
  };
}

function buildScramble(answer: string) {
  if (answer.length <= 3) {
    return answer.split('').reverse().join('');
  }

  return `${answer.slice(1)}${answer[0]}`;
}

function buildAnswerComparison(submittedAnswer: string, correctAnswer: string) {
  const totalLength = Math.max(submittedAnswer.length, correctAnswer.length);
  return Array.from({ length: totalLength }, (_, index) => {
    const submittedCharacter = submittedAnswer[index] ?? '·';
    const correctCharacter = correctAnswer[index] ?? '';
    return {
      character: submittedCharacter,
      isCorrect: normalizeValue(submittedCharacter) === normalizeValue(correctCharacter),
    };
  });
}

function getStartingPhase(activeList: StoredPracticeList | null): SessionPhase {
  if (!activeList) {
    return 'practice';
  }

  return activeList.setupOptions?.startingMode === 'mixed-practice' ? 'practice' : 'learn';
}

function getPhaseMode(phase: SessionPhase, phaseIndex: number): PracticeMode {
  if (phase === 'review') {
    return practiceModeCycle[(phaseIndex + 1) % practiceModeCycle.length];
  }

  if (phase === 'quiz') {
    return 'type-word';
  }

  return practiceModeCycle[phaseIndex % practiceModeCycle.length];
}

function buildExerciseView(
  word: PracticeWord,
  phase: SessionPhase,
  mode: PracticeMode,
  hintSupport: boolean,
): ExerciseView {
  const answer = word.answer;
  const safeHint = hintSupport ? `First letter: ${answer[0]}. Word length: ${answer.length}.` : undefined;

  if (mode === 'missing-letters') {
    const missingLetters = buildMissingLetters(answer);
    return {
      mode,
      modeLabel: phase === 'review' ? 'Review · Missing Letters' : 'Missing Letters',
      title: 'Fill in the missing letters',
      prompt: `${word.prompt}\n\nPattern: ${missingLetters.pattern}`,
      inputLabel: 'Missing letters only',
      placeholder: 'Type the hidden letters',
      expectedAnswer: missingLetters.missingLetters,
      submittedValueResolver: (value) => {
        const characters = answer.split('');
        const trimmedValue = value.trim();
        let hiddenIndex = 0;
        return characters
          .map((character, index) => {
            if (index === 0 || index === characters.length - 1 || index % 2 === 0) {
              return character;
            }

            const replacement = trimmedValue[hiddenIndex] ?? '_';
            hiddenIndex += 1;
            return replacement;
          })
          .join('');
      },
      hintText: safeHint,
    };
  }

  if (mode === 'scramble') {
    return {
      mode,
      modeLabel: phase === 'review' ? 'Review · Scramble' : 'Scramble',
      title: 'Unscramble the letters',
      prompt: `${word.prompt}\n\nScrambled letters: ${buildScramble(answer).split('').join(' ')}`,
      inputLabel: 'Correct word',
      placeholder: 'Type the unscrambled word',
      expectedAnswer: answer,
      hintText: safeHint,
    };
  }

  return {
    mode,
    modeLabel:
      phase === 'quiz'
        ? 'Quick Quiz'
        : phase === 'review'
          ? 'Review · Type the Word'
          : 'Type the Word',
    title: phase === 'quiz' ? 'Quick quiz spelling check' : 'Spell this word',
    prompt: word.prompt,
    inputLabel: 'Your answer',
    placeholder: 'Type your spelling here',
    expectedAnswer: answer,
    hintText: safeHint,
  };
}

export function StudentSessionPage() {
  const actionPhaseRef = useRef<'ready' | 'locking-after-submit' | 'submitted' | 'transitioning'>(
    'ready',
  );
  const summarySavedRef = useRef(false);
  const location = useLocation();
  const routeState = (location.state as StudentSessionRouteState | null) ?? null;
  const activeList = getAvailableListById(routeState?.listId);
  const totalWords = activeList?.practiceWords.length ?? 0;

  const [phase, setPhase] = useState<SessionPhase>(() => getStartingPhase(activeList));
  const [phaseWords, setPhaseWords] = useState<PracticeWord[]>(() => activeList?.practiceWords ?? []);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [currentInputError, setCurrentInputError] = useState('');
  const [hasSubmittedCurrentWord, setHasSubmittedCurrentWord] = useState(false);
  const [currentFeedbackState, setCurrentFeedbackState] = useState<FeedbackState>(idleFeedbackState);
  const [masteredWordIds, setMasteredWordIds] = useState<string[]>([]);
  const [reviewWords, setReviewWords] = useState<PracticeWord[]>([]);
  const [completedWordIndexes, setCompletedWordIndexes] = useState<number[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionEndedEarly, setSessionEndedEarly] = useState(false);
  const [completionActionMessage, setCompletionActionMessage] = useState('');
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [missedCounts, setMissedCounts] = useState<Record<string, number>>({});

  const currentWord = phaseWords[currentWordIndex] ?? null;
  const currentMode = getPhaseMode(phase, currentWordIndex);
  const hintSupport = activeList?.setupOptions?.hintSupport ?? true;
  const currentExercise = useMemo(() => {
    if (!currentWord) {
      return null;
    }

    return buildExerciseView(currentWord, phase, currentMode, hintSupport);
  }, [currentWord, phase, currentMode, hintSupport]);
  const reviewCount = reviewWords.length;
  const masteredCount = masteredWordIds.length;
  const completedCount = completedWordIndexes.length;

  useEffect(() => {
    if (sessionComplete || sessionEndedEarly) {
      actionPhaseRef.current = 'ready';
      return;
    }

    actionPhaseRef.current = hasSubmittedCurrentWord ? 'submitted' : 'ready';
  }, [currentWordIndex, hasSubmittedCurrentWord, sessionComplete, sessionEndedEarly]);

  useEffect(() => {
    if (!activeList || summarySavedRef.current || (!sessionComplete && !sessionEndedEarly)) {
      return;
    }

    savePracticeSessionSummary({
      listId: activeList.id,
      listName: activeList.name,
      completed: sessionComplete,
      totalWordsSeen: completedCount,
      reviewWords: reviewWords.map((word) => word.answer),
      missedCounts,
    });
    summarySavedRef.current = true;
  }, [activeList, completedCount, missedCounts, reviewWords, sessionComplete, sessionEndedEarly]);

  const resetSession = () => {
    summarySavedRef.current = false;
    actionPhaseRef.current = 'ready';
    const nextPhase = getStartingPhase(activeList);
    setPhase(nextPhase);
    setPhaseWords(activeList?.practiceWords ?? []);
    setCurrentWordIndex(0);
    setCurrentInputValue('');
    setCurrentInputError('');
    setHasSubmittedCurrentWord(false);
    setCurrentFeedbackState(idleFeedbackState);
    setMasteredWordIds([]);
    setReviewWords([]);
    setCompletedWordIndexes([]);
    setSessionComplete(false);
    setSessionEndedEarly(false);
    setCompletionActionMessage('');
    setQuizCorrectCount(0);
    setMissedCounts({});
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (hasSubmittedCurrentWord || sessionComplete || sessionEndedEarly) {
      return;
    }

    setCurrentInputValue(event.target.value);
    if (currentInputError) {
      setCurrentInputError('');
    }
  };

  const moveIntoPhase = (nextPhase: SessionPhase, words: PracticeWord[]) => {
    setPhase(nextPhase);
    setPhaseWords(words);
    setCurrentWordIndex(0);
    setCurrentInputValue('');
    setCurrentInputError('');
    setHasSubmittedCurrentWord(false);
    setCurrentFeedbackState(idleFeedbackState);
    setCompletionActionMessage('');
  };

  const handleAdvance = () => {
    setCompletionActionMessage('');

    if (!activeList) {
      actionPhaseRef.current = 'ready';
      return;
    }

    if (phase === 'learn') {
      if (currentWordIndex >= phaseWords.length - 1) {
        moveIntoPhase('practice', activeList.practiceWords);
        return;
      }

      setCurrentWordIndex((currentIndex) => currentIndex + 1);
      return;
    }

    if (currentWordIndex < phaseWords.length - 1) {
      setCurrentWordIndex((currentIndex) => currentIndex + 1);
      setCurrentInputValue('');
      setCurrentInputError('');
      setHasSubmittedCurrentWord(false);
      setCurrentFeedbackState(idleFeedbackState);
      return;
    }

    if (phase === 'practice') {
      if (reviewWords.length > 0) {
        moveIntoPhase('review', reviewWords);
        return;
      }

      moveIntoPhase('quiz', activeList.practiceWords);
      return;
    }

    if (phase === 'review') {
      moveIntoPhase('quiz', activeList.practiceWords);
      return;
    }

    if (phase === 'quiz') {
      setPhase('complete');
      setSessionComplete(true);
      setHasSubmittedCurrentWord(false);
      return;
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeList || !currentWord || !currentExercise || sessionComplete || sessionEndedEarly) {
      return;
    }

    if (
      actionPhaseRef.current === 'locking-after-submit' ||
      actionPhaseRef.current === 'transitioning'
    ) {
      return;
    }

    if (hasSubmittedCurrentWord || actionPhaseRef.current === 'submitted') {
      actionPhaseRef.current = 'transitioning';
      handleAdvance();
      return;
    }

    const normalizedAnswer = currentInputValue.trim();

    if (!normalizedAnswer) {
      setCurrentInputError('Enter your answer before submitting.');
      return;
    }

    const expectedAnswer = currentExercise.expectedAnswer;
    const isCorrect = normalizeValue(normalizedAnswer) === normalizeValue(expectedAnswer);
    const alreadyInReview = reviewWords.some((word) => word.id === currentWord.id);
    const nextCompletedIndexes = completedWordIndexes.includes(currentWordIndex)
      ? completedWordIndexes
      : [...completedWordIndexes, currentWordIndex];
    const submittedAnswerForDisplay = currentExercise.submittedValueResolver
      ? currentExercise.submittedValueResolver(normalizedAnswer)
      : normalizedAnswer;

    actionPhaseRef.current = 'locking-after-submit';
    setCurrentInputError('');
    setHasSubmittedCurrentWord(true);
    setCompletedWordIndexes(nextCompletedIndexes);

    if (phase === 'quiz' && isCorrect) {
      setQuizCorrectCount((currentCount) => currentCount + 1);
    }

    if (isCorrect) {
      if (!masteredWordIds.includes(currentWord.id) && phase !== 'quiz') {
        setMasteredWordIds((currentIds) => [...currentIds, currentWord.id]);
      }
      setCurrentFeedbackState({
        status: 'correct',
        submittedAnswer: submittedAnswerForDisplay,
        correctAnswer: currentWord.answer,
        addedToReview: false,
        message: `Correct. "${currentWord.answer}" is ready for the next stage.`,
        progressMessage: `You have completed ${nextCompletedIndexes.length} of ${phaseWords.length} items in this stage.`,
        answerComparison: buildAnswerComparison(submittedAnswerForDisplay, currentWord.answer),
      });
      return;
    }

    if (phase !== 'quiz') {
      if (!alreadyInReview) {
        setReviewWords((currentReviewWords) => [...currentReviewWords, currentWord]);
      }
      setMissedCounts((currentCounts) => ({
        ...currentCounts,
        [currentWord.answer]: (currentCounts[currentWord.answer] ?? 0) + 1,
      }));
    }

    setCurrentFeedbackState({
      status: 'incorrect',
      submittedAnswer: submittedAnswerForDisplay,
      correctAnswer: currentWord.answer,
      addedToReview: phase !== 'quiz' && !alreadyInReview,
      message: `Not quite. "${currentWord.answer}" is the correct spelling for this prompt.`,
      progressMessage: `You have completed ${nextCompletedIndexes.length} of ${phaseWords.length} items in this stage.`,
      answerComparison: buildAnswerComparison(submittedAnswerForDisplay, currentWord.answer),
    });
  };

  const handleEndSession = () => {
    actionPhaseRef.current = 'ready';
    setSessionEndedEarly(true);
    setCurrentInputError('');
    setHasSubmittedCurrentWord(false);
    setCurrentFeedbackState(idleFeedbackState);
    setCompletionActionMessage('');
  };

  const handleCompletionAction = () => {
    if (reviewWords.length > 0) {
      setCompletionActionMessage(
        `Review and quick quiz are now built into the session. This round collected ${reviewWords.length} review word(s).`,
      );
      return;
    }

    setCompletionActionMessage(
      `Quick quiz completed. You answered ${quizCorrectCount} of ${totalWords} quiz words correctly.`,
    );
  };

  if (!activeList) {
    return (
      <>
        <Header howItWorksHref="/#practice-loop" />
        <main>
          <PageShell className="student-practice-page">
            <Card as="section" className="student-practice__card student-practice__empty">
              <div className="section-heading student-practice__section-heading">
                <p className="eyebrow">Student Practice</p>
                <h1>No practice session available</h1>
                <p>Start from the homepage with a valid access code or list name to begin.</p>
              </div>
              <Link className="text-action" to="/">
                Back to Home
              </Link>
            </Card>
          </PageShell>
        </main>
      </>
    );
  }

  if (totalWords === 0) {
    return (
      <>
        <Header howItWorksHref="/#practice-loop" />
        <main>
          <PageShell className="student-practice-page">
            <Card as="section" className="student-practice__card student-practice__empty">
              <div className="section-heading student-practice__section-heading">
                <p className="eyebrow">Student Practice</p>
                <h1>This practice session has no words yet</h1>
                <p>Choose another list from the homepage to continue.</p>
              </div>
              <Link className="text-action" to="/">
                Back to Home
              </Link>
            </Card>
          </PageShell>
        </main>
      </>
    );
  }

  const currentWordNumber = sessionComplete ? totalWords : Math.min(currentWordIndex + 1, phaseWords.length || totalWords);
  const phaseLabels: Record<SessionPhase, string> = {
    learn: 'Learn',
    practice: 'Practice',
    review: 'Review Mistakes',
    quiz: 'Quick Quiz',
    complete: 'Complete',
  };
  const primaryActionLabel = hasSubmittedCurrentWord
    ? currentWordIndex === phaseWords.length - 1
      ? phase === 'quiz'
        ? 'Finish Session'
        : `Continue to ${phase === 'practice' && reviewWords.length > 0 ? 'Review' : phase === 'review' ? 'Quick Quiz' : 'Next Stage'}`
      : 'Next Word'
    : 'Submit Answer';
  const completionTitle = sessionEndedEarly ? 'Session ended early' : 'Practice complete';
  const completionSummaryMessage = sessionEndedEarly
    ? 'You ended this session before finishing every stage. You can restart when you are ready.'
    : `You finished the learn, practice, review, and quick quiz flow. Quiz score: ${quizCorrectCount} / ${totalWords}.`;
  const completionPrimaryActionLabel = sessionEndedEarly ? 'Restart Session' : 'Show Session Note';
  const completionPrimaryHelperText = sessionEndedEarly
    ? 'Restarting will begin the list again from the first step.'
    : 'This summary now includes the full guided loop instead of a placeholder.';

  return (
    <>
      <Header howItWorksHref="/#practice-loop" />
      <main>
        <PageShell className="student-practice-page">
          <section aria-labelledby="student-practice-title" className="student-practice__intro">
            <p className="eyebrow">Practice stage</p>
            <h1 id="student-practice-title">Student Practice</h1>
            <p className="student-practice__list-name">{activeList.name}</p>
            <p className="student-practice__mode">{phaseLabels[phase]}</p>
          </section>

          <ProgressSummary
            completedCount={completedCount}
            currentWordNumber={currentWordNumber}
            masteredCount={masteredCount}
            phaseLabel={phaseLabels[phase]}
            reviewCount={reviewCount}
            totalWords={phaseWords.length || totalWords}
          />

          {!sessionComplete && !sessionEndedEarly && phase === 'learn' && currentWord ? (
            <Card as="section" className="student-practice__card">
              <div className="section-heading student-practice__section-heading">
                <p className="eyebrow">Learn</p>
                <h2>Study this word before practice</h2>
                <p>Read the prompt and the spelling together once before moving on.</p>
              </div>
              <div className="student-practice__prompt-area">
                <p className="student-practice__prompt-label">Prompt</p>
                <div className="student-practice__prompt">{currentWord.prompt}</div>
              </div>
              <div className="student-practice__learn-word">{currentWord.answer}</div>
              <div className="student-practice__secondary-actions">
                <Button onClick={handleAdvance} type="button">
                  {currentWordIndex === phaseWords.length - 1 ? 'Start Practice' : 'Next Word'}
                </Button>
                <Button onClick={handleEndSession} type="button" variant="ghost">
                  End Session
                </Button>
              </div>
            </Card>
          ) : !sessionComplete && !sessionEndedEarly && currentWord && currentExercise ? (
            <>
              <PracticeCard
                currentInputError={currentInputError}
                currentInputValue={currentInputValue}
                currentPrompt={currentExercise.prompt}
                hasSubmittedCurrentWord={hasSubmittedCurrentWord}
                hintText={currentExercise.hintText}
                inputLabel={currentExercise.inputLabel}
                modeLabel={currentExercise.modeLabel}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                placeholder={currentExercise.placeholder}
                primaryActionLabel={primaryActionLabel}
                title={currentExercise.title}
              />

              <FeedbackPanel
                addedToReview={currentFeedbackState.addedToReview}
                answerComparison={currentFeedbackState.answerComparison}
                correctAnswer={currentFeedbackState.correctAnswer}
                message={currentFeedbackState.message}
                progressMessage={currentFeedbackState.progressMessage}
                status={currentFeedbackState.status}
                submittedAnswer={currentFeedbackState.submittedAnswer}
              />

              <Card as="section" className="student-practice__card student-practice__session-actions">
                <div className="student-practice__secondary-actions">
                  <Button onClick={resetSession} type="button" variant="ghost">
                    Restart Session
                  </Button>
                  <Button onClick={handleEndSession} type="button" variant="ghost">
                    End Session
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <EndSessionPanel
              completedCount={completedCount}
              masteredCount={masteredCount}
              onPrimaryAction={sessionEndedEarly ? resetSession : handleCompletionAction}
              onRestart={resetSession}
              primaryActionHelperText={completionPrimaryHelperText}
              primaryActionLabel={completionPrimaryActionLabel}
              reviewCount={reviewCount}
              reviewWords={reviewWords.map((word) => word.answer)}
              showRestartAction={!sessionEndedEarly}
              summaryMessage={completionSummaryMessage}
              title={completionTitle}
              totalWords={totalWords}
            />
          )}

          {completionActionMessage ? (
            <Card as="section" className="student-practice__card student-practice__completion-message">
              <p className="field-help" role="status" aria-live="polite">
                {completionActionMessage}
              </p>
            </Card>
          ) : null}
        </PageShell>
      </main>
    </>
  );
}
