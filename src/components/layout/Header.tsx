import { Link } from 'react-router-dom';

interface HeaderProps {
  howItWorksHref?: string;
}

export function Header({ howItWorksHref = '#practice-loop' }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-header__brand" to="/">
          Spelling Practice Studio
        </Link>
        <nav aria-label="Primary">
          <a className="site-header__link" href={howItWorksHref}>
            How it works
          </a>
        </nav>
      </div>
    </header>
  );
}
