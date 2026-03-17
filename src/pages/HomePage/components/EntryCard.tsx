import type { FormEventHandler, ReactNode } from 'react';
import { Card } from '../../../components/ui/Card';

interface EntryCardProps {
  title: string;
  description: string;
  actionArea: ReactNode;
  footer?: ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}

export function EntryCard({
  title,
  description,
  actionArea,
  footer,
  onSubmit,
}: EntryCardProps) {
  return (
    <Card as="article" className="entry-card">
      <div className="entry-card__body">
        <div className="entry-card__header">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {onSubmit ? (
          <form className="entry-card__form" noValidate onSubmit={onSubmit}>
            {actionArea}
          </form>
        ) : (
          <div className="entry-card__form">{actionArea}</div>
        )}
      </div>
      {footer ? <div className="entry-card__footer">{footer}</div> : null}
    </Card>
  );
}
