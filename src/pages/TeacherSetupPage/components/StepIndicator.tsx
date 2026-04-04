import { Card } from '../../../components/ui/Card';

interface StepIndicatorProps {
  steps: string[];
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <Card as="section" className="teacher-setup__card teacher-setup__steps">
      <div className="section-heading teacher-setup__section-heading">
        <p className="eyebrow">Teacher Setup</p>
        <h2>Teacher Setup in one guided pass.</h2>
        <p>Enter the list, review it, choose options, and generate the student access code.</p>
      </div>
      <ol className="teacher-setup__step-list">
        {steps.map((step, index) => (
          <li className="teacher-setup__step-item" key={step}>
            <span aria-hidden="true" className="teacher-setup__step-number">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
