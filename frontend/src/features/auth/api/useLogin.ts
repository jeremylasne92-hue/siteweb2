import { useMutation } from '@tanstack/react-query';
import { API_URL } from '../../../config/api';
import { useAuthStore } from '../store';

interface LoginPayload {
    identifier: string;
    password: string;
}

interface LoginResponse {
    user: {
        id: string;
        username: string;
        email: string;
        role: string;
        picture: string | null;
    };
}

async function loginUser(data: LoginPayload): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/auth/login-local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Erreur de connexion');
    }
    return res.json();
}

export function useLogin() {
    const setUser = useAuthStore((s) => s.setUser);

    return useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            // M5 — session_token is in httpOnly cookie, not in JSON
            setUser(data.user);
        },
    });
}
