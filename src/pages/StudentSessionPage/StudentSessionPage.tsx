import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { SessionSummaryRecord, SpellingList } from '../../types/spelling';
import { getAllLists, saveSessionSummary } from '../../utils/practiceStorage';
import { EndSessionPanel } from './components/EndSessionPanel';
import { FeedbackPanel } from './components/FeedbackPanel';
import { PracticeCard } from './components/PracticeCard';
import { ProgressSummary } from './components/ProgressSummary';
import { evaluateStudentAnswer } from './studentSessionEvaluation';
import {
  buildStudentHint,
  getStudentModeLabel,
  getNextStudentStage,
  getPracticeModeForStage,
  getStudentStageHeading,
  getStudentNextStepLabel,
  getStudentPracticeTitle,
  getStudentPrimaryActionLabel,
  getStudentPromptContent,
  getStudentStageDescription,
  getStudentStageEyebrow,
  getStudentStageStepLabel,
  idleFeedbackState,
  studentSessionStageOrder,
} from './studentSessionFlow';
import type { FeedbackState, SessionStage } from './studentSession.types';
import './StudentSessionPage.css';

interface StudentSessionRouteState {
  listId?: string;
}

export function StudentSessionPage() {
  const location = useLocation();
  const routeState = (location.state as StudentSessionRouteState | null) ?? null;
  const activeList = useMemo<SpellingList | null>(() => {
    const lists = getAllLists();
    return lists.find((list) => list.id === routeState?.listId) ?? null;
  }, [routeState?.listId]);

  const totalWords = activeList?.practiceWords.length ?? 0;
  const initialStage: SessionStage =
    activeList?.settings?.startingMode === 'mixed-practice' ? 'practice' : 'learn';

  const [stage, setStage] = useState<SessionStage>(initialStage);
  const [stageIndex, setStageIndex] = useState(0);
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [currentInputError, setCurrentInputError] = useState('');
  const [hasSubmittedCurrentWord, setHasSubmittedCurrentWord] = useState(false);
  const [currentFeedbackState, setCurrentFeedbackState] = useState<FeedbackState>(idleFeedbackState);
  const [masteredWordIds, setMasteredWordIds] = useState<string[]>([]);
  const [reviewWordIds, setReviewWordIds] = useState<string[]>([]);
  const [missCounts, setMissCounts] = useState<Record<string, number>>({});
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [sessionEndedEarly, setSessionEndedEarly] = useState(false);
  const [hasSavedSummary, setHasSavedSummary] = useState(false);

  useEffect(() => {
    setStage(initialStage);
  }, [initialStage]);

  const reviewWords = useMemo(() => {
    if (!activeList) {
      return [];
    }

    return activeList.practiceWords.filter((word) => reviewWordIds.includes(word.id));
  }, [activeList, reviewWordIds]);

  const stageWords = useMemo(() => {
    if (!activeList) {
      return [];
    }

    switch (stage) {
      case 'learn':
      case 'practice':
        return activeList.practiceWords;
      case 'review':
        return reviewWords;
      case 'quiz':
        return activeList.practiceWords.slice(0, Math.min(activeList.practiceWords.length, 5));
      default:
        return [];
    }
  }, [activeList, reviewWords, stage]);

  const activeWord = stageWords[stageIndex] ?? null;
  const practiceMode = activeWord ? getPracticeModeForStage(stage, stageIndex) : 'type';
  const stageHeading = getStudentStageHeading(stage);
  const stageDescription = getStudentStageDescription(stage);
  const nextStepLabel = getStudentNextStepLabel(stage, reviewWordIds.length);
  const activeStageIndex = studentSessionStageOrder.indexOf(stage);
  const completedCount =
    stage === 'learn' ? stageIndex : stage === 'summary' ? totalWords : Math.min(stageIndex, totalWords);
  const currentWordNumber =
    stage === 'summary' ? totalWords : Math.min(stageIndex + 1, Math.max(stageWords.length, 1));
  const quickQuizScore = Math.round(
    (quizCorrectCount / Math.max(Math.min(totalWords, 5), 1)) * 100,
  );

  const resetSession = () => {
    setStage(initialStage);
    setStageIndex(0);
    setCurrentInputValue('');
    setCurrentInputError('');
    setHasSubmittedCurrentWord(false);
    setCurrentFeedbackState(idleFeedbackState);
    setMasteredWordIds([]);
    setReviewWordIds([]);
    setMissCounts({});
    setQuizCorrectCount(0);
    setSessionEndedEarly(false);
    setHasSavedSummary(false);
  };

  useEffect(() => {
    if (!activeList || stage !== 'summary' || sessionEndedEarly || hasSavedSummary) {
      return;
    }

    const sortedMisses = [...activeList.practiceWords]
      .sort((a, b) => (missCounts[b.id] ?? 0) - (missCounts[a.id] ?? 0))
      .filter((word) => (missCounts[word.id] ?? 0) > 0)
      .slice(0, 3)
      .map((word) => word.answer);

    const summary: SessionSummaryRecord = {
      id: `${activeList.id}-${Date.now()}`,
      listId: activeList.id,
      listName: activeList.name,
      accessCode: activeList.accessCode,
      completedAt: new Date().toISOString(),
      totalWords,
      masteredCount: masteredWordIds.length,
      reviewCount: reviewWordIds.length,
      quickQuizScore,
      mostMissedWords: sortedMisses,
    };

    saveSessionSummary(summary);
    setHasSavedSummary(true);
  }, [
    activeList,
    hasSavedSummary,
    masteredWordIds.length,
    missCounts,
    quickQuizScore,
    reviewWordIds.length,
    sessionEndedEarly,
    stage,
    totalWords,
  ]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (hasSubmittedCurrentWord || stage === 'learn' || stage === 'summary') {
      return;
    }

    setCurrentInputValue(event.target.value);
    if (currentInputError) {
      setCurrentInputError('');
    }
  };

  const moveToNextStageOrWord = () => {
    setCurrentInputValue('');
    setCurrentInputError('');
    setHasSubmittedCurrentWord(false);
    setCurrentFeedbackState(idleFeedbackState);

    if (stageIndex < stageWords.length - 1) {
      setStageIndex((currentValue) => currentValue + 1);
      return;
    }

    setStage(getNextStudentStage(stage, reviewWordIds.length));
    setStageIndex(0);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeWord) {
      return;
    }

    if (stage === 'learn') {
      moveToNextStageOrWord();
      return;
    }

    if (hasSubmittedCurrentWord) {
      moveToNextStageOrWord();
      return;
    }

    const promptContent = getStudentPromptContent(stage, practiceMode, activeWord);
    const submission = evaluateStudentAnswer({
      stage,
      practiceMode,
      rawAnswer: currentInputValue,
      expectedAnswer: promptContent.expectedAnswer,
      correctAnswer: activeWord.answer,
      currentWordId: activeWord.id,
      queueLength: stageWords.length,
      stageIndex,
      reviewWordIds,
      masteredWordIds,
    });

    if (submission.kind === 'invalid') {
      setCurrentInputError(submission.errorMessage);
      return;
    }

    setHasSubmittedCurrentWord(true);

    if (submission.shouldMarkMastered) {
      setMasteredWordIds((currentValue) => [...currentValue, activeWord.id]);
    }

    if (submission.shouldIncrementQuizScore) {
      setQuizCorrectCount((currentValue) => currentValue + 1);
    }

    if (submission.shouldIncrementMissCount) {
      setMissCounts((currentValue) => ({
        ...currentValue,
        [activeWord.id]: (currentValue[activeWord.id] ?? 0) + 1,
      }));
    }

    if (submission.shouldAddToReview) {
      setReviewWordIds((currentValue) => [...currentValue, activeWord.id]);
    }

    setCurrentFeedbackState(submission.feedback);
  };

  const handleEndSession = () => {
    setSessionEndedEarly(true);
    setStage('summary');
    setStageIndex(0);
    setCurrentInputValue('');
    setCurrentInputError('');
    setHasSubmittedCurrentWord(false);
    setCurrentFeedbackState(idleFeedbackState);
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

  const promptContent = activeWord ? getStudentPromptContent(stage, practiceMode, activeWord) : null;
  const primaryActionLabel = getStudentPrimaryActionLabel({
    stage,
    stageIndex,
    stageWordCount: stageWords.length,
    hasSubmittedCurrentWord,
    reviewCount: reviewWordIds.length,
  });
  const stageEyebrow = getStudentStageEyebrow({ stage, practiceMode });
  const title = getStudentPracticeTitle({ stage, practiceMode });
  const modeLabel = getStudentModeLabel(practiceMode);

  return (
    <>
      <Header howItWorksHref="/#practice-loop" />
      <main>
        <PageShell className="student-practice-page">
          <section aria-labelledby="student-practice-title" className="student-practice__intro">
            <p className="eyebrow">Guided student flow</p>
            <h1 id="student-practice-title">Student Practice</h1>
            <p className="student-practice__list-name">{activeList.name}</p>
            <p className="student-practice__mode">
              {stageHeading}
              {stage === 'practice' ? ` - ${modeLabel}` : ''}
            </p>
          </section>

          <ProgressSummary
            activeStageIndex={activeStageIndex}
            completedCount={completedCount}
            currentWordNumber={currentWordNumber}
            masteredCount={masteredWordIds.length}
            nextStepLabel={nextStepLabel}
            reviewCount={reviewWordIds.length}
            stageDescription={stageDescription}
            stageLabel={stageHeading}
            stageOrder={studentSessionStageOrder.map((item) => getStudentStageStepLabel(item))}
            totalWords={stageWords.length || totalWords}
          />

          {stage !== 'summary' && activeWord && promptContent ? (
            <>
              <PracticeCard
                currentInputError={currentInputError}
                currentInputValue={currentInputValue}
                eyebrow={stageEyebrow}
                hasSubmittedCurrentWord={hasSubmittedCurrentWord}
                inputHelpText={promptContent.inputHelpText}
                inputLabel={promptContent.inputLabel}
                inputPlaceholder={promptContent.inputPlaceholder}
                instruction={promptContent.instruction}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                primaryActionLabel={primaryActionLabel}
                prompt={promptContent.prompt}
                promptLabel={promptContent.promptLabel}
                showInput={promptContent.showInput}
                supportPanel={
                  <>
                    <p className="student-practice__support-label">Meaning or clue</p>
                    <p className="student-practice__support-copy">{activeWord.prompt}</p>
                    {activeList.settings?.hintSupport ? (
                      <p className="student-practice__hint">Hint: {buildStudentHint(activeWord)}</p>
                    ) : null}
                  </>
                }
                title={title}
              />

              <FeedbackPanel
                comparison={currentFeedbackState.comparison}
                correctAnswer={currentFeedbackState.correctAnswer}
                message={currentFeedbackState.message}
                nextStepMessage={currentFeedbackState.nextStepMessage}
                progressMessage={currentFeedbackState.progressMessage}
                reviewMessage={currentFeedbackState.reviewMessage}
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
              completedCount={sessionEndedEarly ? stageIndex : totalWords}
              masteredCount={masteredWordIds.length}
              onRestart={resetSession}
              quickQuizScore={quickQuizScore}
              recommendedNextStep={
                reviewWordIds.length > 0
                  ? 'Restart this session to practice the words still in review.'
                  : 'Return Home or move on to another list.'
              }
              reviewCount={reviewWordIds.length}
              reviewWords={reviewWords.map((word) => word.answer)}
              summaryMessage={
                sessionEndedEarly
                  ? 'This session ended before the full practice loop was complete. Restart the session to begin again.'
                  : reviewWordIds.length > 0
                    ? 'This session is complete. Some words are still in review, so the next step is to practice those words again.'
                    : 'This session is complete. You mastered the full set, so the next step is to return home or move on to another list.'
              }
              title="Session Summary"
              totalWords={totalWords}
            />
          )}
        </PageShell>
      </main>
    </>
  );
}
