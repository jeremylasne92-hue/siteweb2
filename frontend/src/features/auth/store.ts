import { create } from 'zustand';

interface AuthUser {
    id: string;
    username: string;
    email: string;
    role: string;
    picture: string | null;
}

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    setToken: (token: string) => void;
    setUser: (user: AuthUser) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('session_token'),
    user: null,
    isAuthenticated: !!localStorage.getItem('session_token'),
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
    },
}));
