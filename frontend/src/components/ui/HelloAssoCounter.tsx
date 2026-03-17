import { useEffect, useRef } from 'react';

interface HelloAssoCounterProps {
    src: string;
    title: string;
    className?: string;
}

export function HelloAssoCounter({ src, title, className = '' }: HelloAssoCounterProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.origin !== 'https://www.helloasso.com') return;
            const height = e.data?.height;
            if (height && iframeRef.current) {
                iframeRef.current.style.height = `${height}px`;
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div
            className={`w-full max-w-[350px] mx-auto rounded-xl overflow-hidden border border-echo-gold/30 ${className}`}
            aria-label={title}
        >
            <iframe
                ref={iframeRef}
                src={src}
                title={title}
                className="w-full border-none"
                style={{ minHeight: '120px' }}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
                // @ts-expect-error — allowtransparency is a non-standard HTML attribute
                allowtransparency="true"
            />
        </div>
    );
}
