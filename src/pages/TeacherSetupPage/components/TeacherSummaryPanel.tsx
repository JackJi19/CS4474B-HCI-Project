import { Card } from '../../../components/ui/Card';
import type { SessionSummaryRecord } from '../../../types/spelling';

interface TeacherSummaryPanelProps {
  sessions: SessionSummaryRecord[];
}

function formatCompletedAt(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getSessionOutcomeText(session: SessionSummaryRecord) {
  if (session.reviewCount === 0) {
    return 'Most words were completed successfully, and no words are currently in review.';
  }

  if (session.reviewCount <= Math.max(1, Math.floor(session.totalWords / 3))) {
    return 'Most words were completed successfully, but a few are still in review.';
  }

  if (session.masteredCount === 0) {
    return 'This session needs another practice pass because most words are still in review.';
  }

  return 'Several words are still in review and need more practice before this list is fully mastered.';
}

export function TeacherSummaryPanel({ sessions }: TeacherSummaryPanelProps) {
  return (
    <Card as="section" className="teacher-setup__card">
      <div className="section-heading teacher-setup__section-heading">
        <p className="eyebrow">Recent sessions</p>
        <h2>Teacher Summary</h2>
        <p>
          Review recent session outcomes at a glance, including words practiced, mastered words,
          words in review, and most missed words.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="teacher-setup__empty-state">
          <p>No completed student sessions are available on this browser yet.</p>
        </div>
      ) : (
        <div className="teacher-setup__summary-list">
          {sessions.map((session) => {
            const mostMissedWords = session.mostMissedWords.slice(0, 3);

            return (
              <article className="teacher-setup__session-result" key={session.id}>
                <div className="teacher-setup__session-header">
                  <div className="teacher-setup__session-heading">
                    <h3>Session results for {session.listName}</h3>
                    <p className="teacher-setup__session-meta">
                      Access code {session.accessCode} · Completed {formatCompletedAt(session.completedAt)}
                    </p>
                  </div>
                  <p className="teacher-setup__session-status">Session complete</p>
                </div>

                <div className="teacher-setup__session-grid">
                  <section className="teacher-setup__summary-stat teacher-setup__summary-stat--outcome">
                    <p className="teacher-setup__summary-label">Session Outcome</p>
                    <strong className="teacher-setup__summary-value">Session complete</strong>
                    <p className="teacher-setup__summary-helper">{getSessionOutcomeText(session)}</p>
                  </section>

                  <section className="teacher-setup__summary-stat">
                    <p className="teacher-setup__summary-label">Words Practiced</p>
                    <strong className="teacher-setup__summary-value">{session.totalWords}</strong>
                    <p className="teacher-setup__summary-helper">Total words included in this session</p>
                  </section>

                  <section className="teacher-setup__summary-stat">
                    <p className="teacher-setup__summary-label">Mastered Words</p>
                    <strong className="teacher-setup__summary-value">{session.masteredCount}</strong>
                    <p className="teacher-setup__summary-helper">Words completed successfully in this session</p>
                  </section>

                  <section className="teacher-setup__summary-stat">
                    <p className="teacher-setup__summary-label">Words in Review</p>
                    <strong className="teacher-setup__summary-value">{session.reviewCount}</strong>
                    <p className="teacher-setup__summary-helper">Words that still need more practice</p>
                  </section>

                  <section className="teacher-setup__summary-stat">
                    <p className="teacher-setup__summary-label">Quick Quiz Score</p>
                    <strong className="teacher-setup__summary-value">{session.quickQuizScore}%</strong>
                    <p className="teacher-setup__summary-helper">Short recall check at the end of the session</p>
                  </section>
                </div>

                <section className="teacher-setup__most-missed">
                  <div className="teacher-setup__most-missed-heading">
                    <p className="teacher-setup__summary-label">Most Missed Words</p>
                    <p className="teacher-setup__summary-helper">
                      Words that were missed most often in this session
                    </p>
                  </div>

                  {mostMissedWords.length > 0 ? (
                    <ol className="teacher-setup__most-missed-list">
                      {mostMissedWords.map((word, index) => (
                        <li className="teacher-setup__most-missed-item" key={`${session.id}-${word}`}>
                          <span className="teacher-setup__most-missed-rank">{index + 1}</span>
                          <span className="teacher-setup__most-missed-word">{word}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="teacher-setup__summary-helper">
                      No repeat misses were recorded in this session.
                    </p>
                  )}
                </section>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}
