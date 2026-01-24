import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

const EXAMPLES = [
    { id: 1, type: 'video', url: '/sample1.mp4', thumb: '/luxury-right-2.png', label: 'Noir Detective' }, // Using existing placeholder images for now
    { id: 2, type: 'video', url: '/sample2.mp4', thumb: '/uploaded_image_1768688263689.png', label: 'Cyberpunk City' },
    { id: 3, type: 'video', url: '/sample3.mp4', thumb: '/uploaded_image_1768686610666.png', label: 'Golden Era' },
];

const ExampleCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % EXAMPLES.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + EXAMPLES.length) % EXAMPLES.length);
    };

    return (
        <div className="w-full relative group mt-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-[#d2ac47]/50 text-[10px] uppercase tracking-widest">Inspiration</span>
                <div className="flex gap-1">
                    <button onClick={prevSlide} className="p-1 hover:text-[#d2ac47] transition-colors"><ChevronLeft size={14} /></button>
                    <button onClick={nextSlide} className="p-1 hover:text-[#d2ac47] transition-colors"><ChevronRight size={14} /></button>
                </div>
            </div>

            <div className="relative flex-1 overflow-hidden border border-[#d2ac47]/20 bg-black/50">
                {/* Carousel Content */}
                <div
                    className="absolute inset-0 flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {EXAMPLES.map((item) => (
                        <div key={item.id} className="min-w-full h-full relative" >
                            {/* Placeholder for Video/Image */}
                            <img src={item.thumb} alt={item.label} className="w-full h-full object-cover opacity-60" />

                            {/* Play Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full border border-[#d2ac47] flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-pointer hover:scale-110 transition-transform">
                                    <Play size={20} className="text-[#d2ac47] ml-1" />
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black to-transparent">
                                <span className="text-[#F9F1D8] text-xs font-serif italic">{item.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExampleCarousel;
