import React, { useState, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import axios from 'axios';
import { Wand2, Download, Sparkles, XCircle, ShieldCheck, Flame, Loader2, Play, Film, Image as ImageIcon, Archive, Layers, Video as VideoIcon, Maximize2, Trash2, Upload, RefreshCw, Eye, Mic } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserGallery from './UserGallery';
import ImageUploadZone from './ImageUploadZone';
import { supabase } from '../lib/supabaseClient';

// Simulated Progress Logger for UX
const GenerationLogger = ({ status, error, startTime }: { status: string; error: string | null; startTime?: number }) => {
    const { t } = useTranslation();
    const [initialPlayout, setInitialPlayout] = React.useState(false);
    const [logs, setLogs] = React.useState<string[]>([t('log_receiving')]);

    // Calculate elapsed time for animation sync
    const elapsed = startTime ? Date.now() - startTime : 0;
    const animationDelay = -elapsed;

    // Fast-forward logs based on elapsed time
    React.useLayoutEffect(() => {
        if (startTime && !initialPlayout) {
            const now = Date.now();
            const elapsedMs = now - startTime;

            const steps = [
                { msg: t('log_receiving'), delay: 800 },

                { msg: t('log_analysis'), delay: 5000 },
                { msg: t('log_director'), delay: 15000 },
                { msg: t('log_lighting'), delay: 30000 },
                { msg: t('log_engine'), delay: 60000 },
                { msg: t('log_core'), delay: 90000 },
                { msg: t('log_animation'), delay: 150000 },
                { msg: t('log_rendering'), delay: 240000 },
                { msg: t('log_assembly'), delay: 300000 },
                { msg: t('log_delivery'), delay: 340000 }
            ];

            const pastSteps = steps.filter(s => s.delay < elapsedMs).map(s => s.msg);
            if (pastSteps.length > 0) {
                setLogs(prev => [...prev.slice(0, 1), ...pastSteps].slice(-5)); // Keep last 5
            }
            setInitialPlayout(true);
        }
    }, [startTime]);

    React.useEffect(() => {
        if (status === 'queued') {
            setLogs([t('log_queue_msg')]);
            return;
        }

        if (status === 'processing' || status === 'pending') {
            const steps = [
                { msg: t('log_receiving'), delay: 800 },
                { msg: t('log_analysis'), delay: 5000 },
                { msg: t('log_director'), delay: 15000 },
                { msg: t('log_lighting'), delay: 30000 },
                { msg: t('log_engine'), delay: 60000 },
                { msg: t('log_core'), delay: 90000 },
                { msg: t('log_animation'), delay: 150000 },
                { msg: t('log_rendering'), delay: 240000 },
                { msg: t('log_assembly'), delay: 300000 },
                { msg: t('log_delivery'), delay: 340000 }
            ];

            let timeouts: any[] = [];
            const startOrigin = startTime || Date.now();

            steps.forEach(({ msg, delay }) => {
                // Only schedule future steps
                const timeAlreadyPassed = Date.now() - startOrigin;
                const remainingDelay = delay - timeAlreadyPassed;

                if (remainingDelay > 0) {
                    const timeout = setTimeout(() => {
                        setLogs(prev => [...prev.slice(-4), msg]);
                    }, remainingDelay);
                    timeouts.push(timeout);
                }
            });
            return () => timeouts.forEach(clearTimeout);
        }
    }, [status, startTime]);

    return (
        <div className="absolute inset-0 bg-[var(--bg-primary)]/95 backdrop-blur-sm flex flex-col items-start justify-start p-8 font-mono text-xs z-50">
            <div className="w-full space-y-4">
                {/* Progress Bar Top */}
                <div className="h-2 w-full bg-[#d2ac47]/10 rounded-full overflow-hidden relative">
                    <div
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ${status === 'queued' ? 'bg-amber-600 animate-pulse' : 'bg-[#d2ac47]'}`}
                        style={{
                            width: status === 'queued' ? '15%' : '0%',
                            // Using negative delay to fast-forward animation
                            animation: status !== 'queued' ? `growWidth 360s linear forwards` : 'none',
                            animationDelay: status !== 'queued' ? `${animationDelay}ms` : '0ms'
                        }}
                    ></div>
                </div>
                <div className="flex justify-between text-[9px] text-[var(--text-secondary)]/40 uppercase tracking-widest">
                    <span>{status === 'queued' ? `⚡ ${t('vid_queue_active')}` : `🚀 ${t('vid_gen_active')}`}</span>
                    <span>{status === 'queued' ? t('vid_est_wait') : t('vid_est_time')}</span>
                </div>

                <div className="space-y-3 mt-8">
                    {error ? (
                        <div className="text-red-500 animate-pulse flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            <span>{t('status_error')}: {error}</span>
                        </div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="text-[var(--text-secondary)] animate-fade-in-up flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${i === logs.length - 1 ? "bg-[#d2ac47] animate-ping" : "bg-[#d2ac47]/30"}`}></div>
                                <span className={i === logs.length - 1 ? "animate-pulse font-bold text-[var(--text-secondary)]" : "opacity-50 text-[var(--text-secondary)]/70"}>{log}</span>
                            </div>
                        ))
                    )}

                    {/* Diagnostic message for long waits */}
                    <div className="mt-8 pt-4 border-t border-[#d2ac47]/10 text-[10px] text-[var(--text-secondary)]/30 italic h-10">
                        {status === 'queued' && t('log_queue_msg')}
                        {status === 'processing' && t('log_gpu_msg')}
                        {elapsed > 360000 && !error && status !== 'completed' && t('log_long_wait')}
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
// Webhook URL (Direct n8n endpoint for Video Generation)
const WEBHOOK_URL = "https://n8n.develotex.io/webhook/wan_context_safeMode_3_SB";

/*
const CustomSelect = ({ options, value, onChange, label, disabled = false, centerLabel = false }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative group" ref={dropdownRef}>
            {label && <label className={`text-[var(--text-secondary)] text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5 block ${centerLabel ? 'text-center' : ''} truncate`}>{label}</label>}
            <div
                className={`w-full bg-[var(--bg-input)] border ${isOpen ? 'border-[#d2ac47]' : 'border-[var(--border-color)]'} text-[var(--text-primary)] p-2 md:p-2.5 rounded-lg flex justify-between items-center transition-all ${disabled ? 'opacity-50 cursor-not-allowed border-[#d2ac47]/10' : 'cursor-pointer hover:border-[#d2ac47]/60'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className="truncate text-[10px] md:text-xs font-bold tracking-widest uppercase">{options.find((o: any) => o.value == value)?.label || value}</span>
                <span className="text-[var(--text-secondary)] text-[8px] transition-transform duration-300 transform shrink-0 ml-2" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 min-w-full w-auto whitespace-nowrap bg-[var(--bg-primary)] border border-[#d2ac47] z-[99999] shadow-[0_10px_40px_rgba(0,0,0,0.9)] animate-fade-in-down mt-2 rounded-xl overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar">
                    {options.map((opt: any) => (
                        <div
                            key={opt.value}
                            className={`px-3 py-2 text-[10px] md:text-xs cursor-pointer transition-all border-b border-[#d2ac47]/10 last:border-0 uppercase tracking-wider ${opt.value == value ? 'bg-[#d2ac47] text-black font-bold shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]' : 'text-[var(--text-primary)] hover:bg-[#d2ac47]/10 hover:text-[var(--text-secondary)] hover:pl-4'}`}
                            onClick={() => {
                                onChange(opt.value.toString());
                                setIsOpen(false);
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
*/

const VideoGenerator: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth(); // <--- Get logged in user
    const [imageUrl, setImageUrl] = useState('');
    const [_fileName, setFileName] = useState('');
    const [textPrompt, setTextPrompt] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video'>('image');

    // Fine Tuning State
    const [seed] = useState<number>(-1);
    const [steps] = useState<number>(30);
    const [cfg] = useState<number>(3.0);
    // const [rawPromptMode] = useState(false);
    const [selectedVoice] = useState<string>('Ana de Armas - demo.MP3');

    // Video Player State
    const [videoProgress, setVideoProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);


    const handleTimeUpdate = () => {
        if (videoRef.current && Number.isFinite(videoRef.current.duration)) {
            setVideoProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        // Metadata loaded, video ready
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
    const [startTime, setStartTime] = useState<number | undefined>(undefined);
    const [longWait, setLongWait] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Check for long wait times to prompt user
    React.useEffect(() => {
        let timer: any;
        if (loading && startTime) {
            // Check every 30s if we've crossed the threshold
            timer = setInterval(() => {
                if (Date.now() - startTime > 180000) { // 3 minutes threshold for "feeling long"
                    setLongWait(true);
                }
            }, 5000);
        } else {
            setLongWait(false);
        }
        return () => clearInterval(timer);
    }, [loading, startTime]);

    // Handle incoming images from Avatar Generator
    React.useEffect(() => {
        const checkPending = () => {
            const pending = localStorage.getItem('pendingVideoSource');
            if (pending) {
                // 1. Set as Active Source
                setImageUrl(pending);

                // 2. Add to Gallery (First Item)
                setGalleryItems(prev => {
                    // Avoid duplicates if possible
                    if (prev.some(p => p.url === pending || p.result_url === pending)) return prev;

                    return [{
                        id: `imported_${Date.now()}`,
                        type: 'image',
                        url: pending,
                        result_url: pending,
                        label: 'Imported Avatar',
                        status: 'completed',
                        created_at: new Date().toISOString() // Ensure it sorts to top
                    }, ...prev];
                });

                localStorage.removeItem('pendingVideoSource');
            }
        };

        checkPending(); // Check on mount

        const handleTabSwitch = (e: CustomEvent) => {
            if (e.detail === 'video') {
                setTimeout(checkPending, 100);
            }
        };
        window.addEventListener('switch-tab', handleTabSwitch as EventListener);
        return () => window.removeEventListener('switch-tab', handleTabSwitch as EventListener);
    }, []);
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
            .in('status', ['completed', 'processing', 'pending'])
            .order('created_at', { ascending: false })
            .limit(100);

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
        }
    };

    const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Delete this from library?')) return;

        if (id.startsWith('def_')) {
            // Handle local deletion for default assets
            const deletedDefaults = JSON.parse(localStorage.getItem('deleted_defaults') || '[]');
            if (!deletedDefaults.includes(id)) {
                deletedDefaults.push(id);
                localStorage.setItem('deleted_defaults', JSON.stringify(deletedDefaults));
            }
            setGalleryItems(prev => prev.filter(item => item.id !== id));
            return;
        }

        try {
            const { error } = await supabase.from('generations').delete().eq('id', id);
            if (error) throw error;
            fetchHistory(); // Refresh
            // Clear preview if it was the deleted item
            const deletedItem = galleryItems.find(i => i.id === id);
            const url = deletedItem?.result_url || deletedItem?.video_url || deletedItem?.url;
            if (url === videoUrl) {
                setVideoUrl(null);
                setImageUrl('');
                setActiveItem(null);
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

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
                if (data.startTime) setStartTime(data.startTime);
                setLoading(true);
                // Resume monitoring
                startMonitoring(data.id);
            } catch (e) {
                console.error("Failed to restore session", e);
                localStorage.removeItem('active_generation');
            }
        }
    }, [guestId, user]); // Re-run if user logs in/out

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

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        if (genId) {
            console.log("🛑 [CANCEL] Attempting to stop generation ID:", genId);
            axios.post('/api/cancel-generation', { generation_id: genId })
                .then(res => console.log("✅ [CANCEL] Webhook Response:", res.status))
                .catch(err => console.error("⚠️ [CANCEL] Webhook error:", err.message));
        }

        cleanupMonitoring();
        localStorage.removeItem('active_generation');
        setStartTime(undefined);
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

    const startMonitoring = (generationId: string) => {
        cleanupMonitoring();

        const checkStatus = async () => {
            const savedGen = localStorage.getItem('active_generation');
            if (!savedGen) return true;

            const { data, error } = await supabase
                .from('generations')
                .select('status, video_url')
                .eq('id', generationId)
                .single();

            if (error || !data) {
                if (!data || (error as any)?.code === 'PGRST116') {
                    console.warn("Generation record missing, clearing local state.");
                    setError("Monitoring stopped: Generation record not found.");
                    setLoading(false);
                    cleanupMonitoring();
                    localStorage.removeItem('active_generation');
                }
                return true;
            }

            if (data?.status && data.status !== currentStatus) {
                setCurrentStatus(data.status);
            }

            const isFinished = (data?.status === 'completed' || data?.status === 'Success' || data?.status === 'success');
            const finalUrl = (data as any)?.result_url || data?.video_url;

            if (isFinished) {
                if (finalUrl) {
                    console.log('✅ [POLLING] Masterpiece ready:', finalUrl);
                    setVideoUrl(finalUrl);
                    setLoading(false);
                    cleanupMonitoring();
                    localStorage.removeItem('active_generation');
                    setStartTime(undefined);
                    fetchHistory();
                    return true;
                } else {
                    console.warn("⚠️ [POLLING] Status is completed but URL is missing. Waiting explicitly...");
                    // We don't return true here, we keep polling hoping the URL appears
                }
            }

            if (data?.status === 'failed' || data?.status === 'error') {
                setError('Generation failed on server.');
                setLoading(false);
                cleanupMonitoring();
                localStorage.removeItem('active_generation');
                setStartTime(undefined);
                return true;
            }

            const timeoutId = setTimeout(checkStatus, 3000); // Check faster (3s)
            intervalRef.current = timeoutId;
            return false;
        };

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

                    const isFinished = (newRecord.status === 'completed' || newRecord.status === 'Success' || newRecord.status === 'success');
                    const finalUrl = newRecord.result_url || newRecord.video_url;

                    if (isFinished && finalUrl) {
                        console.log('✅ [REALTIME] Видео готово! URL:', finalUrl);
                        setVideoUrl(finalUrl);
                        setLoading(false);
                        cleanupMonitoring();
                        localStorage.removeItem('active_generation');
                        setStartTime(undefined);
                        fetchHistory();
                    } else if (newRecord.status === 'failed') {
                        setError('Generation failed on server.');
                        setLoading(false);
                        cleanupMonitoring();
                        localStorage.removeItem('active_generation');
                        setStartTime(undefined);
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;

        const id = setTimeout(checkStatus, 1000);
        intervalRef.current = id;

        setTimeout(() => {
            cleanupMonitoring();
            if (loading) setError('Timeout: Video took too long. Check "My Library" later.');
        }, 1200000); // 20 minutes timeout
    };

    const handleExtend = () => {
        if (!activeItem && !videoUrl) {
            setError('Please select a video from history to extend.');
            return;
        }

        // Prefer activeItem, fallback to finding item by videoUrl
        let targetItem = activeItem;
        if (!targetItem && videoUrl) {
            targetItem = galleryItems.find(i => (i.result_url || i.video_url || i.url) === videoUrl);
        }

        if (!targetItem) {
            setError('Could not identify the source video to extend.');
            return;
        }

        // Set up state for extension
        setImageUrl(targetItem.result_url || targetItem.video_url || targetItem.url);
        setTextPrompt(targetItem.prompt || '');
        setFileName(`Extending: ${targetItem.label || 'Video'}`);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Trigger generic generation but with extension context
        // We'll use a hack/prop to pass the ID, or updated handleGenerate

        // Actually, let's just trigger it directly or set a "pendingExtensionId" state?
        // Simpler: Call handleGenerate with an argument.
        handleGenerate(targetItem.id);
    };

    const handleGenerate = async (eventOrId?: React.MouseEvent<HTMLButtonElement> | string) => {
        console.log("🚀 [GEN] Starting Generation. Webhook:", WEBHOOK_URL);

        // Determine if this is an extension or a fresh generation
        const extendFromId = typeof eventOrId === 'string' ? eventOrId : undefined;

        if (!imageUrl || !textPrompt) {
            setError('Please provide both an image URL and a text prompt.');
            return;
        }

        setLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            const { data: generation, error: dbError } = await supabase
                .from('generations')
                .insert({
                    user_id: user?.id,
                    type: 'video',
                    status: 'pending',
                    prompt: textPrompt,
                    image_url: imageUrl,
                    metadata: {
                        safe_mode: safeMode ?? true,
                        guest_id: guestId,
                        extend_from: extendFromId || null // <--- PASS PARENT ID
                    }
                })
                .select()
                .single();

            if (dbError) {
                console.error("❌ [GEN] Supabase Insert Error:", dbError);
                throw new Error(`Database Error: ${dbError.message}`);
            }
            if (!generation) {
                console.error("❌ [GEN] No generation returned after Supabase insert.");
                throw new Error('Failed to init generation');
            }

            console.log("✅ [GEN] Generation started, ID:", generation.id, extendFromId ? `(Extending ${extendFromId})` : '');

            localStorage.setItem('active_generation', JSON.stringify({
                id: generation.id,
                imageUrl,
                prompt: textPrompt,
                startTime: Date.now()
            }));

            setStartTime(Date.now());

            const payload = {
                generation_id: generation.id,
                imageUrl: imageUrl.startsWith('/') ? window.location.origin + imageUrl : imageUrl,
                textPrompt,
                safeMode: safeMode, // Match workflow expected name
                seed: seed === -1 ? Math.floor(Math.random() * 2147483647) : seed,
                steps: steps,
                cfg: cfg,
                voice: selectedVoice,
                extend_from: extendFromId
            };

            console.log("🚀 [WEBHOOK] Sending request to:", WEBHOOK_URL);
            console.log("📦 [WEBHOOK] Payload:", JSON.stringify(payload, null, 2));

            try {
                const response = await axios.post(WEBHOOK_URL, payload, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 60000
                });
                console.log("✅ [WEBHOOK] Response Status:", response.status);
            } catch (postErr: any) {
                if (postErr.code === 'ECONNABORTED' || postErr.message?.includes('timeout')) {
                    console.log("⏳ POST timed out, but monitoring is active.");
                } else {
                    console.warn("⚠️ Webhook response error:", postErr);
                }
            }

            startMonitoring(generation.id);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to start generation.');
            setLoading(false);
        }
    };

    return (
        <div className="w-full relative">




            {/* Switched to Flexbox for Mobile Stability, Grid for Desktop */}
            <div className="flex flex-col xl:grid xl:grid-cols-12 gap-8 items-stretch min-h-[450px]">

                {/* Left Panel: Visual References (Mixed Gallery) - Mobile: Bottom (Order 3) */}
                <div className="order-3 xl:order-none xl:col-span-4 xl:h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2 min-h-[500px] lg:min-h-0">
                    <div className="flex items-center justify-between mb-6 sticky top-0 bg-[var(--bg-primary)]/95 backdrop-blur-md z-[60] py-4 border-b border-[var(--border-color)] shadow-sm -mx-2 px-2 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                <Sparkles size={16} />
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">{t('vid_vis_ref')}</span>
                            </div>

                            {/* Filter Tabs - Inline */}
                            <div className="flex items-center gap-2">
                                {['all', 'video', 'image'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter as any)}
                                        className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] border transition-all ${activeFilter === filter
                                            ? 'bg-[#d2ac47] text-black border-[#d2ac47]'
                                            : 'bg-transparent text-[var(--text-secondary)]/50 border-[var(--border-color)] hover:border-[#d2ac47]/50'
                                            }`}
                                    >
                                        {filter === 'all' ? t('vid_filter_all') : filter === 'image' ? t('vid_filter_photos') : t('vid_filter_videos')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <span className="text-[var(--text-secondary)]/40 text-[9px] font-mono">{galleryItems.filter(item => {
                            const url = item.result_url || item.video_url || item.url || '';
                            const isVideo = url.toLowerCase().endsWith('.mp4') || item.type === 'video';
                            if (activeFilter === 'image') return !isVideo;
                            if (activeFilter === 'video') return isVideo;
                            return true;
                        }).length} {t('vid_items')}</span>
                    </div>

                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 pb-20">
                        {(() => {
                            // Define Visual Reference Defaults (Photos 1-8, Videos 1-17) strictly for this Left Gallery
                            const VISUAL_REFERENCE_DEFAULTS = [
                                // Photos from photo_gallery_left
                                ...Array.from({ length: 8 }, (_, i) => ({
                                    id: `ref_p_${i + 1}`,
                                    type: 'image',
                                    url: `/photo_gallery_left/${i + 1}.png`,
                                    result_url: `/photo_gallery_left/${i + 1}.png`,
                                    label: `Reference ${i + 1}`,
                                    status: 'completed'
                                })),
                                // Videos from videos folder
                                ...Array.from({ length: 17 }, (_, i) => ({
                                    id: `ref_v_${i + 1}`,
                                    type: 'video',
                                    video_url: `/videos/${i + 1}.mp4`,
                                    result_url: `/videos/${i + 1}.mp4`,
                                    label: `Video ${i + 1}`,
                                    status: 'completed'
                                }))
                            ];

                            // Combine User History + Defaults
                            const allVisualItems = [...galleryItems, ...VISUAL_REFERENCE_DEFAULTS];

                            const filteredItems = allVisualItems.filter(item => {
                                const url = item.result_url || item.video_url || item.url || '';
                                const isVideo = url.toLowerCase().endsWith('.mp4') || item.type === 'video';
                                if (activeFilter === 'image') return !isVideo;
                                if (activeFilter === 'video') return isVideo;
                                return true;
                            });

                            const MIN_ITEMS = 9;
                            const itemsToRender = [...filteredItems];
                            const placeholdersNeeded = Math.max(0, MIN_ITEMS - filteredItems.length);

                            return (
                                <>
                                    {itemsToRender.map((item) => {
                                        const url = item.result_url || item.video_url || item.url || '';
                                        const isVideo = url.toLowerCase().endsWith('.mp4') || item.type === 'video';
                                        const isActive = (isVideo && videoUrl === url) || (!isVideo && imageUrl === url);

                                        return (
                                            <div
                                                key={item.id}
                                                className={`group/item relative bg-[var(--bg-primary)] border rounded-xl overflow-hidden aspect-[9/16] shrink-0 cursor-pointer transition-all 
                                                ${isActive ? 'border-[#d2ac47] shadow-[0_0_15px_rgba(210,172,71,0.3)]' : 'border-[var(--border-color)] hover:border-[#d2ac47] hover:shadow-[0_0_20px_rgba(210,172,71,0.2)]'}
                                            `}
                                                onClick={(e) => {
                                                    const v = e.currentTarget.querySelector('video');
                                                    if (v) {
                                                        if (v.paused) v.play().catch(() => { });
                                                        else v.pause();
                                                    }
                                                }}
                                                onMouseEnter={(e) => {
                                                    const v = e.currentTarget.querySelector('video');
                                                    if (v) v.play().catch(() => { });
                                                }}
                                                onMouseLeave={(e) => {
                                                    const v = e.currentTarget.querySelector('video');
                                                    if (v) {
                                                        v.pause();
                                                        v.currentTime = 0;
                                                    }
                                                }}
                                            >
                                                {/* Thumbnail content */}
                                                {isVideo ? (
                                                    <video
                                                        src={url}
                                                        className="w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
                                                        muted
                                                        playsInline
                                                        loop
                                                    />
                                                ) : (
                                                    <img
                                                        src={url}
                                                        alt={item.label || 'Reference'}
                                                        className="w-full h-full object-cover transition-all duration-700 group-hover/item:scale-110"
                                                    />
                                                )}

                                                {/* Type Badge - Top Right */}
                                                <div className="absolute top-2 right-2 z-20">
                                                    {isVideo ? (
                                                        <div className="w-6 h-6 bg-[#d2ac47]/15 backdrop-blur-md rounded-md flex items-center justify-center border border-[#d2ac47]/40 shadow-[0_0_10px_rgba(210,172,71,0.1)]">
                                                            <Film size={11} className="text-[var(--text-secondary)]" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-[var(--border-color)]">
                                                            <ImageIcon size={11} className="text-[var(--text-secondary)]/70" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Hover Overlay - Action Text */}
                                                <div className={`absolute inset-0 transition-opacity duration-300 flex flex-col justify-end p-2 px-3 pb-3 ${item.status === 'processing' || item.status === 'pending' ? 'opacity-100 bg-black/60' : 'opacity-100 md:opacity-0 md:group-hover/item:opacity-100'}`}>


                                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent pointer-none"></div>

                                                    {(item.status === 'processing' || item.status === 'pending') ? (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                                                            <Loader2 size={24} className="text-[var(--text-secondary)] animate-spin" />
                                                            <span className="text-[var(--text-secondary)] text-[9px] font-bold tracking-widest uppercase animate-pulse">Forging...</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    const response = await fetch(url);
                                                                    const blob = await response.blob();
                                                                    const blobUrl = window.URL.createObjectURL(blob);
                                                                    const link = document.createElement('a');
                                                                    link.href = blobUrl;
                                                                    link.download = `infinity_${isVideo ? 'video' : 'photo'}_${Date.now()}.${isVideo ? 'mp4' : 'png'}`;
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    document.body.removeChild(link);
                                                                    window.URL.revokeObjectURL(blobUrl);
                                                                } catch (err) {
                                                                    console.error("Download failed", err);
                                                                    window.open(url, '_blank');
                                                                }
                                                            }}
                                                            className="absolute bottom-14 right-12 p-2 bg-[#d2ac47]/10 backdrop-blur-xl text-[var(--text-secondary)] rounded-full hover:bg-[#d2ac47] hover:text-black transition-all border border-[var(--border-color)] shadow-lg pointer-events-auto z-40 cursor-pointer"
                                                            title="Download"
                                                        >
                                                            <Download size={12} />
                                                        </button>
                                                    )}

                                                    {!(item.status === 'processing' || item.status === 'pending') && (
                                                        <button
                                                            onClick={(e) => handleDeleteItem(e, item.id)}
                                                            className="absolute bottom-14 right-2 p-2 bg-red-950/40 backdrop-blur-xl text-red-400 rounded-full hover:bg-red-600 hover:text-white transition-all border border-red-500/10 shadow-lg pointer-events-auto z-40 cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}

                                                    {(item.status === 'processing' || item.status === 'pending') ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setLoading(true);
                                                                setVideoUrl(null);
                                                                setImageUrl(item.image_url || item.url);
                                                                setTextPrompt(item.prompt || '');

                                                                // Use actual creation time if available to resume timer accurately
                                                                let realStartTime = Date.now();
                                                                if (item.created_at) {
                                                                    const parsedTime = new Date(item.created_at).getTime();
                                                                    if (!isNaN(parsedTime)) {
                                                                        realStartTime = parsedTime;
                                                                    }
                                                                }
                                                                setStartTime(realStartTime);

                                                                const genState = {
                                                                    id: item.id,
                                                                    imageUrl: item.image_url || item.url,
                                                                    prompt: item.prompt || '',
                                                                    startTime: realStartTime
                                                                };
                                                                localStorage.setItem('active_generation', JSON.stringify(genState));
                                                                startMonitoring(item.id);
                                                            }}
                                                            className="relative w-full py-3 bg-[#d2ac47] text-black text-[9px] font-black uppercase tracking-[0.25em] text-center rounded-lg flex items-center justify-center gap-1 shadow-xl transform transition-all hover:scale-[1.02] active:scale-95 pointer-events-auto z-40 cursor-pointer animate-pulse"
                                                        >
                                                            <Eye size={14} className="mr-1" /> WATCH
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (isVideo) {
                                                                        setVideoUrl(url);
                                                                    } else {
                                                                        setVideoUrl(url); // Editor now targets Main Canvas (Video Url slot)
                                                                    }
                                                                    window.scrollTo({ top: 300, behavior: 'smooth' });
                                                                }}
                                                                className="relative px-3 py-1.5 bg-black/40 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-secondary)]/80 hover:text-black text-[8px] font-bold uppercase tracking-[0.2em] text-center rounded-lg flex items-center justify-center gap-1 shadow-lg transform translate-y-4 group-hover/item:translate-y-0 transition-all hover:bg-[#d2ac47] hover:scale-[1.02] active:scale-95 pointer-events-auto z-40 cursor-pointer"
                                                            >
                                                                {t('btn_use_source')}
                                                            </button>
                                                            {!isVideo && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setImageUrl(url); // Ref now targets Source Image (Top slot)
                                                                        window.scrollTo({ top: 300, behavior: 'smooth' });
                                                                    }}
                                                                    className="relative px-3 py-1.5 bg-black/40 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-secondary)]/80 hover:text-black text-[8px] font-bold uppercase tracking-[0.2em] text-center rounded-lg flex items-center justify-center gap-1 shadow-lg transform translate-y-4 group-hover/item:translate-y-0 transition-all hover:bg-[#d2ac47] hover:scale-[1.02] active:scale-95 pointer-events-auto z-40 cursor-pointer"
                                                                >
                                                                    {t('btn_use_ref')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Empty Placeholder Slots */}
                                    {Array.from({ length: placeholdersNeeded }).map((_, i) => (
                                        <div
                                            key={`placeholder-${i}`}
                                            className="relative bg-[var(--bg-input)] border border-dashed border-[#d2ac47]/15 rounded-xl aspect-[9/16] flex flex-col items-center justify-center gap-5 group/empty overflow-hidden transition-all duration-500 hover:border-[#d2ac47]/40 hover:bg-[var(--bg-primary)] dark:hover:bg-[#111]"
                                        >
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(210,172,71,0.1)_0%,transparent_70%)] opacity-30 group-hover/empty:opacity-80 transition-opacity duration-700"></div>

                                            {/* Glow effect behind icon */}
                                            <div className="absolute w-16 h-16 bg-[#d2ac47]/5 rounded-full blur-2xl group-hover/empty:bg-[#d2ac47]/15 transition-colors"></div>

                                            <div className="relative w-12 h-12 rounded-full border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)]/30 transition-all duration-500 group-hover/empty:border-[#d2ac47]/60 group-hover/empty:text-[var(--text-secondary)]/80 group-hover/empty:scale-110 shadow-[0_0_20px_rgba(210,172,71,0.05)] group-hover/empty:shadow-[0_0_30px_rgba(210,172,71,0.2)] bg-[var(--bg-input)]/40 dark:bg-black/40">
                                                <Upload size={22} strokeWidth={1.5} />
                                            </div>

                                            <div className="relative flex flex-col items-center gap-2">
                                                <div className="text-[10px] text-[var(--text-secondary)]/25 uppercase tracking-[0.4em] font-black group-hover/empty:text-[var(--text-secondary)]/70 transition-colors">
                                                    Upload Ref
                                                </div>
                                                <div className="w-6 h-[1px] bg-[#d2ac47]/10 group-hover/empty:w-12 group-hover/empty:bg-[#d2ac47]/30 transition-all duration-500"></div>
                                            </div>

                                            {/* Prominent Art Deco Corners */}
                                            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#d2ac47]/10 rounded-tl-sm transition-all duration-500 group-hover/empty:border-[#d2ac47]/40 group-hover/empty:scale-110"></div>
                                            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#d2ac47]/10 rounded-br-sm transition-all duration-500 group-hover/empty:border-[#d2ac47]/40 group-hover/empty:scale-110"></div>

                                            {/* File Input Overlay for 'Upload Ref' in empty slots */}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                                                title="Upload Reference Image"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    // Basic validation
                                                    if (!file.type.startsWith('image/')) {
                                                        alert('Please upload an image file');
                                                        return;
                                                    }

                                                    // Use the existing handleGenerate-like logic or direct upload
                                                    // We'll duplicate the upload logic from ImageUploadZone for quick access
                                                    try {
                                                        const fileExt = file.name.split('.').pop();
                                                        const uniqueName = `${Date.now()}_quick_${Math.random().toString(36).substring(2)}.${fileExt}`;

                                                        // Optimistic UI: Show loading state in this specific card? 
                                                        // Ideally we just global load or seamless insert. 
                                                        // For now, simpler: Upload -> Add to Gallery -> Set Active

                                                        const { error: uploadError } = await supabase.storage
                                                            .from('generations')
                                                            .upload(uniqueName, file);

                                                        if (uploadError) throw uploadError;

                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('generations')
                                                            .getPublicUrl(uniqueName);

                                                        // 1. Set as Active Source
                                                        setImageUrl(publicUrl);
                                                        setFileName(file.name);

                                                        // 2. Add to Local Gallery (Optimistic)
                                                        const newItem = {
                                                            id: `temp-${Date.now()}`,
                                                            url: publicUrl,
                                                            type: 'image',
                                                            status: 'uploaded',
                                                            label: 'Uploaded Ref',
                                                            created_at: new Date().toISOString()
                                                        };

                                                        setGalleryItems(prev => [newItem, ...prev]);

                                                    } catch (err) {
                                                        console.error("Quick upload failed", err);
                                                        setError("Failed to upload reference image.");
                                                    }
                                                }}
                                            />
                                        </div>
                                    ))}
                                </>
                            );
                        })()}
                    </div>

                    {galleryItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]/30 gap-4 border border-dashed border-[#d2ac47]/10 rounded-2xl">
                            <div className="p-4 bg-[#d2ac47]/5 rounded-full"><Archive size={24} /></div>
                            <p className="text-[10px] uppercase tracking-widest font-mono">Library Empty</p>
                        </div>
                    )}
                </div>

                {/* Center: Generator Interface (Narrowed & Moved Up) */}
                <div className="order-1 xl:order-none w-full xl:w-auto xl:col-span-5 flex flex-col">

                    {/* Moved Hero Section - Integrated into Workspace */}


                    <div id="video-workspace" className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-3xl p-4 md:p-5 relative z-50 flex-none flex flex-col justify-start shadow-2xl transition-all hover:border-[#d2ac47]/40 mx-2 md:mx-0">

                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#d2ac47]/50 to-transparent"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#d2ac47]/50 to-transparent"></div>

                        <div className="space-y-4 relative z-10">
                            {/* Inputs Grid - Split into 2 */}
                            {/* Inputs Container - Flex Col on Mobile, Grid on MD */}
                            <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                                {/* Image Input Frame */}
                                <div className="group relative border border-[var(--border-color)] bg-[var(--bg-input)] hover:border-[#d2ac47] transition-all duration-500 overflow-hidden flex flex-col rounded-2xl h-56 md:h-64">
                                    <div className="absolute top-0 left-0 bg-[#d2ac47] text-black text-[9px] font-bold px-4 py-1.5 uppercase tracking-[0.2em] z-20 rounded-tl-2xl rounded-br-xl pointer-events-none">
                                        {t('vid_src_img')}
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
                                                placeholder={t('vid_click_drag_main')}
                                                className="h-full w-full border-none bg-transparent"
                                            />

                                            {/* Inactive Voice Icon (Empty State) */}
                                            {!imageUrl && (
                                                <div className="absolute bottom-2 right-2 z-20 opacity-20 pointer-events-none grayscale">
                                                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm">
                                                        <Mic size={16} className="text-[var(--text-secondary)]" />
                                                    </div>
                                                </div>
                                            )}

                                            {imageUrl && (
                                                <>
                                                    <div className="absolute top-2 right-2 z-30">
                                                        <button onClick={(e) => { e.stopPropagation(); setImageUrl(''); setFileName(''); }} className="bg-black/50 p-1 rounded-full text-white hover:text-red-500 transition-colors">
                                                            <XCircle size={16} />
                                                        </button>
                                                    </div>
                                                    {/* Voice Button (Duplicate functionality) */}
                                                    <div className="absolute bottom-2 right-2 z-30">
                                                        <button
                                                            className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/40 hover:bg-[#d2ac47] border border-white/10 hover:border-[#d2ac47] backdrop-blur-md group/mic transition-all duration-300 hover:shadow-[0_0_15px_rgba(210,172,71,0.4)]"
                                                            title="Voice Avatar"
                                                        >
                                                            <Mic size={16} className="text-[var(--text-secondary)] group-hover/mic:text-black transition-colors" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                </div>

                                {/* Prompt Input Frame */}
                                <div className="group relative border border-[var(--border-color)] bg-[var(--bg-input)] hover:border-[#d2ac47] transition-all duration-500 flex flex-col rounded-2xl h-56 md:h-64">

                                    {/* Vision Prompt (Full Height) */}
                                    <div className="relative flex-1 flex flex-col border-b border-[#d2ac47]/10">
                                        <div className="absolute top-0 left-0 bg-[#d2ac47] text-black text-[9px] font-bold px-4 py-1.5 uppercase tracking-[0.2em] z-20 rounded-tl-2xl rounded-br-xl">
                                            {t('vid_vision_prompt')}
                                        </div>
                                        <textarea
                                            value={textPrompt}
                                            onChange={(e) => setTextPrompt(e.target.value)}
                                            placeholder={t('vid_ph_prompt')}
                                            className="w-full h-full bg-transparent p-3 md:p-6 pt-10 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 font-sans font-light text-base md:text-sm resize-none focus:outline-none"
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
                                            className="w-full h-full bg-transparent p-3 pt-8 text-[var(--text-primary)]/70 placeholder-red-900/40 font-sans font-light text-[11px] resize-none focus:outline-none"
                                        />
                                    </div>
                                    */}

                                    <div className="absolute bottom-4 right-4 text-[var(--text-secondary)]/30 pointer-events-none group-focus-within:text-[var(--text-secondary)]/60 transition-colors">
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
                            className="cursor-pointer group flex items-center border border-[#d2ac47] w-full md:w-fit transition-all hover:scale-105 shadow-[0_0_15px_rgba(210,172,71,0.1)] bg-[var(--bg-input)] rounded-xl overflow-hidden min-h-[48px]"
                        >
                            <div className={`flex-1 md:flex-none px-2 md:px-6 py-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] md:tracking-[0.25em] transition-all flex items-center justify-center gap-2 md:gap-3 ${safeMode ? 'bg-gold-gradient text-black shadow-[0_0_20px_rgba(210,172,71,0.5)]' : 'text-[var(--text-secondary)]/40 bg-[var(--bg-input)] hover:bg-[#d2ac47]/10 hover:text-[var(--text-secondary)]'} `}>
                                <ShieldCheck size={16} strokeWidth={2.5} /> {t('vid_mode_safe')}
                            </div>
                            <div className="w-[1px] h-full bg-[#d2ac47]/30"></div>
                            <div className={`relative flex-1 md:flex-none px-2 md:px-6 py-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] md:tracking-[0.25em] transition-all flex items-center justify-center gap-2 md:gap-3 ${!safeMode ? 'bg-gradient-to-r from-red-600 to-red-900 text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]' : 'text-[var(--text-secondary)]/40 bg-[var(--bg-input)] hover:bg-red-900/30 hover:text-red-500'} `}>
                                <Flame size={16} strokeWidth={2.5} /> {t('vid_mode_spicy')}
                                <span className="absolute bottom-[1px] right-2 text-[8px] opacity-80 tracking-wider font-mono">BETA</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row gap-3 w-full">
                            {loading && (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="w-full md:w-auto min-h-[48px] px-6 py-3 border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500 transition-all text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 group/cancel rounded-xl shadow-[0_0_10px_rgba(210,172,71,0.1)]"
                                    >
                                        <XCircle size={16} className="group-hover/cancel:rotate-90 transition-transform duration-300" /> CANCEL
                                    </button>
                                    <button
                                        disabled={isSyncing}
                                        onClick={async () => {
                                            setIsSyncing(true);
                                            setLongWait(false); // Ack the warning

                                            // Artificial delay for UX perception if check is too fast
                                            const minTime = new Promise(r => setTimeout(r, 600));

                                            const savedGen = localStorage.getItem('active_generation');
                                            let genId = null;
                                            if (savedGen) {
                                                try {
                                                    const parsed = JSON.parse(savedGen);
                                                    genId = parsed.id || parsed.generation_id;
                                                } catch (e) {
                                                    console.error("Failed to parse generation ID", e);
                                                }
                                            }

                                            if (genId) {
                                                const { data } = await supabase.from('generations').select('status, video_url').eq('id', genId).single();
                                                if (data) {
                                                    if (data.status === 'completed' && data.video_url) {
                                                        setVideoUrl(data.video_url);
                                                        setLoading(false);
                                                        setCurrentStatus('completed');
                                                        cleanupMonitoring();
                                                        localStorage.removeItem('active_generation');
                                                        setStartTime(undefined);
                                                        fetchHistory();
                                                    } else if (data.status === 'failed') {
                                                        setError('Generation failed via Manual Check');
                                                        setLoading(false);
                                                        cleanupMonitoring();
                                                        setStartTime(undefined);
                                                    } else {
                                                        setCurrentStatus(data.status);
                                                    }
                                                }
                                            }

                                            await minTime;
                                            setIsSyncing(false);
                                        }}
                                        className={`group w-12 md:w-14 min-h-[48px] border ml-2 ${longWait ? 'border-green-500 bg-green-950/20 text-green-500 animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[#d2ac47] hover:text-black shadow-[0_0_10px_rgba(210,172,71,0.1)]'} transition-all flex items-center justify-center rounded-xl relative z-40 hover:scale-105 active:scale-95 cursor-pointer hover:shadow-[0_0_15px_rgba(210,172,71,0.3)] ${isSyncing ? 'opacity-50 cursor-wait' : ''}`}
                                        title="Force Check Status"
                                    >
                                        <RefreshCw size={20} className={`active:animate-spin ${longWait || isSyncing ? 'animate-spin' : ''}`} />

                                        {longWait && !isSyncing && (
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-green-600/90 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap animate-bounce shadow-lg z-50 after:content-[''] after:absolute after:right-full after:top-1/2 after:-translate-y-1/2 after:border-4 after:border-transparent after:border-r-green-600/90 cursor-pointer group-hover:scale-110 transition-transform origin-left">
                                                Stuck? Sync
                                            </div>
                                        )}
                                    </button>
                                </>
                            )}

                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className={`w-full md:flex-1 min-h-[48px] py-3 px-6 md:px-8 text-[10px] tracking-[0.3em] font-bold uppercase flex items-center justify-center gap-3 group rounded-xl transition-all duration-300 ${loading ? 'opacity-90 cursor-wait bg-[#d2ac47] text-black shadow-[0_0_10px_rgba(210,172,71,0.3)]' : 'bg-gold-gradient text-black shadow-[0_0_20px_rgba(210,172,71,0.4)] hover:shadow-[0_0_30px_rgba(210,172,71,0.6)] hover:scale-[1.02]'} `}
                            >
                                {loading ? (
                                    <><Loader2 className="animate-spin" size={14} /> Forging...</>
                                ) : (
                                    <>{t('vid_btn_create')} <Play size={12} fill="currentColor" className="group-hover:translate-x-1 transition-transform" /></>
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
                    <div className="mt-4 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-3xl p-2 shadow-2xl relative group w-full aspect-[9/16] max-h-[550px] mx-auto flex flex-col overflow-hidden transition-all duration-500">
                        <div className="relative flex-1 bg-[var(--bg-primary)] flex items-center justify-center overflow-hidden rounded-2xl">
                            {/* Theme-aware background - Dark mode gets the radial gradient, Light mode gets clean cream */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] to-[#050505] opacity-100 dark:opacity-100 light:opacity-0 transition-opacity duration-300 pointer-events-none data-[theme=light]:hidden"></div>

                            {/* Art Deco Corners */}
                            <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-[#d2ac47] pointer-events-none z-10 rounded-tl-lg opacity-50"></div>
                            <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-[#d2ac47] pointer-events-none z-10 rounded-tr-lg opacity-50"></div>

                            {loading ? (
                                // Logger is now full-size overlay in the output box, ensuring visibility
                                <GenerationLogger status={currentStatus} error={error} startTime={startTime} />
                            ) : videoUrl ? (
                                <div className="relative w-full h-full flex items-center justify-center group">
                                    {/* Use object-contain to preserve natural aspect ratio dynamically */}
                                    {/* Use object-contain to preserve natural aspect ratio dynamically */}
                                    {/* Use object-contain to preserve natural aspect ratio dynamically */}
                                    {videoUrl?.toLowerCase().endsWith('.mp4') ? (
                                        <div
                                            className="relative w-full h-full cursor-pointer"
                                            onClick={() => {
                                                if (videoRef.current) {
                                                    if (videoRef.current.paused) {
                                                        videoRef.current.play();
                                                        setIsPlaying(true);
                                                    } else {
                                                        videoRef.current.pause();
                                                        setIsPlaying(false);
                                                    }
                                                }
                                            }}
                                        >
                                            <video
                                                ref={videoRef}
                                                id="main-generated-video"
                                                src={videoUrl}
                                                autoPlay
                                                loop
                                                playsInline
                                                className="w-full h-full object-contain rounded-lg shadow-2xl"
                                                onTimeUpdate={handleTimeUpdate}
                                                onLoadedMetadata={handleLoadedMetadata}
                                                onPlay={() => setIsPlaying(true)}
                                                onPause={() => setIsPlaying(false)}
                                            />
                                        </div>
                                    ) : (
                                        <img
                                            src={videoUrl!}
                                            alt="Generated Fragment"
                                            className="w-full h-full object-contain rounded-lg shadow-2xl animate-fade-in"
                                        />
                                    )}

                                    {/* Infinity Action Deck - Slide Up Menu (Visible for BOTH Video & Image) */}
                                    {videoUrl && (
                                        <div
                                            className="absolute bottom-0 left-0 w-full p-6 pt-20 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/60 to-transparent translate-y-0 md:translate-y-[10px] opacity-100 md:opacity-10 md:hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100 active:opacity-100 focus-within:opacity-100 transition-all duration-500 z-40"
                                            onClick={(e) => e.stopPropagation()} // Prevent closing if clicking deck
                                        >

                                            {/* 1. Infinity Actions Row */}
                                            <div className="flex items-center justify-center gap-2 mb-4">
                                                {/* Extend (Video Only) */}
                                                {videoUrl.toLowerCase().endsWith('.mp4') && (
                                                    <button
                                                        onClick={handleExtend}
                                                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-[#d2ac47] border border-white/10 hover:border-[#d2ac47] backdrop-blur-md group/btn transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(210,172,71,0.4)] w-16"
                                                        title={t('vid_extend')}
                                                    >
                                                        <Layers size={14} className="text-[var(--text-secondary)] group-hover/btn:text-black transition-colors" />
                                                        <span className="text-[7px] font-bold uppercase tracking-widest text-[var(--text-primary)] group-hover/btn:text-black">Extend</span>
                                                    </button>
                                                )}

                                                {/* Upscale (Video Only) */}
                                                {videoUrl.toLowerCase().endsWith('.mp4') && (
                                                    <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-[#d2ac47] border border-white/10 hover:border-[#d2ac47] backdrop-blur-md group/btn transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(210,172,71,0.4)] w-16">
                                                        <Wand2 size={14} className="text-[var(--text-secondary)] group-hover/btn:text-black transition-colors" />
                                                        <span className="text-[7px] font-bold uppercase tracking-widest text-[var(--text-primary)] group-hover/btn:text-black">Upscale</span>
                                                    </button>
                                                )}

                                                {/* Voice (Image Only) */}
                                                {!videoUrl.toLowerCase().endsWith('.mp4') && (
                                                    <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-[#d2ac47] border border-white/10 hover:border-[#d2ac47] backdrop-blur-md group/btn transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(210,172,71,0.4)] w-16">
                                                        <Mic size={14} className="text-[var(--text-secondary)] group-hover/btn:text-black transition-colors" />
                                                        <span className="text-[7px] font-bold uppercase tracking-widest text-[var(--text-primary)] group-hover/btn:text-black">Lip Sync</span>
                                                    </button>
                                                )}
                                            </div>

                                            {/* 2. Playback Scrubber Bar (VIDEO ONLY) */}
                                            {videoUrl.toLowerCase().endsWith('.mp4') && (
                                                <div className="w-full h-12 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center px-4 gap-4 shadow-2xl">
                                                    <button
                                                        className="w-8 h-8 shrink-0 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#d2ac47] group/play transition-all duration-300"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (videoRef.current) {
                                                                if (videoRef.current.paused) videoRef.current.play();
                                                                else videoRef.current.pause();
                                                            }
                                                        }}
                                                    >
                                                        {isPlaying ? (
                                                            <div className="w-2.5 h-2.5 bg-white group-hover/play:bg-black rounded-sm" />
                                                        ) : (
                                                            <Play size={12} className="text-white fill-white group-hover/play:text-black group-hover/play:fill-black" />
                                                        )}
                                                    </button>

                                                    {/* Scrubber */}
                                                    <div
                                                        className="flex-1 h-full flex items-center justify-center cursor-ew-resize group/scrub touch-none"
                                                        onClick={(e) => {
                                                            if (videoRef.current && Number.isFinite(videoRef.current.duration)) {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                const x = e.clientX - rect.left;
                                                                const percentage = Math.max(0, Math.min(1, x / rect.width));
                                                                videoRef.current.currentTime = percentage * videoRef.current.duration;
                                                            }
                                                        }}
                                                        onMouseMove={(e) => {
                                                            if (e.buttons === 1 && videoRef.current && Number.isFinite(videoRef.current.duration)) {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                const x = e.clientX - rect.left;
                                                                const percentage = Math.max(0, Math.min(1, x / rect.width));
                                                                videoRef.current.currentTime = percentage * videoRef.current.duration;
                                                            }
                                                        }}
                                                        onTouchStart={(e) => e.stopPropagation()}
                                                        onTouchMove={(e) => {
                                                            if (videoRef.current && Number.isFinite(videoRef.current.duration)) {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                const x = e.touches[0].clientX - rect.left;
                                                                const percentage = Math.max(0, Math.min(1, x / rect.width));
                                                                videoRef.current.currentTime = percentage * videoRef.current.duration;
                                                            }
                                                        }}
                                                    >
                                                        <div className="w-full h-1 bg-white/20 rounded-full relative overflow-visible pointer-events-none group-hover/scrub:h-1.5 transition-all">
                                                            <div
                                                                className="absolute inset-y-0 left-0 bg-[#d2ac47] rounded-full shadow-[0_0_15px_rgba(210,172,71,0.8)]"
                                                                style={{ width: `${videoProgress}%` }}
                                                            ></div>
                                                            <div
                                                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_black] opacity-0 group-hover/scrub:opacity-100 transition-opacity"
                                                                style={{ left: `${videoProgress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-[9px] text-[var(--text-secondary)] font-mono uppercase tracking-widest shrink-0 opacity-60">
                                                        <span>HD</span>
                                                        <button onClick={toggleFullscreen} className="hover:text-white transition-colors">
                                                            <Maximize2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Top Overlay: Download & Meta (Styled like Safe/Spicy) */}
                                    <div className="absolute top-4 right-4 flex flex-col items-end gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-30">
                                        {/* Use as Reference Button - Only for Images */}
                                        {videoUrl && !videoUrl.toLowerCase().endsWith('.mp4') && (
                                            <button
                                                onClick={handleUseAsReference}
                                                className="px-6 py-2 border border-[#d2ac47]/50 bg-black/60 backdrop-blur-xl text-[var(--text-secondary)] hover:bg-[#d2ac47] hover:text-black transition-all text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 rounded-xl shadow-[0_0_20px_rgba(210,172,71,0.3)] hover:shadow-[0_0_30px_rgba(210,172,71,0.6)] z-50 overflow-hidden group/ref pointer-events-auto"
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
                                            className="px-6 py-2 border border-[#d2ac47]/50 bg-black/50 backdrop-blur-xl text-[var(--text-secondary)] hover:bg-[#d2ac47] hover:text-black transition-all text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 rounded-xl shadow-[0_0_20px_rgba(210,172,71,0.2)] hover:shadow-[0_0_30px_rgba(210,172,71,0.5)] z-50 overflow-hidden group/dl pointer-events-auto"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                <Download size={14} className="group-hover/dl:animate-bounce" />
                                                Download
                                            </span>
                                            <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover/dl:opacity-20 transition-opacity"></div>
                                        </button>

                                        {/* Close / Clear Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setVideoUrl(null);
                                                setImageUrl('');
                                                setActiveItem(null);
                                            }}
                                            className="px-3 py-2 border border-red-500/30 bg-black/50 backdrop-blur-xl text-red-500 hover:bg-red-500 hover:text-white transition-all text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] z-50 overflow-hidden group/close pointer-events-auto"
                                        >
                                            <XCircle size={14} className="group-hover/close:rotate-90 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[var(--text-secondary)] flex flex-col items-center gap-6 opacity-60 group-hover:opacity-100 transition-all duration-500">

                                    {/* Moved Header - Inside Workspace - STRICT ORIGINAL STYLING REBOOT */}
                                    <div className="text-center mb-6 relative z-10 animate-fade-in">
                                        <div className="inline-flex items-center gap-4 mb-4">
                                            <div className="h-[1px] w-12 bg-[#d2ac47]"></div>
                                            <span className="text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.4em] uppercase">{t('vid_gen_active')}</span>
                                            <div className="h-[1px] w-12 bg-[#d2ac47]"></div>
                                        </div>
                                        <h1 className="text-3xl md:text-5xl font-serif text-[var(--text-primary)] mb-4 leading-tight drop-shadow-[0_0_25px_rgba(210,172,71,0.2)]">
                                            {t('vid_tagline_title')}<span className="text-[var(--text-secondary)]">...</span>
                                        </h1>
                                        <p className="text-[var(--text-primary)]/60 max-w-lg mx-auto font-sans text-[10px] md:text-xs tracking-[0.1em] leading-relaxed uppercase">
                                            <Trans i18nKey="vid_tagline_desc" components={{ 1: <i className="text-[var(--text-secondary)] italic lowercase text-lg font-serif" /> }} />
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 mt-8 transform group-hover:scale-110 transition-transform duration-500">
                                        <VideoIcon size={48} strokeWidth={1} />
                                        <span className="text-[8px] tracking-[0.4em] uppercase font-bold opacity-50">{t('vid_active_workspace')}</span>
                                        <p className="text-[var(--text-secondary)]/70 text-[8px] font-sans font-light tracking-[0.2em] mt-1 opacity-80 uppercase text-center max-w-xs">
                                            {t('vid_upload_instruction')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Metadata Footer (Compact Design) */}
                        {activeItem && (
                            <div className="relative px-4 pb-2 pt-2 text-center shrink-0 border-t border-[#d2ac47]/10 bg-[var(--bg-primary)]/50">
                                <p className="text-[var(--text-primary)] text-[13px] font-serif italic mb-1 truncate">
                                    {activeItem.prompt ? (activeItem.prompt.substring(0, 50) + (activeItem.prompt.length > 50 ? '...' : '')) : (activeItem.label || 'Untitled Masterpiece')}
                                </p>
                                <div className="flex items-center justify-center gap-3 text-[8px] uppercase tracking-[0.2em] text-[var(--text-secondary)]/50 font-bold">
                                    <span>{activeItem.created_at ? new Date(activeItem.created_at).toLocaleString() : 'Just now'}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#d2ac47]/20"></div>
                                    <div className="flex items-center gap-1">
                                        <ShieldCheck size={10} className="text-green-500/50" />
                                        <span>Verified Render</span>
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#d2ac47]/20"></div>
                                    <button className="hover:text-[var(--text-secondary)] transition-colors">Infinity Studio</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Infinity Actions Panel - Moved Below Output */}



                </div>


                {/* Right Col: Output & Stats & Coins - Mobile: Middle (Order 2) */}
                <div className="order-2 xl:order-none w-full xl:w-auto xl:col-span-3 flex flex-col gap-4 lg:h-[calc(85vh-150px)]">

                    {/* 3. History / Gallery - Taller on Mobile, Elastic & Stable on PC */}
                    <div className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-3xl p-2 shadow-2xl relative flex flex-col overflow-y-auto overflow-x-hidden flex-1 min-h-[500px] lg:min-h-0 mx-2 md:mx-0">
                        <div className="flex items-center justify-between h-10 px-0">
                            <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.2em] pl-4">{t('vid_history')}</span>
                        </div>
                        <UserGallery
                            newItems={galleryItems} // Actually historyItems? The prop name in UserGallery is newItems?
                            onRefresh={fetchHistory}
                            onSelect={(item) => {
                                const url = item.result_url || item.video_url || item.url;
                                if (url) setVideoUrl(url);
                                setActiveItem(item); // Added this back to ensure activeItem is set
                            }}
                            onDelete={async (id) => {
                                const { error } = await supabase.from('generations').delete().eq('id', id);
                                if (!error) {
                                    fetchHistory();
                                    const deletedItem = galleryItems.find(i => i.id === id);
                                    if (deletedItem && videoUrl === (deletedItem.result_url || deletedItem.video_url || deletedItem.url)) {
                                        setVideoUrl(null);
                                        setActiveItem(null);
                                        setImageUrl('');
                                    }
                                }
                            }}
                            onReference={(item) => {
                                const url = item.result_url || item.video_url || item.url;
                                if (url && !url.toLowerCase().endsWith('.mp4')) {
                                    setImageUrl(url);
                                    setFileName('From Library');
                                    // Scroll to workspace
                                    document.getElementById('video-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                        />


                        {/* Infinity Actions Panel - Moved to Right Column on Desktop */}



                    </div>
                </div>

            </div>
        </div>
    );
};

export default VideoGenerator;
