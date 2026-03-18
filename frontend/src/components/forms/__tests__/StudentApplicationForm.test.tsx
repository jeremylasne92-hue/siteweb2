import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentApplicationForm } from '../StudentApplicationForm';

// Mock fetch
const mockFetch = vi.fn();
(globalThis as Record<string, unknown>).fetch = mockFetch;

// Mock CityAutocomplete to avoid external API calls
vi.mock('../../ui/CityAutocomplete', () => ({
    CityAutocomplete: ({ label, name, placeholder, required }: { label: string; name: string; placeholder?: string; required?: boolean }) => (
        <div>
            <label>{label}</label>
            <input name={name} placeholder={placeholder} required={required} data-testid="city-input" />
        </div>
    ),
}));

const renderForm = () =>
    render(
        <MemoryRouter>
            <StudentApplicationForm />
        </MemoryRouter>
    );

beforeEach(() => {
    vi.clearAllMocks();
    // Reset HTMLInputElement.prototype.checkValidity to default
    vi.restoreAllMocks();
});

describe('StudentApplicationForm', () => {
    describe('Rendering', () => {
        it('renders step 1 (Identite) by default with name and email fields', () => {
            renderForm();
            expect(screen.getByText('Nom complet')).toBeInTheDocument();
            expect(screen.getByText('Email de contact')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Votre prénom et nom')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument();
        });

        it('shows StepProgress component with step labels', () => {
            renderForm();
            expect(screen.getByText('Identité')).toBeInTheDocument();
            expect(screen.getByText('Formation & Compétences')).toBeInTheDocument();
            expect(screen.getByText('Validation')).toBeInTheDocument();
        });
    });

    describe('Step 1 validation', () => {
        it('does not advance when name is empty', () => {
            renderForm();
            // Mock checkValidity to return false for empty name
            const nameInput = screen.getByPlaceholderText('Votre prénom et nom');
            vi.spyOn(nameInput as HTMLInputElement, 'checkValidity').mockReturnValue(false);
            vi.spyOn(nameInput as HTMLInputElement, 'reportValidity').mockReturnValue(false);

            fireEvent.click(screen.getByText('Suivant'));

            // Should still be on step 1 — step 1 content visible, step 2 still hidden
            expect(screen.getByPlaceholderText('Votre prénom et nom')).toBeVisible();
            // The step 2 div has the 'hidden' class so its content should not be visible
            const step2Section = screen.getByPlaceholderText("Nom de votre école ou université").closest('div[class*="hidden"]');
            expect(step2Section).toBeTruthy();
        });

        it('shows error when email is invalid format', () => {
            renderForm();
            const nameInput = screen.getByPlaceholderText('Votre prénom et nom');
            const emailInput = screen.getByPlaceholderText('votre@email.com');

            // Name is valid
            fireEvent.change(nameInput, { target: { value: 'Jean Dupont' } });
            vi.spyOn(nameInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            // Email passes browser checkValidity but fails isValidEmail
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            vi.spyOn(emailInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            fireEvent.click(screen.getByText('Suivant'));

            expect(screen.getByText(/Adresse email invalide/)).toBeInTheDocument();
        });

        it('advances to step 2 when step 1 is valid', () => {
            renderForm();
            const nameInput = screen.getByPlaceholderText('Votre prénom et nom');
            const emailInput = screen.getByPlaceholderText('votre@email.com');
            const cityInput = screen.getByTestId('city-input');

            fireEvent.change(nameInput, { target: { value: 'Jean Dupont' } });
            fireEvent.change(emailInput, { target: { value: 'jean@test.com' } });
            fireEvent.change(cityInput, { target: { value: 'Paris' } });

            vi.spyOn(nameInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(emailInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(cityInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            fireEvent.click(screen.getByText('Suivant'));

            // Step 2 content should now be visible
            expect(screen.getByText('Établissement / École')).toBeVisible();
        });
    });

    describe('Step 2 validation', () => {
        const goToStep2 = () => {
            renderForm();
            const nameInput = screen.getByPlaceholderText('Votre prénom et nom');
            const emailInput = screen.getByPlaceholderText('votre@email.com');
            const cityInput = screen.getByTestId('city-input');

            fireEvent.change(nameInput, { target: { value: 'Jean Dupont' } });
            fireEvent.change(emailInput, { target: { value: 'jean@test.com' } });
            fireEvent.change(cityInput, { target: { value: 'Paris' } });

            vi.spyOn(nameInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(emailInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(cityInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            fireEvent.click(screen.getByText('Suivant'));
        };

        it('shows error when no skills selected', () => {
            goToStep2();

            const schoolInput = screen.getByPlaceholderText("Nom de votre école ou université");
            const studyInput = screen.getByPlaceholderText(/Cinéma, Communication/);

            fireEvent.change(schoolInput, { target: { value: 'Ecole de Cinema' } });
            fireEvent.change(studyInput, { target: { value: 'Cinema' } });

            vi.spyOn(schoolInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(studyInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            // Click next without selecting any skills
            fireEvent.click(screen.getByText('Suivant'));

            expect(screen.getByText(/Veuillez sélectionner au moins une compétence/)).toBeInTheDocument();
        });

        it('shows error when no availability selected', () => {
            goToStep2();

            const schoolInput = screen.getByPlaceholderText("Nom de votre école ou université");
            const studyInput = screen.getByPlaceholderText(/Cinéma, Communication/);

            fireEvent.change(schoolInput, { target: { value: 'Ecole de Cinema' } });
            fireEvent.change(studyInput, { target: { value: 'Cinema' } });

            vi.spyOn(schoolInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(studyInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            // Expand a category and select a skill
            fireEvent.click(screen.getByText('Image'));
            fireEvent.click(screen.getByText('Photographie'));

            // Click next without selecting availability
            fireEvent.click(screen.getByText('Suivant'));

            expect(screen.getByText(/Veuillez sélectionner un type de disponibilité/)).toBeInTheDocument();
        });

        it('advances to step 3 when step 2 is valid', () => {
            goToStep2();

            const schoolInput = screen.getByPlaceholderText("Nom de votre école ou université");
            const studyInput = screen.getByPlaceholderText(/Cinéma, Communication/);

            fireEvent.change(schoolInput, { target: { value: 'Ecole de Cinema' } });
            fireEvent.change(studyInput, { target: { value: 'Cinema' } });

            vi.spyOn(schoolInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(studyInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            // Select a skill
            fireEvent.click(screen.getByText('Image'));
            fireEvent.click(screen.getByText('Photographie'));

            // Select availability
            fireEvent.click(screen.getByText('Stage court (< 3 mois)'));

            fireEvent.click(screen.getByText('Suivant'));

            // Step 3 should show RGPD checkbox and submit button
            expect(screen.getByText(/politique de confidentialité/)).toBeVisible();
            expect(screen.getByText('Soumettre')).toBeVisible();
        });
    });

    describe('Step 3 validation', () => {
        const goToStep3 = () => {
            renderForm();
            const nameInput = screen.getByPlaceholderText('Votre prénom et nom');
            const emailInput = screen.getByPlaceholderText('votre@email.com');
            const cityInput = screen.getByTestId('city-input');

            fireEvent.change(nameInput, { target: { value: 'Jean Dupont' } });
            fireEvent.change(emailInput, { target: { value: 'jean@test.com' } });
            fireEvent.change(cityInput, { target: { value: 'Paris' } });

            vi.spyOn(nameInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(emailInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(cityInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            fireEvent.click(screen.getByText('Suivant'));

            // Step 2
            const schoolInput = screen.getByPlaceholderText("Nom de votre école ou université");
            const studyInput = screen.getByPlaceholderText(/Cinéma, Communication/);

            fireEvent.change(schoolInput, { target: { value: 'Ecole de Cinema' } });
            fireEvent.change(studyInput, { target: { value: 'Cinema' } });

            vi.spyOn(schoolInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(studyInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            fireEvent.click(screen.getByText('Image'));
            fireEvent.click(screen.getByText('Photographie'));
            fireEvent.click(screen.getByText('Stage court (< 3 mois)'));

            fireEvent.click(screen.getByText('Suivant'));
        };

        it('shows submit button disabled when RGPD not checked', () => {
            goToStep3();
            const submitButton = screen.getByText('Soumettre').closest('button');
            expect(submitButton).toBeDisabled();
        });

        it('shows submit button on step 3', () => {
            goToStep3();
            expect(screen.getByText('Soumettre')).toBeVisible();
            expect(screen.getByText(/politique de confidentialité/)).toBeVisible();
        });
    });

    describe('Form submission', () => {
        const goToStep3AndCheckRGPD = () => {
            renderForm();
            const nameInput = screen.getByPlaceholderText('Votre prénom et nom');
            const emailInput = screen.getByPlaceholderText('votre@email.com');
            const cityInput = screen.getByTestId('city-input');

            fireEvent.change(nameInput, { target: { value: 'Jean Dupont' } });
            fireEvent.change(emailInput, { target: { value: 'jean@test.com' } });
            fireEvent.change(cityInput, { target: { value: 'Paris' } });

            vi.spyOn(nameInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(emailInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(cityInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            fireEvent.click(screen.getByText('Suivant'));

            const schoolInput = screen.getByPlaceholderText("Nom de votre école ou université");
            const studyInput = screen.getByPlaceholderText(/Cinéma, Communication/);

            fireEvent.change(schoolInput, { target: { value: 'Ecole de Cinema' } });
            fireEvent.change(studyInput, { target: { value: 'Cinema' } });

            vi.spyOn(schoolInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(studyInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            fireEvent.click(screen.getByText('Image'));
            fireEvent.click(screen.getByText('Photographie'));
            fireEvent.click(screen.getByText('Stage court (< 3 mois)'));

            fireEvent.click(screen.getByText('Suivant'));

            // Check RGPD consent — target the one with required attribute (not sr-only skill checkboxes)
            const rgpdCheckbox = screen.getByRole('checkbox', { name: /politique de confidentialité/i });
            fireEvent.click(rgpdCheckbox);
        };

        it('successful submission shows success message', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ id: '123', rate_limited: false }),
            });

            goToStep3AndCheckRGPD();

            const submitButton = screen.getByText('Soumettre').closest('button')!;
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Candidature envoyée avec succès/)).toBeInTheDocument();
            });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/students/apply'),
                expect.objectContaining({ method: 'POST' }),
            );
        });

        it('handles API error gracefully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            goToStep3AndCheckRGPD();

            const submitButton = screen.getByText('Soumettre').closest('button')!;
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Une erreur est survenue/)).toBeInTheDocument();
            });
        });
    });

    describe('Navigation', () => {
        it('back button returns to previous step', () => {
            renderForm();
            const nameInput = screen.getByPlaceholderText('Votre prénom et nom');
            const emailInput = screen.getByPlaceholderText('votre@email.com');
            const cityInput = screen.getByTestId('city-input');

            fireEvent.change(nameInput, { target: { value: 'Jean Dupont' } });
            fireEvent.change(emailInput, { target: { value: 'jean@test.com' } });
            fireEvent.change(cityInput, { target: { value: 'Paris' } });

            vi.spyOn(nameInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(emailInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(cityInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            // Go to step 2
            fireEvent.click(screen.getByText('Suivant'));
            expect(screen.getByText('Établissement / École')).toBeVisible();

            // Go back to step 1
            fireEvent.click(screen.getByText(/Précédent/));
            expect(screen.getByPlaceholderText('Votre prénom et nom')).toBeVisible();
        });

        it('can navigate through all 3 steps', () => {
            renderForm();
            // Step 1
            expect(screen.getByText('Nom complet')).toBeVisible();

            const nameInput = screen.getByPlaceholderText('Votre prénom et nom');
            const emailInput = screen.getByPlaceholderText('votre@email.com');
            const cityInput = screen.getByTestId('city-input');

            fireEvent.change(nameInput, { target: { value: 'Jean Dupont' } });
            fireEvent.change(emailInput, { target: { value: 'jean@test.com' } });
            fireEvent.change(cityInput, { target: { value: 'Paris' } });

            vi.spyOn(nameInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(emailInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(cityInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            fireEvent.click(screen.getByText('Suivant'));

            // Step 2
            expect(screen.getByText('Établissement / École')).toBeVisible();

            const schoolInput = screen.getByPlaceholderText("Nom de votre école ou université");
            const studyInput = screen.getByPlaceholderText(/Cinéma, Communication/);

            fireEvent.change(schoolInput, { target: { value: 'Ecole de Cinema' } });
            fireEvent.change(studyInput, { target: { value: 'Cinema' } });

            vi.spyOn(schoolInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);
            vi.spyOn(studyInput as HTMLInputElement, 'checkValidity').mockReturnValue(true);

            fireEvent.click(screen.getByText('Image'));
            fireEvent.click(screen.getByText('Photographie'));
            fireEvent.click(screen.getByText('Stage court (< 3 mois)'));

            fireEvent.click(screen.getByText('Suivant'));

            // Step 3
            expect(screen.getByText(/politique de confidentialité/)).toBeVisible();
            expect(screen.getByText('Soumettre')).toBeVisible();
        });
    });
});
