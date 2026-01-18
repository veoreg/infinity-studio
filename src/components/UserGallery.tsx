import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Globe, Lock, Share2 } from 'lucide-react';

const MY_CREATIONS = [
    { id: 101, type: 'video', url: '#', thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop', label: 'Velvet Gaze', privacy: 'public', date: '2h ago' },
    { id: 102, type: 'photo', url: '#', thumb: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2550&auto=format&fit=crop', label: 'Crimson Smile', privacy: 'private', date: '5h ago' },
    { id: 103, type: 'photo', url: '#', thumb: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=2787&auto=format&fit=crop', label: 'Vintage Soul', privacy: 'public', date: '1d ago' },
    { id: 105, type: 'video', url: '#', thumb: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2459&auto=format&fit=crop', label: 'Tokyo Noir', privacy: 'private', date: '2d ago' },
    { id: 106, type: 'photo', url: '#', thumb: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2787&auto=format&fit=crop', label: 'Golden Hour', privacy: 'public', date: '3d ago' },
];

const COMMUNITY_FEED = [
    { id: 201, type: 'video', url: '#', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', label: 'Liquid Gold', author: 'Au_Artist', likes: 4122 },
    { id: 202, type: 'photo', url: '#', thumb: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=2787&auto=format&fit=crop', label: 'Desert Rose', author: 'Retro_X', likes: 890 },
    { id: 203, type: 'photo', url: '#', thumb: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2787&auto=format&fit=crop', label: 'Urban Legend', author: 'City_Walker', likes: 2561 },
    { id: 205, type: 'video', url: '#', thumb: 'https://images.unsplash.com/photo-1583243552698-25029a1396eb?q=80&w=2400&auto=format&fit=crop', label: 'Latin Fire', author: 'Maria_D', likes: 1540 },
    { id: 206, type: 'photo', url: '#', thumb: 'https://images.unsplash.com/photo-1563620915-8478239e9aab?q=80&w=2670&auto=format&fit=crop', label: 'Midnight Blue', author: 'NightOwl', likes: 3200 },
];

export interface GalleryItem {
    id: number;
    type: string;
    url: string;
    thumb: string;
    label: string;
    privacy?: string;
    date?: string;
    author?: string;
    likes?: number;
}

interface UserGalleryProps {
    newItems?: GalleryItem[];
    columns?: number;
}

const UserGallery: React.FC<UserGalleryProps> = ({ newItems = [], columns = 1 }) => {
    const [activeTab, setActiveTab] = useState<'my' | 'community'>('my');
    const [currentIndex, setCurrentIndex] = useState(0);

    const items = activeTab === 'my' ? [...newItems, ...MY_CREATIONS] : COMMUNITY_FEED;

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    return (
        <div className="w-full relative group mt-4 flex-1 flex flex-col min-h-0">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between mb-6 px-2 py-2">
                <div className="flex gap-6">
                    <button
                        onClick={() => { setActiveTab('my'); setCurrentIndex(0); }}
                        className={`text-xs uppercase tracking-[0.2em] font-bold transition-all border-b-2 pb-1 ${activeTab === 'my' ? 'text-[#d2ac47] border-[#d2ac47]' : 'text-[#d2ac47]/40 border-transparent hover:text-[#d2ac47]/80'}`}
                    >
                        My Gallery
                    </button>
                    <button
                        onClick={() => { setActiveTab('community'); setCurrentIndex(0); }}
                        className={`text-xs uppercase tracking-[0.2em] font-bold transition-all border-b-2 pb-1 ${activeTab === 'community' ? 'text-[#d2ac47] border-[#d2ac47]' : 'text-[#d2ac47]/40 border-transparent hover:text-[#d2ac47]/80'}`}
                    >
                        Community
                    </button>
                </div>

                {/* Navigation Arrows */}
                <div className="flex gap-2">
                    <button onClick={prevSlide} className="p-1.5 hover:text-[#d2ac47] transition-colors bg-[#0a0a0a] border border-[#d2ac47]/20 rounded-full hover:border-[#d2ac47]"><ChevronLeft size={16} /></button>
                    <button onClick={nextSlide} className="p-1.5 hover:text-[#d2ac47] transition-colors bg-[#0a0a0a] border border-[#d2ac47]/20 rounded-full hover:border-[#d2ac47]"><ChevronRight size={16} /></button>
                </div>
            </div>

            {/* Gallery Window - Square Aspect for 3 items */}
            <div className="relative flex-1 overflow-hidden border border-[#d2ac47]/20 bg-black/50 group-hover:border-[#d2ac47]/40 transition-colors shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/80 pointer-events-none z-10"></div>

                {/* Carousel Track */}
                <div
                    className="absolute inset-0 flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentIndex * (100 / columns)}%)` }}
                >
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={`relative ${columns > 1 ? 'aspect-square border-r border-[#d2ac47]/20 last:border-r-0' : 'h-full'}`}
                            style={{ minWidth: `${100 / columns}%` }}
                        >
                            {/* Content */}
                            <img src={item.thumb} alt={item.label} className="w-full h-full object-cover opacity-80" />

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="w-16 h-16 rounded-full border-2 border-[#d2ac47] flex items-center justify-center bg-black/40 backdrop-blur-md cursor-pointer hover:scale-110 transition-transform hover:bg-[#d2ac47]/20 shadow-[0_0_40px_rgba(0,0,0,0.6)] group/play">
                                    <Play size={24} className="text-[#d2ac47] ml-1 group-hover/play:text-white transition-colors" />
                                </div>
                            </div>

                            {/* Info Bar */}
                            <div className="absolute bottom-0 left-0 w-full p-6 z-30 flex justify-between items-end bg-gradient-to-t from-black via-black/90 to-transparent pt-20">
                                <div>
                                    <p className="text-[#F9F1D8] text-lg font-serif italic mb-2 drop-shadow-md">{item.label}</p>
                                    <p className="text-[#d2ac47] text-[10px] uppercase tracking-widest font-bold">
                                        {activeTab === 'my' && 'date' in item
                                            ? item.date
                                            : `by ${'author' in item ? item.author : 'Anon'}`}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {activeTab === 'my' && (
                                        <div className="flex gap-3 items-center bg-black/60 px-4 py-2 rounded-full border border-[#d2ac47]/20 backdrop-blur-sm">
                                            {'privacy' in item && item.privacy === 'public' ? (
                                                <Globe size={14} className="text-[#d2ac47]" />
                                            ) : (
                                                <Lock size={14} className="text-[#d2ac47]/50" />
                                            )}
                                            <div className="w-[1px] h-3 bg-[#d2ac47]/20"></div>
                                            <Share2 size={14} className="text-[#F9F1D8] hover:text-[#d2ac47] cursor-pointer transition-colors" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserGallery;
