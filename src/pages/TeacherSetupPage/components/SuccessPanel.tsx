import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

interface SuccessPanelProps {
  accessCode: string;
  sessionName: string;
  wordCount: number;
  startingModeLabel: string;
  hintSupportEnabled: boolean;
  onStartAnotherList: () => void;
}

export function SuccessPanel({
  accessCode,
  sessionName,
  wordCount,
  startingModeLabel,
  hintSupportEnabled,
  onStartAnotherList,
}: SuccessPanelProps) {
  const shareLink = `https://spelling-practice.example/join/${accessCode.toLowerCase()}`;

  return (
    <Card
      as="section"
      aria-labelledby="teacher-setup-success-title"
      aria-live="polite"
      className="teacher-setup__card teacher-setup__success"
      role="status"
    >
      <div className="section-heading teacher-setup__section-heading">
        <p className="eyebrow">Session ready</p>
        <h2 id="teacher-setup-success-title">Your practice session is ready</h2>
        <p>
          Share this code with students so they can enter the guided spelling practice flow.
        </p>
      </div>

      <div className="teacher-setup__success-grid">
        <div className="teacher-setup__code-panel">
          <p className="teacher-setup__code-label">Access code</p>
          <div className="teacher-setup__code" tabIndex={0}>
            {accessCode}
          </div>
        </div>

        <dl className="teacher-setup__success-summary">
          <div>
            <dt>List</dt>
            <dd>{sessionName}</dd>
          </div>
          <div>
            <dt>Words</dt>
            <dd>{wordCount}</dd>
          </div>
          <div>
            <dt>Starting mode</dt>
            <dd>{startingModeLabel}</dd>
          </div>
          <div>
            <dt>Hints</dt>
            <dd>{hintSupportEnabled ? 'On' : 'Off'}</dd>
          </div>
        </dl>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="teacher-setup-share-link">
          Mock share link
        </label>
        <input
          className="input teacher-setup__share-link"
          id="teacher-setup-share-link"
          readOnly
          value={shareLink}
        />
      </div>

      <div className="teacher-setup__success-actions">
        <Link className="text-action" to="/">
          Back to Home
        </Link>
        <Button onClick={onStartAnotherList} type="button" variant="secondary">
          Start Another List
        </Button>
      </div>
    </Card>
  );
}
