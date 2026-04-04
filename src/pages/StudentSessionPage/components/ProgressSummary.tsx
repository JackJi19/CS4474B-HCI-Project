import { Card } from '../../../components/ui/Card';

interface ProgressSummaryProps {
  stageLabel: string;
  stageDescription: string;
  currentWordNumber: number;
  totalWords: number;
  completedCount: number;
  masteredCount: number;
  reviewCount: number;
  nextStepLabel: string;
  stageOrder: string[];
  activeStageIndex: number;
}

export function ProgressSummary({
  stageLabel,
  stageDescription,
  currentWordNumber,
  totalWords,
  completedCount,
  masteredCount,
  reviewCount,
  nextStepLabel,
  stageOrder,
  activeStageIndex,
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
          <p className="eyebrow">Session Progress</p>
          <h2 id="student-progress-title">{stageLabel}</h2>
          <p>{stageDescription}</p>
        </div>
        <div className="student-practice__progress-status">
          <p className="student-practice__word-indicator">
            Word {currentWordNumber} of {totalWords}
          </p>
          <p className="student-practice__next-step">Next Step: {nextStepLabel}</p>
        </div>
      </div>

      <ol className="student-practice__stage-strip" aria-label="Guided practice stages">
        {stageOrder.map((stage, index) => {
          const state = index < activeStageIndex ? 'done' : index === activeStageIndex ? 'active' : 'upcoming';
          return (
            <li className={`student-practice__stage-chip student-practice__stage-chip--${state}`} key={stage}>
              {stage}
            </li>
          );
        })}
      </ol>

      <div className="student-practice__progress-metrics" aria-label="Progress summary">
        <div className="student-practice__metric">
          <span className="student-practice__metric-label">Completed:</span>
          <strong>{completedCount}</strong>
        </div>
        <div className="student-practice__metric">
          <span className="student-practice__metric-label">Mastered:</span>
          <strong>{masteredCount}</strong>
        </div>
        <div className="student-practice__metric">
          <span className="student-practice__metric-label">In Review:</span>
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
