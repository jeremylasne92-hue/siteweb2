import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

interface ApplicationSuccessCTAProps {
    accentColor?: string;
    onNavigate?: () => void;
}

export function ApplicationSuccessCTA({ accentColor = '#D4AF37', onNavigate }: ApplicationSuccessCTAProps) {
    return (
        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg max-w-md">
            <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-4 h-4" style={{ color: accentColor }} />
                <p className="text-sm font-medium text-white">Suivez votre candidature</p>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
                Créez un compte avec la même adresse email pour suivre l'avancement de votre candidature en temps réel.
            </p>
            <Link to="/register" onClick={onNavigate}>
                <Button type="button" variant="outline" className="w-full text-sm">
                    Créer un compte
                </Button>
            </Link>
        </div>
    );
}
