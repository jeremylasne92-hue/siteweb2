import { Users, Briefcase, GraduationCap, Heart, ArrowRight, Handshake } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';

const partnerCategories = [
    {
        icon: Briefcase,
        title: 'Experts & Consultants',
        description: 'Sociologues, psychologues, philosophes et experts en transition écologique qui enrichissent le contenu de la série et valident la pertinence des thématiques abordées.',
        status: 'Recrutement en cours',
        color: 'text-echo-gold',
    },
    {
        icon: Heart,
        title: 'Mécènes & Financeurs',
        description: "Fondations, entreprises engagées et institutions culturelles qui soutiennent financièrement la production et la diffusion d'ECHO.",
        status: 'Appel à partenariats ouvert',
        color: 'text-echo-goldLight',
    },
    {
        icon: GraduationCap,
        title: 'Éducation & Culture',
        description: "Universités, écoles, médiathèques et centres culturels qui intègrent ECHO dans leurs programmes pédagogiques et événements.",
        status: 'Partenariats en discussion',
        color: 'text-echo-blueLight',
    },
    {
        icon: Users,
        title: 'ONG & Associations',
        description: "Organisations à impact social et environnemental qui partagent la vision d'ECHO et co-créent des actions concrètes sur le terrain.",
        status: 'Réseau en construction',
        color: 'text-echo-greenLight',
    },
];

export function ECHOsystem() {
    return (
        <div className="min-h-screen bg-echo-dark text-echo-text">
            {/* Hero */}
            <section className="relative py-32 px-4 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-echo-green/20 to-transparent" />
                <div className="relative max-w-4xl mx-auto">
                    <Handshake className="w-16 h-16 text-echo-greenLight mx-auto mb-6" />
                    <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
                        L'ECHO<span className="text-echo-greenLight">System</span>
                    </h1>
                    <p className="text-xl text-echo-textMuted max-w-2xl mx-auto">
                        Un réseau d'alliances durables entre acteurs du changement.
                        Ensemble, nous construisons un écosystème où chaque partenaire amplifie l'impact collectif.
                    </p>
                </div>
            </section>

            {/* Partner Categories */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-serif font-bold text-center mb-4">Nos Catégories de Partenaires</h2>
                    <p className="text-echo-textMuted text-center mb-16 max-w-2xl mx-auto">
                        L'ECHOSystem rassemble quatre piliers complémentaires pour maximiser l'impact du mouvement.
                    </p>
                    <div className="grid md:grid-cols-2 gap-8">
                        {partnerCategories.map((cat, i) => (
                            <Card key={i} variant="glass" className="p-8 hover:border-echo-greenLight/30 transition-all">
                                <cat.icon className={`w-10 h-10 ${cat.color} mb-4`} />
                                <h3 className="text-xl font-bold mb-3">{cat.title}</h3>
                                <p className="text-echo-textMuted mb-4 leading-relaxed">{cat.description}</p>
                                <span className={`inline-block text-sm ${cat.color} bg-white/5 px-3 py-1 rounded-full`}>
                                    {cat.status}
                                </span>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <Card variant="glass" className="p-12">
                        <h2 className="text-3xl font-serif font-bold mb-4">
                            Devenez Partenaire de l'ECHOSystem
                        </h2>
                        <p className="text-echo-textMuted mb-8 max-w-xl mx-auto">
                            Vous êtes une organisation engagée ? Rejoignez notre réseau et participez
                            à un projet culturel et éducatif unique.
                        </p>
                        <Link to="/contact">
                            <Button className="bg-echo-greenLight text-echo-dark hover:bg-echo-green px-8 py-3 font-bold">
                                Nous Contacter <ArrowRight className="w-4 h-4 ml-2 inline" />
                            </Button>
                        </Link>
                    </Card>
                </div>
            </section>
        </div>
    );
}
