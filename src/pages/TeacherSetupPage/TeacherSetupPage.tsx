import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { buildWordInputFromList, parseWordList } from '../../utils/listParsing';
import { getSessionSummaries, saveCustomList } from '../../utils/practiceStorage';
import type { StartingPracticeMode } from '../../types/spelling';
import { ParsedReviewList } from './components/ParsedReviewList';
import { StepIndicator } from './components/StepIndicator';
import { SuccessPanel } from './components/SuccessPanel';
import { TeacherSummaryPanel } from './components/TeacherSummaryPanel';
import './TeacherSetupPage.css';

interface SetupOptions {
  startingMode: StartingPracticeMode;
  hintSupport: boolean;
}

interface SuccessState {
  sessionName: string;
  wordCount: number;
  setupOptions: SetupOptions;
}

const setupSteps = ['Enter List', 'Review List', 'Choose Options', 'Generate Access Code'];
const minimumWordCount = 3;

const defaultSetupOptions: SetupOptions = {
  startingMode: 'learn-first',
  hintSupport: true,
};

const practiceModeLabels: Record<StartingPracticeMode, string> = {
  'learn-first': 'Learn first',
  'mixed-practice': 'Mixed practice',
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function TeacherSetupPage() {
  const generationLockedRef = useRef(false);
  const [sessionName, setSessionName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [rawWordInput, setRawWordInput] = useState('');
  const [parsedWords, setParsedWords] = useState<string[]>([]);
  const [removedDuplicateCount, setRemovedDuplicateCount] = useState(0);
  const [ignoredInvalidCount, setIgnoredInvalidCount] = useState(0);
  const [setupOptions, setSetupOptions] = useState<SetupOptions>(defaultSetupOptions);
  const [validationError, setValidationError] = useState('');
  const [successState, setSuccessState] = useState<SuccessState | null>(null);
  const [generatedAccessCode, setGeneratedAccessCode] = useState('');
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);

  const recentSessions = useMemo(() => getSessionSummaries(), [summaryRefreshKey]);

  const syncParsedState = (nextRawWordInput: string) => {
    const result = parseWordList(nextRawWordInput);
    setRawWordInput(nextRawWordInput);
    setParsedWords(result.parsedWords);
    setRemovedDuplicateCount(result.removedDuplicateCount);
    setIgnoredInvalidCount(result.ignoredInvalidCount);
    return result;
  };

  const clearFeedbackState = () => {
    generationLockedRef.current = false;
    setValidationError('');
    setSuccessState(null);
    setGeneratedAccessCode('');
  };

  const handleListInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    clearFeedbackState();
    syncParsedState(event.target.value);
  };

  const handleSessionNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    clearFeedbackState();
    setSessionName(event.target.value);
  };

  const handleTeacherNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    clearFeedbackState();
    setTeacherName(event.target.value);
  };

  const handleStartingModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    clearFeedbackState();
    setSetupOptions((currentOptions) => ({
      ...currentOptions,
      startingMode: event.target.value as StartingPracticeMode,
    }));
  };

  const handleHintSupportChange = (event: ChangeEvent<HTMLInputElement>) => {
    clearFeedbackState();
    setSetupOptions((currentOptions) => ({
      ...currentOptions,
      hintSupport: event.target.checked,
    }));
  };

  const handleRemoveWord = (indexToRemove: number) => {
    clearFeedbackState();
    const nextParsedWords = parsedWords.filter((_, index) => index !== indexToRemove);
    setRawWordInput(buildWordInputFromList(nextParsedWords));
    setParsedWords(nextParsedWords);
    setRemovedDuplicateCount(0);
    setIgnoredInvalidCount(0);
  };

  const handleClearList = () => {
    generationLockedRef.current = false;
    setRawWordInput('');
    setParsedWords([]);
    setRemovedDuplicateCount(0);
    setIgnoredInvalidCount(0);
    setValidationError('');
    setSuccessState(null);
    setGeneratedAccessCode('');
  };

  const handleStartAnotherList = () => {
    setSessionName('');
    setTeacherName('');
    setSetupOptions(defaultSetupOptions);
    handleClearList();
  };

  const handleGenerateAccessCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (successState || generationLockedRef.current) {
      return;
    }

    const parsedResult = syncParsedState(rawWordInput);

    if (!rawWordInput.trim()) {
      setValidationError('Enter your spelling list before generating the student access code.');
      return;
    }

    if (parsedResult.parsedWords.length < minimumWordCount) {
      setValidationError(
        `Add at least ${minimumWordCount} valid words to generate the student access code.`,
      );
      return;
    }

    generationLockedRef.current = true;
    const accessCode = `SPS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    saveCustomList({
      sessionName,
      teacherName,
      accessCode,
      words: parsedResult.parsedWords,
      settings: setupOptions,
    });

    setGeneratedAccessCode(accessCode);
    setValidationError('');
    setSuccessState({
      sessionName: sessionName.trim() || 'Untitled list',
      wordCount: parsedResult.parsedWords.length,
      setupOptions: {
        ...setupOptions,
      },
    });
    setSummaryRefreshKey((currentValue) => currentValue + 1);
  };

  const reviewSummary =
    parsedWords.length > 0 ? `${pluralize(parsedWords.length, 'word')} ready` : 'No words ready yet';

  const reviewEmptyMessage = rawWordInput.trim()
    ? 'No valid words are ready yet. Add one word per line to build the practice list.'
    : 'Paste or type words above to preview the cleaned list here.';

  const actionHelperText = successState
    ? 'This session is saved locally. Students can now open Student Practice with the access code or list name.'
    : parsedWords.length >= minimumWordCount
      ? `${pluralize(parsedWords.length, 'word')} ready for Student Practice.`
      : `Add at least ${minimumWordCount} valid words to generate the student access code.`;

  return (
    <>
      <Header howItWorksHref="/#practice-loop" />
      <main>
        <PageShell className="teacher-setup-page">
          <section aria-labelledby="teacher-setup-title" className="teacher-setup__intro">
            <p className="eyebrow">Teacher Setup</p>
            <h1 id="teacher-setup-title">Teacher Setup</h1>
            <p className="teacher-setup__summary">
              Create a spelling session in one guided pass: enter the list, review the cleaned
              words, choose lightweight options, and generate the student access code.
            </p>
            <Link className="teacher-setup__back-link" to="/">
              Back to Home
            </Link>
          </section>

          <StepIndicator steps={setupSteps} />

          <form className="teacher-setup__form" noValidate onSubmit={handleGenerateAccessCode}>
            <Card
              as="section"
              aria-labelledby="teacher-setup-list-entry-title"
              className="teacher-setup__card"
            >
              <div className="section-heading teacher-setup__section-heading">
                <p className="eyebrow">List entry</p>
                <h2 id="teacher-setup-list-entry-title">Enter your spelling list</h2>
                <p>Type or paste one word per line. Blank lines and duplicates are cleaned up in Review List.</p>
              </div>

              <div className="teacher-setup__field-grid">
                <div className="field-group">
                  <label className="field-label" htmlFor="teacher-session-name">
                    Session or list name <span className="teacher-setup__optional">(optional)</span>
                  </label>
                  <Input
                    id="teacher-session-name"
                    name="teacher-session-name"
                    onChange={handleSessionNameChange}
                    placeholder="Example: Week 4 Sound Patterns"
                    value={sessionName}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="teacher-name">
                    Teacher name <span className="teacher-setup__optional">(optional)</span>
                  </label>
                  <Input
                    id="teacher-name"
                    name="teacher-name"
                    onChange={handleTeacherNameChange}
                    placeholder="Example: Ms. Patel"
                    value={teacherName}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="teacher-word-list">
                    Spelling words
                  </label>
                  <textarea
                    aria-describedby="teacher-word-list-help"
                    className="input teacher-setup__textarea"
                    id="teacher-word-list"
                    name="teacher-word-list"
                    onChange={handleListInputChange}
                    placeholder={'forest\nbranch\nstream\nmountain'}
                    rows={10}
                    value={rawWordInput}
                  />
                  <p className="field-help" id="teacher-word-list-help">
                    Paste-first is fine. Blank lines are ignored and duplicates are removed automatically.
                  </p>
                </div>
              </div>
            </Card>

            <Card
              as="section"
              aria-labelledby="teacher-setup-review-title"
              className="teacher-setup__card"
            >
              <div className="teacher-setup__review-header">
                <div className="section-heading teacher-setup__section-heading">
                  <p className="eyebrow">Review</p>
                  <h2 id="teacher-setup-review-title">Review your list</h2>
                  <p>Check the cleaned list before you generate the student access code.</p>
                </div>
                <p aria-live="polite" className="teacher-setup__review-count">
                  {reviewSummary}
                </p>
              </div>

              <div aria-live="polite" className="teacher-setup__notice-list">
                {removedDuplicateCount > 0 ? (
                  <p className="teacher-setup__notice">
                    Removed {pluralize(removedDuplicateCount, 'duplicate')} from the review list.
                  </p>
                ) : null}
                {ignoredInvalidCount > 0 ? (
                  <p className="teacher-setup__notice">
                    Ignored {pluralize(ignoredInvalidCount, 'empty or invalid line', 'empty or invalid lines')}.
                  </p>
                ) : null}
              </div>

              <ParsedReviewList emptyMessage={reviewEmptyMessage} onRemoveWord={handleRemoveWord} words={parsedWords} />
            </Card>

            <Card as="section" className="teacher-setup__card">
              <div className="section-heading teacher-setup__section-heading">
                <p className="eyebrow">Options</p>
                <h2>Choose lightweight setup options</h2>
                <p>The defaults work well for a quick classroom setup, so these options can stay lightweight.</p>
              </div>

              <div className="teacher-setup__options-grid">
                <div className="field-group">
                  <label className="field-label" htmlFor="teacher-starting-mode">
                    Starting mode
                  </label>
                  <select
                    className="input"
                    id="teacher-starting-mode"
                    onChange={handleStartingModeChange}
                    value={setupOptions.startingMode}
                  >
                    <option value="learn-first">Learn first</option>
                    <option value="mixed-practice">Mixed practice</option>
                  </select>
                  <p className="field-help">Learn first previews each word before the practice loop begins.</p>
                </div>

                <label className="teacher-setup__toggle-row">
                  <input checked={setupOptions.hintSupport} onChange={handleHintSupportChange} type="checkbox" />
                  <span>Enable hint support during student practice</span>
                </label>
              </div>
            </Card>

            <Card as="section" className="teacher-setup__card teacher-setup__actions">
              <div className="section-heading teacher-setup__section-heading">
                <p className="eyebrow">Generate</p>
                <h2>Generate the student access code</h2>
                <p>{actionHelperText}</p>
              </div>

              <div className="teacher-setup__action-buttons">
                <Button type="submit">Generate Access Code</Button>
                <Button onClick={handleClearList} type="button" variant="secondary">
                  Clear List
                </Button>
              </div>

              <p className="field-error" role="alert" aria-live="polite">
                {validationError || ' '}
              </p>
            </Card>
          </form>

          {successState ? (
            <SuccessPanel
              accessCode={generatedAccessCode}
              hintSupportEnabled={successState.setupOptions.hintSupport}
              onStartAnotherList={handleStartAnotherList}
              sessionName={successState.sessionName}
              startingModeLabel={practiceModeLabels[successState.setupOptions.startingMode]}
              wordCount={successState.wordCount}
            />
          ) : null}

          <TeacherSummaryPanel sessions={recentSessions} />
        </PageShell>
      </main>
    </>
  );
}
