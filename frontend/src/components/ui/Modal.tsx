import React, { useEffect, useId, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    const titleId = useId();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Content */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-label={title ? undefined : 'Dialog'}
                className={cn(
                    "relative w-full max-w-lg bg-echo-darker border border-white/10 rounded-xl shadow-2xl transform transition-all animate-fade-in",
                    className
                )}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h3 id={titleId} className="text-xl font-serif text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        aria-label="Fermer"
                        className="text-echo-textMuted hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
                    {children}
                </div>
            </div>
        </div>
    );
}
