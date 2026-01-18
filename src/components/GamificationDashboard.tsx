import React from 'react';
import { Trophy, Heart } from 'lucide-react';

const GamificationDashboard: React.FC = () => {
    return (
        <div className="w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#050505] border-art-deco shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d2ac47]/5 to-transparent opacity-50"></div>

            <div className="relative z-10 w-full text-center">
                {/* Level Badge - Simplified */}
                <div className="mb-4 flex flex-col items-center">
                    <span className="text-[#d2ac47] text-[10px] uppercase tracking-widest font-bold mb-1">Creator Level</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-[#F9F1D8] text-5xl font-serif font-bold drop-shadow-[0_0_15px_rgba(210,172,71,0.3)]">5</span>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[#d2ac47] text-[10px] font-bold uppercase tracking-wider">Imagination</span>
                            <span className="text-[#d2ac47]/50 text-[8px] uppercase tracking-[0.2em]">Level</span>
                        </div>
                    </div>
                </div>

                {/* XP Bar */}
                <div className="mb-5 w-full">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[#d2ac47] text-[10px] font-bold uppercase tracking-wider">XP</span>
                        <span className="text-[#F9F1D8] text-[10px] font-mono">1,250 / 2,000</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1a1a1a] border border-[#d2ac47]/30 relative overflow-hidden rounded-full">
                        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#8a6e28] via-[#fbeea4] to-[#d2ac47] w-[62.5%] shadow-[0_0_10px_rgba(210,172,71,0.5)]"></div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 w-full">
                    {/* Popularity */}
                    <div className="bg-[#0f0f0f] border border-[#d2ac47]/20 p-2 flex flex-col items-center hover:border-[#d2ac47]/50 transition-colors group">
                        <Heart size={14} className="text-[#ef4444] mb-1 group-hover:scale-125 transition-transform duration-300" />
                        <span className="text-xl font-serif text-[#F9F1D8] font-bold">128</span>
                        <span className="text-[#d2ac47]/60 text-[8px] uppercase tracking-widest">Likes</span>
                    </div>

                    {/* Rank */}
                    <div className="bg-[#0f0f0f] border border-[#d2ac47]/20 p-2 flex flex-col items-center hover:border-[#d2ac47]/50 transition-colors group">
                        <Trophy size={14} className="text-[#fbeea4] mb-1 group-hover:scale-125 transition-transform duration-300" />
                        <span className="text-xl font-serif text-[#F9F1D8] font-bold">#42</span>
                        <span className="text-[#d2ac47]/60 text-[8px] uppercase tracking-widest">Rank</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamificationDashboard;
