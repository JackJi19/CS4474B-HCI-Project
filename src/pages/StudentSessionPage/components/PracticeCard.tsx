import type { ChangeEventHandler, FormEventHandler } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

interface PracticeCardProps {
  modeLabel: string;
  title: string;
  currentPrompt: string;
  currentInputValue: string;
  currentInputError: string;
  hasSubmittedCurrentWord: boolean;
  hintText?: string;
  inputLabel?: string;
  placeholder?: string;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  primaryActionLabel: string;
}

export function PracticeCard({
  modeLabel,
  title,
  currentPrompt,
  currentInputValue,
  currentInputError,
  hasSubmittedCurrentWord,
  hintText,
  inputLabel = 'Your answer',
  placeholder = 'Type your answer here',
  onInputChange,
  onSubmit,
  primaryActionLabel,
}: PracticeCardProps) {
  return (
    <Card as="section" aria-labelledby="student-practice-card-title" className="student-practice__card">
      <form className="student-practice__form" noValidate onSubmit={onSubmit}>
        <div className="section-heading student-practice__section-heading">
          <p className="eyebrow">{modeLabel}</p>
          <h2 id="student-practice-card-title">{title}</h2>
        </div>

        <div className="student-practice__prompt-area">
          <p className="student-practice__prompt-label">Prompt</p>
          <div className="student-practice__prompt">{currentPrompt}</div>
        </div>

        {hintText ? (
          <div className="student-practice__hint-box">
            <p className="student-practice__prompt-label">Hint</p>
            <p className="student-practice__hint-text">{hintText}</p>
          </div>
        ) : null}

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
            placeholder={placeholder}
            value={currentInputValue}
          />
          <p className="field-help" id="student-practice-help">
            Complete the current step, then continue to the next word.
          </p>
          <p className="field-error" id="student-practice-error" role="alert" aria-live="polite">
            {currentInputError || ' '}
          </p>
        </div>

        <Button type="submit">{primaryActionLabel}</Button>
      </form>
    </Card>
  );
}
