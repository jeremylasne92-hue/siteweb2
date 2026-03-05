import { z } from 'zod';

// ==================== REGISTER ====================

export const registerSchema = z.object({
    username: z.string()
        .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
        .max(30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères')
        .regex(/^[a-zA-Z0-9_]+$/, 'Seuls les lettres, chiffres et underscores sont autorisés'),
    email: z.string()
        .email('Adresse email invalide'),
    password: z.string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins 1 majuscule')
        .regex(/[0-9]/, 'Le mot de passe doit contenir au moins 1 chiffre')
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Le mot de passe doit contenir au moins 1 caractère spécial'),
    password_confirm: z.string(),
    age_consent: z.boolean().refine(val => val === true, {
        message: 'Vous devez certifier avoir plus de 15 ans',
    }),
}).refine(data => data.password === data.password_confirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirm'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// ==================== LOGIN ====================

export const loginSchema = z.object({
    identifier: z.string()
        .min(1, 'Veuillez entrer votre email ou nom d\'utilisateur'),
    password: z.string()
        .min(1, 'Veuillez entrer votre mot de passe'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ==================== PASSWORD STRENGTH ====================

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

export function getPasswordStrength(password: string): { score: number; label: PasswordStrength; color: string } {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'weak', color: '#ef4444' };
    if (score <= 2) return { score: 2, label: 'medium', color: '#f59e0b' };
    if (score <= 3) return { score: 3, label: 'strong', color: '#22c55e' };
    return { score: 4, label: 'very-strong', color: '#10b981' };
}

export const strengthLabels: Record<PasswordStrength, string> = {
    'weak': 'Faible',
    'medium': 'Moyen',
    'strong': 'Fort',
    'very-strong': 'Très fort',
};

// ==================== FORGOT PASSWORD ====================

export const forgotPasswordSchema = z.object({
    email: z.string()
        .email('Adresse email invalide'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ==================== RESET PASSWORD ====================

export const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins 1 majuscule')
        .regex(/[0-9]/, 'Le mot de passe doit contenir au moins 1 chiffre')
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Le mot de passe doit contenir au moins 1 caractère spécial'),
    password_confirm: z.string(),
}).refine(data => data.password === data.password_confirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirm'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
