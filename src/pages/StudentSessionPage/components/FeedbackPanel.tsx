import { Card } from '../../../components/ui/Card';

type FeedbackStatus = 'idle' | 'correct' | 'incorrect';

interface ComparedLetter {
  value: string;
  matches: boolean;
}

interface FeedbackPanelProps {
  status: FeedbackStatus;
  submittedAnswer: string;
  correctAnswer: string;
  addedToReview: boolean;
  message: string;
  progressMessage: string;
  comparison?: ComparedLetter[];
  nextStepMessage?: string;
}

export function FeedbackPanel({
  status,
  submittedAnswer,
  correctAnswer,
  addedToReview,
  message,
  progressMessage,
  comparison = [],
  nextStepMessage,
}: FeedbackPanelProps) {
  if (status === 'idle') {
    return null;
  }

  const statusLabel = status === 'correct' ? 'Correct' : 'Not quite yet';

  return (
    <Card
      as="section"
      aria-live="polite"
      aria-labelledby="student-feedback-title"
      className={`student-practice__card student-practice__feedback student-practice__feedback--${status}`}
      role="status"
    >
      <div className="student-practice__feedback-header">
        <p className="student-practice__feedback-badge">{statusLabel}</p>
        <h2 id="student-feedback-title">Feedback</h2>
      </div>

      <div className="student-practice__feedback-content">
        <p>{message}</p>
        <p>
          <strong>Your answer:</strong> {submittedAnswer || '—'}
        </p>
        {comparison.length > 0 ? (
          <div className="student-practice__comparison-row" aria-label="Letter comparison">
            {comparison.map((letter, index) => (
              <span
                className={letter.matches ? 'student-practice__comparison-letter student-practice__comparison-letter--match' : 'student-practice__comparison-letter student-practice__comparison-letter--mismatch'}
                key={`${letter.value}-${index}`}
              >
                {letter.value === ' ' ? '·' : letter.value}
              </span>
            ))}
          </div>
        ) : null}
        {status === 'incorrect' ? (
          <p>
            <strong>Correct spelling:</strong> {correctAnswer}
          </p>
        ) : null}
        <p>
          <strong>Review update:</strong> {addedToReview ? 'Added to Review.' : 'No change to Review.'}
        </p>
        <p>
          <strong>Progress update:</strong> {progressMessage}
        </p>
        {nextStepMessage ? (
          <p>
            <strong>Next:</strong> {nextStepMessage}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
