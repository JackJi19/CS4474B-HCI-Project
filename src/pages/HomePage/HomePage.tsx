import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EntryCard } from './components/EntryCard';
import { PracticeLoopSection } from './components/PracticeLoopSection';
import { BenefitsSection } from './components/BenefitsSection';
import { validateStudentEntry } from '../../utils/validation';
import './HomePage.css';

export function HomePage() {
  const navigate = useNavigate();
  const [studentEntryValue, setStudentEntryValue] = useState('');
  const [studentEntryError, setStudentEntryError] = useState('');
  const [studentEntryLoading, setStudentEntryLoading] = useState(false);
  const [teacherExistingListMessage, setTeacherExistingListMessage] = useState('');

  const handleStudentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (studentEntryLoading) {
      return;
    }

    const result = validateStudentEntry(studentEntryValue);
    setStudentEntryValue(result.normalizedValue);

    if (!result.isValid) {
      setStudentEntryError(result.error ?? 'Check your entry and try again.');
      return;
    }

    setStudentEntryError('');
    setTeacherExistingListMessage('');
    setStudentEntryLoading(true);

    navigate('/student/session', {
      state: {
        listId: result.matchedList?.id,
      },
    });
  };

  const handleTeacherSetup = () => {
    setTeacherExistingListMessage('');
    navigate('/teacher/setup');
  };

  const handleTeacherExistingListClick = () => {
    setTeacherExistingListMessage(
      'Use the Student Practice card with the access code or list name to open an existing session.',
    );
  };

  return (
    <>
      <Header />
      <main>
        <PageShell className="home-page">
          <section className="hero" aria-labelledby="home-title">
            <div className="hero__intro">
              <p className="eyebrow">Guided spelling practice</p>
              <h1 id="home-title">Spelling Practice Studio</h1>
              <p className="hero__summary">
                A calm spelling practice space with clear steps, visible progress, immediate
                feedback, and lightweight teacher setup.
              </p>
            </div>

            <div className="hero__cards">
              <EntryCard
                title="Student Practice"
                description="Start guided spelling practice with an access code or a shared list name."
                onSubmit={handleStudentSubmit}
                actionArea={
                  <>
                    <div className="field-group">
                      <label className="field-label" htmlFor="student-entry">
                        Enter access code or list name
                      </label>
                      <Input
                        id="student-entry"
                        name="student-entry"
                        autoComplete="off"
                        inputMode="text"
                        maxLength={80}
                        placeholder='Try "NATURE25" or "Week 3 Nature Words"'
                        value={studentEntryValue}
                        hasError={Boolean(studentEntryError)}
                        aria-describedby="student-entry-help student-entry-error"
                        aria-invalid={Boolean(studentEntryError)}
                        onChange={(event) => {
                          setStudentEntryValue(event.target.value);
                          if (studentEntryError) {
                            setStudentEntryError('');
                          }
                        }}
                      />
                      <p className="field-help" id="student-entry-help">
                        Enter either one to start Student Practice.
                      </p>
                      <p
                        className="field-error"
                        id="student-entry-error"
                        role="alert"
                        aria-live="polite"
                      >
                        {studentEntryError || ' '}
                      </p>
                    </div>
                    <Button fullWidth type="submit" disabled={studentEntryLoading}>
                      {studentEntryLoading ? 'Starting Practice...' : 'Start Practice'}
                    </Button>
                  </>
                }
              />

              <EntryCard
                title="Teacher Setup"
                description="Create a classroom practice list and generate a student access code."
                actionArea={
                  <>
                    <Button fullWidth onClick={handleTeacherSetup}>
                      Create a Practice List
                    </Button>
                  </>
                }
                footer={
                  <>
                    <button
                      className="text-action"
                      type="button"
                      onClick={handleTeacherExistingListClick}
                      aria-describedby="teacher-existing-list-message"
                    >
                      I already have a list
                    </button>
                    <p
                      className="field-help teacher-message"
                      id="teacher-existing-list-message"
                      role={teacherExistingListMessage ? 'status' : undefined}
                      aria-live="polite"
                    >
                      {teacherExistingListMessage}
                    </p>
                  </>
                }
              />
            </div>
          </section>

          <PracticeLoopSection />
          <BenefitsSection />
        </PageShell>
      </main>
      <footer className="site-footer">
        <PageShell>
          <p>Designed for guided spelling practice in classrooms and at home.</p>
        </PageShell>
      </footer>
    </>
  );
}
