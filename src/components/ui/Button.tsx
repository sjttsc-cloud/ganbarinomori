import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-primary text-white shadow-[0_4px_0_0_#e76f51]',
      secondary: 'bg-secondary text-text-main shadow-[0_4px_0_0_#f4a261]',
      outline: 'border-4 border-primary text-primary bg-white',
      ghost: 'bg-transparent text-text-main hover:bg-black/5',
    };

    const sizes = {
      sm: 'h-10 px-4 text-sm',
      md: 'h-14 px-8 text-xl',
      lg: 'h-20 px-12 text-3xl',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
