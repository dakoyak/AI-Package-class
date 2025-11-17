import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './GlassButton.module.css';

type GlassButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

function GlassButton({ children, className = '', ...props }: GlassButtonProps) {
  const mergedClassName = `${styles.button} ${className}`.trim();
  return (
    <button className={mergedClassName} {...props}>
      {children}
    </button>
  );
}

export default GlassButton;
