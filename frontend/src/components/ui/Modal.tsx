import React, { useEffect } from 'react';
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Content */}
            <div className={cn(
                "relative w-full max-w-lg bg-echo-darker border border-white/10 rounded-xl shadow-2xl transform transition-all animate-fade-in",
                className
            )}>
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h3 className="text-xl font-serif text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-echo-textMuted hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
