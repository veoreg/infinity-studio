
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'en', label: 'EN', flag: '🇺🇸' },
        { code: 'ru', label: 'RU', flag: '🇷🇺' },
        { code: 'de', label: 'DE', flag: '🇩🇪' },
        { code: 'es', label: 'ES', flag: '🇪🇸' },
        { code: 'th', label: 'TH', flag: '🇹🇭' },
        { code: 'zh', label: 'ZH', flag: '🇨🇳' },
    ];

    const currentLang = languages.find(l => i18n.language.startsWith(l.code)) || languages[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative z-[60]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-all bg-[var(--bg-primary)]/50 backdrop-blur-md ${isOpen ? 'bg-[var(--border-color)]' : ''}`}
            >
                <Globe size={12} />
                <span className="text-[9px] font-bold tracking-widest uppercase">{currentLang.label}</span>
            </button>

            {/* Dropdown */}
            <div className={`absolute top-full right-0 mt-1 w-20 bg-[var(--bg-primary)]/95 backdrop-blur-xl border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top-right ${isOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95 pointer-events-none'}`}>
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => {
                            i18n.changeLanguage(lang.code);
                            setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-[9px] font-bold tracking-widest uppercase hover:bg-[#d2ac47]/10 transition-colors ${i18n.language.startsWith(lang.code) ? 'text-[#d2ac47] bg-[#d2ac47]/5' : 'text-[var(--text-secondary)]'}`}
                    >
                        <span className="text-sm leading-none grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{lang.flag}</span>
                        <span>{lang.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSwitcher;
