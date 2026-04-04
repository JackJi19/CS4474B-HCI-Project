export function BenefitsSection() {
  return (
    <section className="benefits" aria-labelledby="benefits-title">
      <div className="section-heading">
        <p className="eyebrow">Why it helps</p>
        <h2 id="benefits-title">Built for classroom clarity, learnability, and steady skill building.</h2>
      </div>
      <div className="benefits__grid">
        <article className="benefit-column">
          <h3>For students</h3>
          <p>
            Start quickly, focus on one word at a time, and see clear progress and feedback
            throughout the session.
          </p>
        </article>
        <article className="benefit-column">
          <h3>For teachers</h3>
          <p>
            Set up a list quickly, share one clear entry path, and support review without extra
            classroom overhead.
          </p>
        </article>
      </div>
    </section>
  );
}
