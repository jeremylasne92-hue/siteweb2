import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Cognisphere } from './Cognisphere';

const renderPage = () =>
    render(
        <MemoryRouter>
            <Cognisphere />
        </MemoryRouter>
    );

describe('Cognisphere - Story 2.3 Candidatures Anti-Spam', () => {
    it('affiche le formulaire de candidature technique (FR17)', () => {
        renderPage();
        expect(screen.getByText("Rejoindre l'équipe technique")).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Votre nom')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument();
    });

    it('contient le champ honeypot caché (FR18)', () => {
        renderPage();
        const honeypot = document.querySelector('input[name="website"]') as HTMLInputElement;
        expect(honeypot).toBeTruthy();
        expect(honeypot.tabIndex).toBe(-1);
    });

    it('le bouton Envoyer est présent', () => {
        renderPage();
        expect(screen.getByText('Envoyer ma candidature')).toBeInTheDocument();
    });
});
