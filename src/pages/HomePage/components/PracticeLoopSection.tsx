const steps = ['Learn', 'Practice', 'Review Mistakes', 'Quick Quiz'];

export function PracticeLoopSection() {
  return (
    <section className="practice-loop" id="practice-loop" aria-labelledby="practice-loop-title">
      <div className="section-heading">
        <p className="eyebrow">Practice loop</p>
        <h2 id="practice-loop-title">A simple routine students can follow every time.</h2>
      </div>
      <ol className="practice-loop__grid">
        {steps.map((step, index) => (
          <li key={step} className="practice-loop__step">
            <span className="practice-loop__number" aria-hidden="true">
              {index + 1}
            </span>
            <h3>{step}</h3>
          </li>
        ))}
      </ol>
    </section>
  );
}
