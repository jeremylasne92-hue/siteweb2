import React from 'react';
import { cn } from './Button';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'solid';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
    const variants = {
        default: 'bg-echo-darker border border-white/10 text-white',
        glass: 'glass-panel text-white',
        solid: 'bg-neutral-900 border border-neutral-800 text-white',
    };

    return (
        <div
            className={cn(
                'rounded-xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl overflow-hidden relative',
                variants[variant],
                className
            )}
            {...props}
        >
            {variant === 'glass' && (
                <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
            )}
            {children}
        </div>
    );
}
