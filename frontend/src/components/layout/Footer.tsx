import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube } from 'lucide-react';
import { openCookiePanel } from '../ui/CookieBanner';

export function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 pt-10 sm:pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 mb-8 lg:mb-16">

                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-2 mb-2 lg:mb-0">
                        <Link to="/" className="text-2xl sm:text-3xl font-serif font-bold text-white mb-4 lg:mb-6 block">ECHO</Link>
                        <p className="text-echo-textMuted mb-4 lg:mb-6 max-w-sm text-sm">
                            Une websérie sociale, éducative et interactive qui s'inspire de La Divine Comédie pour décrypter les défis contemporains et fédérer une communauté engagée.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Youtube size={20} />} href="https://www.youtube.com/@MouvementECHOFrance" label="YouTube" />
                            <SocialIcon icon={<Instagram size={20} />} href="https://www.instagram.com/mouvementecho" label="Instagram" />
                            <SocialIcon icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>} href="https://www.tiktok.com/@mouvementecho" label="TikTok" />
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-white font-serif mb-4 lg:mb-6 text-sm lg:text-base">Navigation</h4>
                        <ul className="space-y-2 lg:space-y-3">
                            <FooterLink to="/serie">La Série</FooterLink>
                            <FooterLink to="/mouvement">Le Mouvement</FooterLink>
                            <FooterLink to="/cognisphere">CogniSphère</FooterLink>
                            <FooterLink to="/echolink">ECHOLink</FooterLink>
                            <FooterLink to="/partenaires">ECHOSystem</FooterLink>
                            <FooterLink to="/a-propos">À propos</FooterLink>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-serif mb-4 lg:mb-6 text-sm lg:text-base">Ressources</h4>
                        <ul className="space-y-2 lg:space-y-3">
                            <FooterLink to="/ressources">Catalogue</FooterLink>
                            <FooterLink to="/agenda">Événements</FooterLink>
                            <FooterLink to="/faq">FAQ</FooterLink>
                            <FooterLink to="/soutenir">Soutenir</FooterLink>
                            <FooterLink to="/contact">Contact</FooterLink>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="col-span-2 sm:col-span-1">
                        <h4 className="text-white font-serif mb-4 lg:mb-6 text-sm lg:text-base">Légal</h4>
                        <ul className="space-y-2 lg:space-y-3">
                            <FooterLink to="/politique-de-confidentialite">Confidentialité</FooterLink>
                            <FooterLink to="/mentions-legales">Mentions légales</FooterLink>
                            <FooterLink to="/cgu">CGU</FooterLink>
                            <li>
                                <button onClick={openCookiePanel} className="text-echo-textMuted hover:text-echo-gold transition-colors text-sm">
                                    Gérer mes cookies
                                </button>
                            </li>
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

function SocialIcon({ icon, href, label }: { icon: React.ReactNode, href: string, label: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-echo-gold hover:text-black transition-all duration-300">
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
