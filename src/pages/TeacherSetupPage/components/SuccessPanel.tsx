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
        <p className="eyebrow">Teacher Setup</p>
        <h2 id="teacher-setup-success-title">Your practice session is ready</h2>
        <p>
          Share this access code or list name so students can open Student Practice from the home page.
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
            <dt>Session or list name</dt>
            <dd>{sessionName}</dd>
          </div>
          <div>
            <dt>Words in list</dt>
            <dd>{wordCount}</dd>
          </div>
          <div>
            <dt>Starting mode</dt>
            <dd>{startingModeLabel}</dd>
          </div>
          <div>
            <dt>Hint support</dt>
            <dd>{hintSupportEnabled ? 'Enabled' : 'Off'}</dd>
          </div>
        </dl>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="teacher-setup-share-link">
          Share link (mock)
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
