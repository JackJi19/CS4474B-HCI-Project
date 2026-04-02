import type { ChangeEventHandler, FormEventHandler, ReactNode } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

interface PracticeCardProps {
  eyebrow: string;
  title: string;
  instruction: string;
  promptLabel: string;
  prompt: string;
  supportPanel?: ReactNode;
  inputLabel?: string;
  currentInputValue?: string;
  currentInputError?: string;
  hasSubmittedCurrentWord?: boolean;
  inputPlaceholder?: string;
  inputHelpText?: string;
  onInputChange?: ChangeEventHandler<HTMLInputElement>;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  primaryActionLabel: string;
  showInput?: boolean;
}

export function PracticeCard({
  eyebrow,
  title,
  instruction,
  promptLabel,
  prompt,
  supportPanel,
  inputLabel = 'Your answer',
  currentInputValue = '',
  currentInputError = '',
  hasSubmittedCurrentWord = false,
  inputPlaceholder = 'Type your answer here',
  inputHelpText = '',
  onInputChange,
  onSubmit,
  primaryActionLabel,
  showInput = true,
}: PracticeCardProps) {
  const formContent = (
    <>
      <div className="section-heading student-practice__section-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="student-practice-card-title">{title}</h2>
        <p>{instruction}</p>
      </div>

      <div className="student-practice__prompt-area">
        <p className="student-practice__prompt-label">{promptLabel}</p>
        <div className="student-practice__prompt">{prompt}</div>
      </div>

      {supportPanel ? <div className="student-practice__support-panel">{supportPanel}</div> : null}

      {showInput ? (
        <div className="field-group">
          <label className="field-label" htmlFor="student-practice-answer">
            {inputLabel}
          </label>
          <Input
            aria-describedby="student-practice-help student-practice-error"
            aria-invalid={Boolean(currentInputError)}
            autoComplete="off"
            disabled={hasSubmittedCurrentWord}
            hasError={Boolean(currentInputError)}
            id="student-practice-answer"
            inputMode="text"
            maxLength={120}
            name="student-practice-answer"
            onChange={onInputChange}
            placeholder={inputPlaceholder}
            value={currentInputValue}
          />
          <p className="field-help" id="student-practice-help">
            {inputHelpText}
          </p>
          <p className="field-error" id="student-practice-error" role="alert" aria-live="polite">
            {currentInputError || ' '}
          </p>
        </div>
      ) : null}

      <Button type="submit">{primaryActionLabel}</Button>
    </>
  );

  return (
    <Card as="section" aria-labelledby="student-practice-card-title" className="student-practice__card">
      {onSubmit ? (
        <form className="student-practice__form" noValidate onSubmit={onSubmit}>
          {formContent}
        </form>
      ) : (
        <div className="student-practice__form">{formContent}</div>
      )}
    </Card>
  );
}
