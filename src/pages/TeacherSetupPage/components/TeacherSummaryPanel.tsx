import { Card } from '../../../components/ui/Card';
import type { SessionSummaryRecord } from '../../../types/spelling';

interface TeacherSummaryPanelProps {
  sessions: SessionSummaryRecord[];
}

export function TeacherSummaryPanel({ sessions }: TeacherSummaryPanelProps) {
  return (
    <Card as="section" className="teacher-setup__card">
      <div className="section-heading teacher-setup__section-heading">
        <p className="eyebrow">Teacher Summary</p>
        <h2>Teacher Summary</h2>
        <p>
          Review recent classroom sessions at a glance. Each result keeps the session outcome,
          mastered words, words in review, and most missed words easy to scan.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="teacher-setup__empty-state">
          <p>No session summaries are available on this browser yet.</p>
        </div>
      ) : (
        <div className="teacher-setup__summary-table-wrap">
          <table className="teacher-setup__summary-table">
            <thead>
              <tr>
                <th>Session Results</th>
                <th>Session Outcome</th>
                <th>Mastered</th>
                <th>In Review</th>
                <th>Quick Quiz</th>
                <th>Most Missed Words</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <strong>Session results for {session.listName}</strong>
                    <div className="teacher-setup__summary-subtext">Access code: {session.accessCode}</div>
                  </td>
                  <td>
                    <strong>Session complete</strong>
                    <div className="teacher-setup__summary-subtext">
                      Completed on {new Date(session.completedAt).toLocaleString()}
                    </div>
                  </td>
                  <td>{session.masteredCount} / {session.totalWords}</td>
                  <td>{session.reviewCount}</td>
                  <td>{session.quickQuizScore}%</td>
                  <td>
                    {session.mostMissedWords.length ? (
                      session.mostMissedWords.join(', ')
                    ) : (
                      <span className="teacher-setup__summary-empty">
                        Great job — no words were missed in this session.
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
