import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps
  extends PropsWithChildren,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  const className = [
    'button',
    `button--${variant}`,
    fullWidth ? 'button--full-width' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={className} type={type} {...buttonProps}>
      {children}
    </button>
  );
}
