import { Card } from '../../../components/ui/Card';

type FeedbackStatus = 'idle' | 'correct' | 'incorrect';

interface FeedbackPanelProps {
  status: FeedbackStatus;
  submittedAnswer: string;
  correctAnswer: string;
  addedToReview: boolean;
  message: string;
  progressMessage: string;
}

export function FeedbackPanel({
  status,
  submittedAnswer,
  correctAnswer,
  addedToReview,
  message,
  progressMessage,
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
          <strong>Your answer:</strong> {submittedAnswer}
        </p>
        {status === 'incorrect' ? (
          <p>
            <strong>Correct spelling:</strong> {correctAnswer}
          </p>
        ) : null}
        <p>
          <strong>Review update:</strong> {addedToReview ? 'Added to Review.' : 'Not added to Review.'}
        </p>
        <p>
          <strong>Progress update:</strong> {progressMessage}
        </p>
      </div>
    </Card>
  );
}
