import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
          {
            'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200':
              variant === 'primary',
            'bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-200':
              variant === 'secondary',
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
              variant === 'success',
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
              variant === 'warning',
            'bg-destructive text-destructive-foreground': variant === 'destructive',
            'border border-border bg-transparent': variant === 'outline',
            'bg-muted text-muted-foreground': variant === 'default',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;

