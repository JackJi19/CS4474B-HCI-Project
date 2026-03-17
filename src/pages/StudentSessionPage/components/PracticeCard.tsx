import type { ChangeEventHandler, FormEventHandler } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

interface PracticeCardProps {
  currentPrompt: string;
  currentInputValue: string;
  currentInputError: string;
  hasSubmittedCurrentWord: boolean;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  primaryActionLabel: string;
}

export function PracticeCard({
  currentPrompt,
  currentInputValue,
  currentInputError,
  hasSubmittedCurrentWord,
  onInputChange,
  onSubmit,
  primaryActionLabel,
}: PracticeCardProps) {
  return (
    <Card as="section" aria-labelledby="student-practice-card-title" className="student-practice__card">
      <form className="student-practice__form" noValidate onSubmit={onSubmit}>
        <div className="section-heading student-practice__section-heading">
          <p className="eyebrow">Type the Word</p>
          <h2 id="student-practice-card-title">Spell this word</h2>
        </div>

        <div className="student-practice__prompt-area">
          <p className="student-practice__prompt-label">Prompt</p>
          <div className="student-practice__prompt">{currentPrompt}</div>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="student-practice-answer">
            Your answer
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
            placeholder="Type your spelling here"
            value={currentInputValue}
          />
          <p className="field-help" id="student-practice-help">
            Type the spelling that matches the prompt. Capital letters do not matter in this phase.
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
