import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Globe, Lock, Heart, Share2, Maximize2 } from 'lucide-react';

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

// -----------------------------------------------------------------------------------------
// Helper Sub-Component: Handles video state & Premium Apple-Glass Aesthetics
// -----------------------------------------------------------------------------------------
const VideoGalleryItem = ({ item, isActive, onDelete }: { item: any; isActive: boolean; onDelete?: (id: string | number) => void }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    // Reset state when switching items
    useEffect(() => {
        if (!isActive) {
            setIsPlaying(false);
            setProgress(0);
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        } else {
            // Auto-play active slide
            if (videoRef.current && (item.type === 'video' || item.url?.includes('mp4'))) {
                const promise = videoRef.current.play();
                if (promise !== undefined) {
                    promise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
                }
            }
        }
    }, [isActive, item]);

    const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.duration) {
            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    };

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleSeek = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current || !videoRef.current.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (x / width) * videoRef.current.duration;
        videoRef.current.currentTime = newTime;
        setProgress((x / width) * 100);
    };

    const isVideo = item.type === 'video' || item.url?.includes('.mp4') || item.url?.includes('video');

    return (
        <div className="relative min-w-full h-full flex flex-col">
            {/* Background Blur Fill */}
            <div className="absolute inset-0 bg-black overflow-hidden pointer-events-none">
                {item.thumb !== '/placeholder-luxury.png' ? (
                    <img src={item.thumb} alt={item.label} className="w-full h-full object-cover opacity-60 blur-3xl scale-150 saturate-150" />
                ) : (
                    <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#0a0a0a] to-[#000000] opacity-50"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
            </div>

            {/* Main Content Area */}
            <div className="relative flex-1 flex items-center justify-center p-1">
                <div
                    className="relative w-full h-full bg-[#080808] border border-[#d2ac47]/20 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] group/item flex items-center justify-center"
                    onClick={togglePlay}
                >
                    {isVideo ? (
                        <video
                            ref={videoRef}
                            src={item.url}
                            poster={item.thumb !== '/placeholder-luxury.png' ? item.thumb : undefined}
                            className="w-full h-full object-contain bg-black shadow-inner pointer-events-none"
                            muted
                            loop
                            playsInline
                            onTimeUpdate={handleTimeUpdate}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                    ) : (
                        <img
                            src={item.thumb}
                            alt={item.label}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-1000"
                        />
                    )}

                    {/* Interactive Overlay */}
                    <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover/item:opacity-100 transition-all duration-500">
                        {/* Top Icons - Apple Glassmorphism + Soft Glow + Golden Border */}
                        <div className="absolute top-3 left-3 flex gap-2 pointer-events-auto">
                            <button className="group/btn relative p-2.5 bg-black/30 backdrop-blur-xl border border-[#d2ac47]/30 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:border-red-500/50">
                                <Heart size={18} className="text-[#d2ac47]/60 group-hover/btn:text-red-500 transition-colors" />
                            </button>
                            <button className="group/btn relative p-2.5 bg-black/30 backdrop-blur-xl border border-[#d2ac47]/30 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(96,165,250,0.4)] hover:border-blue-400/50">
                                <Share2 size={18} className="text-[#d2ac47]/60 group-hover/btn:text-blue-400 transition-colors" />
                            </button>
                        </div>

                        {/* Bottom Control Bar - Extra Transparency 'Apple Style' */}
                        <div
                            className="absolute bottom-4 left-4 right-4 h-12 bg-black/40 backdrop-blur-2xl border border-[#d2ac47]/10 rounded-2xl overflow-hidden flex items-center px-4 gap-3 group-hover/item:border-[#d2ac47]/30 transition-all pointer-events-auto shadow-2xl animate-in fade-in duration-1000"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Play Button */}
                            <button
                                className="w-8 h-8 shrink-0 rounded-full bg-[#d2ac47]/10 flex items-center justify-center hover:bg-[#d2ac47] group/play transition-colors"
                                onClick={togglePlay}
                            >
                                {isPlaying ? (
                                    <div className="w-2.5 h-2.5 bg-[#d2ac47] group-hover/play:bg-black rounded-sm shadow-[0_0_10px_rgba(210,172,71,0.5)]" />
                                ) : (
                                    <Play size={12} className="text-[#d2ac47] fill-[#d2ac47] group-hover/play:text-black group-hover/play:fill-black shadow-[0_0_10px_rgba(210,172,71,0.5)]" />
                                )}
                            </button>

                            {/* Scrubber - Golden Glow */}
                            <div className="flex-1 h-full flex items-center justify-center cursor-pointer group/scrub" onClick={handleSeek}>
                                <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-visible">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gold-gradient rounded-full shadow-[0_0_15px_rgba(210,172,71,0.6)] transition-all duration-100 ease-linear"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/scrub:opacity-100 transition-opacity shadow-[0_0_10px_white]"
                                        style={{ left: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center gap-2 text-[8px] text-[#d2ac47]/60 font-mono uppercase tracking-tighter shrink-0">
                                <Maximize2 size={12} className="opacity-50 hover:text-white cursor-pointer transition-colors" />
                            </div>
                        </div>

                        {/* Delete Button - Glass + Red Glow */}
                        {onDelete && item.id !== 'p1' && !String(item.id).startsWith('p') && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Delete this item?')) onDelete(item.id);
                                }}
                                className="absolute top-3 right-3 p-2.5 bg-red-950/40 backdrop-blur-xl text-red-200/60 rounded-full hover:bg-red-600 hover:text-white transition-all border border-red-500/10 shadow-lg hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] pointer-events-auto opacity-0 group-hover/item:opacity-100"
                                title="Delete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="relative px-4 pb-4 pt-1 text-center shrink-0">
                <p className="text-[#F9F1D8] text-[11px] font-serif italic mb-0.5 truncate">{item.label}</p>
                <div className="flex items-center justify-center gap-2 text-[7px] uppercase tracking-widest text-[#d2ac47]/40 font-bold">
                    <span>{item.date || 'Just now'}</span>
                    <div className="w-1 h-1 rounded-full bg-[#d2ac47]/10"></div>
                    {item.privacy === 'public' ? <Globe size={8} /> : <Lock size={8} />}
                    <div className="w-1 h-1 rounded-full bg-[#d2ac47]/10"></div>
                    <button className="hover:text-[#d2ac47] transition-colors uppercase">Details</button>
                </div>
            </div>
        </div>
    );
};

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
                        <VideoGalleryItem
                            key={item.id || idx}
                            item={item}
                            isActive={idx === currentIndex}
                            onDelete={onDelete}
                        />
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
