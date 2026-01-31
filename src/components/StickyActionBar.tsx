
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, Video } from 'lucide-react';

interface StickyActionBarProps {
    activeTab: 'video' | 'avatar';
}

const StickyActionBar = ({ activeTab }: StickyActionBarProps) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show bar when scrolled past 100px
            if (window.scrollY > 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSwitch = (tab: 'video' | 'avatar') => {
        // Dispatch custom event to App.tsx
        window.dispatchEvent(new CustomEvent('switch-tab', { detail: tab }));
        // Scroll to top to show the main header again
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none md:hidden"
                >
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:bg-black/40 dark:border-[#d2ac47]/30 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-1.5 flex items-center gap-1 pointer-events-auto">

                        {/* Avatar Button */}
                        <button
                            onClick={() => handleSwitch('avatar')}
                            className={`
                                relative px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300
                                ${activeTab === 'avatar'
                                    ? 'bg-[#d2ac47] text-black font-bold shadow-[0_0_15px_rgba(210,172,71,0.4)]'
                                    : 'hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                            `}
                        >
                            <Sparkles size={16} className={activeTab === 'avatar' ? 'animate-pulse' : ''} />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{t('btn_generate')}</span>
                        </button>

                        <div className="w-[1px] h-6 bg-[var(--border-color)] mx-1 opacity-30"></div>

                        {/* Video Button */}
                        <button
                            onClick={() => handleSwitch('video')}
                            className={`
                                relative px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300
                                ${activeTab === 'video'
                                    ? 'bg-[#d2ac47] text-black font-bold shadow-[0_0_15px_rgba(210,172,71,0.4)]'
                                    : 'hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                            `}
                        >
                            <Video size={16} className={activeTab === 'video' ? 'animate-pulse' : ''} />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{t('nav_cinematic')}</span>
                        </button>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default StickyActionBar;
