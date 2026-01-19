import React, { useState } from 'react';
import axios from 'axios';
import { Play, Loader2, XCircle, ShieldCheck, Flame, Download, Layers, Wand2, Video } from 'lucide-react';
import GamificationDashboard from './GamificationDashboard';
import UserGallery from './UserGallery';
import ImageUploadZone from './ImageUploadZone';
import { supabase } from '../lib/supabaseClient';

// Simulated Progress Logger for UX
const GenerationLogger = () => {
    const [logs, setLogs] = React.useState<string[]>(["Initializing Neural Network..."]);

    React.useEffect(() => {
        const steps = [
            { msg: "Studio: Receiving creative assets...", delay: 800 },
            { msg: "Analysis: Deciphering visual context...", delay: 5000 },
            { msg: "Director: Crafting cinematic screenplay...", delay: 10000 },
            { msg: "Lighting: Configuring atmosphere & mood...", delay: 15000 },
            { msg: "Safety: Verifying content guidelines...", delay: 20000 },
            { msg: "Engine: Calibrating render pipeline...", delay: 25000 },
            { msg: "Core: Loading high-fidelity models...", delay: 35000 },
            { msg: "Animation: Simulating physics and movement...", delay: 50000 },
            { msg: "Rendering: Enhancing texture and detail...", delay: 200000 },
            { msg: "Assembly: Compiling final video sequence...", delay: 390000 },
            { msg: "Delivery: Finalizing masterpiece (Please Wait)...", delay: 410000 }
        ];

        let timeouts: any[] = [];

        steps.forEach(({ msg, delay }) => {
            const timeout = setTimeout(() => {
                setLogs(prev => [...prev.slice(-4), msg]); // Keep last 5 logs
            }, delay);
            timeouts.push(timeout);
        });

        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 font-mono text-xs z-20">
            <div className="w-full max-w-md space-y-2">
                <div className="text-[#d2ac47]/30 text-[10px] text-center mb-2">Build v2.3 (Debug: Payload Fix)</div>
                {logs.map((log, i) => (
                    <div key={i} className="text-[#d2ac47] animate-fade-in-up flex items-center gap-2">
                        <span className="text-[#d2ac47]/50">{`> `}</span>
                        <span className={i === logs.length - 1 ? "animate-pulse font-bold" : "opacity-70"}>{log}</span>
                    </div>
                ))}
                <div className="h-4 w-full bg-[#d2ac47]/10 mt-4 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full bg-[#d2ac47] animate-[shimmer_20s_linear_infinite]" style={{ width: '100%', animation: 'growWidth 420s linear forwards' }}></div>
                </div>
            </div>
            <style>{`
@keyframes growWidth {
    0 % { width: 0 %; }
    100 % { width: 100 %; }
}
`}</style>
        </div>
    );
};

// Webhook URL (Updated to Supabase Workflow)
const WEBHOOK_URL = "https://n8n.develotex.io/webhook/wan_context_safeMode_3_SB";

const VideoGenerator: React.FC = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [fileName, setFileName] = useState('');
    const [textPrompt, setTextPrompt] = useState('');
    const [safeMode, setSafeMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [galleryItems, setGalleryItems] = useState<any[]>([]);
    const abortControllerRef = React.useRef<AbortController | null>(null);

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setLoading(false);
            setError('Generation cancelled by user.');
        }
    };

    const handleDownload = () => {
        if (!videoUrl) return;

        // Mock download
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = `infinity_video_${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Add to gallery
        const newItem = {
            id: Date.now(),
            type: 'video',
            url: videoUrl,
            thumb: '/luxury-right-2.png', // Placeholder thumb for now
            label: 'New Masterpiece',
            privacy: 'private',
            date: 'Just now'
        };
        setGalleryItems(prev => [newItem, ...prev]);
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
                    type: 'video',
                    status: 'pending',
                    prompt: textPrompt,
                    image_url: imageUrl,
                    metadata: { safe_mode: safeMode }
                })
                .select()
                .single();

            if (dbError) throw new Error(`Database Error: ${dbError.message}`);
            if (!generation) throw new Error('Failed to init generation');

            console.log("Generation started, ID:", generation.id);

            // 2. Call Webhook (Fire and Forget - we don't wait for the video blob response)
            // We pass the 'generation_id' so N8n knows where to save the result.
            axios.post(WEBHOOK_URL, {
                generation_id: generation.id, // <--- CRITICAL for Async
                imageUrl,
                filename: fileName,
                textPrompt,
                safeMode,
                resolution_steps: 1080,
                aspect_ratio: "1080",
                megapixels: 1,
            }).catch(err => {
                // If N8n times out (Cloudflare error), that's actually FINE in async mode,
                // provided N8n started processing. Only network errors are real errors.
                console.warn("Webhook triggered (async path)", err);
            });

            // 3. Listen for updates on this specific row
            const channel = supabase
                .channel(`generation_${generation.id}`)
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'generations', filter: `id=eq.${generation.id}` },
                    (payload) => {
                        const newRecord = payload.new as any;
                        console.log("Realtime Update:", newRecord);

                        if (newRecord.status === 'completed' && newRecord.video_url) {
                            setVideoUrl(newRecord.video_url);
                            setLoading(false);
                            supabase.removeChannel(channel);
                        } else if (newRecord.status === 'failed') {
                            setError('Generation failed on server.');
                            setLoading(false);
                            supabase.removeChannel(channel);
                        }
                    }
                )
                .subscribe();

            // Safety timeout (stop listening after 10 minutes)
            setTimeout(() => {
                if (loading) {
                    supabase.removeChannel(channel);
                    // Don't kill the UI, just stop listening
                }
            }, 600000);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to start generation.');
            setLoading(false);
        }
    };

    return (
        <div className="w-full relative">


            {/* Hero Section */}
            <div className="text-center mb-6 relative z-10 animate-fade-in">
                <div className="inline-flex items-center gap-4 mb-4">
                    <div className="h-[1px] w-12 bg-[#d2ac47]"></div>
                    <span className="text-[#d2ac47] text-[10px] font-bold tracking-[0.4em] uppercase">Generation 2.2 Active</span>
                    <div className="h-[1px] w-12 bg-[#d2ac47]"></div>
                </div>
                <h1 className="text-4xl md:text-6xl font-serif text-[#F9F1D8] mb-4 leading-tight drop-shadow-[0_0_25px_rgba(210,172,71,0.2)]">
                    Infinity Video<span className="text-[#d2ac47]">...</span>
                </h1>
                <p className="text-[#F9F1D8]/60 max-w-2xl mx-auto font-sans text-xs tracking-[0.1em] leading-relaxed uppercase">
                    Forging digital desire. The pinnacle of <i className="text-gold-luxury italic lowercase text-lg">AI Aesthetics</i>.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[450px]">

                {/* Left Banner - Breathing/Beckoning Effect (Widened) */}
                <div className="hidden xl:block lg:col-span-4">
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
                <div className="lg:col-span-12 xl:col-span-5 flex flex-col">
                    <div className="bg-velvet-depth border border-[#d2ac47]/20 rounded-3xl p-5 relative overflow-hidden flex-1 flex flex-col justify-start shadow-2xl transition-all hover:border-[#d2ac47]/40">

                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#d2ac47]/50 to-transparent"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#d2ac47]/50 to-transparent"></div>

                        <div className="space-y-4 relative z-10">
                            {/* Inputs Grid - Split into 2 */}
                            {/* Inputs Grid - Expanded to Fill Space */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                {/* Image Input Frame */}
                                <div className="group relative border border-[#d2ac47]/30 bg-[#0a0a0a] hover:border-[#d2ac47] transition-all duration-500 overflow-hidden flex flex-col rounded-2xl aspect-square">
                                    <div className="absolute top-0 left-0 bg-[#d2ac47] text-black text-[9px] font-bold px-4 py-1.5 uppercase tracking-[0.2em] z-20 rounded-br-xl pointer-events-none">
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
                                <div className="group relative border border-[#d2ac47]/30 bg-[#0a0a0a] hover:border-[#d2ac47] transition-all duration-500 flex flex-col rounded-2xl overflow-hidden aspect-square">
                                    <div className="absolute top-0 left-0 bg-[#d2ac47] text-black text-[9px] font-bold px-4 py-1.5 uppercase tracking-[0.2em] z-20 rounded-br-xl">
                                        Vision Prompt
                                    </div>
                                    <textarea
                                        value={textPrompt}
                                        onChange={(e) => setTextPrompt(e.target.value)}
                                        placeholder="Describe the motion, atmosphere, and desire..."
                                        className="w-full h-full bg-transparent p-6 pt-10 text-[#F9F1D8] placeholder-[#d2ac47]/50 font-sans font-light text-sm resize-none focus:outline-none"
                                    />
                                    <div className="absolute bottom-4 right-4 text-[#d2ac47]/50 pointer-events-none group-focus-within:text-[#d2ac47]/80 transition-colors">
                                        <Wand2 size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls - The Toggle */}
                    <div className="border-t border-[#d2ac47]/10 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">

                        {/* Mode Toggle - Strict Rectangles (Larger & Clearer) */}
                        <div
                            onClick={() => setSafeMode(!safeMode)}
                            className="cursor-pointer group flex items-center border border-[#d2ac47] w-fit transition-all hover:scale-105 shadow-[0_0_15px_rgba(210,172,71,0.1)] bg-black rounded-xl overflow-hidden"
                        >
                            <div className={`px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] transition-all flex items-center gap-3 ${safeMode ? 'bg-gold-gradient text-black shadow-[0_0_20px_rgba(210,172,71,0.5)]' : 'text-[#d2ac47]/40 bg-black hover:bg-[#d2ac47]/10 hover:text-[#d2ac47]'} `}>
                                <ShieldCheck size={16} strokeWidth={2.5} /> SAFE
                            </div>
                            <div className="w-[1px] h-full bg-[#d2ac47]/30"></div>
                            <div className={`px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] transition-all flex items-center gap-3 ${!safeMode ? 'bg-gradient-to-r from-red-600 to-red-900 text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]' : 'text-[#d2ac47]/40 bg-black hover:bg-red-900/30 hover:text-red-500'} `}>
                                <Flame size={16} strokeWidth={2.5} /> SPICY
                            </div>
                        </div>

                        {loading && (
                            <button
                                onClick={handleCancel}
                                className="h-full px-6 py-3 border border-[#d2ac47] bg-[#1a1a1a] text-[#d2ac47] hover:bg-red-950/40 hover:text-red-400 hover:border-red-500 transition-all text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 group/cancel rounded-xl shadow-[0_0_10px_rgba(210,172,71,0.1)]"
                            >
                                <XCircle size={16} className="group-hover/cancel:rotate-90 transition-transform duration-300" /> CANCEL
                            </button>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className={`flex-1 md:flex-none py-4 px-8 text-[10px] tracking-[0.3em] font-bold uppercase flex items-center justify-center gap-3 min-w-[200px] group rounded-xl transition-all duration-300 ${loading ? 'opacity-90 cursor-wait bg-[#d2ac47] text-black shadow-[0_0_10px_rgba(210,172,71,0.3)]' : 'bg-gold-gradient text-black shadow-[0_0_20px_rgba(210,172,71,0.4)] hover:shadow-[0_0_30px_rgba(210,172,71,0.6)] hover:scale-[1.02]'} `}
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin" size={14} /> Forging...</>
                            ) : (
                                <>CREATE VIDEO <Play size={12} fill="currentColor" className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-950/30 border-l-2 border-red-500 text-center">
                            <p className="text-red-300 font-serif italic text-sm">{error}</p>
                        </div>
                    )}


                    {/* 3. Output / Generation Result (Dynamic Aspect Ratio) */}
                    <div className="mt-4 flex-1 bg-[#0a0a0a] border border-[#d2ac47]/20 rounded-3xl p-2 shadow-2xl relative group w-full min-h-[500px] flex flex-col justify-center overflow-hidden transition-all duration-500">
                        <div className="absolute inset-0 w-full h-full bg-[#050505] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] to-[#050505] rounded-2xl">
                            {/* Art Deco Corners */}
                            <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-[#d2ac47] pointer-events-none z-10 rounded-tl-lg opacity-50"></div>
                            <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-[#d2ac47] pointer-events-none z-10 rounded-tr-lg opacity-50"></div>
                            <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-[#d2ac47] pointer-events-none z-10 rounded-bl-lg opacity-50"></div>
                            <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-[#d2ac47] pointer-events-none z-10 rounded-br-lg opacity-50"></div>

                            {loading ? (
                                <GenerationLogger />
                            ) : videoUrl ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {/* Use object-contain to preserve natural aspect ratio dynamically */}
                                    <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />

                                    {/* Top Overlay: Text Center, Button Right */}
                                    <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/80 to-transparent flex items-start justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                        <div className="absolute left-1/2 transform -translate-x-1/2 top-6">
                                            <p className="text-[#d2ac47] font-serif italic text-xl drop-shadow-md opacity-50 cursor-default pointer-events-auto">Masterpiece Ready</p>
                                        </div>
                                        <button onClick={handleDownload} className="flex items-center gap-2 bg-[#d2ac47] text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_15px_rgba(210,172,71,0.4)] rounded-xl pointer-events-auto">
                                            <Download size={16} /> DOWNLOAD
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[#d2ac47] flex flex-col items-center gap-4 opacity-50 group-hover:opacity-80 transition-opacity transform group-hover:scale-105 duration-500">
                                    <Video size={64} strokeWidth={1} />
                                    <span className="text-[10px] tracking-[0.4em] uppercase font-bold">Active Workspace</span>
                                </div>
                            )}
                        </div>
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
                <div className="lg:col-span-12 xl:col-span-3 flex flex-col gap-4">

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
                    <div className="flex-1 bg-[#0a0a0a] border border-[#d2ac47]/20 rounded-3xl p-4 shadow-2xl relative min-h-[500px] md:min-h-[300px] flex flex-col">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-[#d2ac47] text-[10px] font-bold uppercase tracking-[0.2em]">History</span>
                        </div>
                        <UserGallery newItems={galleryItems} />
                    </div>
                </div>
            </div >
        </div >


    );
};

export default VideoGenerator;
