import { useState, useEffect } from 'react';
import { Calendar, MapPin, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { EVENTS_API } from '../config/api';

interface EventItem {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: string;
    image_url?: string;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2670&auto=format&fit=crop';

export function Events() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Tout');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(EVENTS_API);
                if (res.ok) {
                    setEvents(await res.json());
                }
            } catch (err) {
                console.error('Failed to fetch events', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filters = ['Tout', 'Projection', 'Atelier', 'Conférence', 'En ligne'];

    const filteredEvents = activeFilter === 'Tout'
        ? events
        : events.filter(e => e.type === activeFilter);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <>
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-echo-darker">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-echo-darker via-echo-darker/80 to-transparent" />
                </div>

                <div className="relative z-20 text-center max-w-4xl px-4 animate-fade-in">
                    <div className="inline-block p-3 rounded-full bg-echo-gold/10 mb-6 border border-echo-gold/30">
                        <Calendar className="w-8 h-8 text-echo-gold" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">
                        L'Agenda <span className="text-echo-gold">ECHO</span>
                    </h1>
                    <p className="text-xl text-neutral-300 max-w-2xl mx-auto font-light">
                        Rencontres, projections, ateliers. Rejoignez-nous sur le terrain pour construire demain.
                    </p>
                </div>
            </section>

            {/* Filter */}
            <div className="bg-echo-dark/50 border-y border-white/5 py-4 sticky top-20 z-30 backdrop-blur-md">
                <div className="container mx-auto px-4 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-full text-sm transition-colors ${activeFilter === filter ? 'bg-echo-gold text-black font-semibold' : 'bg-white/5 text-white hover:bg-white/10'}`}
                            >
                                {filter === 'Tout' ? 'Tout' : filter + 's'}
                            </button>
                        ))}
                    </div>
                    <div className="text-echo-gold text-sm font-mono">
                        {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} à venir
                    </div>
                </div>
            </div>

            {/* Events List */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl space-y-8">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 text-echo-gold animate-spin" />
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-20">
                            <Calendar className="w-12 h-12 text-echo-textMuted mx-auto mb-4" />
                            <p className="text-echo-textMuted text-lg">Aucun événement à venir pour le moment.</p>
                            <p className="text-echo-textMuted text-sm mt-2">Revenez bientôt pour découvrir nos prochains rendez-vous !</p>
                        </div>
                    ) : filteredEvents.map((event) => (
                        <div key={event.id} className="group relative bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-echo-gold/30 transition-all duration-300 flex flex-col md:flex-row">
                            {/* Image */}
                            <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                                <div className="absolute inset-0 bg-echo-gold/10 mix-blend-overlay z-10" />
                                <img
                                    src={event.image_url || DEFAULT_IMAGE}
                                    alt={event.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded text-xs font-mono text-echo-gold z-20">
                                    {event.type}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="text-2xl font-serif text-white mb-2 group-hover:text-echo-gold transition-colors">{event.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-neutral-400 text-sm">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" /> {formatDate(event.date)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" /> {event.time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" /> {event.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{event.description}</p>

                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                                    <span className="text-neutral-500 text-sm">Organisé par l'équipe ECHO</span>
                                    <Link to="/contact">
                                        <Button variant="outline" size="sm" className="group-hover:bg-echo-gold group-hover:text-black group-hover:border-echo-gold">
                                            Réserver <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Suggest Event CTA */}
            <section className="py-20 bg-echo-darker relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl font-serif text-white mb-4">Vous souhaitez organiser une projection ?</h2>
                    <p className="text-neutral-400 max-w-2xl mx-auto mb-8">
                        Devenez ambassadeur ECHO et organisez un événement dans votre ville. Nous vous fournissons les outils nécessaires.
                    </p>
                    <Link to="/contact">
                        <Button variant="primary" size="lg">
                            Proposer un événement
                        </Button>
                    </Link>
                </div>
            </section>
        </>
    );
}
