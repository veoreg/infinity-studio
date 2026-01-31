import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Play, Globe, Lock, Heart, Share2, Maximize2, Image as ImageIcon, Video as VideoIcon, Download, PersonStanding } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const PLACEHOLDERS = [
    { id: 'lib_1', type: 'video', url: '/assets/my_library/1.mp4', thumb: '/assets/my_library/1.mp4', label: 'Library 1', privacy: 'private' },
    { id: 'lib_2', type: 'video', url: '/assets/my_library/2.mp4', thumb: '/assets/my_library/2.mp4', label: 'Library 2', privacy: 'private' },
    { id: 'lib_3', type: 'video', url: '/assets/my_library/3.mp4', thumb: '/assets/my_library/3.mp4', label: 'Library 3', privacy: 'private' },
    { id: 'lib_4', type: 'video', url: '/assets/my_library/4.mp4', thumb: '/assets/my_library/4.mp4', label: 'Library 4', privacy: 'private' },
    { id: 'lib_5', type: 'video', url: '/assets/my_library/5.mp4', thumb: '/assets/my_library/5.mp4', label: 'Library 5', privacy: 'private' },
];

const COMMUNITY_FEED = [
    { id: 'tr_1', type: 'video', url: '/assets/trending/1.mp4', thumb: '/assets/trending/1.mp4', label: 'Trending 1', author: 'AI_Studio', likes: 1200 },
    { id: 'tr_2', type: 'video', url: '/assets/trending/2.mp4', thumb: '/assets/trending/2.mp4', label: 'Trending 2', author: 'AI_Studio', likes: 1150 },
    { id: 'tr_3', type: 'video', url: '/assets/trending/3.mp4', thumb: '/assets/trending/3.mp4', label: 'Trending 3', author: 'AI_Studio', likes: 980 },
    { id: 'tr_4', type: 'video', url: '/assets/trending/4.mp4', thumb: '/assets/trending/4.mp4', label: 'Trending 4', author: 'AI_Studio', likes: 850 },
    { id: 'tr_5', type: 'video', url: '/assets/trending/5.mp4', thumb: '/assets/trending/5.mp4', label: 'Trending 5', author: 'AI_Studio', likes: 720 },
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
    is_public?: boolean;
    date?: string;
    author?: string;
    likes?: number;
}

interface UserGalleryProps {
    newItems?: GalleryItem[];
    columns?: number;
    onDelete?: (id: number | string) => void;
    onSelect?: (item: GalleryItem) => void;
    onReference?: (item: GalleryItem) => void;
    onToVideo?: (item: GalleryItem) => void;
    onRefresh?: () => void;
    compact?: boolean;
}

// -----------------------------------------------------------------------------------------
// Helper Sub-Component: Handles video state & Premium Apple-Glass Aesthetics
// -----------------------------------------------------------------------------------------
const VideoGalleryItem = ({
    item,
    isActive,
    onDelete,
    onSelect,
    onReference,
    onToVideo,
    onTogglePrivacy
}: {
    item: any;
    isActive: boolean;
    onDelete?: (id: string | number) => void;
    onSelect?: (item: any) => void;
    onReference?: (item: any) => void;
    onToVideo?: (item: any) => void;
    onTogglePrivacy?: (item: any) => void;
}) => {
    const { t } = useTranslation();
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
            setShowUI(true); // Reset UI visibility when inactive/switching
        } else {
            // Auto-play active slide
            if (videoRef.current && isVideoFile) {
                const promise = videoRef.current.play();
                if (promise !== undefined) {
                    promise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
                }
            }
            // Reset timer on slide change
            resetUITimer();
        }
    }, [isActive, item.id, isVideoFile]);

    const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.duration) {
            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    };

    const resetUITimer = () => {
        setShowUI(true);
        if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
        // Fade out to 10% after 2.0 seconds (User requested 2.0s delay)
        uiTimeoutRef.current = setTimeout(() => {
            setShowUI(false);
        }, 2000);
    };

    const handleInteraction = () => {
        // Any interaction resets the timer and shows UI
        resetUITimer();
    };

    // Initial timer on mount/active
    useEffect(() => {
        if (isActive) resetUITimer();
        return () => {
            if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
        };
    }, [isActive]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleInteraction();

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
        handleInteraction();
        if (!videoRef.current || !videoRef.current.duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const validX = Math.max(0, Math.min(offsetX, rect.width));
        const percentage = validX / rect.width;
        const newTime = percentage * videoRef.current.duration;

        videoRef.current.currentTime = newTime;
        setProgress(percentage * 100);
    };

    return (
        <div
            className="relative min-w-full h-full flex flex-col"
            onClick={handleInteraction} // Global touch handler to restore UI
            onMouseMove={handleInteraction} // Mouse move also restores UI
        >
            {/* Background Blur Fill */}
            <div className="absolute inset-0 bg-[var(--bg-input)] overflow-hidden pointer-events-none transition-colors duration-500">
                {item.thumb !== '/placeholder-luxury.png' ? (
                    <img src={item.thumb} alt={item.label} className="w-full h-full object-cover opacity-60 blur-3xl scale-150 saturate-150" />
                ) : (
                    <div className="w-full h-full opacity-50"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 dark:from-black/80 dark:to-black/20 opacity-20 dark:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Main Content Area */}
            <div className="relative flex-1 flex items-center justify-center p-0 overflow-hidden bg-[var(--bg-input)] transition-colors duration-500">
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
                            preload="metadata"
                            onTimeUpdate={handleTimeUpdate}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onError={(e) => console.error("❌ [GALLERY] Video failed:", mediaUrl, e)}
                        />
                    ) : (
                        <img
                            src={mediaUrl || item.thumb}
                            alt={item.label}
                            className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                        />
                    )}

                    {/* Interactive Overlay - Fades to 10% opacity, does NOT hide completely */}
                    <div
                        className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-500 delay-500"
                        style={{ opacity: showUI ? 1 : 0.1 }}
                    >
                        {/* Type Indicator */}
                        <div className="absolute top-16 right-3 flex flex-col gap-2">
                            <div className="p-2 bg-transparent backdrop-blur-md border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)]/60 shadow-lg">
                                {isVideoFile ? <VideoIcon size={14} /> : <ImageIcon size={14} />}
                            </div>
                        </div>

                        <div className="absolute top-3 left-3 flex gap-2 pointer-events-auto">
                            {/* Standardized Button Style */}
                            {(() => {
                                // Premium Golden Glass Style
                                const baseBtnClass = "group/btn relative p-2.5 bg-black/60 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-secondary)] rounded-full transition-all hover:bg-[#d2ac47] hover:text-black hover:border-[#d2ac47] hover:scale-110 active:scale-95 shadow-lg z-30";

                                return (
                                    <>
                                        {/* LIKE BUTTON */}
                                        <button className={`${baseBtnClass} hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:!bg-red-500/20 hover:!border-red-500 hover:!text-white`}>
                                            <Heart size={18} className="text-[var(--text-secondary)] group-hover/btn:text-white transition-colors" />
                                        </button>

                                        {/* SHARE BUTTON */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleInteraction();
                                                if (onTogglePrivacy) onTogglePrivacy(item);
                                            }}
                                            className={`${baseBtnClass} ${item.is_public
                                                ? 'bg-blue-500/20 !border-blue-400 !text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.3)] hover:!bg-blue-500/30 hover:!text-white'
                                                : 'hover:shadow-[0_0_20px_rgba(96,165,250,0.6)] hover:!bg-blue-500/20 hover:!border-blue-500 hover:!text-white'
                                                }`}
                                        >
                                            <Share2
                                                size={18}
                                                className={`transition-colors ${item.is_public
                                                    ? 'text-blue-400 group-hover/btn:text-white'
                                                    : 'text-[var(--text-secondary)] group-hover/btn:text-white'
                                                    }`}
                                            />
                                        </button>

                                        {/* Download Button */}
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                handleInteraction();
                                                try {
                                                    const response = await fetch(mediaUrl);
                                                    const blob = await response.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.download = `infinity_${isVideoFile ? 'video' : 'photo'}_${Date.now()}.${isVideoFile ? 'mp4' : 'png'}`;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    window.URL.revokeObjectURL(url);
                                                } catch (err) {
                                                    console.error("Download failed", err);
                                                    window.open(mediaUrl, '_blank');
                                                }
                                            }}
                                            className={`${baseBtnClass} hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:!bg-green-500/20 hover:!border-green-500 hover:!text-white`}
                                            title={t('tooltip_download')}
                                        >
                                            <Download size={18} className="text-[var(--text-secondary)] group-hover/btn:text-white transition-colors" />
                                        </button>

                                        {/* Reference Button (NOW EDIT) */}
                                        {!isVideoFile && onReference && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleInteraction();
                                                    onReference(item);
                                                }}
                                                className={`${baseBtnClass} hover:shadow-[0_0_20px_rgba(249,115,22,0.6)] hover:!bg-orange-500/20 hover:!border-orange-500 hover:!text-white`}
                                                title={t('btn_use_ref')}
                                            >
                                                <PersonStanding size={18} className="text-[var(--text-secondary)] group-hover/btn:text-white transition-colors" />
                                            </button>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Bottom Control Bar - Only for Videos */}
                        {isVideoFile && (
                            <div
                                className="absolute bottom-10 left-4 right-4 h-12 bg-black/40 backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl overflow-hidden flex items-center px-4 gap-3 group-hover/item:border-[var(--border-color)] transition-all pointer-events-auto shadow-2xl"
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

                                {/* Scrubber */}
                                <div
                                    className="flex-1 h-full flex items-center justify-center cursor-ew-resize group/scrub touch-none"
                                    onClick={handleSeek}
                                    onMouseMove={(e) => {
                                        if (e.buttons === 1) handleSeek(e);
                                    }}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onTouchMove={(e) => {
                                        e.stopPropagation();
                                        if (!videoRef.current || !videoRef.current.duration) return;
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const offsetX = e.touches[0].clientX - rect.left;
                                        const validX = Math.max(0, Math.min(offsetX, rect.width));
                                        const percentage = validX / rect.width;
                                        const newTime = percentage * videoRef.current.duration;
                                        if (!isNaN(newTime) && isFinite(newTime)) {
                                            videoRef.current.currentTime = newTime;
                                            setProgress(percentage * 100);
                                        }
                                    }}
                                >
                                    <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-visible pointer-events-none">
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

                                <div className="flex items-center gap-2 text-[8px] text-[var(--text-secondary)]/60 font-mono uppercase tracking-tighter shrink-0 pointer-events-auto">
                                    <Maximize2 size={12} className="opacity-50 hover:text-white cursor-pointer transition-colors" />
                                </div>
                            </div>
                        )}

                        {/* Full View Button for Images */}
                        {!isVideoFile && (
                            <div className="absolute inset-0 flex flex-col gap-1.5 items-center justify-center pointer-events-none">
                                <button
                                    className="px-3 py-1.5 bg-white/5 backdrop-blur-[2px] border border-white/10 text-white/90 text-[8px] font-bold uppercase tracking-[0.2em] rounded-full shadow-sm pointer-events-auto hover:bg-black/40 hover:border-white/30 hover:text-white transition-all hover:scale-105"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleInteraction();
                                        if (onSelect) onSelect(item);
                                    }}
                                >
                                    {t('btn_use_ref')}
                                </button>

                                {onToVideo && (
                                    <button
                                        className="px-3 py-1.5 bg-[var(--bg-card)]/80 backdrop-blur-md border border-[#d2ac47]/50 text-[#d2ac47] text-[8px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg pointer-events-auto hover:bg-[#d2ac47] hover:text-black transition-all hover:scale-105 flex items-center gap-1.5"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleInteraction();
                                            onToVideo(item);
                                        }}
                                    >
                                        <VideoIcon size={10} />
                                        {t('btn_to_video')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Delete Button - Always Visible but fades with others */}
                    {onDelete && item.id !== 'p1' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleInteraction();
                                if (window.confirm(t('tooltip_delete') + '?')) onDelete(item.id);
                            }}
                            className={`absolute top-3 right-3 p-2.5 bg-red-950/40 backdrop-blur-xl text-red-200/60 rounded-full hover:bg-red-600 hover:text-white transition-all border border-red-500/10 shadow-lg hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] pointer-events-auto z-30 duration-1000 ${showUI ? 'opacity-100' : 'opacity-10'}`}
                            title={t('tooltip_delete')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Footer Info */}
            <div className={`relative px-4 pb-4 pt-1 text-center shrink-0 transition-opacity duration-1000 ${showUI ? 'opacity-100' : 'opacity-20'}`}>
                <p className="text-[var(--text-primary)] text-[11px] font-serif italic mb-0.5 truncate">{item.label}</p>
                <div className="flex items-center justify-center gap-2 text-[7px] uppercase tracking-widest text-[var(--text-secondary)]/40 font-bold">
                    <span>{item.date || t('lbl_just_now')}</span>
                    <div className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/10"></div>
                    {item.is_public ? <Globe size={8} className="text-blue-400" /> : <Lock size={8} />}
                    <div className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/10"></div>
                    <button
                        className="hover:text-[var(--text-secondary)] transition-colors uppercase"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleInteraction();
                            if (onSelect) onSelect(item);
                        }}
                    >
                        {t('label_details')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserGallery: React.FC<UserGalleryProps> = ({ newItems = [], onDelete, onSelect, onReference, onToVideo, onRefresh, compact = false }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'my' | 'community'>('my');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoHistory, setIsAutoHistory] = useState<any[]>([]);

    // Generate or retrieve Guest ID for isolation (Self-contained)
    const [guestId] = useState(() => {
        let id = localStorage.getItem('endless_guest_id');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('endless_guest_id', id);
        }
        return id;
    });

    useEffect(() => {
        if (!newItems || newItems.length === 0) {
            const fetchHistory = async () => {
                let query = supabase
                    .from('generations')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (user) {
                    query = query.eq('user_id', user.id);
                } else {
                    query = query.contains('metadata', { guest_id: guestId });
                }

                const { data, error } = await query;
                if (data && !error) {
                    setIsAutoHistory(data);
                }
            };
            fetchHistory();
        }
    }, [user, guestId, newItems]);

    // Handle Privacy Toggle (Share to Trending)
    const handleTogglePrivacy = async (item: GalleryItem) => {
        console.log("Toggle Privacy Triggered for:", item.id, item.is_public);
        if (!user && !guestId) return; // Basic guard

        const newIsPublic = !item.is_public;

        // Optimistic Update
        const updateList = (list: any[]) => list.map(i => i.id === item.id ? { ...i, is_public: newIsPublic } : i);
        if (newItems && newItems.length > 0) {
            // ...
        }
        setIsAutoHistory(prev => updateList(prev));

        // Actual Supabase call
        try {
            const { error } = await supabase
                .from('generations')
                .update({ is_public: newIsPublic })
                .eq('id', item.id);

            if (error) throw error;

            // If successfully shared to public, maybe trigger a refresh of community feed?
            if (activeTab === 'community' && onRefresh) onRefresh();

        } catch (err) {
            console.error("Failed to toggle privacy:", err);
            // Revert on error
            setIsAutoHistory(prev => prev.map(i => i.id === item.id ? { ...i, privacy: item.privacy } : i));
            alert(t('error_share_failed') || "Failed to update privacy");
        }
    };


    // Mobile Swipe Logic
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const rawItems = React.useMemo(() => {
        if (activeTab === 'community') return COMMUNITY_FEED;
        const historyData = (newItems && newItems.length > 0) ? newItems : isAutoHistory;
        return [...(historyData || []), ...PLACEHOLDERS];
    }, [activeTab, newItems, isAutoHistory]);

    // Normalize items to handle Supabase schema - Memoized to prevent flickering
    const items = React.useMemo(() => (
        rawItems.map((item: any) => ({
            ...item,
            thumb: item.image_url || item.thumb || '/placeholder-luxury.png',
            url: item.video_url || item.url,
            label: item.prompt ? (item.prompt.substring(0, 20) + '...') : (item.label || t('lbl_untitled'))
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
        <div className={`w-full relative group mt-4 flex-1 flex flex-col min-h-0 bg-[var(--bg-primary)] rounded-2xl overflow-hidden border border-[var(--border-color)] ${compact ? 'border-none bg-transparent mt-0' : ''}`}>
            {/* Header / Tabs */}
            {!compact && (
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
                            {t('vid_lib')}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('community');
                                setCurrentIndex(0);
                            }}
                            className={`text-[9px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === 'community' ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]/30 hover:text-[var(--text-secondary)]/60'}`}
                        >
                            {t('vid_trending')}
                        </button>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="flex gap-1.5">
                        <button onClick={prevSlide} className="p-1 hover:text-[var(--text-secondary)] transition-colors border border-[var(--border-color)] rounded-lg bg-transparent"><ChevronLeft size={12} /></button>
                        <button onClick={nextSlide} className="p-1 hover:text-[var(--text-secondary)] transition-colors border border-[var(--border-color)] rounded-lg bg-transparent"><ChevronRight size={12} /></button>
                    </div>
                </div>
            )}

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
                            onReference={onReference}
                            onToVideo={onToVideo}
                            onTogglePrivacy={handleTogglePrivacy}
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
