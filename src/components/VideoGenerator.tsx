import React, { useState } from 'react';
import axios from 'axios';
import { Play, Loader2, XCircle, ShieldCheck, Flame, Download, Layers, Wand2, Video } from 'lucide-react';
import GamificationDashboard from './GamificationDashboard';
import UserGallery from './UserGallery';
import ImageUploadZone from './ImageUploadZone';

// Simulated Progress Logger for UX
const GenerationLogger = () => {
    const [logs, setLogs] = React.useState<string[]>(["Initializing Neural Network..."]);

    React.useEffect(() => {
        const steps = [
            { msg: "Webhook: Receiving Input Data...", delay: 800 },
            { msg: "AI Analyst: Extracting Image Context...", delay: 5000 },
            { msg: "Role [Smart Director]: Generating Script...", delay: 10000 },
            { msg: "Tokenizer: Parsing [Lighting, Style]...", delay: 15000 },
            { msg: "Security: Running NSFW Filters...", delay: 20000 },
            { msg: "Router: Workflow [SAFE] Selected...", delay: 25000 },
            { msg: "ComfyUI: Loading Flux Checkpoint...", delay: 35000 },
            { msg: "K-Sampler: Refining Motion Data...", delay: 50000 },
            { msg: "K-Sampler: Polishing Visuals...", delay: 200000 },
            { msg: "VAE Decode: Rendering Frames...", delay: 390000 },
            { msg: "API: Downloading Video (Please Wait)...", delay: 410000 }
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

// Webhook URL (Proxied via Vite)
const WEBHOOK_URL = "/api/webhook";

const VideoGenerator: React.FC = () => {
    const [imageUrl, setImageUrl] = useState('');
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
            // Cancel any previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            const response = await axios.post(WEBHOOK_URL, {
                imageUrl,
                textPrompt,
                safeMode
            }, {
                responseType: 'blob',
                headers: { 'Content-Type': 'application/json' },
                timeout: 900000, // 15 minutes timeout for safely handling long generation
                signal: abortControllerRef.current.signal
            });



            const url = URL.createObjectURL(new Blob([response.data], { type: 'video/mp4' }));
            setVideoUrl(url);

        } catch (err: any) {
            console.error(err);
            let errorMessage = 'Failed to generate video. Please check your inputs and try again.';

            if (err.response) {
                errorMessage = `Server Error(${err.response.status}): ${err.response.statusText} `;
                if (err.response.data instanceof Blob) {
                    try {
                        const text = await err.response.data.text();
                        const json = JSON.parse(text);
                        if (json.message) errorMessage += ` - ${json.message} `;
                    } catch (e) { /* ignore blob parse error */ }
                }
            } else if (err.request) {
                errorMessage = 'No response received from server. Check if the n8n workflow is active.';
            } else {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
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
                    <div className="bg-velvet-depth border border-[#d2ac47]/20 rounded-3xl p-6 relative overflow-hidden flex-1 flex flex-col justify-start shadow-2xl transition-all hover:border-[#d2ac47]/40">

                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#d2ac47]/50 to-transparent"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#d2ac47]/50 to-transparent"></div>

                        <div className="space-y-4 relative z-10 mt-2">
                            {/* Inputs Grid - Split into 2 */}
                            {/* Inputs Grid - Expanded to Fill Space */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[250px]">
                                {/* Image Input Frame */}
                                <div className="group relative border border-[#d2ac47]/30 bg-[#0a0a0a] hover:border-[#d2ac47] transition-all duration-500 overflow-hidden flex flex-col rounded-2xl">
                                    <div className="absolute top-0 left-0 bg-[#d2ac47] text-black text-[9px] font-bold px-4 py-1.5 uppercase tracking-[0.2em] z-20 rounded-br-xl pointer-events-none">
                                        Source Image
                                    </div>

                                    {/* Main Upload Zone */}
                                    <div className="flex-1 p-0 relative h-full flex flex-col">
                                        <div className="absolute inset-0">
                                            <ImageUploadZone
                                                onImageUpload={setImageUrl}
                                                currentUrl={imageUrl}
                                                placeholder="CLICK OR DRAG IMAGE"
                                                className="h-full w-full"
                                            />
                                        </div>
                                    </div>

                                </div>

                                {/* Prompt Input Frame */}
                                <div className="group relative border border-[#d2ac47]/30 bg-[#0a0a0a] hover:border-[#d2ac47] transition-all duration-500 flex flex-col rounded-2xl overflow-hidden min-h-[250px]">
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
                                className="h-full px-6 py-3 border border-[#d2ac47]/30 bg-black/50 text-[#d2ac47]/50 hover:bg-red-950/20 hover:text-red-400 hover:border-red-500/50 transition-all text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 group/cancel rounded-xl"
                            >
                                <XCircle size={16} className="group-hover/cancel:rotate-90 transition-transform duration-300" /> CANCEL
                            </button>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className={`flex-1 md:flex-none py-4 px-8 text-[10px] tracking-[0.3em] font-bold uppercase flex items-center justify-center gap-3 min-w-[200px] group rounded-xl transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed bg-[#d2ac47]/20 text-[#d2ac47]/50' : 'bg-gold-gradient text-black shadow-[0_0_20px_rgba(210,172,71,0.4)] hover:shadow-[0_0_30px_rgba(210,172,71,0.6)] hover:scale-[1.02]'} `}
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
