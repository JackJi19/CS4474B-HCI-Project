import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { mockLists } from '../../data/mockLists';
import type { PracticeWord } from '../../types/spelling';
import { EndSessionPanel } from './components/EndSessionPanel';
import { FeedbackPanel } from './components/FeedbackPanel';
import { PracticeCard } from './components/PracticeCard';
import { ProgressSummary } from './components/ProgressSummary';
import './StudentSessionPage.css';

interface StudentSessionRouteState {
  listId?: string;
}

type FeedbackStatus = 'idle' | 'correct' | 'incorrect';

interface FeedbackState {
  status: FeedbackStatus;
  submittedAnswer: string;
  correctAnswer: string;
  addedToReview: boolean;
  message: string;
  progressMessage: string;
}

const idleFeedbackState: FeedbackState = {
  status: 'idle',
  submittedAnswer: '',
  correctAnswer: '',
  addedToReview: false,
  message: '',
  progressMessage: '',
};

export function StudentSessionPage() {
  const actionPhaseRef = useRef<'ready' | 'locking-after-submit' | 'submitted' | 'transitioning'>(
    'ready',
  );
  const location = useLocation();
  const routeState = (location.state as StudentSessionRouteState | null) ?? null;
  const activeList = mockLists.find((list) => list.id === routeState?.listId) ?? null;
  const totalWords = activeList?.practiceWords.length ?? 0;

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [currentInputError, setCurrentInputError] = useState('');
  const [hasSubmittedCurrentWord, setHasSubmittedCurrentWord] = useState(false);
  const [currentFeedbackState, setCurrentFeedbackState] = useState<FeedbackState>(idleFeedbackState);
  const [masteredCount, setMasteredCount] = useState(0);
  const [reviewWords, setReviewWords] = useState<PracticeWord[]>([]);
  const [completedWordIndexes, setCompletedWordIndexes] = useState<number[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionEndedEarly, setSessionEndedEarly] = useState(false);
  const [completionActionMessage, setCompletionActionMessage] = useState('');

  const currentWord = activeList?.practiceWords[currentWordIndex] ?? null;
  const reviewCount = reviewWords.length;

  useEffect(() => {
    if (sessionComplete || sessionEndedEarly) {
      actionPhaseRef.current = 'ready';
      return;
    }

    actionPhaseRef.current = hasSubmittedCurrentWord ? 'submitted' : 'ready';
  }, [currentWordIndex, hasSubmittedCurrentWord, sessionComplete, sessionEndedEarly]);

  const resetSession = () => {
    actionPhaseRef.current = 'ready';
    setCurrentWordIndex(0);
    setCurrentInputValue('');
    setCurrentInputError('');
    setHasSubmittedCurrentWord(false);
    setCurrentFeedbackState(idleFeedbackState);
    setMasteredCount(0);
    setReviewWords([]);
    setCompletedWordIndexes([]);
    setSessionComplete(false);
    setSessionEndedEarly(false);
    setCompletionActionMessage('');
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

  const handleAdvance = () => {
    setCompletionActionMessage('');

    if (!activeList) {
      actionPhaseRef.current = 'ready';
      return;
    }

    if (currentWordIndex >= activeList.practiceWords.length - 1) {
      setSessionComplete(true);
      setHasSubmittedCurrentWord(false);
      return;
    }

    setCurrentWordIndex((currentIndex) => currentIndex + 1);
    setCurrentInputValue('');
    setCurrentInputError('');
    setHasSubmittedCurrentWord(false);
    setCurrentFeedbackState(idleFeedbackState);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeList || !currentWord || sessionComplete || sessionEndedEarly) {
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
      setCurrentInputError('Enter your spelling before submitting.');
      return;
    }

    const isCorrect = normalizedAnswer.toLowerCase() === currentWord.answer.toLowerCase();
    const alreadyInReview = reviewWords.some((word) => word.id === currentWord.id);
    const nextCompletedIndexes = completedWordIndexes.includes(currentWordIndex)
      ? completedWordIndexes
      : [...completedWordIndexes, currentWordIndex];

    actionPhaseRef.current = 'locking-after-submit';
    setCurrentInputError('');
    setHasSubmittedCurrentWord(true);
    setCompletedWordIndexes(nextCompletedIndexes);

    if (isCorrect) {
      setMasteredCount((currentCount) => currentCount + 1);
      setCurrentFeedbackState({
        status: 'correct',
        submittedAnswer: normalizedAnswer,
        correctAnswer: currentWord.answer,
        addedToReview: false,
        message: `"${currentWord.answer}" is correct. This word is marked as mastered.`,
        progressMessage: `You have completed ${nextCompletedIndexes.length} of ${activeList.practiceWords.length} words.`,
      });
      return;
    }

    if (!alreadyInReview) {
      setReviewWords((currentReviewWords) => [...currentReviewWords, currentWord]);
    }

    setCurrentFeedbackState({
      status: 'incorrect',
      submittedAnswer: normalizedAnswer,
      correctAnswer: currentWord.answer,
      addedToReview: !alreadyInReview,
      message: `"${normalizedAnswer}" is not the correct spelling for this prompt.`,
      progressMessage: `You have completed ${nextCompletedIndexes.length} of ${activeList.practiceWords.length} words.`,
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
        'Review Missed Words is the next phase. For now, your missed words are listed here so the follow-up step is visible.',
      );
      return;
    }

    setCompletionActionMessage(
      'Quick Quiz comes next in a later phase. This placeholder keeps the next step visible without adding more screens yet.',
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

  const currentWordNumber = sessionComplete
    ? totalWords
    : Math.min(currentWordIndex + 1, totalWords);
  const primaryActionLabel = hasSubmittedCurrentWord
    ? currentWordIndex === totalWords - 1
      ? 'Finish Practice'
      : 'Next Word'
    : 'Submit Answer';
  const completedCount = completedWordIndexes.length;
  const completionTitle = sessionEndedEarly ? 'Session ended early' : 'Practice complete';
  const completionSummaryMessage = sessionEndedEarly
    ? 'You ended this session before finishing every word. You can restart when you are ready.'
    : 'You have finished this round of Type the Word practice.';
  const completionPrimaryActionLabel = sessionEndedEarly
    ? 'Restart Session'
    : reviewWords.length > 0
      ? 'Review Missed Words'
      : 'Continue to Quick Quiz';
  const completionPrimaryHelperText = sessionEndedEarly
    ? 'Restarting will begin the list again from the first word.'
    : reviewWords.length > 0
      ? 'Review is the next step because some words were added to your review list.'
      : 'No words were added to review, so the next step would be a quick quiz.';

  return (
    <>
      <Header howItWorksHref="/#practice-loop" />
      <main>
        <PageShell className="student-practice-page">
          <section aria-labelledby="student-practice-title" className="student-practice__intro">
            <p className="eyebrow">Practice stage</p>
            <h1 id="student-practice-title">Student Practice</h1>
            <p className="student-practice__list-name">{activeList.name}</p>
            <p className="student-practice__mode">Type the Word</p>
          </section>

          <ProgressSummary
            completedCount={completedCount}
            currentWordNumber={currentWordNumber}
            masteredCount={masteredCount}
            reviewCount={reviewCount}
            totalWords={totalWords}
          />

          {!sessionComplete && !sessionEndedEarly && currentWord ? (
            <>
              <PracticeCard
                currentInputError={currentInputError}
                currentInputValue={currentInputValue}
                currentPrompt={currentWord.prompt}
                hasSubmittedCurrentWord={hasSubmittedCurrentWord}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                primaryActionLabel={primaryActionLabel}
              />

              <FeedbackPanel
                addedToReview={currentFeedbackState.addedToReview}
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
