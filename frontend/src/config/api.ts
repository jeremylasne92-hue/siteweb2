// Centralized API configuration
// In development: points to localhost
// In production: uses the VITE_API_URL env variable or relative path
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const PARTNERS_API = `${API_URL}/partners`;
export const EVENTS_API = `${API_URL}/events`;
export const EPISODES_API = `${API_URL}/episodes`;
