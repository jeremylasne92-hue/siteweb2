import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Support } from './Support';
import { CAMPAIGNS } from '../config/donation';

const renderPage = () =>
    render(
        <MemoryRouter>
            <Support />
        </MemoryRouter>
    );

describe('Support - Story 2.4 Passerelle de Soutien et Dons', () => {
    it('les boutons "Contribuer" sont des liens vers HelloAsso (FR19)', () => {
        renderPage();
        const links = screen.getAllByRole('link', { name: /contribuer/i });
        expect(links.length).toBe(3);
        links.forEach((link, i) => {
            expect(link).toHaveAttribute('href', CAMPAIGNS[i].donationUrl);
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        });
    });

    it('affiche la mention HelloAsso comme plateforme de paiement', () => {
        renderPage();
        expect(screen.getByText(/plateforme de paiement sécurisée/)).toBeInTheDocument();
    });

    it('affiche les trois campagnes par ville', () => {
        renderPage();
        expect(screen.getByText(/Lille/)).toBeInTheDocument();
        expect(screen.getByText(/Lyon/)).toBeInTheDocument();
        expect(screen.getByText(/Bordeaux/)).toBeInTheDocument();
    });
});
