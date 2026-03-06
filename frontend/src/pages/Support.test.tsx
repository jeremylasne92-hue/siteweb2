import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Support } from './Support';
import { DONATION_URL } from '../config/donation';

const renderPage = () =>
    render(
        <MemoryRouter>
            <Support />
        </MemoryRouter>
    );

describe('Support - Story 2.4 Passerelle de Soutien et Dons', () => {
    it('les boutons "Je soutiens" sont des liens vers HelloAsso (FR19)', () => {
        renderPage();
        const links = screen.getAllByRole('link', { name: /je soutiens/i });
        expect(links.length).toBe(3);
        links.forEach((link) => {
            expect(link).toHaveAttribute('href', DONATION_URL);
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        });
    });

    it('affiche la mention HelloAsso comme plateforme de paiement', () => {
        renderPage();
        expect(screen.getByText(/HelloAsso/)).toBeInTheDocument();
        expect(screen.getByText(/plateforme certifiée/)).toBeInTheDocument();
    });

    it('affiche les trois paliers de don', () => {
        renderPage();
        expect(screen.getByText('Graine')).toBeInTheDocument();
        expect(screen.getByText('Racine')).toBeInTheDocument();
        expect(screen.getByText('Canopée')).toBeInTheDocument();
    });
});
