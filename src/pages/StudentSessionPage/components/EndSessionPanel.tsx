import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

interface EndSessionPanelProps {
  title: string;
  summaryMessage: string;
  completedCount: number;
  totalWords: number;
  masteredCount: number;
  reviewCount: number;
  reviewWords: string[];
  quickQuizScore: number;
  recommendedNextStep: string;
  onRestart: () => void;
}

export function EndSessionPanel({
  title,
  summaryMessage,
  completedCount,
  totalWords,
  masteredCount,
  reviewCount,
  reviewWords,
  quickQuizScore,
  recommendedNextStep,
  onRestart,
}: EndSessionPanelProps) {
  return (
    <Card
      as="section"
      aria-labelledby="student-end-session-title"
      className="student-practice__card student-practice__end-panel"
    >
      <div className="section-heading student-practice__section-heading">
        <p className="eyebrow">Session summary</p>
        <h2 id="student-end-session-title">{title}</h2>
        <p>{summaryMessage}</p>
      </div>

      <div className="student-practice__completion-grid">
        <div className="student-practice__metric">
          <span className="student-practice__metric-label">Completed</span>
          <strong>
            {completedCount} / {totalWords}
          </strong>
        </div>
        <div className="student-practice__metric">
          <span className="student-practice__metric-label">Mastered</span>
          <strong>{masteredCount}</strong>
        </div>
        <div className="student-practice__metric">
          <span className="student-practice__metric-label">Review</span>
          <strong>{reviewCount}</strong>
        </div>
        <div className="student-practice__metric">
          <span className="student-practice__metric-label">Quick quiz</span>
          <strong>{quickQuizScore}%</strong>
        </div>
      </div>

      {reviewWords.length > 0 ? (
        <div className="student-practice__review-summary">
          <p className="student-practice__review-summary-label">Words still worth another review</p>
          <ul className="student-practice__review-chips">
            {reviewWords.map((word) => (
              <li className="student-practice__review-chip" key={word}>
                {word}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="student-practice__completion-actions">
        <p className="student-practice__next-step-banner">Recommended next step: {recommendedNextStep}</p>
      </div>

      <div className="student-practice__secondary-actions">
        <Button onClick={onRestart} type="button" variant="secondary">
          Restart Session
        </Button>
        <Link className="text-action" to="/">
          Back to Home
        </Link>
      </div>
    </Card>
  );
}
