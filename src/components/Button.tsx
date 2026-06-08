/*
  Button
  --------------------------------------------------------------------------
  The one button in the game. Worn brass plate over dark leather, amber on
  hover, pressed-in on active. Variants tune emphasis without changing the
  material language.
*/

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type Variant = 'primary' | 'ghost' | 'plate';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = 'plate', className, children, ...rest }: Props) {
  const classes = ['btn', `btn--${variant}`, className].filter(Boolean).join(' ');
  return (
    <button className={classes} {...rest}>
      <span className="btn__label">{children}</span>
    </button>
  );
}
