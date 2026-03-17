import { Card } from '../../../components/ui/Card';

interface ProgressSummaryProps {
  currentWordNumber: number;
  totalWords: number;
  completedCount: number;
  masteredCount: number;
  reviewCount: number;
  phaseLabel: string;
}

export function ProgressSummary({
  currentWordNumber,
  totalWords,
  completedCount,
  masteredCount,
  reviewCount,
  phaseLabel,
}: ProgressSummaryProps) {
  const progressPercentage = totalWords > 0 ? Math.round((completedCount / totalWords) * 100) : 0;

  return (
    <Card
      as="section"
      aria-labelledby="student-progress-title"
      className="student-practice__card student-practice__progress-card"
    >
      <div className="student-practice__progress-heading">
        <div className="section-heading student-practice__section-heading">
          <p className="eyebrow">Session progress</p>
          <h2 id="student-progress-title">Keep moving one word at a time.</h2>
        </div>
        <div className="student-practice__progress-side">
          <p className="student-practice__word-indicator">
            Word {currentWordNumber} of {totalWords}
          </p>
          <p className="student-practice__phase-tag">{phaseLabel}</p>
        </div>
      </div>

      <div className="student-practice__progress-metrics" aria-label="Progress summary">
        <div className="student-practice__metric">
          <span className="student-practice__metric-label">Completed</span>
          <strong>{completedCount}</strong>
        </div>
        <div className="student-practice__metric">
          <span className="student-practice__metric-label">Mastered</span>
          <strong>{masteredCount}</strong>
        </div>
        <div className="student-practice__metric">
          <span className="student-practice__metric-label">Review</span>
          <strong>{reviewCount}</strong>
        </div>
      </div>

      <div
        aria-label={`${progressPercentage}% complete`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progressPercentage}
        className="student-practice__progress-bar"
        role="progressbar"
      >
        <div className="student-practice__progress-bar-fill" style={{ width: `${progressPercentage}%` }} />
      </div>
    </Card>
  );
}
