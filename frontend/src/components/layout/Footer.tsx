import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="text-3xl font-serif font-bold text-white mb-6 block">ECHO</Link>
                        <p className="text-echo-textMuted mb-6 max-w-sm">
                            Une websérie sociale, éducative et interactive qui s'inspire de La Divine Comédie pour décrypter les défis contemporains et fédérer une communauté engagée.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Youtube size={20} />} href="#" />
                            <SocialIcon icon={<Instagram size={20} />} href="#" />
                            <SocialIcon icon={<Facebook size={20} />} href="#" />
                            <SocialIcon icon={<Twitter size={20} />} href="#" />
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-white font-serif mb-6">Navigation</h4>
                        <ul className="space-y-3">
                            <FooterLink to="/serie">La Série</FooterLink>
                            <FooterLink to="/mouvement">Le Mouvement</FooterLink>
                            <FooterLink to="/echolink">ECHOLink</FooterLink>
                            <FooterLink to="/partenaires">ECHOSystem</FooterLink>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-serif mb-6">Ressources</h4>
                        <ul className="space-y-3">
                            <FooterLink to="/ressources">Catalogue</FooterLink>
                            <FooterLink to="/blog">Blog</FooterLink>
                            <FooterLink to="/faq">FAQ</FooterLink>
                            <FooterLink to="/contact">Contact</FooterLink>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-serif mb-6">Légal</h4>
                        <ul className="space-y-3">
                            <FooterLink to="/mentions-legales">Mentions Légales</FooterLink>
                            <FooterLink to="/confidentialite">Confidentialité</FooterLink>
                            <FooterLink to="/cgu">CGU</FooterLink>
                            <FooterLink to="/admin">Admin</FooterLink>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-echo-textMuted text-sm">
                    <p>&copy; {new Date().getFullYear()} Mouvement ECHO. Tous droits réservés.</p>
                    <p className="mt-2 text-xs opacity-50">Made with ❤️ by the ECHO Team</p>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode, href: string }) {
    return (
        <a href={href} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-echo-gold hover:text-black transition-all duration-300">
            {icon}
        </a>
    );
}

function FooterLink({ to, children }: { to: string, children: React.ReactNode }) {
    return (
        <li>
            <Link to={to} className="text-echo-textMuted hover:text-echo-gold transition-colors text-sm">
                {children}
            </Link>
        </li>
    );
}
