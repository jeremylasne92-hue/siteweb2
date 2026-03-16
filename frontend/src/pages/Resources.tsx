import { useState, useEffect } from 'react';
import { FileText, Video, BookOpen, ExternalLink, Filter, Play, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SEO } from '../components/seo/SEO';
import { MEDIATHEQUE_API } from '../config/api';
import type { MediaResource, ResourceType } from '../types/mediatheque';
import { RESOURCE_TYPE_LABELS, RESOURCE_TYPE_COLORS } from '../types/mediatheque';

const TYPE_ICONS: Record<ResourceType, typeof FileText> = {
    document: FileText,
    video: Video,
    livre: BookOpen,
    outil: ExternalLink,
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function extractYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function extractHostname(url: string): string {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
}

export function Resources() {
    const [resources, setResources] = useState<MediaResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeType, setActiveType] = useState<ResourceType | null>(null);
    const [videoModal, setVideoModal] = useState<string | null>(null);

    useEffect(() => {
        const fetchResources = async () => {
            setIsLoading(true);
            try {
                const url = activeType
                    ? `${MEDIATHEQUE_API}?type=${activeType}`
                    : MEDIATHEQUE_API;
                const res = await fetch(url);
                if (res.ok) {
                    setResources(await res.json());
                }
            } catch (err) {
                console.error('Failed to fetch resources', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResources();
    }, [activeType]);

    const handleCardAction = (resource: MediaResource) => {
        if (resource.resource_type === 'video' && resource.external_url) {
            const ytId = extractYouTubeId(resource.external_url);
            if (ytId) {
                setVideoModal(`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1`);
                return;
            }
        }
        if (resource.file_url) {
            window.open(resource.file_url, '_blank');
            return;
        }
        if (resource.external_url) {
            window.open(resource.external_url, '_blank', 'noopener');
        }
    };

    const getActionLabel = (resource: MediaResource): string => {
        switch (resource.resource_type) {
            case 'video': return 'Regarder';
            case 'document': return resource.file_url ? 'Télécharger' : 'Consulter';
            case 'livre': return resource.file_url ? 'Télécharger' : 'En savoir plus';
            case 'outil': return 'Accéder';
            default: return 'Voir';
        }
    };

    const categories: { key: ResourceType | null; label: string }[] = [
        { key: null, label: 'Tous' },
        { key: 'document', label: 'Documents' },
        { key: 'video', label: 'Vidéos' },
        { key: 'livre', label: 'Livres' },
        { key: 'outil', label: 'Outils' },
    ];

    return (
        <>
            <SEO
                title="Ressources"
                description="Ressources et documentation du Mouvement ECHO. Contenus pédagogiques sur la transition écologique et sociale."
                url="https://mouvementecho.fr/ressources"
            />

            {/* Hero Section */}
            <section className="relative py-20 bg-echo-darker border-b border-white/5">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-white mb-4 sm:mb-6">Médiathèque</h1>
                    <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                        Accédez à l'ensemble nos ressources pour comprendre, se former et agir.
                        Libre d'accès et de partage.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-4 min-h-screen bg-black/50">
                <div className="container mx-auto max-w-7xl">

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-8 sm:mb-10 overflow-x-auto pb-4 hide-scrollbar">
                        <span className="flex items-center gap-2 text-neutral-500 mr-4">
                            <Filter className="w-4 h-4" /> Filtres :
                        </span>
                        {categories.map((cat) => (
                            <button
                                key={cat.label}
                                onClick={() => setActiveType(cat.key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeType === cat.key
                                    ? 'bg-echo-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                                    : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Loading state */}
                    {isLoading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-echo-gold mx-auto mb-4" />
                            <p className="text-neutral-500">Chargement des ressources...</p>
                        </div>
                    ) : resources.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-neutral-500">Aucune ressource trouvée pour cette catégorie.</p>
                        </div>
                    ) : (
                        /* Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resources.map((resource) => {
                                const colors = RESOURCE_TYPE_COLORS[resource.resource_type];
                                const Icon = TYPE_ICONS[resource.resource_type];
                                const ytId = resource.resource_type === 'video' && resource.external_url
                                    ? extractYouTubeId(resource.external_url) : null;

                                return (
                                    <Card
                                        key={resource.id}
                                        variant="glass"
                                        className={`group border-l-4 ${colors.border} hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
                                        onClick={() => handleCardAction(resource)}
                                    >
                                        {/* YouTube thumbnail for videos */}
                                        {ytId && (
                                            <div className="relative aspect-video overflow-hidden rounded-t-lg">
                                                <img
                                                    src={resource.thumbnail_url || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                                                    alt={resource.title}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                                                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                        <Play className="w-6 h-6 text-white ml-1" fill="white" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-3 bg-white/5 rounded-lg group-hover:bg-echo-gold/20 group-hover:text-echo-gold transition-colors">
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                                                    {RESOURCE_TYPE_LABELS[resource.resource_type]}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-echo-blueLight transition-colors">
                                                {resource.title}
                                            </h3>

                                            <p className="text-neutral-400 text-sm mb-4 line-clamp-3">
                                                {resource.description}
                                            </p>

                                            {/* Source / Author / Year */}
                                            {(resource.author || resource.source || resource.year) && (
                                                <div className="text-xs text-neutral-500 mb-4">
                                                    {resource.author && <span>{resource.author}</span>}
                                                    {resource.author && resource.year && <span> · </span>}
                                                    {resource.year && <span>{resource.year}</span>}
                                                    {!resource.author && resource.source && <span>{resource.source}</span>}
                                                </div>
                                            )}

                                            {/* Tags */}
                                            {resource.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    {resource.tags.slice(0, 4).map(tag => (
                                                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-neutral-400">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                                <div className="text-xs text-neutral-500 font-mono">
                                                    {resource.file_name && resource.file_size
                                                        ? `PDF · ${formatFileSize(resource.file_size)}`
                                                        : resource.resource_type === 'video' ? 'YouTube'
                                                        : resource.external_url ? extractHostname(resource.external_url) : ''}
                                                </div>
                                                <Button variant="ghost" size="sm" className="text-echo-blueLight hover:text-white p-0">
                                                    {getActionLabel(resource)}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Video Modal */}
            {videoModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setVideoModal(null)}
                >
                    <div className="relative w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setVideoModal(null)}
                            className="absolute -top-10 right-0 text-white/70 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <iframe
                            src={videoModal}
                            className="w-full h-full rounded-lg"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            title="Video player"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
