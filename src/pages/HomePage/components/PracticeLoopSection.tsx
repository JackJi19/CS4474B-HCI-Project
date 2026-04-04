const steps = [
  {
    label: 'Learn',
    description: 'Study each word before the main practice loop begins.',
  },
  {
    label: 'Student Practice',
    description: 'Spell one word at a time with immediate feedback.',
  },
  {
    label: 'Review Mistakes',
    description: 'Practice the words that still need more support.',
  },
  {
    label: 'Quick Quiz',
    description: 'Finish with a short recall check at the end.',
  },
];

export function PracticeLoopSection() {
  return (
    <section className="practice-loop" id="practice-loop" aria-labelledby="practice-loop-title">
      <div className="section-heading">
        <p className="eyebrow">Practice loop</p>
        <h2 id="practice-loop-title">The guided spelling loop students can follow every time.</h2>
      </div>
      <ol className="practice-loop__grid">
        {steps.map((step, index) => (
          <li key={step.label} className="practice-loop__step">
            <span className="practice-loop__number" aria-hidden="true">
              {index + 1}
            </span>
            <h3>{step.label}</h3>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
