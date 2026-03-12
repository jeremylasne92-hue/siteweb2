import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Shield, LogOut } from 'lucide-react';
import { cn, Button } from '../ui/Button';
import { useAuthStore } from '../../features/auth/store';

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = () => setIsUserMenuOpen(false);
        if (isUserMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isUserMenuOpen]);

    const navLinks = [
        { name: 'La Série', path: '/serie' },
        { name: 'Le Mouvement', path: '/mouvement' },
        { name: 'Cognisphère', path: '/cognisphere' },
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
                    <img src="/logo-echo.jpg" alt="ECHO Logo" className="h-12 w-auto object-contain mix-blend-lighten" />
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
                    {user?.role === 'admin' && (
                        <Link to="/admin">
                            <Button variant="ghost" size="sm" className="gap-2 text-echo-gold">
                                <Shield size={16} />
                                <span className="hidden xl:inline">Admin</span>
                            </Button>
                        </Link>
                    )}
                    {isAuthenticated ? (
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                                <User size={18} />
                                <span className="hidden xl:inline">{user?.username || 'Mon Compte'}</span>
                            </Button>
                            {isUserMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-echo-darker border border-white/10 rounded-lg shadow-xl overflow-hidden animate-fade-in">
                                    <Link
                                        to="/profil"
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-echo-textMuted hover:bg-white/5 hover:text-white transition-colors"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <User size={14} />
                                        Mon profil
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/10"
                                    >
                                        <LogOut size={14} />
                                        Se déconnecter
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <User size={18} />
                                <span className="hidden xl:inline">Mon Compte</span>
                            </Button>
                        </Link>
                    )}
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
                        {user?.role === 'admin' && (
                            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="secondary" className="w-full gap-2 text-echo-gold">
                                    <Shield size={16} /> Administration
                                </Button>
                            </Link>
                        )}
                        {isAuthenticated ? (
                            <>
                                <Link to="/profil" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="secondary" className="w-full">Mon profil</Button>
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                                >
                                    <LogOut size={16} />
                                    Se déconnecter
                                </button>
                            </>
                        ) : (
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="secondary" className="w-full">Mon Compte</Button>
                            </Link>
                        )}
                        <Link to="/soutenir" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="primary" className="w-full">Soutenir le projet</Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
