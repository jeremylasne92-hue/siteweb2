import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User } from 'lucide-react';
import { cn, Button } from '../ui/Button';

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'La Série', path: '/serie' },
        { name: 'Le Mouvement', path: '/mouvement' },
        { name: 'ECHOLink', path: '/echolink' },
        { name: 'Partenaires', path: '/partenaires' },
        { name: 'Événements', path: '/agenda' },
        { name: 'Ressources', path: '/ressources' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/0',
                isScrolled ? 'bg-echo-dark/80 backdrop-blur-md border-white/5 py-3' : 'bg-transparent py-5'
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 relative group">
                    <img src="/src/assets/logo-echo.jpg" alt="ECHO Logo" className="h-16 w-auto object-contain" />
                    <span className="sr-only">ECHO</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                                'text-sm uppercase tracking-wider transition-colors hover:text-echo-gold',
                                location.pathname === link.path ? 'text-echo-gold' : 'text-echo-textMuted'
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    <button className="text-white hover:text-echo-gold transition-colors">
                        <Search size={20} />
                    </button>
                    <div className="h-4 w-px bg-white/20"></div>
                    <Link to="/auth">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <User size={18} />
                            <span className="hidden xl:inline">Mon Compte</span>
                        </Button>
                    </Link>
                    <Link to="/soutenir">
                        <Button variant="primary" size="sm">Soutenir</Button>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-echo-dark border-b border-white/10 p-4 flex flex-col gap-4 animate-fade-in">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="text-white hover:text-echo-gold py-2 border-b border-white/5"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-3 mt-4">
                        <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="secondary" className="w-full">Mon Compte</Button>
                        </Link>
                        <Link to="/soutenir" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="primary" className="w-full">Soutenir le projet</Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
