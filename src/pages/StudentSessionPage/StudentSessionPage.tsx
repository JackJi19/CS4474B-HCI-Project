import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { PracticeMode, PracticeWord, SessionSummaryRecord, SpellingList } from '../../types/spelling';
import { getAllLists, saveSessionSummary } from '../../utils/practiceStorage';
import { EndSessionPanel } from './components/EndSessionPanel';
import { FeedbackPanel } from './components/FeedbackPanel';
import { PracticeCard } from './components/PracticeCard';
import { ProgressSummary } from './components/ProgressSummary';
import './StudentSessionPage.css';

interface StudentSessionRouteState {
  listId?: string;
}

type FeedbackStatus = 'idle' | 'correct' | 'incorrect';
type Stage = 'learn' | 'practice' | 'review' | 'quiz' | 'summary';

interface FeedbackState {
  status: FeedbackStatus;
  submittedAnswer: string;
  correctAnswer: string;
  addedToReview: boolean;
  message: string;
  progressMessage: string;
  comparison?: Array<{ value: string; matches: boolean }>;
  nextStepMessage?: string;
}

const stageOrder: Stage[] = ['learn', 'practice', 'review', 'quiz', 'summary'];

const idleFeedbackState: FeedbackState = {
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

function buildHint(word: PracticeWord) {
  const chunks = word.answer.match(/.{1,3}/g)?.join(' - ') ?? word.answer;
  return `Starts with ${word.answer[0].toUpperCase()}, has ${word.answer.length} letters, and can be chunked as ${chunks}.`;
}

function compareLetters(submittedAnswer: string, correctAnswer: string) {
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

function getModeForStage(stage: Stage, index: number): PracticeMode {
  if (stage === 'quiz' || stage === 'review') {
    return 'type';
  }

  return ['type', 'missing', 'scramble'][index % 3] as PracticeMode;
}

function getStageLabel(stage: Stage) {
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

function getStageDescription(stage: Stage) {
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

function getNextStepLabel(stage: Stage, reviewCount: number) {
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

function getPromptContent(stage: Stage, mode: PracticeMode, word: PracticeWord) {
  if (stage === 'learn') {
    return {
      promptLabel: 'Study word',
      prompt: word.answer,
      instruction: 'Take a moment to study the spelling, then move to the next word when you are ready.',
      inputLabel: '',
      inputPlaceholder: '',
      inputHelpText: '',
      expectedAnswer: word.answer,
      supportPanel: word.prompt,
      showInput: false,
    };
  }

  if (mode === 'missing') {
    const missing = buildMissingPattern(word.answer);
    return {
      promptLabel: 'Complete the pattern',
      prompt: missing.pattern,
      instruction: 'Enter only the missing letters in order.',
      inputLabel: 'Missing letters',
      inputPlaceholder: 'Type the missing letters',
      inputHelpText: 'Use the visible pattern to reconstruct the word.',
      expectedAnswer: missing.expectedMissingLetters,
      supportPanel: word.prompt,
      showInput: true,
    };
  }

  if (mode === 'scramble') {
    return {
      promptLabel: 'Unscramble the letters',
      prompt: shuffleWord(word.answer),
      instruction: 'Unscramble the letters and type the full word.',
      inputLabel: 'Unscrambled word',
      inputPlaceholder: 'Type the full word',
      inputHelpText: 'Use the letter order clue and the prompt to reconstruct the spelling.',
      expectedAnswer: word.answer,
      supportPanel: word.prompt,
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
    supportPanel: null as string | null,
    showInput: true,
  };
}

export function StudentSessionPage() {
  const location = useLocation();
  const routeState = (location.state as StudentSessionRouteState | null) ?? null;
  const activeList = useMemo<SpellingList | null>(() => {
    const lists = getAllLists();
    return lists.find((list) => list.id === routeState?.listId) ?? null;
  }, [routeState?.listId]);

  const totalWords = activeList?.practiceWords.length ?? 0;
  const initialStage: Stage = activeList?.settings?.startingMode === 'mixed-practice' ? 'practice' : 'learn';

  const [stage, setStage] = useState<Stage>(initialStage);
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

  const currentQueue = useMemo(() => {
    if (!activeList) {
      return [];
    }

    switch (stage) {
      case 'learn':
        return activeList.practiceWords;
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

  const currentWord = currentQueue[stageIndex] ?? null;
  const currentMode = currentWord ? getModeForStage(stage, stageIndex) : 'type';
  const completedCount = stage === 'learn' ? stageIndex : stage === 'summary' ? totalWords : Math.min(stageIndex, totalWords);
  const activeStageIndex = stageOrder.indexOf(stage === 'summary' ? 'summary' : stage);
  const currentWordNumber = stage === 'summary' ? totalWords : Math.min(stageIndex + 1, Math.max(currentQueue.length, 1));
  const nextStepLabel = getNextStepLabel(stage, reviewWordIds.length);
  const quickQuizScore = currentQueue.length > 0 && stage === 'summary'
    ? Math.round((quizCorrectCount / Math.min(totalWords, 5)) * 100)
    : Math.round((quizCorrectCount / Math.max(Math.min(totalWords, 5), 1)) * 100);

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
  }, [activeList, hasSavedSummary, masteredWordIds.length, missCounts, quickQuizScore, reviewWordIds.length, sessionEndedEarly, stage, totalWords]);

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

    if (stageIndex < currentQueue.length - 1) {
      setStageIndex((currentValue) => currentValue + 1);
      return;
    }

    if (stage === 'learn') {
      setStage('practice');
      setStageIndex(0);
      return;
    }

    if (stage === 'practice') {
      setStage(reviewWordIds.length > 0 ? 'review' : 'quiz');
      setStageIndex(0);
      return;
    }

    if (stage === 'review') {
      setStage('quiz');
      setStageIndex(0);
      return;
    }

    if (stage === 'quiz') {
      setStage('summary');
      setStageIndex(0);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeList || !currentWord) {
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

    const promptContent = getPromptContent(stage, currentMode, currentWord);
    const normalizedAnswer = currentInputValue.trim();

    if (!normalizedAnswer) {
      setCurrentInputError(stage === 'practice' && currentMode === 'missing' ? 'Enter the missing letters before continuing.' : 'Enter your answer before continuing.');
      return;
    }

    const isCorrect = normalizedAnswer.toLowerCase() === promptContent.expectedAnswer.toLowerCase();
    const alreadyInReview = reviewWordIds.includes(currentWord.id);

    setHasSubmittedCurrentWord(true);

    if (isCorrect) {
      if (stage !== 'quiz' && !masteredWordIds.includes(currentWord.id)) {
        setMasteredWordIds((currentValue) => [...currentValue, currentWord.id]);
      }

      if (stage === 'quiz') {
        setQuizCorrectCount((currentValue) => currentValue + 1);
      }

      setCurrentFeedbackState({
        status: 'correct',
        submittedAnswer: normalizedAnswer,
        correctAnswer: currentWord.answer,
        addedToReview: false,
        message: `Good work. "${currentWord.answer}" is correct.`,
        progressMessage: `You have completed ${Math.min(stageIndex + 1, currentQueue.length)} of ${currentQueue.length} words in ${getStageLabel(stage)}.`,
        comparison: compareLetters(currentMode === 'missing' ? promptContent.expectedAnswer : normalizedAnswer, promptContent.expectedAnswer),
        nextStepMessage: stageIndex === currentQueue.length - 1 ? `Move to ${getNextStepLabel(stage, reviewWordIds.length)}.` : 'Continue to the next word.',
      });
      return;
    }

    if (stage !== 'quiz') {
      setMissCounts((currentValue) => ({
        ...currentValue,
        [currentWord.id]: (currentValue[currentWord.id] ?? 0) + 1,
      }));

      if (!alreadyInReview) {
        setReviewWordIds((currentValue) => [...currentValue, currentWord.id]);
      }
    }

    setCurrentFeedbackState({
      status: 'incorrect',
      submittedAnswer: normalizedAnswer,
      correctAnswer: currentWord.answer,
      addedToReview: stage !== 'quiz' && !alreadyInReview,
      message: currentMode === 'missing'
        ? `Those letters do not complete the word correctly yet.`
        : `"${normalizedAnswer}" is not the correct spelling for this prompt.`,
      progressMessage: `You have completed ${Math.min(stageIndex + 1, currentQueue.length)} of ${currentQueue.length} words in ${getStageLabel(stage)}.`,
      comparison: compareLetters(currentMode === 'missing' ? normalizedAnswer : normalizedAnswer, promptContent.expectedAnswer),
      nextStepMessage: stage === 'quiz' ? 'Finish the quiz, then review the summary.' : 'Continue and this word will remain visible in Review Mistakes.',
    });
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

  const promptContent = currentWord ? getPromptContent(stage, currentMode, currentWord) : null;
  const primaryActionLabel = stage === 'learn'
    ? stageIndex === currentQueue.length - 1
      ? 'Begin Practice'
      : 'Next Study Word'
    : hasSubmittedCurrentWord
      ? stageIndex === currentQueue.length - 1
        ? `Go to ${getNextStepLabel(stage, reviewWordIds.length)}`
        : 'Next Word'
      : 'Submit Answer';

  const stageEyebrow = stage === 'learn' ? 'Learn stage' : stage === 'practice' ? `${getStageLabel(stage)} - ${currentMode}` : getStageLabel(stage);
  const title = stage === 'learn'
    ? 'Study the word before you practice'
    : stage === 'review'
      ? 'Review a missed word'
      : stage === 'quiz'
        ? 'Quick Quiz'
        : currentMode === 'missing'
          ? 'Fill in the missing letters'
          : currentMode === 'scramble'
            ? 'Unscramble the word'
            : 'Spell this word';

  return (
    <>
      <Header howItWorksHref="/#practice-loop" />
      <main>
        <PageShell className="student-practice-page">
          <section aria-labelledby="student-practice-title" className="student-practice__intro">
            <p className="eyebrow">Guided student flow</p>
            <h1 id="student-practice-title">Student Practice</h1>
            <p className="student-practice__list-name">{activeList.name}</p>
            <p className="student-practice__mode">{getStageLabel(stage)}{stage === 'practice' ? ` - ${currentMode}` : ''}</p>
          </section>

          <ProgressSummary
            activeStageIndex={activeStageIndex}
            completedCount={completedCount}
            currentWordNumber={currentWordNumber}
            masteredCount={masteredWordIds.length}
            nextStepLabel={nextStepLabel}
            reviewCount={reviewWordIds.length}
            stageDescription={getStageDescription(stage)}
            stageLabel={getStageLabel(stage)}
            stageOrder={stageOrder.map((item) => getStageLabel(item))}
            totalWords={currentQueue.length || totalWords}
          />

          {stage !== 'summary' && currentWord && promptContent ? (
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
                    <p className="student-practice__support-copy">{currentWord.prompt}</p>
                    {activeList.settings?.hintSupport ? (
                      <p className="student-practice__hint">Hint: {buildHint(currentWord)}</p>
                    ) : null}
                  </>
                }
                title={title}
              />

              <FeedbackPanel
                addedToReview={currentFeedbackState.addedToReview}
                comparison={currentFeedbackState.comparison}
                correctAnswer={currentFeedbackState.correctAnswer}
                message={currentFeedbackState.message}
                nextStepMessage={currentFeedbackState.nextStepMessage}
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
              completedCount={sessionEndedEarly ? stageIndex : totalWords}
              masteredCount={masteredWordIds.length}
              onRestart={resetSession}
              quickQuizScore={quickQuizScore}
              recommendedNextStep={reviewWordIds.length > 0 ? 'Restart the session and focus on the review words.' : 'Return to Home or create another list.'}
              reviewCount={reviewWordIds.length}
              reviewWords={reviewWords.map((word) => word.answer)}
              summaryMessage={sessionEndedEarly ? 'The session was ended before all stages were completed.' : 'The full guided loop is complete. Use the summary below to decide what to do next.'}
              title={sessionEndedEarly ? 'Session ended early' : 'Practice complete'}
              totalWords={totalWords}
            />
          )}
        </PageShell>
      </main>
    </>
  );
}
