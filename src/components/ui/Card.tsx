import type { HTMLAttributes, PropsWithChildren } from 'react';

interface CardProps extends PropsWithChildren, HTMLAttributes<HTMLElement> {
  as?: 'article' | 'section' | 'div';
}

export function Card({ as = 'div', children, className = '', ...props }: CardProps) {
  const Component = as;
  const classes = ['card', className].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
