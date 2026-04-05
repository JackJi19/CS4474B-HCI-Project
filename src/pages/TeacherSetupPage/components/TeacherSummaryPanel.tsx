import { Card } from '../../../components/ui/Card';
import type { SessionSummaryRecord } from '../../../types/spelling';

interface TeacherSummaryPanelProps {
  sessions: SessionSummaryRecord[];
}

export function TeacherSummaryPanel({ sessions }: TeacherSummaryPanelProps) {
  return (
    <Card as="section" className="teacher-setup__card">
      <div className="section-heading teacher-setup__section-heading">
        <p className="eyebrow">Teacher summary</p>
        <h2>Recent practice results</h2>
        <p>
          This lightweight summary supports quick classroom review by surfacing recent completion,
          review load, and quiz performance.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="teacher-setup__empty-state">
          <p>No student sessions have been completed on this browser yet.</p>
        </div>
      ) : (
        <div className="teacher-setup__summary-table-wrap">
          <table className="teacher-setup__summary-table">
            <thead>
              <tr>
                <th>List</th>
                <th>Completed</th>
                <th>Mastered</th>
                <th>Review</th>
                <th>Quiz</th>
                <th>Most missed</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <strong>{session.listName}</strong>
                    <div className="teacher-setup__summary-subtext">{session.accessCode}</div>
                  </td>
                  <td>{new Date(session.completedAt).toLocaleString()}</td>
                  <td>{session.masteredCount} / {session.totalWords}</td>
                  <td>{session.reviewCount}</td>
                  <td>{session.quickQuizScore}%</td>
                  <td>{session.mostMissedWords.length ? session.mostMissedWords.join(', ') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
