import { Fragment, useState } from 'react';
import { Card } from '../../../components/ui/Card';
import type { SessionSummaryRecord } from '../../../types/spelling';
import { TeacherSessionDetailPanel } from './TeacherSessionDetailPanel';

interface TeacherSummaryPanelProps {
  sessions: SessionSummaryRecord[];
}

export function TeacherSummaryPanel({ sessions }: TeacherSummaryPanelProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

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
              {sessions.map((session) => {
                const isSelected = selectedSessionId === session.id;

                return (
                  <Fragment key={session.id}>
                    <tr className={isSelected ? 'teacher-setup__summary-row teacher-setup__summary-row--active' : 'teacher-setup__summary-row'}>
                      <td>
                        <strong>Session results for {session.listName}</strong>
                        <div className="teacher-setup__summary-subtext">Access code: {session.accessCode}</div>
                        <button
                          aria-controls={`teacher-summary-detail-${session.id}`}
                          aria-expanded={isSelected}
                          className="text-action teacher-setup__summary-toggle"
                          onClick={() =>
                            setSelectedSessionId((currentValue) =>
                              currentValue === session.id ? null : session.id,
                            )
                          }
                          type="button"
                        >
                          {isSelected ? 'Hide details' : 'View details'}
                        </button>
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
                    {isSelected ? (
                      <tr className="teacher-setup__summary-detail-row">
                        <td colSpan={6}>
                          <TeacherSessionDetailPanel
                            onHideDetails={() => setSelectedSessionId(null)}
                            session={session}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
