/** Common TLDs for basic email validation (not exhaustive but covers 99%+ of real emails). */
const COMMON_TLDS = new Set([
    'com', 'fr', 'net', 'org', 'eu', 'io', 'co', 'dev', 'app', 'info',
    'biz', 'me', 'tv', 'cc', 'be', 'ch', 'de', 'uk', 'us', 'ca', 'au',
    'nl', 'it', 'es', 'pt', 'at', 'pl', 'cz', 'se', 'no', 'dk', 'fi',
    'ie', 'lu', 'ro', 'bg', 'hr', 'sk', 'si', 'lt', 'lv', 'ee', 'hu',
    'gr', 'cy', 'mt', 'jp', 'kr', 'cn', 'in', 'br', 'mx', 'ar', 'cl',
    'ru', 'ua', 'za', 'nz', 'sg', 'hk', 'tw', 'th', 'id', 'ph', 'vn',
    'xyz', 'online', 'site', 'tech', 'store', 'cloud', 'pro', 'live',
    'email', 'name', 'space', 'shop', 'design', 'digital', 'media',
    'studio', 'agency', 'social', 'world', 'global', 'education',
    'asso', 'gouv', 'ac', 'edu', 'gov', 'mil', 'int',
]);

/**
 * Validates an email address format.
 * Returns true if the email is valid or empty/null (optional fields).
 * Checks format + TLD against common TLDs list.
 */
export function isValidEmail(email: string | null | undefined): boolean {
    if (!email || email.trim() === '') return true; // empty = optional, OK
    const trimmed = email.trim();
    // Basic format: local@domain.tld
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,20}$/.test(trimmed)) return false;
    // Extract TLD and check against known TLDs
    const tld = trimmed.split('.').pop()?.toLowerCase();
    if (!tld || !COMMON_TLDS.has(tld)) return false;
    return true;
}

/**
 * Validates a phone number format.
 * - French numbers (starting with 0): exactly 10 digits
 * - International (starting with +): 6-15 digits (ITU-T E.164)
 * Returns true if the phone is valid or empty/null (optional fields).
 */
export function isValidPhone(phone: string | null | undefined): boolean {
    if (!phone || phone.trim() === '') return true;
    const trimmed = phone.trim();
    if (!/^[+0][\d\s.\-()]{5,19}$/.test(trimmed)) return false;
    const digitCount = trimmed.replace(/\D/g, '').length;
    // French local format (starts with 0): must be exactly 10 digits
    if (trimmed.startsWith('0')) {
        return digitCount === 10;
    }
    // International format (starts with +): 6-15 digits
    return digitCount >= 6 && digitCount <= 15;
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
