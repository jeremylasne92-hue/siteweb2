import { useMutation } from '@tanstack/react-query';
import { API_URL } from '../../../config/api';

interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    interests?: string[];
    age_consent: boolean;
    acquisition_source?: string;
}

interface RegisterResponse {
    id: string;
    username: string;
    email: string;
    message: string;
}

async function registerUser(data: RegisterPayload): Promise<RegisterResponse> {
    // Attach UTM params and referrer from sessionStorage
    const enrichedData = {
        ...data,
        utm_source: sessionStorage.getItem('echo_utm_source') || undefined,
        utm_medium: sessionStorage.getItem('echo_utm_medium') || undefined,
        utm_campaign: sessionStorage.getItem('echo_utm_campaign') || undefined,
        referrer: sessionStorage.getItem('echo_referrer') || undefined,
    };

    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(enrichedData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Erreur lors de l\'inscription');
    }
    return res.json();
}

export function useRegister() {
    return useMutation({
        mutationFn: registerUser,
    });
}
