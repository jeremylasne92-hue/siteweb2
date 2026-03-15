import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
    label: string;
    href?: string; // Omit for current page (last item)
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

const BASE_URL = 'https://mouvementecho.fr';

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    const allItems: BreadcrumbItem[] = [{ label: 'Accueil', href: '/' }, ...items];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": allItems.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            ...(item.href ? { "item": `${BASE_URL}${item.href}` } : {}),
        })),
    };

    return (
        <>
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Helmet>
            <nav
                aria-label="Fil d'Ariane"
                className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-2"
            >
                <ol className="flex items-center gap-1.5 text-sm text-echo-textMuted">
                    {allItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-1.5">
                            {index > 0 && <ChevronRight size={14} className="opacity-40" />}
                            {item.href ? (
                                <Link
                                    to={item.href}
                                    className="hover:text-echo-gold transition-colors"
                                >
                                    {index === 0 ? <Home size={14} /> : item.label}
                                </Link>
                            ) : (
                                <span className="text-white/70">{item.label}</span>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
}
