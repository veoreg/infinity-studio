import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsVisible(false);
        }
        setDeferredPrompt(null);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:w-96 animate-fade-in-up">
            <div className="bg-[#1a1a1a] border border-[#d2ac47]/30 rounded-xl p-4 shadow-2xl flex items-center justify-between gap-4 backdrop-blur-md bg-opacity-90">
                <div className="flex items-center gap-3">
                    <div className="bg-[#d2ac47]/10 p-2 rounded-lg">
                        <Download className="text-[#d2ac47]" size={24} />
                    </div>
                    <div>
                        <h3 className="text-[#d2ac47] font-bold text-sm">Install App</h3>
                        <p className="text-xs text-white/60">Add to home screen for better experience</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <button
                        onClick={handleInstallClick}
                        className="bg-[#d2ac47] text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#ffe082] transition-colors"
                    >
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
};
