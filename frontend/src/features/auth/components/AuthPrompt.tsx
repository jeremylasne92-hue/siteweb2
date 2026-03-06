import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const AuthPrompt = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-echo-gold/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-md w-full text-center space-y-6 bg-black/40 p-8 sm:p-10 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
                <div className="mx-auto w-16 h-16 rounded-full bg-echo-gold/10 flex items-center justify-center">
                    <LogIn className="w-8 h-8 text-echo-gold" />
                </div>

                <h2 className="text-2xl font-bold text-white">
                    Espace Réservé aux Membres
                </h2>

                <p className="text-echo-textMuted text-base">
                    Rejoignez le Mouvement pour accéder à cette section.
                    Connectez-vous ou créez un compte pour découvrir tout le contenu exclusif.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Link to="/login">
                        <Button className="w-full sm:w-auto px-6 py-5">
                            Se connecter
                        </Button>
                    </Link>
                    <Link to="/register">
                        <Button variant="outline" className="w-full sm:w-auto px-6 py-5">
                            Créer un compte
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
