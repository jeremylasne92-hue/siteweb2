import { useMutation } from '@tanstack/react-query';
import { API_URL } from '../../../config/api';

interface ForgotPasswordPayload {
    email: string;
}

interface ForgotPasswordResponse {
    message: string;
}

async function forgotPassword(data: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Erreur lors de la demande');
    }
    return res.json();
}

export function useForgotPassword() {
    return useMutation({
        mutationFn: forgotPassword,
    });
}
