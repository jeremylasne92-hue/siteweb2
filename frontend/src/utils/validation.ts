/**
 * Validates an email address format.
 * Returns true if the email is valid or empty/null (optional fields).
 */
export function isValidEmail(email: string | null | undefined): boolean {
    if (!email || email.trim() === '') return true; // empty = optional, OK
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validates a phone number format (FR-style: digits, spaces, dashes, dots, +).
 * Returns true if the phone is valid or empty/null (optional fields).
 */
export function isValidPhone(phone: string | null | undefined): boolean {
    if (!phone || phone.trim() === '') return true;
    return /^[+]?[\d\s.\-()]{6,20}$/.test(phone.trim());
}

/**
 * Sanitizes a phone input value by stripping invalid characters.
 * Keeps only digits, spaces, dashes, dots, parentheses and leading +.
 */
export function sanitizePhone(value: string): string {
    // Keep leading + if present, then only allowed chars
    const cleaned = value.replace(/[^\d\s.\-+()]/g, '');
    // Ensure + only appears at the start
    const plusIndex = cleaned.indexOf('+');
    if (plusIndex > 0) {
        return cleaned.slice(0, plusIndex) + cleaned.slice(plusIndex + 1);
    }
    return cleaned;
}

/**
 * Validates a French postal code (5 digits).
 * Returns true if the postal code is valid or empty/null (optional fields).
 */
export function isValidPostalCode(code: string | null | undefined): boolean {
    if (!code || code.trim() === '') return true;
    return /^\d{5}$/.test(code.trim());
}

/**
 * Parses a FastAPI 422 error detail (which can be a string or array of validation errors)
 * into a human-readable string.
 */
export function parse422Detail(detail: unknown): string {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
        return detail
            .map((e: { loc?: string[]; msg?: string }) => {
                const field = e.loc?.slice(-1)[0] || '?';
                return `${field}: ${e.msg}`;
            })
            .join(', ');
    }
    return 'Erreur de validation';
}
