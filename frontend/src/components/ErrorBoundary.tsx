import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                    <AlertTriangle className="h-16 w-16 text-echo-gold mb-6" />
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Une erreur est survenue
                    </h1>
                    <p className="text-echo-textMuted mb-8 max-w-md">
                        Nous sommes desoles, quelque chose s'est mal passe.
                        Veuillez recharger la page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-echo-gold text-echo-darkBg font-semibold rounded-lg hover:bg-echo-gold/90 transition-colors"
                    >
                        Recharger la page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
