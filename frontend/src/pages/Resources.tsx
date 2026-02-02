import React, { useState } from 'react';
import { Search, Download, FileText, Video, BookOpen, ExternalLink, Filter } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export function Resources() {
    const [activeCategory, setActiveCategory] = useState("Tous");

    const categories = ["Tous", "Documents", "Vidéos", "Livres", "Outils"];

    const resources = [
        {
            id: 1,
            title: "Manifeste ECHO",
            type: "Documents",
            format: "PDF",
            size: "2.4 MB",
            desc: "Le document fondateur du mouvement, expliquant notre vision et nos objectifs.",
            icon: FileText
        },
        {
            id: 2,
            title: "Comprendre la Crise",
            type: "Vidéos",
            format: "MP4",
            duration: "15 min",
            desc: "Une explication claire et sans concession des enjeux climatiques actuels.",
            icon: Video
        },
        {
            id: 3,
            title: "Guide de la Résilience",
            type: "Livres",
            format: "EPUB",
            desc: "Un guide pratique pour préparer l'avenir, co-écrit par nos experts.",
            icon: BookOpen
        },
        {
            id: 4,
            title: "Calculateur d'Impact",
            type: "Outils",
            format: "Web",
            desc: "Évaluez votre impact personnel et découvrez des pistes d'amélioration.",
            icon: ExternalLink
        },
        {
            id: 5,
            title: "Kit Média",
            type: "Documents",
            format: "ZIP",
            size: "15 MB",
            desc: "Logos, images et communiqués de presse pour partager ECHO.",
            icon: Download
        },
        {
            id: 6,
            title: "Bibliographie Essentielle",
            type: "Livres",
            format: "PDF",
            desc: "Une liste curatée d'ouvrages pour approfondir vos connaissances.",
            icon: BookOpen
        }
    ];

    const filteredResources = activeCategory === "Tous"
        ? resources
        : resources.filter(r => r.type === activeCategory);

    return (
        <>
            {/* Hero Section */}
            <section className="relative py-20 bg-echo-darker border-b border-white/5">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">Médiathèque</h1>
                    <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
                        Accédez à l'ensemble nos ressources pour comprendre, se former et agir.
                        Libre d'accès et de partage.
                    </p>

                    <div className="relative max-w-xl mx-auto">
                        <Input
                            placeholder="Rechercher une ressource..."
                            className="pl-12 bg-white/5 border-white/10 text-lg py-6 rounded-full"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-4 min-h-screen bg-black/50">
                <div className="container mx-auto max-w-7xl">

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4 mb-10 overflow-x-auto pb-4 hide-scrollbar">
                        <span className="flex items-center gap-2 text-neutral-500 mr-4">
                            <Filter className="w-4 h-4" /> Filtres :
                        </span>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                    ? 'bg-echo-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                                    : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map((resource) => (
                            <Card key={resource.id} variant="glass" className="group">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-white/5 rounded-lg group-hover:bg-echo-gold/20 group-hover:text-echo-gold transition-colors">
                                            <resource.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider bg-black/20 px-2 py-1 rounded">
                                            {resource.type}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-echo-blueLight transition-colors">
                                        {resource.title}
                                    </h3>
                                    <p className="text-neutral-400 text-sm mb-6 line-clamp-2">
                                        {resource.desc}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <div className="text-xs text-neutral-500 font-mono">
                                            {resource.format}
                                            {resource.size && ` • ${resource.size}`}
                                            {resource.duration && ` • ${resource.duration}`}
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-echo-blueLight hover:text-white p-0">
                                            Télécharger
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {filteredResources.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-neutral-500">Aucune ressource trouvée pour cette catégorie.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
