import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Play, Loader2, XCircle, ShieldCheck, Flame, Download, Layers, Wand2, Video as VideoIcon, Image as ImageIcon, Heart, Share2, Maximize2 } from 'lucide-react';
import GamificationDashboard from './GamificationDashboard';
import UserGallery from './UserGallery';
import ImageUploadZone from './ImageUploadZone';
import { supabase } from '../lib/supabaseClient';

// Simulated Progress Logger for UX
const GenerationLogger = ({ status, error }: { status: string; error: string | null }) => {
    const [logs, setLogs] = React.useState<string[]>(["Initializing Neural Network..."]);

    React.useEffect(() => {
        // Base logs for different statuses
        if (status === 'queued') {
            setLogs(["Server received request...", "Searching for available GPU slot...", "You are in the creative queue..."]);
            return;
        }

        if (status === 'processing' || status === 'pending') {
            const steps = [
                { msg: "Studio: Receiving creative assets...", delay: 800 },
                { msg: "Analysis: Deciphering visual context...", delay: 5000 },
                { msg: "Director: Crafting cinematic screenplay...", delay: 15000 },
                { msg: "Lighting: Configuring atmosphere & mood...", delay: 30000 },
                { msg: "Engine: Calibrating render pipeline (This takes time)...", delay: 60000 },
                { msg: "Core: Loading high-fidelity models...", delay: 90000 },
                { msg: "Animation: Simulating physics and movement...", delay: 150000 },
                { msg: "Rendering: Enhancing texture and detail...", delay: 240000 },
                { msg: "Assembly: Compiling final video sequence...", delay: 300000 },
                { msg: "Delivery: Finalizing masterpiece...", delay: 340000 }
            ];

            let timeouts: any[] = [];
            steps.forEach(({ msg, delay }) => {
                const timeout = setTimeout(() => {
                    setLogs(prev => [...prev.slice(-4), msg]);
                }, delay);
                timeouts.push(timeout);
            });
            return () => timeouts.forEach(clearTimeout);
        }
    }, [status]);

    return (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-start justify-start p-8 font-mono text-xs z-50">
            <div className="w-full space-y-4">
                {/* Progress Bar Top */}
                <div className="h-2 w-full bg-[#d2ac47]/10 rounded-full overflow-hidden relative">
                    <div
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ${status === 'queued' ? 'bg-amber-600 animate-pulse' : 'bg-[#d2ac47]'}`}
                        style={{ width: status === 'queued' ? '15%' : '0%', animation: status !== 'queued' ? 'growWidth 360s linear forwards' : 'none' }}
                    ></div>
                </div>
                <div className="flex justify-between text-[9px] text-[#d2ac47]/40 uppercase tracking-widest">
                    <span>{status === 'queued' ? '⚡ QUEUE ACTIVE' : '🚀 GENERATION ACTIVE'}</span>
                    <span>{status === 'queued' ? 'EST: WAITING' : 'EST: 5-6 MINS'}</span>
                </div>

                <div className="space-y-3 mt-8">
                    {error ? (
                        <div className="text-red-500 animate-pulse flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            <span>ERROR: {error}</span>
                        </div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="text-[#d2ac47] animate-fade-in-up flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${i === logs.length - 1 ? "bg-[#d2ac47] animate-ping" : "bg-[#d2ac47]/30"}`}></div>
                                <span className={i === logs.length - 1 ? "animate-pulse font-bold text-[#d2ac47]" : "opacity-50 text-[#d2ac47]/70"}>{log}</span>
                            </div>
                        ))
                    )}

                    {/* Diagnostic message for long waits */}
                    <div className="mt-8 pt-4 border-t border-[#d2ac47]/10 text-[10px] text-[#d2ac47]/30 italic h-10">
                        {status === 'queued' && "Server is currently handling other requests. Please stay on this page."}
                        {status === 'processing' && "GPU is rendering your frames. This usually takes 5-7 minutes."}
                    </div>
                </div>
            </div>
            <style>{`
@keyframes growWidth {
    0% { width: 0%; }
    100% { width: 95%; } 
}
`}</style>
        </div>
    );
};

// Webhook URL (Updated to Supabase Workflow)
// Webhook URL (Proxied via Vercel/Netlify/Vite)
const WEBHOOK_URL = "/api/video";

import { useAuth } from '../contexts/AuthContext';

// ... (existing imports)

// -----------------------------------------------------------------------------------------
// Helper Component: RecentMasterpieceItem
// Handles individual video state, scrubbing, and premium aesthetics for stability.
// -----------------------------------------------------------------------------------------
const RecentMasterpieceItem = ({ item, onViewFull, onDelete }: { item: any; onViewFull: (item: any) => void; onDelete: (id: string, url: string) => void }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

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

    const mediaUrl = item.result_url || item.video_url || item.url;
    const isVideoFile = mediaUrl?.toLowerCase().endsWith('.mp4');

    return (
        <div className="group/item relative bg-[#080808] border border-[#d2ac47]/10 rounded-2xl overflow-hidden aspect-square shadow-2xl transition-all hover:border-[#d2ac47]/40 hover:-translate-y-1">
            {/* 1. LAYER: Blur Fill Background (Static Image) */}
            <div className="absolute inset-0 pointer-events-none">
                <img
                    src={item.thumb || item.image_url || "/placeholder-luxury.png"}
                    alt=""
                    className="w-full h-full object-cover opacity-60 blur-3xl scale-150 saturate-150"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
            </div>

            {/* 2. LAYER: Main Content */}
            <div className="relative h-full w-full flex items-center justify-center p-1">
                <div
                    className="relative w-full h-full rounded-xl overflow-hidden shadow-inner flex items-center justify-center bg-black"
                    onClick={togglePlay}
                >
                    {isVideoFile ? (
                        <video
                            ref={videoRef}
                            src={mediaUrl}
                            className="h-full w-full object-contain pointer-events-none"
                            muted
                            loop
                            playsInline
                            onTimeUpdate={handleTimeUpdate}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                    ) : (
                        <img
                            src={mediaUrl}
                            className="h-full w-full object-contain"
                            alt={item.label}
                        />
                    )}
                </div>
            </div>

            {/* 3. LAYER: Interactive Items */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover/item:opacity-100 transition-all duration-500">
                {/* Type Indicator - Top Right (Below Delete) */}
                <div className="absolute top-16 right-3 flex flex-col gap-2">
                    <div className="p-2 bg-black/40 backdrop-blur-md border border-[#d2ac47]/20 rounded-lg text-[#d2ac47]/60 shadow-lg animate-in zoom-in duration-300">
                        {isVideoFile ? <VideoIcon size={14} /> : <ImageIcon size={14} />}
                    </div>
                </div>

                {/* Top Icons - Apple Glass + Soft Glow + Golden Border */}
                <div className="absolute top-3 left-3 flex gap-2 pointer-events-auto">
                    <button className="group/btn relative p-2.5 bg-black/30 backdrop-blur-xl border border-[#d2ac47]/30 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:border-red-500/50">
                        <Heart size={16} className="text-[#d2ac47]/60 group-hover/btn:text-red-500 transition-colors" />
                    </button>
                    <button className="group/btn relative p-2.5 bg-black/30 backdrop-blur-xl border border-[#d2ac47]/30 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(96,165,250,0.4)] hover:border-blue-400/50">
                        <Share2 size={16} className="text-[#d2ac47]/60 group-hover/btn:text-blue-400 transition-colors" />
                    </button>
                </div>

                {/* Bottom Video Panel Bar - ONLY FOR VIDEOS */}
                {isVideoFile && (
                    <div
                        className="absolute bottom-3 left-3 right-3 h-10 bg-black/40 backdrop-blur-md border border-[#d2ac47]/10 rounded-xl overflow-hidden flex items-center px-3 gap-3 pointer-events-auto shadow-2xl animate-in fade-in duration-1000"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Play Button */}
                        <button
                            className="w-6 h-6 shrink-0 rounded-full bg-[#d2ac47]/10 flex items-center justify-center hover:bg-[#d2ac47] group/play transition-colors"
                            onClick={togglePlay}
                        >
                            {isPlaying ? (
                                <div className="w-2 h-2 bg-[#d2ac47] group-hover/play:bg-black rounded-sm shadow-[0_0_10px_rgba(210,172,71,0.5)]" />
                            ) : (
                                <Play size={10} className="text-[#d2ac47] fill-[#d2ac47] group-hover/play:text-black group-hover/play:fill-black shadow-[0_0_10px_rgba(210,172,71,0.5)]" />
                            )}
                        </button>

                        {/* Scrubber - Golden Glow */}
                        <div className="flex-1 h-full flex items-center justify-center cursor-pointer group/scrub" onClick={handleSeek}>
                            <div className="w-full h-1 bg-white/10 rounded-full relative overflow-visible">
                                <div
                                    className="absolute inset-y-0 left-0 bg-gold-gradient rounded-full shadow-[0_0_15px_rgba(210,172,71,0.6)] transition-all duration-100 ease-linear"
                                    style={{ width: `${progress}%` }}
                                ></div>
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover/scrub:opacity-100 transition-opacity shadow-[0_0_10px_white]"
                                    style={{ left: `${progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 text-[7px] text-[#d2ac47]/60 font-mono uppercase tracking-tighter shrink-0">
                            <Maximize2 size={10} className="opacity-50 hover:text-white cursor-pointer transition-colors" />
                        </div>
                    </div>
                )}

                {/* Hover Action: View Full */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewFull(item);
                        }}
                        className="px-4 py-1.5 bg-[#d2ac47]/90 backdrop-blur-sm text-black text-[9px] font-bold uppercase rounded-xl shadow-[0_0_20px_rgba(210,172,71,0.4)] translate-y-4 group-hover/item:translate-y-0 opacity-0 group-hover/item:opacity-100 transition-all duration-300 pointer-events-auto hover:bg-white hover:scale-105"
                    >
                        View Full
                    </button>
                </div>

                {/* Delete Button - Glass + Red Glow */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this masterpiece?')) onDelete(item.id, mediaUrl);
                    }}
                    className="absolute top-3 right-3 p-2.5 bg-red-950/40 backdrop-blur-xl text-red-200/60 rounded-full hover:bg-red-600 hover:text-white transition-all border border-red-500/10 shadow-lg hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] pointer-events-auto opacity-0 group-hover/item:opacity-100"
                    title="Delete"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                </button>
            </div>
        </div>
    );
};

const VideoGenerator: React.FC = () => {
    const { user } = useAuth(); // <--- Get logged in user
    const [imageUrl, setImageUrl] = useState('');
    const [fileName, setFileName] = useState('');
    const [textPrompt, setTextPrompt] = useState('');
    // const [negativePrompt, setNegativePrompt] = useState(''); <--- Feature Disabled
    // Video Player State
    const [videoProgress, setVideoProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setVideoProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        // Metadata loaded, video ready
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            videoRef.current.currentTime = percentage * videoRef.current.duration;
        }
    };

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (!document.fullscreenElement) {
                videoRef.current.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };
    const [safeMode, setSafeMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string>('pending');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [galleryItems, setGalleryItems] = useState<any[]>([]);

    // Refs for cleanup
    const abortControllerRef = React.useRef<AbortController | null>(null);
    const intervalRef = React.useRef<any | null>(null);
    const channelRef = React.useRef<any | null>(null);

    // Generate or retrieve Guest ID for isolation
    const [guestId] = useState(() => {
        let id = localStorage.getItem('endless_guest_id');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('endless_guest_id', id);
        }
        return id;
    });

    const fetchHistory = async () => {
        let query = supabase
            .from('generations')
            .select('*')
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(20);

        if (user) {
            // If logged in, fetch MY data associated with my account
            query = query.eq('user_id', user.id);
        } else {
            // If guest, fetch by guest_id metadata
            query = query.contains('metadata', { guest_id: guestId });
        }

        const { data } = await query;
        if (data) {
            setGalleryItems(data);

            // AUTO-RESOLVE STUCK UI
            // If we find our active generation ID in the successfully fetched history,
            // it means it's done and we should clear the loading state.
            const activeGenRaw = localStorage.getItem('active_generation');
            if (activeGenRaw && loading) {
                try {
                    const activeGen = JSON.parse(activeGenRaw);
                    const found = data.find(item => item.id === activeGen.id);
                    const finalUrl = found?.result_url || found?.video_url;

                    if (found && finalUrl) {
                        console.log("🎯 [SYNC] Active generation found in history! Auto-resolving UI.");
                        setVideoUrl(finalUrl);
                        setActiveItem(found);
                        setLoading(false);
                        cleanupMonitoring();
                        localStorage.removeItem('active_generation');
                    }
                } catch (e) {
                    console.error("Sync error:", e);
                }
            }
        }
    };

    // RESTORE STATE ON MOUNT + Fetch History
    React.useEffect(() => {
        fetchHistory(); // Load some past videos to show it's working
        // ... (rest of restore logic)
    }, [guestId, user]); // Re-run if user logs in/out

    // RESTORE STATE ON MOUNT + Fetch History
    React.useEffect(() => {
        fetchHistory(); // Load some past videos to show it's working
        const savedGen = localStorage.getItem('active_generation');
        if (savedGen) {
            try {
                const data = JSON.parse(savedGen);
                console.log("Restoring session:", data);
                setImageUrl(data.imageUrl || '');
                setTextPrompt(data.prompt || '');
                // setNegativePrompt(data.negativePrompt || '');
                setLoading(true);
                // Resume monitoring
                startMonitoring(data.id);
            } catch (e) {
                console.error("Failed to restore session", e);
                localStorage.removeItem('active_generation');
            }
        }
    }, [guestId]); // Re-run if guestId changes (unlikely but safe)

    const cleanupMonitoring = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }
    };

    const handleCancel = async () => {
        const savedGen = localStorage.getItem('active_generation');
        let genId = null;
        if (savedGen) {
            try {
                genId = JSON.parse(savedGen).id;
            } catch (e) {
                console.error("Failed to parse saved generation for cancel", e);
            }
        }

        // 1. Abort Upload/Request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        // 2. Call N8n Cancel Webhook (Async)
        if (genId) {
            console.log("🛑 Sending cancel request for:", genId);
            axios.post('/api/cancel-generation', { generation_id: genId })
                .catch(err => console.warn("Cancel webhook error (non-critical):", err));
        }

        // 3. Stop Listeners
        cleanupMonitoring();

        // 4. Clear Storage
        localStorage.removeItem('active_generation');

        // 5. Reset UI
        setLoading(false);
        setError('Generation cancelled by user.');
    };

    const handleDownload = async () => {
        if (!videoUrl) return;
        try {
            const isVideo = videoUrl.toLowerCase().endsWith('.mp4');
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `infinity_${isVideo ? 'video' : 'photo'}_${Date.now()}.${isVideo ? 'mp4' : 'png'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed", err);
            // Fallback if CORS or network blocks blob fetch
            window.open(videoUrl, '_blank');
        }
    };

    const handleUseAsReference = () => {
        if (videoUrl && !videoUrl.toLowerCase().endsWith('.mp4')) {
            setImageUrl(videoUrl);
            setFileName('Reference Image');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Reusable Monitor Function
    const startMonitoring = (generationId: string) => {
        // Cleanup existing (just in case)
        cleanupMonitoring();

        // 1. Polling Function (Recursive for Stability)
        const checkStatus = async () => {
            // Safety: If not loading anymore, stop polling
            const savedGen = localStorage.getItem('active_generation');
            if (!savedGen) return true;

            const { data, error } = await supabase
                .from('generations')
                .select('status, video_url')
                .eq('id', generationId)
                .single();

            // Handle Deleted/Missing Record
            if (error || !data) {
                if (!data || (error as any)?.code === 'PGRST116') {
                    console.warn("Generation record missing, clearing local state.");
                    setLoading(false);
                    cleanupMonitoring();
                    localStorage.removeItem('active_generation');
                }
                return true;
            }

            // Track status for logging
            if (data?.status && data.status !== currentStatus) {
                setCurrentStatus(data.status);
            }

            // SUCCESS CASE
            const isFinished = (data?.status === 'completed' || data?.status === 'Success' || data?.status === 'success');
            const finalUrl = (data as any)?.result_url || data?.video_url;

            if (isFinished && finalUrl) {
                console.log('✅ [POLLING] Masterpiece ready:', finalUrl);
                setVideoUrl(finalUrl);
                setLoading(false);
                cleanupMonitoring();
                localStorage.removeItem('active_generation');
                fetchHistory();
                return true;
            }

            // FAILED CASE
            if (data?.status === 'failed' || data?.status === 'error') {
                setError('Generation failed on server.');
                setLoading(false);
                cleanupMonitoring();
                localStorage.removeItem('active_generation');
                return true;
            }

            // Continue polling after 5s if still loading
            const timeoutId = setTimeout(checkStatus, 5000);
            intervalRef.current = timeoutId;
            return false;
        };

        // 2. Realtime Subscription
        const channel = supabase
            .channel(`generation_${generationId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'generations', filter: `id=eq.${generationId}` },
                (payload) => {
                    const newRecord = payload.new as any;
                    console.log('🔔 [REALTIME] Получено обновление из Supabase:', newRecord);

                    if (newRecord.status && newRecord.status !== currentStatus) {
                        setCurrentStatus(newRecord.status);
                    }

                    if (newRecord.status === 'completed' && newRecord.video_url) {
                        console.log('✅ [REALTIME] Видео готово! URL:', newRecord.video_url);
                        setVideoUrl(newRecord.video_url);
                        setLoading(false);
                        cleanupMonitoring();
                        localStorage.removeItem('active_generation');
                        // Refresh history to show the new video immediately
                        fetchHistory();
                    } else if (newRecord.status === 'failed') {
                        setError('Generation failed on server.');
                        setLoading(false);
                        cleanupMonitoring();
                        localStorage.removeItem('active_generation');
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;

        // 3. Start Initial Polling Delay
        const id = setTimeout(checkStatus, 5000);
        intervalRef.current = id;

        // 4. Safety Timeout (10m)
        setTimeout(() => {
            cleanupMonitoring();
            // Don't auto-cancel UI, just stop checking to save battery.
            // User can still manual refresh if really long.
        }, 600000);
    };

    const handleGenerate = async () => {
        if (!imageUrl || !textPrompt) {
            setError('Please provide both an image URL and a text prompt.');
            return;
        }

        setLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            // 1. Create a "Pending" record in Supabase
            const { data: generation, error: dbError } = await supabase
                .from('generations')
                .insert({
                    user_id: user?.id, // Link to authenticated user (if logged in)
                    type: 'video',
                    status: 'pending',
                    prompt: textPrompt,
                    // negative_prompt: negativePrompt, <--- DB doesn't have this column yet
                    image_url: imageUrl,
                    // Store guest_id for isolation
                    metadata: { safe_mode: safeMode ?? true, guest_id: guestId }
                })
                .select()
                .single();

            if (dbError) throw new Error(`Database Error: ${dbError.message}`);
            if (!generation) throw new Error('Failed to init generation');

            console.log("Generation started, ID:", generation.id);

            // SAVE STATE (Persistence)
            localStorage.setItem('active_generation', JSON.stringify({
                id: generation.id,
                imageUrl,
                prompt: textPrompt,
                startTime: Date.now()
            }));

            // 2. Call Webhook (Fire and Forget - we don't wait for the video blob response)
            // We pass the 'generation_id' so N8n knows where to save the result.
            axios.post(WEBHOOK_URL, {
                generation_id: generation.id, // <--- CRITICAL for Async
                imageUrl,
                filename: fileName,
                textPrompt,
                safeMode,
                // Removed all technical params (resolution, steps, etc) per strict user instruction
                // as N8n/Comfy handles the sampling logic internally.
            }).catch(err => {
                // If N8n times out (Cloudflare error), that's actually FINE in async mode,
                // provided N8n started processing. Only network errors are real errors.
                console.warn("Webhook triggered (async path)", err);
            });

            // 3. Start Monitoring
            startMonitoring(generation.id);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to start generation.');
            setLoading(false);
        }
    };

    return (
        <div className="w-full relative">


            {/* Hero Section - Build: 2026-01-19 23:05 UTC+7 */}
            <div className="text-center mb-6 relative z-10 animate-fade-in">
                <div className="inline-flex items-center gap-4 mb-4">
                    <div className="h-[1px] w-12 bg-[#d2ac47]"></div>
                    <span className="text-[#d2ac47] text-[10px] font-bold tracking-[0.4em] uppercase">Generation 2.4 Active</span>
                    <div className="h-[1px] w-12 bg-[#d2ac47]"></div>
                </div>
                <h1 className="text-4xl md:text-6xl font-serif text-[#F9F1D8] mb-4 leading-tight drop-shadow-[0_0_25px_rgba(210,172,71,0.2)]">
                    Infinity Video<span className="text-[#d2ac47]">...</span>
                </h1>
                <p className="text-[#F9F1D8]/60 max-w-2xl mx-auto font-sans text-xs tracking-[0.1em] leading-relaxed uppercase">
                    Forging digital desire. The pinnacle of <i className="text-gold-luxury italic lowercase text-lg">AI Aesthetics</i>.
                </p>
            </div>

            {/* Switched to Flexbox for Mobile Stability, Grid for Desktop */}
            <div className="flex flex-col xl:grid xl:grid-cols-12 gap-8 items-stretch min-h-[450px]">

                {/* Left Banner - Breathing/Beckoning Effect (Widened) */}
                <div className="hidden xl:block xl:col-span-4">
                    <div className="h-full w-full relative overflow-hidden group border border-[#d2ac47]/20 rounded-3xl shadow-2xl transition-all hover:border-[#d2ac47]/40">
                        <div className="absolute inset-0 bg-[#080808]/20 z-10 mix-blend-overlay"></div>
                        {/* Art Deco Corners - Softened */}
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#d2ac47]/50 rounded-tl-xl z-30"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#d2ac47]/50 rounded-tr-xl z-30"></div>

                        <img
                            src="/luxury-left-2.png"
                            alt="Beckoning Avatar"
                            className="w-full h-full object-cover animate-pulse-slow transform hover:scale-105 transition-transform duration-[3000ms]"
                            style={{ animation: 'breathe 4s infinite ease-in-out alternate' }}
                        />
                        <div className="absolute bottom-6 left-0 w-full text-center z-20">
                            <p className="text-auth font-serif text-2xl italic text-[#fbeea4] animate-fade-in-up drop-shadow-lg">Captured Moment...</p>
                        </div>
                    </div>
                </div>

                {/* Center: Generator Interface (Narrowed & Moved Up) */}
                <div className="w-full xl:w-auto xl:col-span-5 flex flex-col">
                    <div className="bg-velvet-depth border border-[#d2ac47]/20 rounded-3xl p-5 relative overflow-hidden flex-1 flex flex-col justify-start shadow-2xl transition-all hover:border-[#d2ac47]/40">

                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#d2ac47]/50 to-transparent"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#d2ac47]/50 to-transparent"></div>

                        <div className="space-y-4 relative z-10">
                            {/* Inputs Grid - Split into 2 */}
                            {/* Inputs Container - Flex Col on Mobile, Grid on MD */}
                            <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                                {/* Image Input Frame */}
                                <div className="group relative border border-[#d2ac47]/30 bg-[#0a0a0a] hover:border-[#d2ac47] transition-all duration-500 overflow-hidden flex flex-col rounded-2xl h-64">
                                    <div className="absolute top-0 left-0 bg-[#d2ac47] text-black text-[9px] font-bold px-4 py-1.5 uppercase tracking-[0.2em] z-20 rounded-tl-2xl rounded-br-xl pointer-events-none">
                                        Source Image
                                    </div>

                                    {/* Main Upload Zone */}
                                    <div className="flex-1 p-0 relative h-full flex flex-col">
                                        <div className="w-full h-full">
                                            <ImageUploadZone
                                                onImageUpload={({ url, fileName }) => {
                                                    setImageUrl(url);
                                                    setFileName(fileName);
                                                }}
                                                currentUrl={imageUrl}
                                                placeholder="Click or Drag Image"
                                                className="h-full w-full border-none bg-transparent"
                                            />
                                            {imageUrl && (
                                                <div className="absolute top-2 right-2 z-30">
                                                    <button onClick={(e) => { e.stopPropagation(); setImageUrl(''); setFileName(''); }} className="bg-black/50 p-1 rounded-full text-white hover:text-red-500 transition-colors">
                                                        <XCircle size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>

                                {/* Prompt Input Frame */}
                                <div className="group relative border border-[#d2ac47]/30 bg-[#0a0a0a] hover:border-[#d2ac47] transition-all duration-500 flex flex-col rounded-2xl h-64">

                                    {/* Vision Prompt (Full Height) */}
                                    <div className="relative flex-1 flex flex-col border-b border-[#d2ac47]/10">
                                        <div className="absolute top-0 left-0 bg-[#d2ac47] text-black text-[9px] font-bold px-4 py-1.5 uppercase tracking-[0.2em] z-20 rounded-tl-2xl rounded-br-xl">
                                            Vision Prompt
                                        </div>
                                        <textarea
                                            value={textPrompt}
                                            onChange={(e) => setTextPrompt(e.target.value)}
                                            placeholder="Describe the motion, atmosphere, and desire..."
                                            className="w-full h-full bg-transparent p-3 md:p-6 pt-10 text-[#F9F1D8] placeholder-[#d2ac47]/50 font-sans font-light text-base md:text-sm resize-none focus:outline-none"
                                        />
                                    </div>

                                    {/* Negative Prompt (Disabled/Hidden per N8n limitations) */}
                                    {/*
                                    <div className="relative h-1/3 bg-red-950/5 flex flex-col group/neg">
                                        <div className="absolute top-0 left-0 bg-red-900/40 text-red-100 text-[8px] font-bold px-3 py-1 uppercase tracking-[0.15em] z-20 rounded-br-lg group-hover/neg:bg-red-600 transition-colors">
                                            Exclude (Negative)
                                        </div>
                                        <textarea
                                            value={negativePrompt}
                                            onChange={(e) => setNegativePrompt(e.target.value)}
                                            placeholder="no distortion, blurry, low quality..."
                                            className="w-full h-full bg-transparent p-3 pt-8 text-[#F9F1D8]/70 placeholder-red-900/40 font-sans font-light text-[11px] resize-none focus:outline-none"
                                        />
                                    </div>
                                    */}

                                    <div className="absolute bottom-4 right-4 text-[#d2ac47]/30 pointer-events-none group-focus-within:text-[#d2ac47]/60 transition-colors">
                                        <Wand2 size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls - The Toggle + Buttons */}
                    <div className="border-t border-[#d2ac47]/10 pt-4 mt-4 flex flex-col gap-3">

                        {/* Mode Toggle - Full Width Mobile */}
                        <div
                            onClick={() => setSafeMode(!safeMode)}
                            className="cursor-pointer group flex items-center border border-[#d2ac47] w-full md:w-fit transition-all hover:scale-105 shadow-[0_0_15px_rgba(210,172,71,0.1)] bg-black rounded-xl overflow-hidden min-h-[48px]"
                        >
                            <div className={`flex-1 md:flex-none px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 ${safeMode ? 'bg-gold-gradient text-black shadow-[0_0_20px_rgba(210,172,71,0.5)]' : 'text-[#d2ac47]/40 bg-black hover:bg-[#d2ac47]/10 hover:text-[#d2ac47]'} `}>
                                <ShieldCheck size={16} strokeWidth={2.5} /> SAFE
                            </div>
                            <div className="w-[1px] h-full bg-[#d2ac47]/30"></div>
                            <div className={`flex-1 md:flex-none px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 ${!safeMode ? 'bg-gradient-to-r from-red-600 to-red-900 text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]' : 'text-[#d2ac47]/40 bg-black hover:bg-red-900/30 hover:text-red-500'} `}>
                                <Flame size={16} strokeWidth={2.5} /> SPICY
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row gap-3 w-full">
                            {loading && (
                                <button
                                    onClick={handleCancel}
                                    className="w-full md:w-auto min-h-[48px] px-6 py-3 border border-[#d2ac47] bg-[#1a1a1a] text-[#d2ac47] hover:bg-red-950/40 hover:text-red-400 hover:border-red-500 transition-all text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 group/cancel rounded-xl shadow-[0_0_10px_rgba(210,172,71,0.1)]"
                                >
                                    <XCircle size={16} className="group-hover/cancel:rotate-90 transition-transform duration-300" /> CANCEL
                                </button>
                            )}

                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className={`w-full md:flex-1 min-h-[48px] py-3 px-6 md:px-8 text-[10px] tracking-[0.3em] font-bold uppercase flex items-center justify-center gap-3 group rounded-xl transition-all duration-300 ${loading ? 'opacity-90 cursor-wait bg-[#d2ac47] text-black shadow-[0_0_10px_rgba(210,172,71,0.3)]' : 'bg-gold-gradient text-black shadow-[0_0_20px_rgba(210,172,71,0.4)] hover:shadow-[0_0_30px_rgba(210,172,71,0.6)] hover:scale-[1.02]'} `}
                            >
                                {loading ? (
                                    <><Loader2 className="animate-spin" size={14} /> Forging...</>
                                ) : (
                                    <>CREATE VIDEO <Play size={12} fill="currentColor" className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-950/30 border-l-2 border-red-500 text-center mt-4 rounded-xl">
                            <p className="text-red-300 font-serif italic text-sm">{error}</p>
                        </div>
                    )}


                    {/* 3. Output / Generation Result (VERTICAL - 9:16) */}
                    <div className="mt-4 bg-[#0a0a0a] border border-[#d2ac47]/20 rounded-3xl p-2 shadow-2xl relative group w-full aspect-[9/16] max-h-[550px] mx-auto flex flex-col overflow-hidden transition-all duration-500">
                        <div className="relative flex-1 bg-[#050505] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] to-[#050505] rounded-2xl">
                            {/* Art Deco Corners */}
                            <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-[#d2ac47] pointer-events-none z-10 rounded-tl-lg opacity-50"></div>
                            <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-[#d2ac47] pointer-events-none z-10 rounded-tr-lg opacity-50"></div>

                            {loading ? (
                                // Logger is now full-size overlay in the output box, ensuring visibility
                                <GenerationLogger status={currentStatus} error={error} />
                            ) : videoUrl ? (
                                <div className="relative w-full h-full flex items-center justify-center group">
                                    {/* Use object-contain to preserve natural aspect ratio dynamically */}
                                    {/* Use object-contain to preserve natural aspect ratio dynamically */}
                                    {/* Use object-contain to preserve natural aspect ratio dynamically */}
                                    {videoUrl?.toLowerCase().endsWith('.mp4') ? (
                                        <video
                                            ref={videoRef}
                                            id="main-generated-video"
                                            src={videoUrl}
                                            autoPlay
                                            loop
                                            className="w-full h-full object-contain rounded-lg shadow-2xl"
                                            onTimeUpdate={handleTimeUpdate}
                                            onLoadedMetadata={handleLoadedMetadata}
                                        />
                                    ) : (
                                        <img
                                            src={videoUrl!}
                                            alt="Generated Fragment"
                                            className="w-full h-full object-contain rounded-lg shadow-2xl animate-fade-in"
                                        />
                                    )}

                                    {/* Premium Control Overlay Bar - Moved lower to save space */}
                                    {videoUrl?.toLowerCase().endsWith('.mp4') && (
                                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] h-10 bg-black/40 backdrop-blur-2xl border border-[#d2ac47]/10 rounded-2xl flex items-center px-4 gap-3 shadow-2xl transition-all pointer-events-auto opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0">
                                            <button
                                                className="w-8 h-8 shrink-0 rounded-full bg-[#d2ac47]/10 flex items-center justify-center hover:bg-[#d2ac47] group/play transition-all duration-300"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (videoRef.current) {
                                                        if (videoRef.current.paused) videoRef.current.play();
                                                        else videoRef.current.pause();
                                                    }
                                                }}
                                            >
                                                {videoRef.current?.paused ? (
                                                    <Play size={12} className="text-[#d2ac47] fill-[#d2ac47] group-hover/play:text-black group-hover/play:fill-black shadow-[0_0_10px_rgba(210,172,71,0.5)]" />
                                                ) : (
                                                    <div className="w-2.5 h-2.5 bg-[#d2ac47] group-hover/play:bg-black rounded-sm shadow-[0_0_10px_rgba(210,172,71,0.5)]" />
                                                )}
                                            </button>

                                            {/* Scrubber - Unified Golden Glow */}
                                            <div className="flex-1 h-full flex items-center justify-center cursor-pointer group/scrub" onClick={handleSeek}>
                                                <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-visible">
                                                    <div
                                                        className="absolute inset-y-0 left-0 bg-gold-gradient rounded-full shadow-[0_0_15px_rgba(210,172,71,0.6)] transition-all duration-100 ease-linear"
                                                        style={{ width: `${videoProgress}%` }}
                                                    ></div>
                                                    <div
                                                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/scrub:opacity-100 transition-opacity shadow-[0_0_10px_white]"
                                                        style={{ left: `${videoProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-[10px] text-[#d2ac47]/60 font-mono uppercase tracking-widest shrink-0">
                                                <span>4K</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#d2ac47]/10"></div>
                                                <button onClick={toggleFullscreen} className="hover:text-white transition-colors">
                                                    <Maximize2 size={12} className="opacity-50 hover:opacity-100" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Top Overlay: Download & Meta (Styled like Safe/Spicy) */}
                                    <div className="absolute top-4 right-4 flex flex-col items-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-30">
                                        {/* Use as Reference Button - Only for Images */}
                                        {videoUrl && !videoUrl.toLowerCase().endsWith('.mp4') && (
                                            <button
                                                onClick={handleUseAsReference}
                                                className="px-6 py-2 border border-[#d2ac47]/50 bg-black/60 backdrop-blur-xl text-[#d2ac47] hover:bg-[#d2ac47] hover:text-black transition-all text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 rounded-xl shadow-[0_0_20px_rgba(210,172,71,0.3)] hover:shadow-[0_0_30px_rgba(210,172,71,0.6)] z-50 overflow-hidden group/ref pointer-events-auto"
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    <Layers size={14} className="group-hover/ref:scale-120 transition-transform" />
                                                    Use as Reference
                                                </span>
                                                <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover/ref:opacity-20 transition-opacity"></div>
                                            </button>
                                        )}

                                        {/* Download Button - Improved Premium Style: Golden Glow */}
                                        <button
                                            onClick={handleDownload}
                                            className="px-6 py-2 border border-[#d2ac47]/50 bg-black/50 backdrop-blur-xl text-[#d2ac47] hover:bg-[#d2ac47] hover:text-black transition-all text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 rounded-xl shadow-[0_0_20px_rgba(210,172,71,0.2)] hover:shadow-[0_0_30px_rgba(210,172,71,0.5)] z-50 overflow-hidden group/dl pointer-events-auto"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                <Download size={14} className="group-hover/dl:animate-bounce" />
                                                Download
                                            </span>
                                            <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover/dl:opacity-20 transition-opacity"></div>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[#d2ac47] flex flex-col items-center gap-4 opacity-50 group-hover:opacity-80 transition-opacity transform group-hover:scale-105 duration-500">
                                    <VideoIcon size={64} strokeWidth={1} />
                                    <span className="text-[10px] tracking-[0.4em] uppercase font-bold">Active Workspace</span>
                                </div>
                            )}
                        </div>

                        {/* Metadata Footer (Compact Design) */}
                        {activeItem && (
                            <div className="relative px-4 pb-2 pt-2 text-center shrink-0 border-t border-[#d2ac47]/10 bg-[#080808]/50">
                                <p className="text-[#F9F1D8] text-[13px] font-serif italic mb-1 truncate">
                                    {activeItem.prompt ? (activeItem.prompt.substring(0, 50) + (activeItem.prompt.length > 50 ? '...' : '')) : (activeItem.label || 'Untitled Masterpiece')}
                                </p>
                                <div className="flex items-center justify-center gap-3 text-[8px] uppercase tracking-[0.2em] text-[#d2ac47]/50 font-bold">
                                    <span>{activeItem.created_at ? new Date(activeItem.created_at).toLocaleString() : 'Just now'}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#d2ac47]/20"></div>
                                    <div className="flex items-center gap-1">
                                        <ShieldCheck size={10} className="text-green-500/50" />
                                        <span>Verified Render</span>
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#d2ac47]/20"></div>
                                    <button className="hover:text-[#d2ac47] transition-colors">Infinity Studio</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Infinity Actions Panel */}
                    <div className="mt-6 border border-[#d2ac47]/30 bg-[#050505] p-6 relative overflow-hidden group rounded-3xl">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d2ac47]/50 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d2ac47]/50 to-transparent"></div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-[1px] flex-1 bg-[#d2ac47]/20"></div>
                            <span className="text-[#d2ac47] text-[10px] font-bold uppercase tracking-[0.4em]">Infinity Studio</span>
                            <div className="h-[1px] flex-1 bg-[#d2ac47]/20"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Extend Button */}
                            <button className="flex flex-col items-center justify-center p-4 border border-[#d2ac47]/20 hover:border-[#d2ac47] bg-[#0a0a0a] transition-all group/btn hover:-translate-y-1 rounded-2xl">
                                <div className="mb-2 p-2 rounded-full border border-[#d2ac47]/30 text-[#d2ac47] group-hover/btn:bg-[#d2ac47] group-hover/btn:text-black transition-colors">
                                    <Layers size={18} />
                                </div>
                                <span className="text-[#F9F1D8] text-[9px] font-bold uppercase tracking-widest mb-1">Extend Video</span>
                                <span className="text-[#d2ac47]/50 text-[8px] uppercase tracking-wider">+5 Seconds</span>
                            </button>

                            {/* Upscale Button */}
                            <button className="flex flex-col items-center justify-center p-4 border border-[#d2ac47]/20 hover:border-[#d2ac47] bg-[#0a0a0a] transition-all group/btn hover:-translate-y-1 rounded-2xl">
                                <div className="mb-2 p-2 rounded-full border border-[#d2ac47]/30 text-[#d2ac47] group-hover/btn:bg-[#d2ac47] group-hover/btn:text-black transition-colors">
                                    <Wand2 size={18} />
                                </div>
                                <span className="text-[#F9F1D8] text-[9px] font-bold uppercase tracking-widest mb-1">Upscale</span>
                                <span className="text-[#d2ac47]/50 text-[8px] uppercase tracking-wider">4K Enhance & Save</span>
                            </button>

                            {/* Download Button */}
                            <button className="flex flex-col items-center justify-center p-4 border border-[#d2ac47]/20 hover:border-[#d2ac47] bg-[#0a0a0a] transition-all group/btn hover:-translate-y-1 rounded-2xl">
                                <div className="mb-2 p-2 rounded-full border border-[#d2ac47]/30 text-[#d2ac47] group-hover/btn:bg-[#d2ac47] group-hover/btn:text-black transition-colors">
                                    <Download size={18} />
                                </div>
                                <span className="text-[#F9F1D8] text-[9px] font-bold uppercase tracking-widest mb-1">Save to Drive</span>
                                <span className="text-[#d2ac47]/50 text-[8px] uppercase tracking-wider">Original Quality</span>
                            </button>
                        </div>
                    </div>
                </div>


                {/* Right Col: Output & Stats & Coins */}
                <div className="w-full xl:w-auto xl:col-span-3 flex flex-col gap-4">

                    {/* 1. Coins / Credits Widget */}
                    <div className="bg-[#050505] border border-[#d2ac47]/20 rounded-3xl p-4 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#d2ac47]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-[#d2ac47]/60 text-[9px] uppercase tracking-[0.3em] mb-1">Balance</span>
                        <div className="flex items-center gap-2 text-[#F9F1D8] drop-shadow-[0_0_10px_rgba(210,172,71,0.5)]">
                            {/* Gold Coin Icon */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd700] via-[#fbeea4] to-[#b8860b] border border-[#fbeea4] shadow-[0_0_15px_rgba(255,215,0,0.6)] flex items-center justify-center mr-2" style={{ animation: 'spinY 5s linear infinite' }}>
                                <div className="w-5 h-5 rounded-full border border-[#b8860b]/50"></div>
                            </div>
                            <span className="text-4xl font-serif font-bold">2,450</span>
                            <div className="flex flex-col leading-none">
                                <span className="text-xs text-[#d2ac47] font-bold uppercase tracking-wider">Credits</span>
                                <span className="text-[9px] text-[#d2ac47]/60 uppercase tracking-widest">Available</span>
                            </div>
                        </div>
                        <button className="mt-2 px-3 py-1 border border-[#d2ac47]/30 text-[#d2ac47] text-[7px] uppercase tracking-[0.2em] hover:bg-[#d2ac47] hover:text-black transition-all rounded-full">
                            Add Funds
                        </button>
                    </div>

                    {/* 2. Gamification Stats (Moved here) */}
                    <GamificationDashboard />

                    {/* 3. History / Gallery (Dump) - Moved to Bottom Right */}
                    <div className="flex-1 bg-[#0a0a0a] border border-[#d2ac47]/20 rounded-3xl p-2 shadow-2xl relative flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between h-10 px-0">
                            <span className="text-[#d2ac47] text-[10px] font-bold uppercase tracking-[0.2em] pl-4">History</span>
                        </div>
                        <UserGallery
                            newItems={galleryItems}
                            onDelete={async (id) => {
                                const { error } = await supabase.from('generations').delete().eq('id', id);
                                if (!error) {
                                    fetchHistory();
                                    // If currently playing the deleted video, clear the main screen
                                    const deletedItem = galleryItems.find(i => i.id === id);
                                    if (deletedItem && videoUrl === (deletedItem.result_url || deletedItem.video_url || deletedItem.url)) {
                                        setVideoUrl(null);
                                        setActiveItem(null);
                                        setImageUrl('');
                                    }
                                }
                            }}
                            onSelect={(item) => {
                                setVideoUrl(item.result_url || item.video_url || item.url || null);
                                setActiveItem(item);
                            }}
                            onRefresh={() => fetchHistory()}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Creations Gallery (New Section) */}
            {
                galleryItems.length > 0 && (
                    <div className="mt-4 animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#d2ac47]/30"></div>
                            <h2 className="text-2xl font-serif text-[#F9F1D8] italic">Recent Masterpieces</h2>
                            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#d2ac47]/30"></div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {galleryItems.map((item) => (
                                <RecentMasterpieceItem
                                    key={item.id}
                                    item={item}
                                    onViewFull={(item) => {
                                        setVideoUrl(item.result_url || item.video_url || item.url);
                                        setActiveItem(item);
                                        // window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: Scroll to top
                                    }}
                                    onDelete={async (id, url) => {
                                        const { error } = await supabase.from('generations').delete().eq('id', id);
                                        if (!error) {
                                            fetchHistory(); // Refresh list reliably
                                            if (videoUrl === url) {
                                                setVideoUrl(null);
                                                setActiveItem(null);
                                                setImageUrl('');
                                            }
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default VideoGenerator;
