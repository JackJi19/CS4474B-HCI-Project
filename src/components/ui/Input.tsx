import type { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  hasError?: boolean;
}

export function Input({ hasError = false, ...props }: InputProps) {
  const className = ['input', hasError ? 'input--error' : ''].filter(Boolean).join(' ');

  return <input className={className} {...props} />;
}
