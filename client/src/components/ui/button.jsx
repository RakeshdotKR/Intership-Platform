import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#060610] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-indigo-600 text-white shadow hover:bg-indigo-500 active:scale-95',
        destructive:
          'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-600/20 dark:text-red-400 dark:border-red-500/30 dark:hover:bg-red-600/30 dark:hover:text-red-300',
        outline:
          'border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/5 dark:hover:text-white dark:hover:border-white/20',
        secondary:
          'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white',
        ghost:
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white',
        link:
          'text-indigo-600 underline-offset-4 hover:underline hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300',
        success:
          'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-600/30',
        gradient:
          'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-violet-500 active:scale-95',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
