export function BenefitsSection() {
  return (
    <section className="benefits" aria-labelledby="benefits-title">
      <div className="section-heading">
        <p className="eyebrow">Why it helps</p>
        <h2 id="benefits-title">Built for classroom clarity and steady skill building.</h2>
      </div>
      <div className="benefits__grid">
        <article className="benefit-column">
          <h3>For students</h3>
          <p>
            Start quickly, hear what to focus on, and get clear feedback after each round of
            spelling practice.
          </p>
        </article>
        <article className="benefit-column">
          <h3>For teachers</h3>
          <p>
            Create a list fast, point learners to one clear entry path, and support review without
            extra setup steps.
          </p>
        </article>
      </div>
    </section>
  );
}
