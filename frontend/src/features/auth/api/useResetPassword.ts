import { useMutation } from '@tanstack/react-query';
import { API_URL } from '../../../config/api';

interface ResetPasswordPayload {
    token: string;
    password: string;
    password_confirm: string;
}

interface ResetPasswordResponse {
    message: string;
}

async function resetPassword({ token, ...data }: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Erreur lors de la réinitialisation');
    }
    return res.json();
}

export function useResetPassword() {
    return useMutation({
        mutationFn: resetPassword,
    });
}
