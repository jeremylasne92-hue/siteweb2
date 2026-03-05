import { create } from 'zustand';
import { API_URL } from '../../config/api';

interface UserInfo {
    id: string;
    username: string;
    email: string;
    role: string;
    picture: string | null;
}

interface AuthState {
    token: string | null;
    user: UserInfo | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setToken: (token: string) => void;
    setUser: (user: UserInfo) => void;
    logout: () => void;
    checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    token: localStorage.getItem('session_token'),
    user: null,
    isAuthenticated: !!localStorage.getItem('session_token'),
    isLoading: false,

    setToken: (token) => {
        localStorage.setItem('session_token', token);
        set({ token, isAuthenticated: true });
    },

    setUser: (user) => {
        set({ user });
    },

    logout: () => {
        localStorage.removeItem('session_token');
        set({ token: null, user: null, isAuthenticated: false });
        // Call backend logout
        fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        }).catch(() => { /* silent */ });
    },

    checkSession: async () => {
        const token = get().token;
        if (!token) return;

        set({ isLoading: true });
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const user = await res.json();
                set({ user, isAuthenticated: true, isLoading: false });
            } else {
                localStorage.removeItem('session_token');
                set({ token: null, user: null, isAuthenticated: false, isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },
}));
