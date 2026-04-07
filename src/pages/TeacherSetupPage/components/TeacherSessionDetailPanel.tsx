import type { SessionSummaryRecord } from '../../../types/spelling';

interface TeacherSessionDetailPanelProps {
  session: SessionSummaryRecord;
  onHideDetails: () => void;
}

function getSessionOutcomeMessage(session: SessionSummaryRecord) {
  if (session.reviewCount > 0) {
    return 'Session complete. Most words were completed successfully, but a few still need review.';
  }

  return 'Session complete. Students finished this session without any words remaining in review.';
}

export function TeacherSessionDetailPanel({
  session,
  onHideDetails,
}: TeacherSessionDetailPanelProps) {
  return (
    <div
      className="teacher-setup__summary-detail"
      id={`teacher-summary-detail-${session.id}`}
    >
      <div className="section-heading teacher-setup__section-heading">
        <p className="eyebrow">Teacher Summary</p>
        <h3>Session results for {session.listName}</h3>
        <p>{getSessionOutcomeMessage(session)}</p>
      </div>

      <dl className="teacher-setup__summary-detail-grid">
        <div>
          <dt>Access Code</dt>
          <dd>{session.accessCode}</dd>
        </div>
        <div>
          <dt>Completed</dt>
          <dd>{new Date(session.completedAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Session Outcome</dt>
          <dd>Session complete</dd>
        </div>
        <div>
          <dt>Words Practiced</dt>
          <dd>{session.totalWords}</dd>
        </div>
        <div>
          <dt>Mastered Words</dt>
          <dd>{session.masteredCount}</dd>
        </div>
        <div>
          <dt>Words in Review</dt>
          <dd>{session.reviewCount}</dd>
        </div>
        <div>
          <dt>Quick Quiz Score</dt>
          <dd>{session.quickQuizScore}%</dd>
        </div>
        <div>
          <dt>Most Missed Words</dt>
          <dd>
            {session.mostMissedWords.length
              ? session.mostMissedWords.join(', ')
              : 'Great job — no words were missed in this session.'}
          </dd>
        </div>
      </dl>

      <button className="text-action" onClick={onHideDetails} type="button">
        Back to recent sessions
      </button>
    </div>
  );
}
