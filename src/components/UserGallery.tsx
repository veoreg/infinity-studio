import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Globe, Lock, Heart, Share2, Maximize2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

const PLACEHOLDERS = [
    { id: 'p1', type: 'video', url: '/videos/wan22_2026-01-22T15_36_40 FALSE_00001.mp4', thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop', label: 'Elegance Redefined', privacy: 'private' },
    { id: 'p2', type: 'video', url: '/videos/infinity_video_1769098200041.mp4', thumb: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=2787&auto=format&fit=crop', label: 'Shadow Bloom', privacy: 'private' },
    { id: 'p3', type: 'video', url: '/videos/infinity_video_1769099816091.mp4', thumb: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=2787&auto=format&fit=crop', label: 'Dark Angel', privacy: 'private' },
];

const COMMUNITY_FEED = [
    { id: 201, type: 'video', url: '/videos/infinity_video_1769040650308.mp4', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', label: 'Golden Majesty', author: 'AI_Studio', likes: 12540 },
    { id: 202, type: 'video', url: '/videos/wan22_2026-01-22T16_45_50 NSFW_00001.mp4', thumb: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2787&auto=format&fit=crop', label: 'Winter Goddess', author: 'AI_Studio', likes: 21450 },
    { id: 203, type: 'video', url: '/videos/wan22_2026-01-20T16_41_35 FALSE_00001.mp4', thumb: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=2787&auto=format&fit=crop', label: 'Maldives Diva', author: 'AI_Studio', likes: 8900 },
    { id: 204, type: 'video', url: '/videos/infinity_video_1769098912544.mp4', thumb: 'https://images.unsplash.com/photo-1583243552698-25029a1396eb?q=80&w=2400&auto=format&fit=crop', label: 'Poolside Dream', author: 'AI_Studio', likes: 15400 },
    { id: 205, type: 'video', url: '/videos/infinity_video_1769091280526.mp4', thumb: 'https://images.unsplash.com/photo-1563620915-8478239e9aab?q=80&w=2670&auto=format&fit=crop', label: 'Ethereal Motion', author: 'AI_Studio', likes: 8900 },
];

export interface GalleryItem {
    id: number | string;
    type: string;
    url?: string;
    result_url?: string;
    video_url?: string;
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
    onSelect?: (item: GalleryItem) => void;
    onRefresh?: () => void;
    compact?: boolean;
}

// -----------------------------------------------------------------------------------------
// Helper Sub-Component: Handles video state & Premium Apple-Glass Aesthetics
// -----------------------------------------------------------------------------------------
const VideoGalleryItem = ({ item, isActive, onDelete, onSelect }: { item: any; isActive: boolean; onDelete?: (id: string | number) => void; onSelect?: (item: any) => void }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showUI, setShowUI] = useState(true);
    const uiTimeoutRef = React.useRef<any>(null);

    const mediaUrl = item.result_url || item.video_url || item.url;
    const isVideoFile = mediaUrl?.toLowerCase().endsWith('.mp4') || item.type === 'video';

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
            if (videoRef.current && isVideoFile) {
                const promise = videoRef.current.play();
                if (promise !== undefined) {
                    promise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
                }
            }
        }
    }, [isActive, item, isVideoFile]);

    const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.duration) {
            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    };

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;

        if (isPlaying) {
            if (!showUI) {
                // If playing and UI is hidden, show UI first
                setShowUI(true);
            } else {
                // If playing and UI is visible, pause
                videoRef.current.pause();
                setIsPlaying(false);
            }
        } else {
            // If paused, start playing and hide UI
            videoRef.current.play();
            setIsPlaying(true);
            setShowUI(false);
        }
    };

    // Auto-hide UI when playing
    useEffect(() => {
        if (isPlaying && showUI) {
            if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
            uiTimeoutRef.current = setTimeout(() => {
                setShowUI(false);
            }, 3000); // 3 seconds
        }
        return () => {
            if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
        };
    }, [isPlaying, showUI]);

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

    // const isVideo = item.type === 'video' || item.url?.includes('.mp4') || item.url?.includes('video');
    // Replaced by isVideoFile defined above

    return (
        <div className="relative min-w-full h-full flex flex-col">
            {/* Background Blur Fill */}
            <div className="absolute inset-0 bg-[var(--bg-input)] overflow-hidden pointer-events-none transition-colors duration-500">
                {item.thumb !== '/placeholder-luxury.png' ? (
                    <img src={item.thumb} alt={item.label} className="w-full h-full object-cover opacity-60 blur-3xl scale-150 saturate-150" />
                ) : (
                    <div className="w-full h-full opacity-50"></div>
                )}
                {/* Gradient Overlay - Dark in dark mode, light/transparent in light mode */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 dark:from-black/80 dark:to-black/20 opacity-20 dark:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Main Content Area - Blur Fill Layout */}
            <div className="relative flex-1 flex items-center justify-center p-0 overflow-hidden bg-[var(--bg-input)] transition-colors duration-500">
                {/* 1. Blur Fill Layer */}
                <div className="absolute inset-0 pointer-events-none">
                    <img src={item.thumb} alt="" className="w-full h-full object-cover opacity-30 blur-2xl scale-125 saturate-150" />
                    <div className="absolute inset-0 bg-[var(--bg-input)]/40"></div>
                </div>

                <div
                    className="relative w-full h-full z-10 overflow-hidden group/item flex items-center justify-center transition-all duration-500"
                    onClick={togglePlay}
                >
                    {isVideoFile ? (
                        <video
                            ref={videoRef}
                            src={mediaUrl}
                            poster={item.thumb !== '/placeholder-luxury.png' ? item.thumb : undefined}
                            className="w-full h-full object-contain bg-transparent shadow-2xl pointer-events-none"
                            muted
                            loop
                            playsInline
                            onTimeUpdate={handleTimeUpdate}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                    ) : (
                        <img
                            src={mediaUrl || item.thumb}
                            alt={item.label}
                            className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-1000"
                        />
                    )}

                    {/* Interactive Overlay - Visible only on hover (PC) or tap/playing (Mobile) */}
                    <div
                        data-visible={showUI}
                        className="absolute inset-0 z-20 pointer-events-none opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 [@media(hover:none)]:data-[visible=true]:opacity-100 transition-all duration-300"
                    >
                        {/* Type Indicator - Top Right (Below Delete) */}
                        <div className="absolute top-16 right-3 flex flex-col gap-2">
                            <div className="p-2 bg-black/40 backdrop-blur-md border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)]/60 shadow-lg animate-in zoom-in duration-300">
                                {isVideoFile ? <VideoIcon size={14} /> : <ImageIcon size={14} />}
                            </div>
                        </div>

                        {/* Top Icons - Apple Glassmorphism + Soft Glow + Golden Border */}
                        <div className="absolute top-3 left-3 flex gap-2 pointer-events-auto">
                            <button className="group/btn relative p-2.5 bg-black/30 backdrop-blur-xl border border-[var(--border-color)] rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:border-red-500/50">
                                <Heart size={18} className="text-[var(--text-secondary)]/60 group-hover/btn:text-red-500 transition-colors" />
                            </button>
                            <button className="group/btn relative p-2.5 bg-black/30 backdrop-blur-xl border border-[var(--border-color)] rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(96,165,250,0.4)] hover:border-blue-400/50">
                                <Share2 size={18} className="text-[var(--text-secondary)]/60 group-hover/btn:text-blue-400 transition-colors" />
                            </button>
                        </div>

                        {/* Bottom Control Bar - Only for Videos */}
                        {isVideoFile && (
                            <div
                                className="absolute bottom-10 left-4 right-4 h-12 bg-black/40 backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl overflow-hidden flex items-center px-4 gap-3 group-hover/item:border-[var(--border-color)] transition-all pointer-events-auto shadow-2xl animate-in fade-in duration-500"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Play Button */}
                                <button
                                    className="w-8 h-8 shrink-0 rounded-full bg-[var(--text-secondary)]/10 flex items-center justify-center hover:bg-[var(--text-secondary)] group/play transition-colors"
                                    onClick={togglePlay}
                                >
                                    {isPlaying ? (
                                        <div className="w-2.5 h-2.5 bg-[#d2ac47] group-hover/play:bg-black rounded-sm shadow-[0_0_10px_var(--border-color)]" />
                                    ) : (
                                        <Play size={12} className="text-[var(--text-secondary)] fill-[var(--text-secondary)] group-hover/play:text-black group-hover/play:fill-black shadow-[0_0_10px_var(--border-color)]" />
                                    )}
                                </button>

                                {/* Scrubber - Golden Glow */}
                                <div className="flex-1 h-full flex items-center justify-center cursor-pointer group/scrub" onClick={handleSeek}>
                                    <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-visible">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-gold-gradient rounded-full shadow-[0_0_15px_var(--border-color)] transition-all duration-100 ease-linear"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/scrub:opacity-100 transition-opacity shadow-[0_0_10px_white]"
                                            style={{ left: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Meta Info */}
                                <div className="flex items-center gap-2 text-[8px] text-[var(--text-secondary)]/60 font-mono uppercase tracking-tighter shrink-0 pointer-events-auto">
                                    <Maximize2 size={12} className="opacity-50 hover:text-white cursor-pointer transition-colors" />
                                </div>
                            </div>
                        )}

                        {/* Full View Button for Images (Replacement for Scrubber) */}
                        {!isVideoFile && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <button
                                    className="px-5 py-2 bg-white/5 backdrop-blur-[2px] border border-white/10 text-white/90 text-[9px] font-bold uppercase tracking-[0.3em] rounded-full shadow-sm pointer-events-auto hover:bg-black/40 hover:border-white/30 hover:text-white transition-all hover:scale-105"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onSelect) onSelect(item);
                                    }}
                                >
                                    USE REF
                                </button>
                            </div>
                        )}

                        {/* Delete Button - Glass + Red Glow */}
                        {onDelete && item.id !== 'p1' && (
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
                <p className="text-[var(--text-primary)] text-[11px] font-serif italic mb-0.5 truncate">{item.label}</p>
                <div className="flex items-center justify-center gap-2 text-[7px] uppercase tracking-widest text-[var(--text-secondary)]/40 font-bold">
                    <span>{item.date || 'Just now'}</span>
                    <div className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/10"></div>
                    {item.privacy === 'public' ? <Globe size={8} /> : <Lock size={8} />}
                    <div className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/10"></div>
                    <button
                        className="hover:text-[var(--text-secondary)] transition-colors uppercase"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onSelect) onSelect(item);
                        }}
                    >
                        Details
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserGallery: React.FC<UserGalleryProps> = ({ newItems = [], onDelete, onSelect, onRefresh }) => {
    const [activeTab, setActiveTab] = useState<'my' | 'community'>('my');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Mobile Swipe Logic
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const rawItems = React.useMemo(() => (
        activeTab === 'my'
            ? [...(newItems || []), ...PLACEHOLDERS]
            : COMMUNITY_FEED
    ), [activeTab, newItems]);

    // Normalize items to handle Supabase schema - Memoized to prevent flickering
    const items = React.useMemo(() => (
        rawItems.map((item: any) => ({
            ...item,
            thumb: item.image_url || item.thumb || '/placeholder-luxury.png',
            url: item.video_url || item.url,
            label: item.prompt ? (item.prompt.substring(0, 20) + '...') : (item.label || 'Untitled')
        }))
    ), [rawItems]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextSlide();
        }
        if (isRightSwipe) {
            prevSlide();
        }
    };

    return (
        <div className="w-full relative group mt-4 flex-1 flex flex-col min-h-0 bg-[var(--bg-primary)] rounded-2xl overflow-hidden border border-[var(--border-color)]">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-input)] border-b border-[var(--border-color)] sticky top-0 z-40">
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setActiveTab('my');
                            setCurrentIndex(0);
                            if (onRefresh) onRefresh();
                        }}
                        className={`text-[9px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === 'my' ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]/30 hover:text-[var(--text-secondary)]/60'}`}
                    >
                        My Library
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('community');
                            setCurrentIndex(0);
                        }}
                        className={`text-[9px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === 'community' ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]/30 hover:text-[var(--text-secondary)]/60'}`}
                    >
                        Trending
                    </button>
                </div>

                {/* Navigation Arrows */}
                <div className="flex gap-1.5">
                    <button onClick={prevSlide} className="p-1 hover:text-[var(--text-secondary)] transition-colors border border-[var(--border-color)] rounded-lg bg-black/40"><ChevronLeft size={12} /></button>
                    <button onClick={nextSlide} className="p-1 hover:text-[var(--text-secondary)] transition-colors border border-[var(--border-color)] rounded-lg bg-black/40"><ChevronRight size={12} /></button>
                </div>
            </div>

            {/* Gallery Window */}
            <div
                className="relative flex-1 overflow-hidden group-hover:border-[#d2ac47]/40 transition-colors touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >

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
                            onSelect={onSelect}
                        />
                    ))}
                </div>

                {/* Counter Tag - Unified Premium Position (Now Lower) */}
                <div className="absolute bottom-4 right-4 bg-[var(--bg-input)]/80 dark:bg-black/60 backdrop-blur-md border border-[var(--border-color)] px-3 py-1 rounded-full z-30 shadow-lg">
                    <span className="text-[var(--text-secondary)] text-[8px] font-bold tracking-widest">{currentIndex + 1} / {items.length}</span>
                </div>
            </div>
        </div>
    );
};

export default UserGallery;
