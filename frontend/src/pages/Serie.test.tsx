import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Serie } from './Serie';

const CONSENT_KEY = 'echo-cookie-consent';

const renderSerie = () =>
    render(
        <MemoryRouter>
            <Serie />
        </MemoryRouter>
    );

describe('Serie - Story 2.1 QA Express', () => {
    it('affiche le badge "Bientôt disponible" sur les cartes épisodes S1', () => {
        renderSerie();
        const badges = screen.getAllByText('Bientôt disponible');
        // 11 épisodes en Saison 1 = 11 badges
        expect(badges.length).toBe(11);
    });

    it('affiche la façade YouTube quand le consentement n\'est pas donné (FR6 + RGPD)', () => {
        localStorage.removeItem(CONSENT_KEY);
        renderSerie();
        // No iframe should load before consent
        const iframe = document.querySelector('iframe[src*="youtube"]');
        expect(iframe).toBeNull();
        // Facade placeholder should be shown
        expect(screen.getByText('Contenu vidéo YouTube')).toBeInTheDocument();
        expect(screen.getByText('Accepter et afficher la vidéo')).toBeInTheDocument();
    });

    it('affiche le lecteur vidéo YouTube après consentement (FR6)', () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice: 'accepted', timestamp: Date.now() }));
        renderSerie();
        const iframe = document.querySelector('iframe[src*="youtube-nocookie.com/embed"]');
        expect(iframe).toBeTruthy();
    });

    it('les cartes épisodes sont cliquables pour voir les thèmes', () => {
        renderSerie();
        const episodeCards = screen.getAllByRole('button', { name: /Voir les thèmes de l'épisode/ });
        expect(episodeCards.length).toBe(11);
    });
});

describe('Serie - Story 2.2 Exploration & Opt-in', () => {
    it('affiche le synopsis dans la modale épisode (FR8)', () => {
        renderSerie();
        // Click first episode card to open modal
        const cards = screen.getAllByRole('button', { name: /Voir les thèmes de l'épisode/ });
        fireEvent.click(cards[0]);
        // Synopsis placeholder should be visible
        expect(screen.getByText('Synopsis à venir')).toBeInTheDocument();
    });

    it('affiche les thématiques dans la modale (FR8)', () => {
        renderSerie();
        const cards = screen.getAllByRole('button', { name: /Voir les thèmes de l'épisode/ });
        fireEvent.click(cards[0]);
        expect(screen.getByText(/Thématiques Existentielles/)).toBeInTheDocument();
        expect(screen.getByText(/Thématiques Sociétales/)).toBeInTheDocument();
        expect(screen.getByText(/Thématiques Sociales/)).toBeInTheDocument();
    });

    it('le bouton opt-in est masqué si non connecté (FR9)', () => {
        renderSerie();
        const cards = screen.getAllByRole('button', { name: /Voir les thèmes de l'épisode/ });
        fireEvent.click(cards[0]);
        // Opt-in button should NOT be visible when not authenticated
        expect(screen.queryByText("M'alerter à la sortie")).not.toBeInTheDocument();
    });
});
