import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CookieBanner } from '../ui/CookieBanner';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="flex flex-col min-h-screen">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-black focus:rounded-lg focus:text-sm focus:font-semibold">
                Aller au contenu principal
            </a>
            <Header />
            <main id="main-content" className="flex-grow pt-16 sm:pt-20">
                {children}
            </main>
            <Footer />
            <CookieBanner />
        </div>
    );
}
