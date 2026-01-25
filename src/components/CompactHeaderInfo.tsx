import React from 'react';
import { Zap, Heart, Trophy } from 'lucide-react';

const CompactHeaderInfo: React.FC = () => {
    // Hardcoded for now, will connect to Supabase later
    const credits = 1250;
    const level = 5;

    return (
        <div className="flex items-center gap-3">
            {/* Credits Pill */}
            <div className="group relative flex items-center gap-2 px-3 py-1.5 bg-[#0f0f0f]/80 backdrop-blur-md border border-[#d2ac47]/30 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] cursor-pointer hover:border-[#d2ac47]/60 transition-all">
                <div className="text-[#d2ac47]">
                    <Zap size={14} className="fill-[#d2ac47] drop-shadow-[0_0_8px_rgba(210,172,71,0.6)]" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-[#F9F1D8] text-xs font-bold font-mono tracking-wider">{credits}</span>
                </div>
                {/* Shine Effect */}
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_3s_infinite]" />
                </div>
            </div>

            {/* Level Pill */}
            <div className="hidden md:flex flex-col items-end leading-none group/level relative cursor-default">
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#d2ac47]/60 uppercase tracking-widest font-bold">Lvl</span>
                    <span className="text-[#F9F1D8] text-sm font-bold font-serif">{level}</span>
                </div>

                {/* TOOLTIP / DROPDOWN on Hover */}
                <div className="absolute top-8 right-0 w-48 bg-[#0a0a0a] border border-[#d2ac47]/30 rounded-xl p-4 shadow-2xl opacity-0 invisible group-hover/level:opacity-100 group-hover/level:visible transition-all duration-300 z-50 pointer-events-none group-hover/level:pointer-events-auto mt-2">
                    <div className="flex flex-col gap-3">
                        {/* XP Bar */}
                        <div className="w-full">
                            <div className="flex justify-between text-[8px] uppercase tracking-widest text-[#d2ac47] mb-1">
                                <span>XP</span>
                                <span>1250 / 2000</span>
                            </div>
                            <div className="w-full h-1 bg-[#d2ac47]/10 rounded-full overflow-hidden">
                                <div className="h-full w-[60%] bg-[#d2ac47] shadow-[0_0_5px_#d2ac47]"></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center border-t border-[#d2ac47]/10 pt-2">
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1 text-[#F9F1D8] font-bold">
                                    <Heart size={10} className="text-red-500 fill-red-500/20" />
                                    <span>128</span>
                                </div>
                                <span className="text-[7px] text-[#d2ac47]/50 uppercase tracking-widest">Likes</span>
                            </div>
                            <div className="w-[1px] h-6 bg-[#d2ac47]/10"></div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1 text-[#F9F1D8] font-bold text-[#fbeea4]">
                                    <Trophy size={10} className="text-blue-500 fill-blue-500/20" />
                                    <span>#42</span>
                                </div>
                                <span className="text-[7px] text-[#d2ac47]/50 uppercase tracking-widest">Rank</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
