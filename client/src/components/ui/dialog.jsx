import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const DialogContext = React.createContext({});

function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children, asChild }) {
  const { onOpenChange } = React.useContext(DialogContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: () => onOpenChange(true) });
  }
  return <button onClick={() => onOpenChange(true)}>{children}</button>;
}

function DialogOverlay({ className, ...props }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
        className
      )}
      {...props}
    />
  );
}

function DialogContent({ className, children, ...props }) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;
  return (
    <>
      <DialogOverlay onClick={() => onOpenChange(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-black/10 dark:border-white/10 dark:bg-[#0d0d1a] dark:shadow-black/50',
            className
          )}
          {...props}
        >
          {children}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors dark:text-white/40 dark:hover:text-white/80 dark:hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 mb-6', className)} {...props} />;
}

function DialogTitle({ className, ...props }) {
  return (
    <h2
      className={cn('text-lg font-semibold text-slate-900 leading-none tracking-tight dark:text-white', className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-slate-500 dark:text-white/50', className)} {...props} />;
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
