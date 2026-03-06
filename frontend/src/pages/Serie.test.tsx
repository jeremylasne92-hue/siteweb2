import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Serie } from './Serie';

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

    it('le lecteur vidéo YouTube est intégré (FR6)', () => {
        renderSerie();
        const iframe = document.querySelector('iframe[src*="youtube.com/embed"]');
        expect(iframe).toBeTruthy();
    });

    it('les cartes épisodes sont cliquables pour voir les thèmes', () => {
        renderSerie();
        const episodeCards = screen.getAllByRole('button', { name: /Voir les thèmes de l'épisode/ });
        expect(episodeCards.length).toBe(11);
    });
});
