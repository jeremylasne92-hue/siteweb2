import React from 'react';
import { Mail, MapPin, Send, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Contact() {
    return (
        <section className="relative min-h-[80vh] flex items-center justify-center py-20 bg-echo-darker">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=2671&auto=format&fit=crop')] bg-cover bg-center opacity-10" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">

                    {/* Contact Info Side */}
                    <div className="md:w-1/3 bg-echo-darker p-10 flex flex-col justify-between border-r border-white/5">
                        <div>
                            <h2 className="text-2xl font-serif text-white mb-6">Contactez-nous</h2>
                            <p className="text-neutral-400 mb-8 text-sm leading-relaxed">
                                Vous avez une question, une proposition ou simplement envie d'échanger ? Nous lisons tous les messages.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4 text-neutral-300">
                                    <Mail className="w-5 h-5 text-echo-gold mt-1" />
                                    <div>
                                        <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Email</span>
                                        contact@projet-echo.fr
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 text-neutral-300">
                                    <MapPin className="w-5 h-5 text-echo-gold mt-1" />
                                    <div>
                                        <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">QG</span>
                                        Paris, France
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">Réseaux Sociaux</span>
                            <div className="flex gap-4">
                                {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
                                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:bg-echo-gold hover:text-black transition-all">
                                        <Icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="md:w-2/3 p-10 bg-white/[0.02]">
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Nom" placeholder="Votre nom" />
                                <Input label="Email" type="email" placeholder="votre@email.com" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">Sujet</label>
                                <select className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-echo-gold text-sm">
                                    <option>Question générale</option>
                                    <option>Presse & Média</option>
                                    <option>Partenariat</option>
                                    <option>Autre</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">Message</label>
                                <textarea
                                    className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-echo-gold min-h-[150px] text-sm resize-y"
                                    placeholder="Comment pouvons-nous vous aider ?"
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button variant="primary" className="flex items-center gap-2">
                                    Envoyer <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
}
