import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

const icons = {
    success: <CheckCircle className="text-green-400" size={18} />,
    error: <XCircle className="text-red-400" size={18} />,
    warning: <AlertTriangle className="text-amber-400" size={18} />,
};

const borders = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    warning: 'border-amber-500/30',
};

export function Toast({ message, type = 'success', onClose, duration = 4000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className={`fixed top-20 right-6 z-[9999] flex items-center gap-3 px-4 py-3 bg-[#1A1A1A] border ${borders[type]} rounded-lg shadow-xl max-w-sm`}
            style={{ animation: 'slideInRight 0.3s ease-out' }}>
            {icons[type]}
            <span className="text-sm text-white">{message}</span>
            <button onClick={onClose} className="text-neutral-500 hover:text-white ml-2">
                <X size={14} />
            </button>
        </div>
    );
}
