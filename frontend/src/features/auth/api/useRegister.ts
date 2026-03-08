import { useMutation } from '@tanstack/react-query';
import { API_URL } from '../../../config/api';

interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    age_consent: boolean;
}

interface RegisterResponse {
    id: string;
    username: string;
    email: string;
    message: string;
}

async function registerUser(data: RegisterPayload): Promise<RegisterResponse> {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
