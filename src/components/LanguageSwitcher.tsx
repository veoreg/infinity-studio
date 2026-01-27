
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'en', label: 'EN', flag: '🇺🇸' },
        { code: 'ru', label: 'RU', flag: '🇷🇺' },
        { code: 'de', label: 'DE', flag: '🇩🇪' },
        { code: 'es', label: 'ES', flag: '🇪🇸' },
        { code: 'th', label: 'TH', flag: '🇹🇭' },
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-all">
                <Globe size={14} />
                <span className="text-[10px] font-bold tracking-widest uppercase">{currentLang.label}</span>
            </button>

            {/* Dropdown */}
            <div className="absolute top-full right-0 mt-2 w-32 bg-[var(--bg-input)]/95 backdrop-blur-xl border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-[#d2ac47]/20 transition-colors ${i18n.language === lang.code ? 'text-[#d2ac47]' : 'text-[var(--text-secondary)]'}`}
                    >
                        <span>{lang.label}</span>
                        <span className="text-lg">{lang.flag}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSwitcher;
