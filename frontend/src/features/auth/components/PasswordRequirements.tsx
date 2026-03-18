import { Check, X } from 'lucide-react';

interface PasswordRequirementsProps {
    password: string;
}

const requirements = [
    { label: '8 caractères minimum', test: (p: string) => p.length >= 8 },
    { label: '1 lettre majuscule', test: (p: string) => /[A-Z]/.test(p) },
    { label: '1 chiffre', test: (p: string) => /[0-9]/.test(p) },
    { label: '1 caractère spécial (!@#$...)', test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
];

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
    if (!password) return null;

    return (
        <ul className="space-y-1 mt-2 animate-fade-in">
            {requirements.map((req) => {
                const met = req.test(password);
                return (
                    <li key={req.label} className="flex items-center gap-2 text-xs">
                        {met ? (
                            <Check size={14} className="text-green-500 shrink-0" />
                        ) : (
                            <X size={14} className="text-red-400 shrink-0" />
                        )}
                        <span className={met ? 'text-green-400' : 'text-stone-400'}>
                            {req.label}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}
