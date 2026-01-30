import React from 'react';
import { Zap, Coins, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CompactHeaderInfo: React.FC = () => {
    const { profile, user } = useAuth();

    // Balance logic
    const totalBalance = user ? (profile?.credits || 0) + (profile?.purchased_coins || 0) : 0;
    const isAdmin = profile?.is_admin || false;

    return (
        <div className="flex items-center gap-3">
            {/* Credits Pill */}
            <div
                className="group relative flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)]/80 backdrop-blur-md border border-[var(--border-color)] rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] cursor-pointer hover:border-[#d2ac47]/60 transition-all"
                title={user ? `Credits: ${profile?.credits || 0} | Coins: ${profile?.purchased_coins || 0}` : "Sign In to see balance"}
            >
                <div className="text-[var(--text-secondary)]">
                    <Zap size={14} className={`${user ? 'fill-[#d2ac47] drop-shadow-[0_0_8px_rgba(210,172,71,0.6)] text-[#d2ac47]' : 'opacity-30'}`} />
                </div>
                <div className="flex flex-col leading-none">
                    <span className={`text-[var(--text-primary)] text-xs font-bold font-mono tracking-wider ${user ? '' : 'opacity-40'}`}>
                        {user ? totalBalance : '—'}
                    </span>
                </div>

                {/* Visual distinguish for Coins if any */}
                {user && (profile?.purchased_coins || 0) > 0 && (
                    <div className="ml-1 flex items-center">
                        <Coins size={10} className="text-yellow-400 opacity-60" />
                    </div>
                )}

                {/* Shine Effect */}
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_3s_infinite]" />
                </div>
            </div>

            {/* Admin Badge / Role Indicator */}
            {isAdmin ? (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gold-gradient rounded-full shadow-[0_0_15px_rgba(210,172,71,0.3)]">
                    <ShieldCheck size={12} className="text-black" />
                    <span className="text-black text-[10px] font-bold uppercase tracking-widest">Colleague</span>
                </div>
            ) : (
                <div className={`hidden md:flex items-center px-2.5 py-1 border border-[var(--border-color)] rounded-full ${user ? 'border-[#d2ac47]/30' : 'opacity-30'}`}>
                    <span className="text-[var(--text-secondary)] text-[9px] uppercase tracking-[0.15em] font-black font-serif italic">
                        {user ? 'Identity' : 'Guest'}
                    </span>
                </div>
            )}

            <style>{`
                @keyframes shimmer {
                    0% { left: -100%; }
                    20% { left: 200%; }
                    100% { left: 200%; }
                }
             `}</style>
        </div>
    );
};

export default CompactHeaderInfo;
