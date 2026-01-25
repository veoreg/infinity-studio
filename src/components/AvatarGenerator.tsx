import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wand2, Download, RefreshCw, Sparkles, XCircle, Camera, User, X, Maximize2, Upload } from 'lucide-react';

import UserGallery from './UserGallery';
import ImageUploadZone from './ImageUploadZone';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Webhook URL - Direct n8n endpoint for Avatar Generation
const WEBHOOK_URL = "/api/avatar";

interface CustomSelectProps {
    label: string;
    value: string | number;
    onChange: (val: string) => void;
    options: { label: string, value: string | number }[];
    disabled?: boolean;
}

// Reusable Dropdown Component
const CustomSelect: React.FC<CustomSelectProps & { centerLabel?: boolean }> = ({ label, value, onChange, options, disabled, centerLabel }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative group" ref={dropdownRef}>
            <label className={`text-[#d2ac47] text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5 block ${centerLabel ? 'text-center' : ''} truncate`}>{label}</label>
            <div
                className={`w-full bg-[#0a0a0a] border ${isOpen ? 'border-[#d2ac47]' : 'border-[#d2ac47]/30'} text-[#F9F1D8] p-2 md:p-2.5 rounded-lg flex justify-between items-center transition-all 
                ${disabled ? 'opacity-50 cursor-not-allowed border-[#d2ac47]/10' : 'cursor-pointer hover:border-[#d2ac47]/60'}
                `}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className="truncate text-[10px] md:text-xs font-bold tracking-widest uppercase">{options.find(o => o.value == value)?.label || value}</span>
                <span className="text-[#d2ac47] text-[8px] transition-transform duration-300 transform shrink-0 ml-2" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </div>

            {/* Dropdown Options - Absolute positioned with high Z-index */}
            {isOpen && (
                <div className="absolute top-full left-0 min-w-full w-auto whitespace-nowrap bg-[#050505] border border-[#d2ac47] z-[99999] shadow-[0_10px_40px_rgba(0,0,0,0.9)] animate-fade-in-down mt-2 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            className={`px-3 py-2 text-[10px] md:text-xs cursor-pointer transition-all border-b border-[#d2ac47]/10 last:border-0 uppercase tracking-wider
                                ${opt.value == value
                                    ? 'bg-[#d2ac47] text-black font-bold shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]'
                                    : 'text-[#e0e0e0] hover:bg-[#d2ac47]/10 hover:text-[#fbeea4] hover:pl-4'
                                }
                            `}
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

const AvatarLogger = ({ status, error }: { status: string; error: string | null }) => {
    const [log, setLog] = useState("Initializing Neural Network...");

    React.useEffect(() => {
        if (status === 'queued') {
            setLog("Waiting for available slot in GPU cluster...");
            return;
        }

        const steps = [
            { msg: "Scanner: Initializing biometric handshake...", delay: 1500 },
            { msg: "Scanner: Precise facial topography mapping...", delay: 8000 },
            { msg: "Identity: Extracting structural DNA markers...", delay: 18000 },
            { msg: "Composition: Rigging skeletal anatomical frame...", delay: 30000 },
            { msg: "Engine: Seeding neural latent space (FLUX.1)...", delay: 45000 },
            { msg: "Detailing: Perfecting epidermal micro-textures...", delay: 65000 },
            { msg: "Lighting: Global illumination & ray-tracing...", delay: 85000 },
            { msg: "Optics: Simulating prime lens aberrations...", delay: 98000 },
            { msg: "Studio: Finalizing digital masterpiece...", delay: 105000 }
        ];

        let timeouts: any[] = [];

        steps.forEach(({ msg, delay }) => {
            const timeout = setTimeout(() => {
                setLog(msg);
            }, delay);
            timeouts.push(timeout);
        });

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [status]);

    return (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-8 text-center space-y-6 z-50">
            {/* Elegant AI Loader: Thin dual-ring system */}
            <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-[1px] border-[#d2ac47]/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                <div className="absolute inset-1 border-t-[1px] border-[#d2ac47] rounded-full animate-[spin_2s_linear_infinite]"></div>
                <div className="absolute inset-3 border-b-[1px] border-[#d2ac47]/50 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                <Sparkles size={12} className="text-[#d2ac47] animate-pulse" />
            </div>
            <div className={`font-mono ${error ? 'text-red-500' : 'text-[#d2ac47]'} text-xs uppercase tracking-[0.3em] font-bold`}>
                {error ? `[FATAL ERROR] ${error}` : `> ${log}`}
            </div>
            {/* Progress Bar Simulation */}
            {!error && (
                <div className="w-48 h-1 bg-[#d2ac47]/20 rounded-full overflow-hidden mt-4 bg-black/40 backdrop-blur-sm">
                    <div
                        className={`h-full bg-[#d2ac47] ${status === 'queued' ? 'opacity-30 animated-pulse w-full' : ''}`}
                        style={{
                            width: status === 'queued' ? '100%' : '0%',
                            animation: (status === 'processing' || status === 'pending') ? 'growWidth 105s linear forwards' : 'none'
                        }}
                    ></div>
                </div>
            )}
            <style>{`
                @keyframes growWidth {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
};

// -----------------------------------------------------------------------------------------
// Helper Component: ImageComparisonSlider
// -----------------------------------------------------------------------------------------
const ImageComparisonSlider = ({ before, after }: { before: string; after: string }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const position = ((x - rect.left) / rect.width) * 100;
        setSliderPos(Math.max(0, Math.min(100, position)));
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-[#d2ac47]/20 group/slider shadow-2xl"
            onMouseMove={(e) => e.buttons === 1 && handleMove(e)}
            onTouchMove={handleMove}
            onMouseDown={handleMove}
        >
            {/* After Image (Background) */}
            <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover bg-[#0a0a0a]" />

            {/* Before Image (Foreground with Clip) */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden z-10"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
                <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover bg-[#0a0a0a]" />
            </div>

            {/* Slider Line */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#d2ac47]/80 shadow-[0_0_15px_rgba(210,172,71,0.5)] z-20 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black/80 backdrop-blur-md border border-[#d2ac47]/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-[#d2ac47] rounded-full"></div>
                        <div className="w-0.5 h-3 bg-[#d2ac47] rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 rounded-full text-[8px] text-[#F9F1D8] uppercase tracking-[0.2em] backdrop-blur-md border border-[#d2ac47]/20 z-30 font-bold opacity-0 group-hover/slider:opacity-100 transition-opacity">Original</div>
            <div className="absolute top-4 right-4 px-3 py-1 bg-[#d2ac47]/80 rounded-full text-[8px] text-black font-bold uppercase tracking-[0.2em] backdrop-blur-md border border-[#F9F1D8]/20 z-30 opacity-0 group-hover/slider:opacity-100 transition-opacity">AI Edit</div>

            {/* Watermark/Instruction */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/40 backdrop-blur-sm rounded-full text-[7px] text-[#d2ac47]/60 uppercase tracking-[0.3em] z-30 font-medium whitespace-nowrap opacity-0 group-hover/slider:opacity-100 transition-opacity">Slide to compare transformation</div>
        </div>
    );
};

// Helper Component: EditPhotoModal
// Elegant popup for text-based photo editing requests
// -----------------------------------------------------------------------------------------
const EditPhotoModal = ({ isOpen, onClose, onSubmit, prompt, setPrompt, loading, originalImage, onUpload }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    prompt: string;
    setPrompt: (v: string) => void;
    loading: boolean;
    originalImage: string | null;
    onUpload?: (url: string) => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
            <div className="relative w-full max-w-5xl bg-[#0a0a0a] border border-[#d2ac47]/30 rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                {/* Art Deco Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-gradient opacity-10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#d2ac47]/5 blur-[100px] rounded-full"></div>

                <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gold-gradient/10 rounded-xl border border-[#d2ac47]/20 shadow-[0_0_15px_rgba(210,172,71,0.1)]">
                                <Wand2 size={24} className="text-[#d2ac47]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-serif text-[#F9F1D8] italic tracking-wide">Neural Image Refiner</h3>
                                <p className="text-[10px] text-[#d2ac47]/50 uppercase tracking-[0.3em] font-bold">Advanced Latent Space Editor</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-[#d2ac47]/40 hover:text-[#d2ac47] transition-all rounded-full hover:bg-white/5 hover:scale-110">
                            <XCircle size={28} />
                        </button>
                    </div>

                    {/* Content Grid */}
                    <div className="flex-1 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 h-full">

                            {/* Left Side: Image Preview */}
                            <div className="flex flex-col h-full">
                                <label className="text-[#d2ac47] text-[10px] font-black tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                                    <Camera size={12} /> Target Canvas
                                </label>

                                <div className="flex-1 min-h-0 bg-black/40 rounded-2xl border border-[#d2ac47]/10 overflow-hidden relative group/canvas">
                                    {!originalImage ? (
                                        <div
                                            className="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#d2ac47]/5 transition-all"
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = (e) => {
                                                    const file = (e.target as HTMLInputElement).files?.[0];
                                                    if (file && onUpload) {
                                                        const url = URL.createObjectURL(file);
                                                        onUpload(url);
                                                    }
                                                };
                                                input.click();
                                            }}
                                        >
                                            <div className="p-5 bg-[#d2ac47]/5 rounded-full border border-[#d2ac47]/10 animate-pulse">
                                                <Camera className="text-[#d2ac47]/40" size={40} strokeWidth={1} />
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-[10px] text-[#d2ac47] font-black uppercase tracking-widest">Upload Source Material</span>
                                                <span className="block text-[8px] text-[#d2ac47]/30 uppercase tracking-widest mt-1">Support: JPG, PNG, WEBP</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col">
                                            <div className="flex-1 min-h-0">
                                                <ImageComparisonSlider
                                                    before={originalImage}
                                                    after={originalImage}
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = (e) => {
                                                        const file = (e.target as HTMLInputElement).files?.[0];
                                                        if (file && onUpload) {
                                                            const url = URL.createObjectURL(file);
                                                            onUpload(url);
                                                        }
                                                    };
                                                    input.click();
                                                }}
                                                className="absolute top-4 right-4 z-40 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-[#d2ac47]/30 text-[#d2ac47] text-[8px] hover:bg-[#d2ac47] hover:text-black hover:border-transparent uppercase tracking-[0.2em] font-black transition-all rounded-lg shadow-2xl opacity-0 group-hover/canvas:opacity-100 flex items-center gap-1.5"
                                            >
                                                <RefreshCw size={10} />
                                                Switch Source
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Controls */}
                            <div className="flex flex-col h-full space-y-8">
                                <div className="flex flex-col flex-1">
                                    <label className="text-[#d2ac47] text-[10px] font-black tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                                        <Sparkles size={12} /> Neural Directives
                                    </label>
                                    <div className="relative flex-1 group">
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="Describe changes... e.g., 'Make her a red-head', 'Add a neon futuristic background', 'Change dress to silk robe'..."
                                            className="w-full h-full bg-white/[0.03] border border-[#d2ac47]/30 group-hover:border-[#d2ac47]/60 rounded-2xl p-6 text-[#F9F1D8] placeholder-[#F9F1D8]/20 font-sans font-light text-base focus:outline-none focus:border-[#d2ac47] focus:ring-1 ring-[#d2ac47]/20 transition-all resize-none shadow-[inset_0_2px_20px_rgba(0,0,0,0.8)] leading-relaxed custom-scrollbar"
                                        />
                                        <div className="absolute bottom-4 right-4 flex items-center gap-3 opacity-40">
                                            <span className="text-[8px] text-[#d2ac47] uppercase tracking-widest font-bold">AI Active</span>
                                            <div className="w-2 h-2 rounded-full bg-[#d2ac47] animate-pulse shadow-[0_0_10px_#d2ac47]"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 shrink-0">
                                    <button
                                        onClick={onClose}
                                        className="py-5 border border-[#d2ac47]/20 text-[#d2ac47]/40 hover:text-[#d2ac47] hover:border-[#d2ac47]/50 transition-all text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl bg-transparent active:scale-95"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={onSubmit}
                                        disabled={!prompt.trim() || loading}
                                        className="py-5 bg-gold-gradient text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-[0_10px_30px_rgba(210,172,71,0.2)] hover:shadow-[0_20px_50px_rgba(210,172,71,0.4)] transform hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <>
                                                <RefreshCw className="animate-spin" size={16} />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} />
                                                <span>Execute Change</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AvatarGenerator: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string>('pending');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);

    // Identity Specs
    const [gender, setGender] = useState('female');
    const [age, setAge] = useState<string>('24');
    const [nationality, setNationality] = useState('Russian');
    const [bodyType, setBodyType] = useState('fitness model');
    const [clothing, setClothing] = useState('dressed');
    const [role, setRole] = useState('Seductive Teacher');
    const [artStyle, setArtStyle] = useState('Realistic RAW');

    // Visual Sources
    const [faceImageUrl, setFaceImageUrl] = useState('');
    const [bodyRefUrl, setBodyRefUrl] = useState('');
    const [compositionUrl, setCompositionUrl] = useState('');

    // Toggles
    const [grabBody, setGrabBody] = useState(false);
    const [grabComposition, setGrabComposition] = useState(false);

    // Fine Tuning
    const [instantIdWeight, setInstantIdWeight] = useState(0.85);
    const [userPrompt, setUserPrompt] = useState('beautiful woman, detailed skin texture, cinematic lighting');

    // Advanced Controls
    const [seed, setSeed] = useState<number>(-1); // -1 = Random
    const [rawPromptMode, setRawPromptMode] = useState(false);
    const [upscale, setUpscale] = useState(false);

    // Generate or retrieve Guest ID for isolation
    const [guestId] = useState(() => {
        let id = localStorage.getItem('endless_guest_id');
        if (!id) {
            id = uuidv4();
            localStorage.setItem('endless_guest_id', id);
        }
        return id;
    });

    // Gallery State
    const [galleryItems, setGalleryItems] = useState<any[]>([]);

    // Monitoring Refs
    const controllerRef = React.useRef<AbortController | null>(null);
    const pollingInterval = React.useRef<any>(null);
    const realtimeChannel = React.useRef<any>(null);
    const lastTrackingId = React.useRef<string | null>(null);

    // Initial fetch
    useEffect(() => {
        fetchHistory();
        return () => cleanupMonitoring();
    }, []);

    // Fail-safe: If the item appears in the gallery (history), resolve loading
    useEffect(() => {
        if (loading && lastTrackingId.current) {
            const found = galleryItems.find(item => item.id === lastTrackingId.current);
            const foundUrl = found?.result_url || found?.image_url || found?.url;
            if (found && foundUrl) {
                console.log("🛡️ [FAIL-SAFE] Found matching item in gallery. Resolving loading.");
                setGeneratedImage(foundUrl);
                cleanupMonitoring();
                setLoading(false);
            }
        }
    }, [galleryItems, loading]);

    // AI Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editPrompt, setEditPrompt] = useState('');

    const fetchHistory = async () => {
        try {
            const { data, error: dbError } = await supabase
                .from('generations')
                .select('*')
                // .eq('type', 'avatar') // User requested ALL history (Videos + Photos)
                .or(`status.eq.completed,status.eq.success,status.eq.Success`)
                // .contains('metadata', { guest_id: guestId }) // REMOVED FILTER as per user request to see all history (debug mode)
                .order('created_at', { ascending: false })
                .limit(50); // Increased limit to ensure we catch the user's videos

            if (dbError) throw dbError;
            if (data) setGalleryItems(data);
        } catch (err) {
            console.error("Failed to fetch gallery history:", err);
        }
    };

    const cleanupMonitoring = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
        if (realtimeChannel.current) {
            supabase.removeChannel(realtimeChannel.current);
            realtimeChannel.current = null;
        }
    };

    const startMonitoring = (generationId: string) => {
        cleanupMonitoring();
        setLoading(true);
        setCurrentStatus('processing');
        lastTrackingId.current = generationId;

        // 1. Polling Fallback (Every 10 seconds)
        pollingInterval.current = setInterval(() => checkStatus(generationId), 10000);

        // 2. Realtime Listener
        realtimeChannel.current = supabase
            .channel(`avatar-gen-${generationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'generations',
                    filter: `id=eq.${generationId}`
                },
                (payload) => {
                    const newRecord = payload.new as any;
                    console.log("🔔 [REALTIME] Update received for ID:", generationId, "Status:", newRecord.status);

                    if (newRecord.status) {
                        setCurrentStatus(newRecord.status);
                    }

                    const finalUrl = newRecord.result_url || newRecord.image_url || newRecord.url || (newRecord.metadata?.result_url);
                    const isFinished = newRecord.status === 'completed' || newRecord.status === 'success' || newRecord.status === 'Success';

                    if (isFinished && finalUrl) {
                        console.log("🎯 [REALTIME] SUCCESS! Resolving with URL:", finalUrl);
                        setGeneratedImage(finalUrl);
                        cleanupMonitoring();
                        setLoading(false);
                        fetchHistory();
                    } else if (newRecord.status === 'failed' || newRecord.status === 'error') {
                        console.error("❌ [REALTIME] Generation reported failure:", newRecord.error_message);
                        setError(newRecord.error_message || "Generation failed on server.");
                        cleanupMonitoring();
                        setLoading(false);
                    }
                }
            )
            .subscribe();

        // Initial check
        checkStatus(generationId);
    };

    const checkStatus = async (generationId: string) => {
        try {
            const { data, error: dbError } = await supabase
                .from('generations')
                .select('*')
                .eq('id', generationId)
                .single();

            if (dbError) throw dbError;

            if (data) {
                console.log("📋 [POLLING] FULL DATA:", JSON.stringify(data, null, 2));
                console.log("📋 [POLLING] Status:", data.status, "| result_url:", data.result_url, "| image_url:", data.image_url);
                if (data.status) setCurrentStatus(data.status);

                const finalUrl = (data as any).result_url || data.image_url || data.url || (data.metadata?.result_url);
                const isFinished = data.status === 'completed' || data.status === 'success' || data.status === 'Success';

                if (isFinished && finalUrl) {
                    console.log("🚀 [POLLING] SUCCESS! Final URL found:", finalUrl);
                    setGeneratedImage(finalUrl);
                    cleanupMonitoring();
                    setLoading(false);
                    fetchHistory();
                } else if (data.status === 'failed' || data.status === 'error') {
                    console.error("❌ [POLLING] FAILURE:", data.error_message);
                    setError(data.error_message || "Generation failed.");
                    cleanupMonitoring();
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error("Status check failed:", err);
        }
    };

    const handleCancel = async () => {
        const genId = activeGenerationId || lastTrackingId.current || localStorage.getItem('active_avatar_id');

        // 1. Abort Upload/Request
        if (controllerRef.current) {
            controllerRef.current.abort();
            controllerRef.current = null;
        }

        // 2. Call N8n Cancel Webhook (Async)
        if (genId) {
            console.log("🛑 [CANCEL] Attempting to stop generation ID:", genId);
            axios.post('/api/cancel-generation', { generation_id: genId })
                .then(res => console.log("✅ [CANCEL] Webhook Response:", res.status))
                .catch(err => console.error("⚠️ [CANCEL] Webhook error:", err.message));
        } else {
            console.warn("⚠️ [CANCEL] No active generation ID found to cancel.");
        }

        // 3. Cleanup
        cleanupMonitoring();
        setLoading(false);
        setActiveGenerationId(null);
        localStorage.removeItem('active_avatar_id');
        setError('Generation stopped by user.');
    };

    const handleDownload = async () => {
        if (!generatedImage) return;

        try {
            const response = await fetch(generatedImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `infinity_avatar_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed", err);
            // Fallback if CORS or network blocks blob fetch
            window.open(generatedImage, '_blank');
        }

        // Add to Gallery
        const newItem = {
            id: Date.now(),
            type: 'photo',
            url: generatedImage,
            thumb: generatedImage,
            label: 'Identity Forged',
            privacy: 'private',
            date: 'Just now'
        };
        setGalleryItems(prev => [newItem, ...prev]);
    };

    const handleGenerate = async () => {
        if (!faceImageUrl) {
            setError("Face Image URL is required.");
            return;
        }

        if (grabBody && !bodyRefUrl) {
            setError("Body Reference is ON but empty. Please upload an image or close the slot.");
            return;
        }

        if (grabComposition && !compositionUrl) {
            setError("Background Reference is ON but empty. Please upload an image or close the slot.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Create a unique Generation ID (UUID)
            const generationId = uuidv4();

            // 2. Create an initial record in the 'generations' table
            const { error: dbError } = await supabase
                .from('generations')
                .insert([{
                    id: generationId,
                    type: 'avatar',
                    prompt: userPrompt,
                    status: 'processing',
                    image_url: null,
                    metadata: { guest_id: guestId }
                }]);

            if (dbError) {
                console.error("Database initialization failed:", dbError);
                // We proceed anyway, but warn
            }

            const payload = {
                generation_id: generationId,
                gender,
                age: Number(age) || 18, // Fallback to 18 if empty/invalid
                nationality,
                body_type: bodyType,
                clothing,
                role: role,
                art_style: artStyle,
                face_image_url: faceImageUrl,
                body_reference_image_url: (grabBody && bodyRefUrl) ? bodyRefUrl : undefined,
                composition_image_url: (grabComposition && compositionUrl) ? compositionUrl : undefined,
                // Strict Logic: Validation ensures images exist if Toggles are True
                grab_body_from_image: grabBody,
                grab_composition: grabComposition,
                instantid_weight: instantIdWeight,
                style_token: rawPromptMode ? userPrompt : `Style: ${artStyle}. Role: ${role}. Body: ${bodyType}. Clothing: ${clothing}. ${userPrompt} `,
                user_prompt: userPrompt,
                seed: seed === -1 ? Math.floor(Math.random() * 2147483647) : seed,
                upscale: upscale,
                safe_mode: 3 // Strictly 3 as requested
            };

            // Create new AbortController
            controllerRef.current = new AbortController();

            // Start monitoring for completion via Supabase BEFORE sending the request
            setActiveGenerationId(generationId);
            localStorage.setItem('active_avatar_id', generationId);
            startMonitoring(generationId);

            // Send to webhook
            console.log("📡 [WEBHOOK] Sending request to:", WEBHOOK_URL);
            console.log("📦 [WEBHOOK] Payload:", JSON.stringify(payload, null, 2));

            try {
                const response = await axios.post(WEBHOOK_URL, payload, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 60000,
                    signal: controllerRef.current.signal
                });
                console.log("✅ [WEBHOOK] Response Status:", response.status);
            } catch (postErr: any) {
                // If it's a timeout, we ignore it because monitoring is already running.
                // The backend (n8n) will continue processing and update Supabase.
                if (postErr.code === 'ECONNABORTED' || postErr.message?.includes('timeout')) {
                    console.log("⏱️ POST timed out, but monitoring is active. Waiting for Supabase update...");
                    return; // Stay in loading state, monitoring will handle resolution
                } else if (axios.isCancel(postErr) || postErr.name === 'CanceledError') {
                    throw postErr; // Re-throw to be handled by the outer catch
                } else {
                    console.warn("⚠️ Webhook response error, but monitoring continues. If status doesn't change, check backend.", postErr);
                    // We don't throw here to allow monitoring to catch potential success even if webhook response had issues
                    return;
                }
            }

        } catch (err: any) {
            // Check if the request was canceled by the user
            if (axios.isCancel(err) || err.name === 'CanceledError') {
                console.log('Generation canceled by user');
                setError('Generation stopped by user.');
                return;
            }

            console.error("Generation Error:", err);
            let errMsg = "Failed to generate avatar. Please check inputs and try again.";

            // Try to read error blob as text
            if (err.response && err.response.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    if (json.message) errMsg = json.message;
                } catch (e) { /* ignore */ }
            } else if (err.request) {
                errMsg = 'No response received from server. Check if the backend is active.';
            }

            setError(errMsg);
            setLoading(false);
        }
    };

    return (
        <div className="w-full relative animate-fade-in pb-20">


            {/* Header Removed for Redesign 2026 */}

            {/* Switched to Flexbox for Mobile Stability, Grid for Desktop - Match Video/Premium Style */}
            <div className="flex flex-col xl:grid xl:grid-cols-12 gap-8 items-stretch">

                {/* Left Banner - Restored High-Res & Art Deco Corners to match Video Generator exactly */}
                {/* Left Panel: Showcase Gallery (Vertical List) */}
                <div className="order-2 xl:order-1 xl:col-span-3 xl:h-[1100px] overflow-y-auto custom-scrollbar pr-2">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex items-center gap-2 text-[#d2ac47]">
                            <Sparkles size={16} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Source Frames</span>
                        </div>

                        {/* Load & Edit Button (User Request) */}
                        <div className="relative">
                            <button
                                onClick={() => document.getElementById('sidebar-upload-trigger')?.click()}
                                className="px-3 py-1.5 border border-[#d2ac47] text-[#d2ac47] rounded text-[9px] font-bold uppercase tracking-wider hover:bg-[#d2ac47] hover:text-black transition-all flex items-center gap-2"
                            >
                                <Upload size={10} />
                                <span>Load & Edit</span>
                            </button>
                            <input
                                id="sidebar-upload-trigger"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        // Quick Upload using Supabase
                                        const fileExt = file.name.split('.').pop();
                                        const uniqueName = `edit_source_${Date.now()}.${fileExt}`;
                                        try {
                                            const { error: upErr } = await supabase.storage.from('generations').upload(uniqueName, file);
                                            if (upErr) throw upErr;
                                            const { data: { publicUrl } } = supabase.storage.from('generations').getPublicUrl(uniqueName);

                                            setGeneratedImage(publicUrl);
                                            setIsEditModalOpen(true);
                                        } catch (err) {
                                            console.error("Upload failed", err);
                                            alert("Failed to load image for editing.");
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {galleryItems
                            .filter(item => {
                                const url = item.result_url || item.video_url || item.url || '';
                                return !url.toLowerCase().endsWith('.mp4') && item.type !== 'video';
                            })
                            .map((item) => (
                                <div
                                    key={item.id}
                                    className="group/item relative bg-[#080808] border border-[#d2ac47]/20 rounded-xl overflow-hidden aspect-[9/16] shrink-0 cursor-pointer transition-all hover:border-[#d2ac47] hover:shadow-[0_0_20px_rgba(210,172,71,0.2)]"
                                    onClick={() => {
                                        setGeneratedImage(item.result_url || item.image_url || item.url);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    <img
                                        src={item.result_url || item.image_url || item.url}
                                        alt={item.label}
                                        className="w-full h-full object-cover transition-all duration-700 group-hover/item:scale-110"
                                    />

                                    {/* Hover Overlay - Premium "Inject Frame" Button */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 block">
                                        <div className="w-full py-2 bg-[#d2ac47] text-black text-[8px] font-black uppercase tracking-[0.2em] text-center rounded-lg transform translate-y-4 group-hover/item:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-1 shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                                            <span>Inject Frame</span>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                                                <path d="M5 12h14" />
                                                <path d="M12 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Selection Indicator */}
                                    {generatedImage === (item.result_url || item.image_url || item.url) && (
                                        <div className="absolute inset-0 border-2 border-[#d2ac47] rounded-xl pointer-events-none box-border shadow-[inset_0_0_20px_rgba(210,172,71,0.5)]"></div>
                                    )}
                                </div>
                            ))}
                    </div>

                    {galleryItems.filter(item => {
                        const url = item.result_url || item.video_url || item.url || '';
                        return !url.toLowerCase().endsWith('.mp4') && item.type !== 'video';
                    }).length === 0 && (
                            <div className="text-[#d2ac47]/30 text-xs text-center py-10 font-mono text-[10px] uppercase tracking-widest border border-dashed border-[#d2ac47]/10 rounded-xl mt-4">
                                NO SOURCE IMAGES
                            </div>
                        )}
                </div>

                {/* Center COLUMN: Canvas / Preview (Span 6) */}
                <div className="order-1 xl:order-2 w-full xl:col-span-6 space-y-6 relative z-20">

                    {/* NEW: Compact Identity Toolbar (Above Canvas) */}
                    <div className="bg-[#121212]/90 backdrop-blur-md border border-[#d2ac47]/20 rounded-xl px-2 py-1 flex flex-col md:flex-row gap-2 items-center justify-between shadow-lg relative z-[70]">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 w-full">
                            <CustomSelect
                                label="Gender"
                                value={gender}
                                onChange={setGender}
                                options={[{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }, { label: 'Trans', value: 'transgender' }]}
                            />
                            <div className="group relative">
                                <label className="text-[#d2ac47] text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5 block text-center truncate">Age</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="w-full bg-[#0a0a0a] border border-[#d2ac47]/30 text-[#F9F1D8] p-2 md:p-2.5 text-[10px] md:text-xs text-center rounded-lg focus:border-[#d2ac47] outline-none font-bold tracking-widest uppercase transition-colors hover:border-[#d2ac47]/60"
                                    value={age}
                                    placeholder="24"
                                    onChange={(e) => { if (e.target.value === '' || /^\d+$/.test(e.target.value)) setAge(e.target.value); }}
                                    onBlur={() => { if (age && Number(age) < 18) setAge('18'); if (Number(age) > 90) setAge('90'); }}
                                />
                            </div>
                            <CustomSelect
                                label="Nation"
                                value={nationality}
                                onChange={setNationality}
                                options={[
                                    { label: 'Any', value: '' },
                                    { label: 'Russian', value: 'Russian' },
                                    { label: 'European', value: 'European' },
                                    { label: 'Asian', value: 'Asian' },
                                    { label: 'Latina', value: 'Latina' },
                                    { label: 'Afro', value: 'Afro' },
                                    { label: 'Indian', value: 'Indian' },
                                    { label: 'Middle Eastern', value: 'Middle Eastern' },
                                    { label: 'Japanese', value: 'Japanese' }
                                ]}
                            />
                            <CustomSelect
                                label="Clothing"
                                value={clothing}
                                onChange={setClothing}
                                options={[{ label: 'Dressed', value: 'dressed' }, { label: 'Semi-Dressed', value: 'semi-dressed' }, { label: 'Nude', value: 'nude' }]}
                            />
                            <CustomSelect
                                label="Role"
                                value={role}
                                onChange={setRole}
                                options={[
                                    { label: 'Any', value: '' },
                                    { label: 'Seductive Teacher', value: 'Seductive Teacher' },
                                    { label: 'Submissive Maid', value: 'Submissive Maid' },
                                    { label: 'Insatiable Flight Attendant', value: 'Insatiable Flight Attendant' },
                                    { label: 'Strict Boss / CEO', value: 'Strict Boss / CEO' },
                                    { label: 'Naughty Nun', value: 'Naughty Nun' },
                                    { label: 'Gentle Yoga Instructor', value: 'Gentle Yoga Instructor' },
                                    { label: 'BDSM Gothic diva', value: 'BDSM Gothic diva' },
                                    { label: 'sex mashine Cyberpunk rebel', value: 'sex mashine Cyberpunk rebel' },
                                    { label: 'The Insatiable Secretary', value: 'The Insatiable Secretary' },
                                    { label: 'sexual outspoken tik tok blogger', value: 'sexual outspoken tik tok blogger' }
                                ]}
                            />
                        </div>
                    </div>
                    {/* Visual Source (Moved from Input Block) - Acts as "Canvas" if editing */}

                    {/* Main Output / Active Workspace */}
                    <div className="bg-[#050505] border border-[#d2ac47]/20 rounded-3xl relative flex items-center justify-center overflow-hidden shadow-2xl group flex-col w-full transition-all duration-700 h-[500px] md:h-[580px] shrink-0 mx-2 md:mx-0">
                        {generatedImage ? (
                            <img src={generatedImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 blur-3xl scale-150 saturate-150" />
                        ) : (
                            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#050505_100%)] opacity-50"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/20"></div>

                        {/* Content Overlay */}
                        {generatedImage ? (
                            <>
                                <img id="generated-avatar-image" src={generatedImage} alt="Generated Avatar" className="absolute inset-0 z-10 w-full h-full object-contain drop-shadow-2xl shadow-black" />

                                {/* Top Actions */}
                                <div className="absolute top-4 right-4 z-50 flex gap-2">
                                    <button
                                        onClick={() => {
                                            const img = document.getElementById('generated-avatar-image');
                                            if (img) {
                                                if (!document.fullscreenElement) {
                                                    img.requestFullscreen().catch(err => console.error(err));
                                                } else {
                                                    document.exitFullscreen();
                                                }
                                            }
                                        }}
                                        className="p-2 bg-black/40 backdrop-blur-md border border-[#d2ac47]/30 text-[#d2ac47]/70 rounded-full hover:bg-[#d2ac47] hover:text-black hover:border-[#d2ac47] transition-all duration-300 group"
                                        title="Full Screen"
                                    >
                                        <Maximize2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setGeneratedImage(null)}
                                        className="p-2 bg-black/40 backdrop-blur-md border border-red-500/30 text-red-500/70 rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 group"
                                        title="Clear Image"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Bottom Actions - Premium Redesign (Airy & Compact) */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-3 w-auto whitespace-nowrap">
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="px-5 py-2.5 bg-black/40 backdrop-blur-md border border-[#d2ac47]/30 rounded-lg hover:bg-[#d2ac47]/10 hover:border-[#d2ac47] hover:text-[#d2ac47] text-[#d2ac47]/80 transition-all flex items-center gap-2 group shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                                    >
                                        <Wand2 size={14} className="group-hover:rotate-12 transition-transform" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Edit / Variations</span>
                                    </button>

                                    <button
                                        onClick={handleDownload}
                                        className="px-5 py-2.5 bg-[#d2ac47]/90 hover:bg-[#d2ac47] text-black rounded-lg hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(210,172,71,0.2)] hover:shadow-[0_0_25px_rgba(210,172,71,0.4)] backdrop-blur-sm"
                                    >
                                        <Download size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Download</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                {/* Brand Header */}
                                <div className="mb-8 text-center transform -translate-y-4">
                                    <div className="flex items-center justify-center gap-4 mb-3 opacity-80">
                                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#d2ac47]/50"></div>
                                        <span className="text-[#d2ac47] text-[10px] uppercase tracking-[0.4em] font-bold animate-pulse">Identity Forge</span>
                                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#d2ac47]/50"></div>
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-serif text-[#F9F1D8] tracking-wide drop-shadow-[0_0_25px_rgba(210,172,71,0.2)] mb-4">
                                        Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d2ac47] to-[#F9F1D8] italic font-light">Avatar</span>
                                    </h1>
                                    <p className="text-[#d2ac47]/40 text-[9px] uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed border-t border-[#d2ac47]/10 pt-4 mt-2">
                                        The ultimate forge for high-fidelity <br /> personal identities and artistic portraits.
                                    </p>
                                </div>

                                {/* Active Workspace Indicator - Larger & Centered */}
                                <div className="flex flex-col items-center opacity-60 mt-4">
                                    <Camera size={42} className="text-[#d2ac47]/30 mb-4 animate-pulse" />
                                    <span className="text-[#d2ac47]/40 text-[10px] font-bold uppercase tracking-[0.3em] text-center">Active Workspace</span>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                                <AvatarLogger status={currentStatus} error={error} />
                            </div>
                        )}
                    </div>

                    {/* Generate Button Area (Floating at bottom of center) */}
                    <div className="flex gap-4">
                        {loading && (
                            <button
                                onClick={handleCancel}
                                className="px-6 py-5 border border-red-500/30 bg-[#1a1a1a] text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] group/cancel"
                            >
                                <XCircle size={20} className="transition-transform duration-300 group-hover/cancel:rotate-90" />
                            </button>
                        )}
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className={`flex-1 font-bold uppercase tracking-[0.3em] py-5 rounded-xl shadow-[0_0_20px_rgba(210,172,71,0.4)] transition-all flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(210,172,71,0.6)] ${loading ? 'bg-[#d2ac47] text-black opacity-90 cursor-wait shadow-[0_0_10px_rgba(210,172,71,0.3)]' : 'bg-gold-gradient text-black'}`}
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                            {loading ? "Forging Identity..." : "Generate Avatar"}
                        </button>
                    </div>

                    {/* MOVED: Identity Matrix / Settings (Now below Canvas) */}
                    <div className="grid grid-cols-1 gap-4">


                        {/* 2. Visual Sources - Art Deco Panel */}
                        <div className="bg-[#121212] border border-[#d2ac47]/20 rounded-3xl p-5 md:p-8 relative shadow-2xl transition-all hover:border-[#d2ac47]/40 mx-2 md:mx-0">
                            <div className="absolute top-0 left-0 px-4 md:px-6 py-2 bg-[#d2ac47] text-black text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase rounded-tl-3xl rounded-br-2xl shadow-lg">
                                Visual Source
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                                {/* 1. Main Face Input */}
                                <div className="border rounded-2xl p-4 md:p-6 border-[#d2ac47] bg-[#0a0a0a] flex flex-col group overflow-hidden hover:border-[#d2ac47]/60 h-[380px] md:h-[480px]">
                                    <div className="flex items-center gap-3 mb-4 h-8 shrink-0">
                                        <div className="w-8 h-8 border border-[#d2ac47] rounded-full flex items-center justify-center bg-[#d2ac47]/10 text-[#d2ac47]">
                                            <User size={16} />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#d2ac47]">
                                            Face Reference
                                        </span>
                                    </div>
                                    {/* Drag & Drop Zone */}
                                    <div className="flex-1 relative overflow-hidden rounded-xl mb-3 bg-black/40">
                                        <ImageUploadZone
                                            onImageUpload={({ url }) => {
                                                setFaceImageUrl(url);
                                                setError(null);
                                            }}
                                            currentUrl={faceImageUrl}
                                            placeholder="Face Photo"
                                            className="h-full w-full"
                                        />
                                    </div>
                                    {/* Likeness Slider - Centered vertically for better balance */}
                                    <div className="h-16 shrink-0 flex flex-col justify-center">
                                        <div className="flex justify-between text-[#d2ac47] text-[9px] font-bold tracking-[0.2em] uppercase mb-1">
                                            <span>Likeness Strength</span>
                                            <span>{instantIdWeight}</span>
                                        </div>
                                        <input type="range" min="0" max="1" step="0.05" value={instantIdWeight} onChange={(e) => setInstantIdWeight(Number(e.target.value))}
                                            className="w-full h-1 bg-[#d2ac47]/20 rounded-lg appearance-none cursor-pointer mt-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#d2ac47] [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-110 transition-all" />
                                    </div>
                                </div>

                                {/* 2. Body Reference Toggle */}
                                <div className={`border rounded-2xl p-6 group/body flex flex-col h-[480px] transition-all duration-500 ${error?.includes('Body') ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] bg-red-950/10' : (grabBody && !bodyRefUrl) ? 'border-solid border-red-500/50 bg-red-950/5' : grabBody ? 'border-solid border-[#d2ac47]/50 bg-[#0a0a0a]' : 'border-dashed border-[#d2ac47]/30 bg-transparent hover:border-[#d2ac47]/50 hover:bg-[#d2ac47]/5'} `}>

                                    {/* Header Area: Fixed Height */}
                                    <div className="h-8 mb-4 flex items-center gap-3 shrink-0">
                                        {grabBody ? (
                                            <>
                                                <button
                                                    className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 hover:rotate-90 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 hover:border-red-500 shrink-0 aspect-square shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-in slide-in-from-left-6 fade-in duration-500"
                                                    onClick={() => setGrabBody(false)}
                                                    title="Close Slot"
                                                >
                                                    <XCircle size={20} strokeWidth={2} />
                                                </button>
                                                <div className="flex flex-col justify-center leading-none animate-in slide-in-from-left-8 fade-in duration-700">
                                                    <span className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5 ${!bodyRefUrl ? 'text-red-500' : 'text-[#d2ac47]'}`}>Body Reference</span>
                                                    <span className={`text-[8px] uppercase tracking-wider ${!bodyRefUrl ? 'text-red-500/40' : 'text-[#d2ac47]/40'}`}>(CLOSE IF UNUSED)</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full text-center">
                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#d2ac47]/40">BODY REFERENCE</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Interaction Area */}
                                    <div className="flex-1 relative rounded-xl overflow-hidden mb-3 bg-black/20">
                                        {grabBody ? (
                                            <div className="animate-fade-in w-full h-full">
                                                <ImageUploadZone
                                                    onImageUpload={({ url }) => {
                                                        setBodyRefUrl(url);
                                                        setError(null);
                                                    }}
                                                    currentUrl={bodyRefUrl}
                                                    placeholder="Body Reference Image"
                                                    className="h-full w-full"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:bg-[#d2ac47]/5" onClick={() => setGrabBody(true)}>
                                                <div className="w-16 h-16 rounded-full border border-[#d2ac47]/20 text-[#d2ac47]/30 flex items-center justify-center mb-3 group-hover/body:border-[#d2ac47]/60 group-hover/body:text-[#d2ac47] transition-all">
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M7 5 C7 8 9 11 10.5 12 C12 13 8 18 7 19" />
                                                        <path d="M17 5 C17 8 15 11 13.5 12 C12 13 16 18 17 19" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#d2ac47]/40 text-center px-4">Click to Upload Body Reference</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* OR Block */}
                                    <div className="flex items-center gap-3 h-6 shrink-0 opacity-60">
                                        <div className="h-[1px] flex-1 bg-[#d2ac47]/30"></div>
                                        <span className="text-[#d2ac47] text-[8px] font-bold tracking-[0.2em]">OR</span>
                                        <div className="h-[1px] flex-1 bg-[#d2ac47]/30"></div>
                                    </div>

                                    {/* Dropdown Controls - Centered vertically */}
                                    <div className="h-16 flex flex-col justify-center shrink-0">
                                        <CustomSelect
                                            label="Body Structure"
                                            value={bodyType}
                                            onChange={(val) => setBodyType(val)}
                                            disabled={grabBody}
                                            centerLabel={true}
                                            options={[
                                                { label: 'AI Decide / Empty', value: '' },
                                                { label: 'Fitness Model', value: 'fitness model' },
                                                { label: 'Thin / Model', value: 'thin' },
                                                { label: 'Athletic', value: 'athletic' },
                                                { label: 'Curvy', value: 'curvy' },
                                                { label: 'Thick', value: 'thick' },
                                                { label: 'Chubby', value: 'chubby' },
                                                { label: 'Obese / BBW', value: 'obese' },
                                                { label: 'Muscular', value: 'muscular' }
                                            ]}
                                        />
                                    </div>
                                </div>

                                {/* 3. Composition Reference Toggle */}
                                <div className={`border rounded-2xl p-6 group/comp flex flex-col h-[480px] transition-all duration-500 ${error?.includes('Background') ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] bg-red-950/10' : (grabComposition && !compositionUrl) ? 'border-solid border-red-500/50 bg-[#0a0a0a]' : grabComposition ? 'border-solid border-[#d2ac47]/50 bg-[#0a0a0a]' : 'border-dashed border-[#d2ac47]/30 bg-transparent hover:border-[#d2ac47]/50 hover:bg-[#d2ac47]/5'} `}>

                                    {/* Structural Alignment: Header Spacer or Real Header */}
                                    <div className="h-8 mb-4 flex items-center gap-3 shrink-0">
                                        {grabComposition ? (
                                            <>
                                                <button
                                                    className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 hover:rotate-90 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 hover:border-red-500 shrink-0 aspect-square shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-in slide-in-from-left-6 fade-in duration-500"
                                                    onClick={() => setGrabComposition(false)}
                                                    title="Close Slot"
                                                >
                                                    <XCircle size={20} strokeWidth={2} />
                                                </button>
                                                <div className="flex flex-col leading-none animate-in slide-in-from-left-8 fade-in duration-700">
                                                    <span className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5 ${!compositionUrl ? 'text-red-500' : 'text-[#d2ac47]'}`}>Background Reference</span>
                                                    <span className={`text-[8px] uppercase tracking-wider ${!compositionUrl ? 'text-red-500/40' : 'text-[#d2ac47]/40'}`}>(CLOSE IF UNUSED)</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full text-center">
                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#d2ac47]/40">BACKGROUND REFERENCE</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 relative overflow-hidden rounded-xl mb-3 bg-black/20 focus-within:ring-1 ring-[#d2ac47]/30">
                                        {grabComposition ? (
                                            <div className="animate-fade-in w-full h-full">
                                                <ImageUploadZone
                                                    onImageUpload={({ url }) => {
                                                        setCompositionUrl(url);
                                                        setError(null);
                                                    }}
                                                    currentUrl={compositionUrl}
                                                    placeholder="Background Reference Image"
                                                    className="h-full w-full"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:bg-[#d2ac47]/5" onClick={() => setGrabComposition(true)}>
                                                <div className="w-16 h-16 rounded-full border border-[#d2ac47]/20 text-[#d2ac47]/30 flex items-center justify-center mb-3 group-hover/comp:border-[#d2ac47]/60 group-hover/comp:text-[#d2ac47] transition-all">
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                        <path d="M3 15C3 15 8 13 11 15C14 17 18 14 21 16" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#d2ac47]/40 text-center px-4">Click to Upload Background Reference</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Placeholder to maintain height consistency with the slider column */}
                                    <div className="h-16 shrink-0 flex items-center justify-center">
                                        <div className="w-8 h-[1px] bg-[#d2ac47]/10"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Style & Prompt - Art Deco Panel */}


                        {/* Error Message Display (Moved Up for Visibility) */}
                        {error && <div className="text-red-400 text-center font-serif italic bg-red-950/30 p-4 border border-red-900/50 rounded-xl animate-pulse mb-4">{error}</div>}
                    </div>
                </div>
                {/* Right Panel: Gallery + Fine Tuning (Stacked) */}
                <div className="order-3 xl:order-3 w-full xl:col-span-3 h-auto xl:h-[1100px] flex flex-col gap-4">

                    {/* 1. Gallery (Styled like VideoGenerator) */}
                    <div className="order-2 xl:order-1 flex-1 bg-[#0a0a0a] border border-[#d2ac47]/20 rounded-3xl p-2 shadow-2xl relative flex flex-col overflow-hidden mx-2 md:mx-0 min-h-0">
                        <div className="flex items-center justify-between h-10 px-0">
                            <span className="text-[#d2ac47] text-[10px] font-bold uppercase tracking-[0.2em] pl-4">History</span>
                        </div>
                        <UserGallery
                            newItems={galleryItems}
                            onRefresh={fetchHistory}
                            onSelect={(item) => {
                                const url = item.result_url || item.video_url || item.url;
                                if (url) setGeneratedImage(url);
                            }}
                            onDelete={async (id) => {
                                const { error } = await supabase.from('generations').delete().eq('id', id);
                                if (!error) fetchHistory();
                            }}
                        />
                    </div>

                    {/* 2. Fine Tuning Block (Moved Here - Compacted) */}
                    <div className="order-1 xl:order-2 bg-[#121212] border border-[#d2ac47]/20 rounded-3xl p-5 relative shadow-2xl transition-all hover:border-[#d2ac47]/40 shrink-0">
                        <div className="absolute top-0 left-0 px-4 py-1.5 bg-[#d2ac47] text-black text-[9px] font-bold tracking-[0.2em] uppercase rounded-tl-3xl rounded-br-2xl shadow-lg">
                            Fine Tuning
                        </div>

                        <div className="mt-4 space-y-4">
                            {/* Art Style */}
                            <CustomSelect
                                label="Art Style"
                                value={artStyle}
                                onChange={(val) => setArtStyle(val)}
                                options={[
                                    { label: 'AI Decide / Empty', value: '' },
                                    { label: 'Realistic RAW', value: 'Realistic RAW' },
                                    { label: 'Vintage Pin-Up', value: 'Vintage Pin-Up' },
                                    { label: 'Private Polaroid', value: 'Private Polaroid' },
                                    { label: 'Analogue Film', value: 'Analogue Film' },
                                    { label: 'Anime / Manga', value: 'Anime / Manga' },
                                    { label: 'Hentai / NSFW', value: 'Hentai / NSFW' },
                                    { label: 'Fashion Editorial', value: 'Fashion Editorial' },
                                    { label: 'Gothic Noir', value: 'Gothic Noir' }
                                ]}
                            />

                            <div>
                                <label className="text-[#d2ac47] text-[9px] font-bold tracking-[0.2em] uppercase mb-1 block">Prompt Details</label>
                                <textarea value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-[#d2ac47]/30 text-[#F9F1D8] p-3 text-xs h-20 focus:outline-none focus:border-[#d2ac47] rounded-xl shadow-inner resize-none"
                                    placeholder="Describe specific details..." />

                                <div className="flex flex-col gap-2 mt-2">
                                    <div className="w-full flex items-center gap-2 bg-[#0a0a0a] border border-[#d2ac47]/20 p-2 rounded-xl">
                                        <span className="text-[#d2ac47] text-[9px] uppercase tracking-wider whitespace-nowrap">Seed:</span>
                                        <input
                                            type="number"
                                            value={seed === -1 ? '' : seed}
                                            placeholder="Random"
                                            onChange={(e) => setSeed(e.target.value === '' ? -1 : parseInt(e.target.value))}
                                            className="bg-transparent text-[#F9F1D8] text-xs font-mono w-full focus:outline-none placeholder-[#d2ac47]/30"
                                        />
                                        <button
                                            onClick={() => setSeed(Math.floor(Math.random() * 2147483647))}
                                            className="text-[#d2ac47]/50 hover:text-[#d2ac47] transition-colors"
                                            title="Spin Random Seed"
                                        >
                                            <RefreshCw size={14} className="active:animate-spin" />
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setRawPromptMode(!rawPromptMode)}
                                            className={`flex-1 flex items-center justify-center gap-1 py-2 border transition-all rounded-xl ${rawPromptMode ? 'bg-[#d2ac47] border-[#d2ac47] text-black' : 'bg-transparent border-[#d2ac47]/30 text-[#d2ac47]/60 hover:text-[#d2ac47] hover:border-[#d2ac47]'}`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${rawPromptMode ? 'bg-black' : 'bg-[#d2ac47]/50'}`}></div>
                                            <span className="text-[8px] uppercase tracking-widest font-bold">Raw</span>
                                        </button>
                                        <button
                                            onClick={() => setUpscale(!upscale)}
                                            className={`flex-1 flex items-center justify-center gap-1 py-2 border transition-all rounded-xl ${upscale ? 'bg-[#d2ac47] border-[#d2ac47] text-black' : 'bg-transparent border-[#d2ac47]/30 text-[#d2ac47]/60 hover:text-[#d2ac47] hover:border-[#d2ac47]'}`}
                                        >
                                            <Sparkles size={12} className={upscale ? 'text-black' : ''} />
                                            <span className="text-[8px] uppercase tracking-widest font-bold">Upscale</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div > {/* End of Main Grid */}



            < EditPhotoModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={async () => {
                    if (!editPrompt.trim()) return;

                    setIsEditModalOpen(false);
                    setLoading(true);

                    try {
                        const payload = {
                            gender: "female", // Default for now
                            clothing: "edit", // This triggers your Switch in n8n
                            face_image_url: generatedImage, // The image we are editing
                            user_prompt: editPrompt,
                            instantid_weight: 0.85,
                            style_token: "realistic",
                            parent_gen_id: null // We'll need to fetch the real ID if it's a gallery image
                        };

                        const response = await fetch('https://n8n.develotex.io/webhook/Flux_Image_Generator_Advanced_Upscl_3+SB', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        if (!response.ok) throw new Error('Failed to start edit workflow via Main Hook');

                        // Note: n8n will update the DB, and our Supabase subscription in App.tsx 
                        // will automatically detect the new image and update the UI.

                    } catch (error) {
                        console.error("Edit Error:", error);
                    } finally {
                        setLoading(false);
                    }
                }}
                prompt={editPrompt}
                setPrompt={setEditPrompt}
                loading={loading}
                originalImage={generatedImage}
                onUpload={(url) => setGeneratedImage(url)}
            />

            < style > {`
                @keyframes shine {
                    0% { transform: translateX(-100%) skewX(-45deg); opacity: 0; }
                    20% { opacity: 0.5; }
                    50% { transform: translateX(100%) skewX(-45deg); opacity: 0.1; }
                    100% { transform: translateX(100%) skewX(-45deg); opacity: 0; }
                }

                @keyframes spinY {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(210, 172, 71, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(210, 172, 71, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(210, 172, 71, 0.4);
                }
            `}</style >
        </div >
    );
};

export default AvatarGenerator;

