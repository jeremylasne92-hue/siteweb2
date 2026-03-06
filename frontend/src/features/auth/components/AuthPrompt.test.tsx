import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthPrompt } from './AuthPrompt';

const renderAuthPrompt = () =>
    render(
        <MemoryRouter>
            <AuthPrompt />
        </MemoryRouter>
    );

describe('AuthPrompt', () => {
    it('affiche le titre et le message incitatif', () => {
        renderAuthPrompt();
        expect(screen.getByText('Espace Réservé aux Membres')).toBeInTheDocument();
        expect(screen.getByText(/Rejoignez le Mouvement/)).toBeInTheDocument();
    });

    it('affiche les boutons Se connecter et Créer un compte', () => {
        renderAuthPrompt();
        expect(screen.getByText('Se connecter')).toBeInTheDocument();
        expect(screen.getByText('Créer un compte')).toBeInTheDocument();
    });

    it('contient les liens vers /login et /register', () => {
        renderAuthPrompt();
        const loginLink = screen.getByText('Se connecter').closest('a');
        const registerLink = screen.getByText('Créer un compte').closest('a');
        expect(loginLink).toHaveAttribute('href', '/login');
        expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('affiche le bouton X de fermeture', () => {
        renderAuthPrompt();
        const closeButton = screen.getByRole('button', { name: 'Fermer' });
        expect(closeButton).toBeInTheDocument();
        expect(closeButton.querySelector('svg')).toBeInTheDocument();
    });

    it('le bouton X est cliquable sans erreur', async () => {
        const user = userEvent.setup();
        renderAuthPrompt();
        const closeButton = screen.getByRole('button', { name: 'Fermer' });
        await user.click(closeButton);
    });
});
