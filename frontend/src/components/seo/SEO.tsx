import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    image?: string;
    url?: string;
}

export function SEO({ title, description, image = 'https://mouvementecho.fr/logo-echo.jpg', url = 'https://mouvementecho.fr' }: SEOProps) {
    const fullTitle = `${title} | Mouvement ECHO`;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />

            {/* OpenGraph tags */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={image} />
            <meta property="og:locale" content="fr_FR" />
            <meta property="og:site_name" content="Mouvement ECHO" />

            {/* Canonical URL */}
            <link rel="canonical" href={url} />

            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
}
