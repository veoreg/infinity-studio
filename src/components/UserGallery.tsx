import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Globe, Lock } from 'lucide-react';

const PLACEHOLDERS = [
    { id: 'p1', type: 'placeholder', thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop', label: 'Your Art Here', privacy: 'private' },
    { id: 'p2', type: 'placeholder', thumb: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2550&auto=format&fit=crop', label: 'Create Something', privacy: 'private' },
    { id: 'p3', type: 'placeholder', thumb: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=2787&auto=format&fit=crop', label: 'Waiting for Muse', privacy: 'private' },
    { id: 'p4', type: 'placeholder', thumb: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2459&auto=format&fit=crop', label: 'Start Forging', privacy: 'private' },
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
    onDelete?: (id: number | string) => void;
}

const UserGallery: React.FC<UserGalleryProps> = ({ newItems = [], onDelete }) => {
    const [activeTab, setActiveTab] = useState<'my' | 'community'>('my');
    const [currentIndex, setCurrentIndex] = useState(0);

    const rawItems = activeTab === 'my'
        ? (newItems.length > 0 ? newItems : PLACEHOLDERS)
        : COMMUNITY_FEED;

    // Normalize items to handle Supabase schema
    const items = rawItems.map((item: any) => ({
        ...item,
        thumb: item.image_url || item.thumb || '/placeholder-luxury.png',
        url: item.video_url || item.url,
        label: item.prompt ? (item.prompt.substring(0, 20) + '...') : (item.label || 'Untitled')
    }));

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    return (
        <div className="w-full relative group mt-4 flex-1 flex flex-col min-h-0 bg-[#050505] rounded-2xl overflow-hidden border border-[#d2ac47]/10">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-[#d2ac47]/10 sticky top-0 z-40">
                <div className="flex gap-4">
                    <button
                        onClick={() => { setActiveTab('my'); setCurrentIndex(0); }}
                        className={`text-[9px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === 'my' ? 'text-[#d2ac47]' : 'text-[#d2ac47]/30 hover:text-[#d2ac47]/60'}`}
                    >
                        My Library
                    </button>
                    <button
                        onClick={() => { setActiveTab('community'); setCurrentIndex(0); }}
                        className={`text-[9px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === 'community' ? 'text-[#d2ac47]' : 'text-[#d2ac47]/30 hover:text-[#d2ac47]/60'}`}
                    >
                        Trending
                    </button>
                </div>

                {/* Navigation Arrows */}
                <div className="flex gap-1.5">
                    <button onClick={prevSlide} className="p-1 hover:text-[#d2ac47] transition-colors border border-[#d2ac47]/10 rounded-lg bg-black/40"><ChevronLeft size={12} /></button>
                    <button onClick={nextSlide} className="p-1 hover:text-[#d2ac47] transition-colors border border-[#d2ac47]/10 rounded-lg bg-black/40"><ChevronRight size={12} /></button>
                </div>
            </div>

            {/* Gallery Window */}
            <div className="relative flex-1 overflow-hidden group-hover:border-[#d2ac47]/40 transition-colors">

                {/* Carousel Track */}
                <div
                    className="absolute inset-0 flex transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1)"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {items.map((item, idx) => (
                        <div
                            key={item.id || idx}
                            className="relative min-w-full h-full flex flex-col"
                        >
                            {/* Backdrop Image */}
                            <div className="absolute inset-0 bg-black">
                                <img src={item.thumb} alt={item.label} className="w-full h-full object-cover opacity-30 blur-sm scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                            </div>

                            {/* Main Display (Center) */}
                            <div className="relative flex-1 flex items-center justify-center p-4">
                                <div className="relative aspect-video w-full max-w-[90%] bg-[#080808] border border-[#d2ac47]/20 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] group/item">
                                    {/* Smart Thumbnail: Use Video if available, else Image */}
                                    {(item.type === 'video' || item.url?.includes('.mp4') || item.url?.includes('video')) ? (
                                        <video
                                            src={item.url}
                                            poster={item.thumb !== '/placeholder-luxury.png' ? item.thumb : undefined}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                            muted
                                            loop
                                            playsInline
                                            onMouseOver={e => e.currentTarget.play()}
                                            onMouseOut={e => e.currentTarget.pause()}
                                        />
                                    ) : (
                                        <img src={item.thumb} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                                    )}

                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity gap-3 pointer-events-auto">
                                        <div className="w-10 h-10 rounded-full border border-[#d2ac47] flex items-center justify-center bg-black/60 shadow-[0_0_15px_rgba(210,172,71,0.3)]">
                                            <Play size={16} className="text-[#d2ac47] ml-0.5" />
                                        </div>

                                        {/* Delete Button (Only for 'my' tab) */}
                                        {activeTab === 'my' && onDelete && item.id !== 'p1' && !String(item.id).startsWith('p') && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm('Delete this item?')) {
                                                        onDelete(item.id);
                                                    }
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-950/80 text-red-200 rounded-lg hover:bg-red-600 hover:text-white transition-colors border border-red-500/30 shadow-lg"
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Info Section (Bottom) */}
                            <div className="relative px-5 pb-5 pt-2 text-center">
                                <p className="text-[#F9F1D8] text-sm font-serif italic mb-1 truncate">{item.label}</p>
                                <div className="flex items-center justify-center gap-3 text-[8px] uppercase tracking-widest text-[#d2ac47]/50 font-bold">
                                    <span>{item.date || 'Just now'}</span>
                                    <div className="w-1 h-1 rounded-full bg-[#d2ac47]/20"></div>
                                    {item.privacy === 'public' ? <Globe size={10} /> : <Lock size={10} />}
                                    <div className="w-1 h-1 rounded-full bg-[#d2ac47]/20"></div>
                                    <button className="hover:text-[#d2ac47] transition-colors uppercase">Details</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Counter Tag */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md border border-[#d2ac47]/20 px-3 py-1 rounded-full z-30">
                    <span className="text-[#d2ac47] text-[8px] font-bold tracking-widest">{currentIndex + 1} / {items.length}</span>
                </div>
            </div>
        </div>
    );
};

export default UserGallery;
