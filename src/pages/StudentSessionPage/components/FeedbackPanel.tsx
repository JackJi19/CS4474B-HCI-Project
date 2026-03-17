import { Card } from '../../../components/ui/Card';

type FeedbackStatus = 'idle' | 'correct' | 'incorrect';

interface FeedbackPanelProps {
  status: FeedbackStatus;
  submittedAnswer: string;
  correctAnswer: string;
  addedToReview: boolean;
  message: string;
  progressMessage: string;
  answerComparison?: Array<{ character: string; isCorrect: boolean }>;
}

export function FeedbackPanel({
  status,
  submittedAnswer,
  correctAnswer,
  addedToReview,
  message,
  progressMessage,
  answerComparison = [],
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
        {answerComparison.length > 0 ? (
          <div>
            <p className="student-practice__comparison-label">
              <strong>Letter check:</strong>
            </p>
            <div aria-label="Letter-by-letter comparison" className="student-practice__comparison-row">
              {answerComparison.map((entry, index) => (
                <span
                  className={`student-practice__comparison-letter ${entry.isCorrect ? 'student-practice__comparison-letter--correct' : 'student-practice__comparison-letter--incorrect'}`}
                  key={`${entry.character}-${index}`}
                >
                  {entry.character === ' ' ? '␠' : entry.character}
                </span>
              ))}
            </div>
          </div>
        ) : null}
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
