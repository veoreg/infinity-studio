import React, { useEffect, useState } from 'react';

interface Glint {
    id: number;
    top: number;
    left: number;
    size: number;
    delay: number;
    duration: number;
}

const GoldGlints: React.FC = () => {
    const [glints, setGlints] = useState<Glint[]>([]);

    useEffect(() => {
        // "Specific corners" and "not random" - Fixed pleasing positions
        const fixedGlints = [
            { id: 1, top: 15, left: 10, size: 24, delay: 0, duration: 2 },   // Top Left area
            { id: 2, top: 12, left: 85, size: 18, delay: 1.5, duration: 2.5 }, // Top Right area
            { id: 3, top: 80, left: 8, size: 20, delay: 0.5, duration: 3 },    // Bottom Left area
            { id: 4, top: 75, left: 92, size: 28, delay: 2, duration: 2.2 },   // Bottom Right area
            { id: 5, top: 45, left: 95, size: 16, delay: 3.5, duration: 2.8 }, // Middle Right edge
        ];
        setGlints(fixedGlints);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
            <style>
                {`
                  @keyframes glint-twinkle {
                    0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
                    50% { opacity: 1; transform: scale(1) rotate(45deg); }
                    100% { opacity: 0; transform: scale(0.5) rotate(90deg); }
                  }
                `}
            </style>
            {glints.map((glint) => (
                <div
                    key={glint.id}
                    className="absolute text-[#fff] drop-shadow-[0_0_4px_rgba(255,215,0,0.9)]"
                    style={{
                        top: `${glint.top}%`,
                        left: `${glint.left}%`,
                        width: `${glint.size}px`,
                        height: `${glint.size}px`,
                        opacity: 0,
                        animation: `glint-twinkle ${glint.duration}s ease-in-out infinite`,
                        animationDelay: `${glint.delay}s`,
                    }}
                >
                    {/* Thin "Lens Flare" Cross Shape */}
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#ffeebb]">
                        {/* Very thin arms for "sharp" look */}
                        <path d="M12 0 L12.5 11 L24 12 L12.5 13 L12 24 L11.5 13 L0 12 L11.5 11 Z" />
                    </svg>
                </div>
            ))}
        </div>
    );
};

export default GoldGlints;
