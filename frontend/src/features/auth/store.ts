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
    user: UserInfo | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: UserInfo) => void;
    logout: () => void;
    checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (user) => {
        set({ user, isAuthenticated: true });
    },

    logout: () => {
        set({ user: null, isAuthenticated: false });
        fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        }).catch(() => { /* silent */ });
    },

    checkSession: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include',
            });
            if (res.ok) {
                const user = await res.json();
                set({ user, isAuthenticated: true, isLoading: false });
            } else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },
}));
