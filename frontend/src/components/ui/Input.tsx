import React from 'react';
import { cn } from './Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-sm font-medium text-echo-textMuted ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-echo-gold/50 focus:border-echo-gold/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
                        error && 'border-echo-red focus:ring-echo-red/50',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-echo-red ml-1">{error}</p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";
