import type { PropsWithChildren } from 'react';

interface PageShellProps extends PropsWithChildren {
  className?: string;
}

export function PageShell({ children, className = '' }: PageShellProps) {
  const classes = ['page-shell', className].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}
