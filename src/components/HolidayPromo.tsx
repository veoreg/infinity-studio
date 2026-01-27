import React, { useState } from 'react';

const HolidayPromo: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <style>
                {`
          @keyframes sway-tag {
            0%, 100% { transform: rotate(15deg) translateY(0); }
            50% { transform: rotate(12deg) translateY(-5px); }
          }
          @keyframes vibrate-subtle {
            0% { transform: translate(0); }
            20% { transform: translate(-1px, 1px); }
            40% { transform: translate(-1px, -1px); }
            60% { transform: translate(1px, 1px); }
            80% { transform: translate(1px, -1px); }
            100% { transform: translate(0); }
          }
           @keyframes spark-explode {
            0% { opacity: 1; transform: translate(0, 0) scale(1); }
            100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); }
          }
          @keyframes glow-pulse-text {
            0%, 100% { text-shadow: 0 0 5px rgba(239, 68, 68, 0.5); }
            50% { text-shadow: 0 0 20px rgba(239, 68, 68, 1); }
          }
          @keyframes success-zoom {
             0% { transform: scale(1); }
             50% { transform: scale(1.1); }
             100% { transform: scale(1); }
          }
        `}
            </style>
            <div className="w-full flex justify-center md:block md:w-auto relative transform scale-[0.52] md:scale-[0.7] cursor-pointer pointer-events-auto origin-bottom mb-8 md:mb-0">
                <div
                    className="relative group pointer-events-auto cursor-pointer"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => {
                        // Toggle animation state manually for mobile control
                        setIsHovered(!isHovered);

                        // Only copy/alert if we are turning it ON (or always? User wants toggle. Let's just copy always but toggle visual)
                        const discountCode = "PLEASURE50";
                        navigator.clipboard.writeText(discountCode);

                        // Optional: Debounce alert? No, keeps it simple.
                        if (!isHovered) { // If it WAS off, and we turn it on -> alert
                            alert(`Discount Code ${discountCode} Copied! Enjoy.`);
                        }
                    }}
                >
                    {/* Golden Sparks Explosion (Thicker & denser) */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
                        {Array.from({ length: 180 }).map((_, i) => { // Increased to 180 (+20%)
                            const angle = Math.random() * 360;
                            const distance = 150 + Math.random() * 300; // Increased range (150-450px)
                            const tx = Math.cos(angle * Math.PI / 180) * distance;
                            const ty = Math.sin(angle * Math.PI / 180) * distance;
                            const scale = 0.5 + Math.random() * 1.5; // Varied sizes

                            return (
                                <div
                                    key={i}
                                    className={`absolute bg-[#ffd700] rounded-full shadow-[0_0_8px_#ffd700] opacity-0 ${isHovered ? 'animate-spark' : ''}`}
                                    style={{
                                        width: `${2 * scale}px`,
                                        height: `${2 * scale}px`,
                                        '--tx': `${tx}px`,
                                        '--ty': `${ty}px`,
                                        animation: isHovered ? `spark-explode ${0.4 + Math.random() * 0.4}s cubic-bezier(0.1, 0.7, 1.0, 0.1) infinite` : 'none', // More explosive ease
                                        animationDelay: `${Math.random() * 0.1}s` // Tighter delay for instant burst
                                    } as React.CSSProperties}
                                />
                            );
                        })}
                    </div>

                    {/* The Large Golden Ticket - Ultra Luxury Strict Design */}
                    <div
                        className="w-64 h-36 bg-[var(--bg-primary)]/90 backdrop-blur-md border-2 border-[#d2ac47] flex flex-col items-center justify-center relative shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden z-10"
                        style={{
                            animation: isHovered ? 'vibrate-subtle 0.3s linear infinite' : 'sway-tag 6s ease-in-out infinite alternate',
                            boxShadow: isHovered ? '0 0 80px rgba(210,172,71,0.4), inset 0 0 30px rgba(210,172,71,0.1)'
                                : '0 20px 50px rgba(0,0,0,0.8)'
                        }}
                    >
                        {/* Generated Texture Background - Vector Trace Effect */}
                        <div
                            className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none"
                            style={{
                                backgroundImage: 'url("/luxury_art_deco_texture.png")',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
                                WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
                            }}
                        ></div>

                        {/* Double Border Effect for Strict Luxury */}
                        <div className="absolute inset-[3px] border border-[#d2ac47]/40 pointer-events-none"></div>

                        {/* Art Deco Corners */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#d2ac47]"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#d2ac47]"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#d2ac47]"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#d2ac47]"></div>

                        {/* Content using drop-shadows for readability over texture */}
                        <span className="text-[var(--text-secondary)] text-[9px] font-bold uppercase tracking-[0.4em] mb-2 opacity-100 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] z-10 relative">Exclusive Access</span>

                        <div className="flex items-baseline gap-1 z-10 relative drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                            <span className="text-[var(--text-primary)] text-6xl font-serif font-bold leading-none bg-clip-text text-transparent bg-gradient-to-t from-[#8a6e28] via-[#fbeea4] to-[#fff]">-50%</span>
                        </div>

                        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#d2ac47] to-transparent my-2 opacity-80 z-10 relative shadow-[0_0_5px_black]"></div>

                        <span
                            className="text-[#ef4444] text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 group-hover:tracking-[0.5em] z-10 relative drop-shadow-[0_2px_2px_rgba(0,0,0,1)]"
                            style={{
                                textShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
                            }}
                        >
                            Get Pleasure
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HolidayPromo;
