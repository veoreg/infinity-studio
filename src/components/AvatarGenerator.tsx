import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, Download, RefreshCw, User, Sparkles, XCircle, ShieldCheck } from "lucide-react";
import GamificationDashboard from './GamificationDashboard';
import UserGallery from './UserGallery';
import ImageUploadZone from './ImageUploadZone';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Webhook URL - Direct n8n endpoint for Avatar Generation
const WEBHOOK_URL = "https://n8n.develotex.io:443/webhook-test/Flux_Image_Generator_Advanced_Upscl_3+SB";

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
            <label className={`text-[#d2ac47] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 block ${centerLabel ? 'text-center' : ''}`}>{label}</label>
            <div
                className={`w-full bg-[#0a0a0a] border ${isOpen ? 'border-[#d2ac47]' : 'border-[#d2ac47]/30'} text-[#F9F1D8] p-3 rounded-xl flex justify-between items-center transition-all 
                ${disabled ? 'opacity-50 cursor-not-allowed border-[#d2ac47]/10' : 'cursor-pointer hover:border-[#d2ac47]/60'}
                `}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className="truncate text-xs font-bold tracking-widest uppercase">{options.find(o => o.value == value)?.label || value}</span>
                <span className="text-[#d2ac47] text-[10px] transition-transform duration-300 transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </div>

            {/* Dropdown Options - Absolute positioned with high Z-index */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full bg-[#050505] border border-[#d2ac47] z-[100] shadow-[0_10px_40px_rgba(0,0,0,0.9)] animate-fade-in-down mt-2 rounded-xl overflow-hidden">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            className={`p-2 text-xs cursor-pointer transition-all border-b border-[#d2ac47]/10 last:border-0 uppercase tracking-wider
                                ${opt.value == value
                                    ? 'bg-[#d2ac47] text-black font-bold shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]'
                                    : 'text-[#e0e0e0] hover:bg-[#d2ac47]/10 hover:text-[#fbeea4] hover:pl-2'
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
            { msg: "Scanner: Mapping facial structure...", delay: 2000 },
            { msg: "Identity: Preserving unique features...", delay: 6000 },
            { msg: "Composition: Aligning pose and body...", delay: 12000 },
            { msg: "Detailing: Generating realistic skin...", delay: 18000 },
            { msg: "Lighting: Ray-tracing illumination...", delay: 32000 },
            { msg: "Polishing: Blending visual elements...", delay: 42000 },
            { msg: "Studio: Developing final photograph...", delay: 48000 }
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
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 animate-fade-in drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)]">
            <RefreshCw className={`w-12 h-12 text-[#d2ac47] ${status !== 'failed' ? 'animate-spin' : ''}`} />
            <div className={`font-mono ${error ? 'text-red-500' : 'text-[#d2ac47]'} text-xs uppercase tracking-widest font-bold`}>
                {error ? `[ERROR] ${error}` : `> ${log}`}
            </div>
            {/* Progress Bar Simulation */}
            {!error && (
                <div className="w-48 h-1 bg-[#d2ac47]/20 rounded-full overflow-hidden mt-4 bg-black/40 backdrop-blur-sm">
                    <div
                        className={`h-full bg-[#d2ac47] ${status === 'queued' ? 'opacity-30 animated-pulse w-full' : ''}`}
                        style={{
                            width: status === 'queued' ? '100%' : '0%',
                            animation: (status === 'processing' || status === 'pending') ? 'growWidth 60s linear forwards' : 'none'
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

const AvatarGenerator: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string>('pending');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    // Initial fetch
    useEffect(() => {
        fetchHistory();
        return () => cleanupMonitoring();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data, error: dbError } = await supabase
                .from('generations')
                .select('*')
                .eq('type', 'avatar')
                .or(`status.eq.completed,status.eq.success,status.eq.Success`)
                .contains('metadata', { guest_id: guestId })
                .order('created_at', { ascending: false })
                .limit(10);

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
                    console.log("🔔 [REALTIME] Update received:", newRecord.status);

                    if (newRecord.status) {
                        setCurrentStatus(newRecord.status);
                    }

                    const finalUrl = newRecord.result_url || newRecord.video_url || newRecord.image_url;
                    if ((newRecord.status === 'completed' || newRecord.status === 'success' || newRecord.status === 'Success') && finalUrl) {
                        console.log("🎯 [REALTIME] Found final URL:", finalUrl);
                        setGeneratedImage(finalUrl);
                        setActiveItem(newRecord);
                        cleanupMonitoring();
                        setLoading(false);
                        fetchHistory();
                    } else if (newRecord.status === 'failed' || newRecord.status === 'error') {
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
                if (data.status) setCurrentStatus(data.status);

                const finalUrl = (data as any).result_url || data.video_url || data.image_url;
                const isFinished = data.status === 'completed' || data.status === 'success' || data.status === 'Success';

                if (isFinished && finalUrl) {
                    setGeneratedImage(finalUrl);
                    setActiveItem(data);
                    cleanupMonitoring();
                    setLoading(false);
                    fetchHistory();
                } else if (data.status === 'failed' || data.status === 'error') {
                    setError(data.error_message || "Generation failed.");
                    cleanupMonitoring();
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error("Status check failed:", err);
        }
    };

    const handleCancel = () => {
        if (controllerRef.current) {
            controllerRef.current.abort();
            controllerRef.current = null;
            setLoading(false);
            setError('Generation stopped by user.');
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;

        // Trigger Download
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `infinity_avatar_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

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

            // Send to webhook (don't wait for blob anymore)
            await axios.post(WEBHOOK_URL, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
                signal: controllerRef.current.signal
            });

            // Start monitoring for completion
            startMonitoring(generationId);

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full relative animate-fade-in pb-20">


            {/* Header */}
            <div className="text-center mb-12 relative z-10">
                <div className="inline-flex items-center gap-4 mb-4">
                    <div className="h-[1px] w-12 bg-[#d2ac47]"></div>
                    <span className="text-[#d2ac47] text-[10px] font-bold tracking-[0.4em] uppercase">Identity Forge</span>
                    <div className="h-[1px] w-12 bg-[#d2ac47]"></div>
                </div>
                <h2 className="text-4xl md:text-6xl font-serif text-[#F9F1D8] mb-4 drop-shadow-[0_0_15px_rgba(210,172,71,0.2)]">
                    Create Your <span className="text-gold-luxury italic">Avatar</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* LEFT COLUMN: Controls */}
                <div className="lg:col-span-8 space-y-8 relative z-10">

                    {/* 1. Identity Matrix - Art Deco Panel */}
                    <div className="bg-[#121212] border border-[#d2ac47]/20 rounded-3xl p-8 relative shadow-2xl group transition-all hover:border-[#d2ac47]/40">
                        <div className="absolute top-0 left-0 px-6 py-2 bg-[#d2ac47] text-black text-[10px] font-bold tracking-[0.2em] uppercase rounded-tl-3xl rounded-br-2xl shadow-lg">
                            Identity Matrix
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="space-y-2">
                                <CustomSelect
                                    label="Gender"
                                    value={gender}
                                    onChange={(val) => setGender(val)}
                                    options={[
                                        { label: 'Female', value: 'female' },
                                        { label: 'Male', value: 'male' },
                                        { label: 'Transgender', value: 'transgender' }
                                    ]}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-[#d2ac47] text-[10px] font-bold tracking-[0.2em] uppercase">Age</label>
                                </div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={age}
                                    placeholder="18-80"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Allow empty or digits only. NO casting to Number() here.
                                        if (val === '' || /^\d+$/.test(val)) {
                                            setAge(val);
                                        }
                                    }}
                                    onBlur={() => {
                                        // Optional: constrain range on blur if needed, or leave for generation validation
                                        if (age !== '' && Number(age) < 18) setAge('18');
                                        if (Number(age) > 90) setAge('90');
                                    }}
                                    className="w-full bg-[#0a0a0a] border border-[#d2ac47]/30 text-[#F9F1D8] p-3 focus:outline-none focus:border-[#d2ac47] rounded-xl font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <CustomSelect
                                    label="Nationality"
                                    value={nationality}
                                    onChange={(val) => setNationality(val)}
                                    options={[
                                        { label: 'AI Decide / Empty', value: '' },
                                        { label: 'Russian', value: 'Russian' },
                                        { label: 'European', value: 'European' },
                                        { label: 'American', value: 'American' },
                                        { label: 'Latina', value: 'Latina' },
                                        { label: 'Asian', value: 'Asian' },
                                        { label: 'Japanese', value: 'Japanese' },
                                        { label: 'Korean', value: 'Korean' },
                                        { label: 'Indian', value: 'Indian' },
                                        { label: 'Arab', value: 'Arab' },
                                        { label: 'African', value: 'African' },
                                        { label: 'Scandinavian', value: 'Scandinavian' },
                                        { label: 'Brazilian', value: 'Brazilian' }
                                    ]}
                                />
                            </div>

                            {/* Clothing & Role Row (50/50 Split) */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <CustomSelect
                                        label="Clothing Style"
                                        value={clothing}
                                        onChange={(val) => setClothing(val)}
                                        options={[
                                            { label: 'Dressed (Full Outfit)', value: 'dressed' },
                                            { label: 'Semi-Dressed (Lingerie/Bikini)', value: 'semi-dressed' },
                                            { label: 'Nude (Artistic)', value: 'nude' }
                                        ]}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <CustomSelect
                                        label="Character Role / Archetype"
                                        value={role}
                                        onChange={(val) => setRole(val)}
                                        options={[
                                            { label: 'AI Decide / Empty', value: '' },
                                            { label: 'Seductive Teacher', value: 'Seductive Teacher' },
                                            { label: 'Submissive Maid', value: 'Submissive Maid' },
                                            { label: 'Insatiable Flight Attendant', value: 'Insatiable Flight Attendant' },
                                            { label: 'Strict Boss / CEO', value: 'Strict Boss' },
                                            { label: 'Naughty Nun', value: 'Naughty Nun' },
                                            { label: 'Yoga Instructor', value: 'Yoga Instructor' },
                                            { label: 'Gothic Vixen', value: 'Gothic Vixen' },
                                            { label: 'Cyberpunk Rebel', value: 'Cyberpunk Rebel' },
                                            { label: 'Office Secretary', value: 'Office Secretary' },
                                            { label: 'Fitness Influencer', value: 'Fitness Influencer' }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Visual Sources - Art Deco Panel */}
                    <div className="bg-[#121212] border border-[#d2ac47]/20 rounded-3xl p-4 md:p-8 relative shadow-2xl transition-all hover:border-[#d2ac47]/40">
                        <div className="absolute top-0 left-0 px-6 py-2 bg-[#d2ac47] text-black text-[10px] font-bold tracking-[0.2em] uppercase rounded-tl-3xl rounded-br-2xl shadow-lg">
                            Visual Source
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                            {/* 1. Main Face Input */}
                            <div className="border rounded-2xl p-6 border-[#d2ac47] bg-[#0a0a0a] flex flex-col group overflow-hidden hover:border-[#d2ac47]/60 h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 border border-[#d2ac47] rounded-full flex items-center justify-center bg-[#d2ac47]/10 text-[#d2ac47]">
                                        <User size={16} />
                                    </div>
                                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#d2ac47]">
                                        Face Reference (Required)
                                    </span>
                                </div>
                                {/* Drag & Drop Zone */}
                                <div className="w-full h-64 relative overflow-hidden rounded-xl mb-3">
                                    <ImageUploadZone
                                        onImageUpload={({ url }) => setFaceImageUrl(url)}
                                        currentUrl={faceImageUrl}
                                        placeholder="Upload Face Photo"
                                        className="h-full w-full"
                                    />
                                </div>
                                {/* Likeness Slider */}
                                <div className="pb-10">
                                    <div className="flex justify-between text-[#d2ac47] text-[9px] font-bold tracking-[0.2em] uppercase mb-1">
                                        <span>Likeness Strength</span>
                                        <span>{instantIdWeight}</span>
                                    </div>
                                    <input type="range" min="0" max="1" step="0.05" value={instantIdWeight} onChange={(e) => setInstantIdWeight(Number(e.target.value))}
                                        className="w-full h-1 bg-[#d2ac47]/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-[#d2ac47] [&::-webkit-slider-thumb]:rounded-full" />
                                </div>
                            </div>

                            {/* 2. Body Reference Toggle */}
                            <div className={`border rounded-2xl p-6 group/body flex flex-col h-full ${error?.includes('Body') ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] bg-red-950/10' : grabBody ? 'border-solid border-red-500/50 bg-[#0a0a0a]' : 'border-dashed border-[#d2ac47]/30 bg-transparent hover:border-[#d2ac47]/50 hover:bg-[#d2ac47]/5'} `}>

                                {/* Header Area: Fixed Height to prevent layout shift */}
                                <div className="h-10 mb-4 flex items-center gap-3">
                                    {grabBody ? (
                                        <>
                                            <div className={`w-8 h-8 border border-red-500 rounded-full flex items-center justify-center bg-red-950/20 text-red-500 cursor-pointer`} onClick={() => setGrabBody(false)}>
                                                <XCircle size={16} />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-red-500 leading-none mb-1">Body Reference</span>
                                                <span className="text-[8px] text-red-500/80 uppercase tracking-wider leading-none">(Close if unused)</span>
                                            </div>
                                        </>
                                    ) : (
                                        /* Placeholder to maintain height */
                                        <div className="w-full h-full"></div>
                                    )}
                                </div>

                                {/* Main Interaction Area: Aspect Square */}
                                <div className="w-full aspect-square relative rounded-xl overflow-hidden mb-3">
                                    {grabBody ? (
                                        <div className="animate-fade-in w-full h-full">
                                            <ImageUploadZone
                                                onImageUpload={({ url }) => {
                                                    setBodyRefUrl(url);
                                                    setError(null);
                                                }}
                                                currentUrl={bodyRefUrl}
                                                placeholder="Upload Body Ref"
                                                className="h-full w-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => setGrabBody(true)}>
                                            <button
                                                className={`rounded-full flex items-center justify-center transition-all duration-500 w-20 h-20 border border-[#d2ac47]/40 text-[#d2ac47]/40 mb-4 hover:border-[#d2ac47] hover:text-[#d2ac47] hover:shadow-[0_0_20px_rgba(210,172,71,0.2)]`}>
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    {/* Left Side Body Curve (Widened) */}
                                                    <path d="M7 5 C7 8 9 11 10.5 12 C12 13 8 18 7 19" />
                                                    {/* Right Side Body Curve (Widened & Mirrored) */}
                                                    <path d="M17 5 C17 8 15 11 13.5 12 C12 13 16 18 17 19" />
                                                </svg>
                                            </button>
                                            <div className="flex flex-col text-center">
                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#d2ac47]/60">
                                                    Body Reference
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Linker / Separator - Transparent */}
                                <div className="flex items-center gap-3 py-2 my-2 opacity-80 hover:opacity-100 transition-opacity">
                                    <div className="h-[1px] flex-1 bg-[#d2ac47]/20"></div>
                                    <span className="text-[#d2ac47] text-[10px] font-bold uppercase tracking-[0.2em] shrink-0">OR</span>
                                    <div className="h-[1px] flex-1 bg-[#d2ac47]/20"></div>
                                </div>

                                {/* Dropdown Controls */}
                                <div>
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
                            <div className={`border rounded-2xl p-6 group/comp flex flex-col h-full ${error?.includes('Background') ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] bg-red-950/10' : (grabComposition && !compositionUrl) ? 'border-solid border-red-500/50 bg-[#0a0a0a]' : grabComposition ? 'border-solid border-[#d2ac47]/50 bg-[#0a0a0a]' : 'border-dashed border-[#d2ac47]/30 bg-transparent hover:border-[#d2ac47]/50 hover:bg-[#d2ac47]/5'} `}>

                                {/* Structural Alignment: Header Spacer or Real Header */}
                                {grabComposition ? (
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-8 h-8 border border-red-500 rounded-full flex items-center justify-center bg-red-950/20 text-red-500 cursor-pointer`} onClick={() => setGrabComposition(false)}>
                                            <XCircle size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-red-500">Background Ref</span>
                                            <span className="text-[8px] text-red-500/80 uppercase tracking-wider">(Close if unused)</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-8 mb-4"></div> /* Spacer */
                                )}

                                {grabComposition ? (
                                    <div className="animate-fade-in w-full h-64 relative overflow-hidden rounded-xl mb-3">
                                        <ImageUploadZone
                                            onImageUpload={({ url }) => setCompositionUrl(url)}
                                            currentUrl={compositionUrl}
                                            placeholder="Upload Background"
                                            className="h-full w-full"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-64 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => setGrabComposition(true)}>
                                        <button
                                            className={`rounded-full flex items-center justify-center transition-all duration-500 w-20 h-20 border border-[#d2ac47]/40 text-[#d2ac47]/40 mb-4 hover:border-[#d2ac47] hover:text-[#d2ac47] hover:shadow-[0_0_20px_rgba(210,172,71,0.2)]`}>
                                            {/* Backdrop / Background Icon (Custom SVG) */}
                                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                {/* Frame / Wall */}
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                {/* Cyclorama Curve / Landscape hint */}
                                                <path d="M3 15C3 15 8 13 11 15C14 17 18 14 21 16" />
                                                {/* Small Sun/Focus */}
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                            </svg>
                                        </button>
                                        <div className="flex flex-col text-center">
                                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#d2ac47]/60">
                                                Background Ref
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Padding filler to match height if necessary, or just rely on h-full on parent */}
                                <div className="flex-1"></div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Style & Prompt - Art Deco Panel */}
                    <div className="bg-[#121212] border border-[#d2ac47]/20 rounded-3xl p-8 relative shadow-2xl transition-all hover:border-[#d2ac47]/40">
                        <div className="absolute top-0 left-0 px-6 py-2 bg-[#d2ac47] text-black text-[10px] font-bold tracking-[0.2em] uppercase rounded-tl-3xl rounded-br-2xl shadow-lg">
                            Fine Tuning
                        </div>

                        <div className="mt-6 space-y-6">
                            {/* Art Style Dropdown */}
                            <div>
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
                            </div>



                            <div>
                                <label className="text-[#d2ac47] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 block">Prompt Details</label>
                                <textarea value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-[#d2ac47]/30 text-[#F9F1D8] p-3 text-sm h-24 focus:outline-none focus:border-[#d2ac47] rounded-xl shadow-inner"
                                    placeholder="Describe specific details..." />
                                {/* Advanced Controls: Seed & Raw Mode */}
                                {/* Layout Refactor: Seed Row, Then Toggles Row */}
                                <div className="flex flex-col gap-3 mt-3">
                                    {/* Row 1: Seed Control (Full Width) */}
                                    <div className="w-full flex items-center gap-2 bg-[#0a0a0a] border border-[#d2ac47]/20 p-4 rounded-xl">
                                        <span className="text-[#d2ac47] text-xs uppercase tracking-wider whitespace-nowrap">Seed:</span>
                                        <input
                                            type="number"
                                            value={seed === -1 ? '' : seed}
                                            placeholder="Random"
                                            onChange={(e) => setSeed(e.target.value === '' ? -1 : parseInt(e.target.value))}
                                            className="bg-transparent text-[#F9F1D8] text-sm font-mono w-full focus:outline-none placeholder-[#d2ac47]/30"
                                        />
                                        <button
                                            onClick={() => setSeed(Math.floor(Math.random() * 2147483647))}
                                            className="text-[#d2ac47]/50 hover:text-[#d2ac47] transition-colors"
                                            title="Spin Random Seed"
                                        >
                                            <RefreshCw size={16} className="active:animate-spin" />
                                        </button>
                                    </div>

                                    {/* Row 2: Toggles (Split Width) */}
                                    <div className="flex items-center gap-3">
                                        {/* Raw Prompt Toggle */}
                                        <button
                                            onClick={() => setRawPromptMode(!rawPromptMode)}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 border transition-all rounded-xl ${rawPromptMode ? 'bg-[#d2ac47] border-[#d2ac47] text-black' : 'bg-transparent border-[#d2ac47]/30 text-[#d2ac47]/60 hover:text-[#d2ac47] hover:border-[#d2ac47]'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${rawPromptMode ? 'bg-black' : 'bg-[#d2ac47]/50'}`}></div>
                                            <span className="text-xs uppercase tracking-widest font-bold">Raw Prompt</span>
                                        </button>

                                        {/* Upscale Toggle */}
                                        <button
                                            onClick={() => setUpscale(!upscale)}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 border transition-all rounded-xl ${upscale ? 'bg-[#d2ac47] border-[#d2ac47] text-black' : 'bg-transparent border-[#d2ac47]/30 text-[#d2ac47]/60 hover:text-[#d2ac47] hover:border-[#d2ac47]'}`}
                                        >
                                            <Sparkles size={16} className={upscale ? 'text-black' : ''} />
                                            <span className="text-xs uppercase tracking-widest font-bold">Upscale</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message Display (Moved Up for Visibility) */}
                    {error && <div className="text-red-400 text-center font-serif italic bg-red-950/30 p-4 border border-red-900/50 rounded-xl animate-pulse mb-4">{error}</div>}

                    {/* Generate & Cancel Buttons */}
                    <div className="flex gap-4">
                        {loading && (
                            <button
                                onClick={handleCancel}
                                className="px-6 py-5 border border-[#d2ac47] bg-[#1a1a1a] text-[#d2ac47] hover:bg-red-950/40 hover:text-red-400 hover:border-red-500 transition-all text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 group/cancel rounded-xl shadow-[0_0_10px_rgba(210,172,71,0.1)]"
                            >
                                <XCircle size={20} className="group-hover/cancel:rotate-90 transition-transform duration-300" />
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



                    {/* MOBILE ONLY: Image Output (Moved up per user request) */}
                    <div className="lg:hidden mt-8 mb-8">
                        <div className="bg-[#050505] border border-[#d2ac47]/20 rounded-3xl aspect-[9/16] max-h-[550px] mx-auto relative flex items-center justify-center overflow-hidden shadow-2xl group flex-col min-h-[500px]">
                            {/* 1. LAYER: Ambient Background (Blur Fill) */}
                            {generatedImage && (
                                <>
                                    <div className="absolute inset-0 pointer-events-none">
                                        <img
                                            src={generatedImage}
                                            alt=""
                                            className="w-full h-full object-cover opacity-60 blur-3xl scale-150 saturate-150"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/20"></div>
                                    </div>

                                    {/* 2. LAYER: Main Sharp Subject */}
                                    <img src={generatedImage} alt="Generated Avatar" className="relative z-10 w-full h-full object-cover drop-shadow-2xl" />

                                    {/* Deco Corners */}
                                    <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#d2ac47] pointer-events-none z-20"></div>
                                    <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#d2ac47] pointer-events-none z-20"></div>
                                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#d2ac47] pointer-events-none z-20"></div>
                                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#d2ac47] pointer-events-none z-20"></div>
                                </>
                            )}
                            {/* 2. LAYER: Loading Logger */}
                            {loading && (
                                <div className={`flex flex-col items-center justify-center ${generatedImage ? 'absolute inset-0 z-20 bg-black/50 backdrop-blur-sm' : 'w-full h-full'}`}>
                                    <AvatarLogger status={currentStatus} error={error} />
                                </div>
                            )}
                            {/* 3. LAYER: Action Buttons */}
                            {generatedImage && (
                                <div className="absolute top-12 left-0 w-full z-30 flex justify-center gap-4 transition-opacity duration-300">
                                    <button onClick={handleGenerate} disabled={loading} className="btn-gold px-6 py-3 text-xs tracking-widest uppercase flex items-center gap-2 border border-[#d2ac47]/50 rounded-xl hover:bg-[#d2ac47] hover:text-black shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Regenerate
                                    </button>
                                    <button onClick={handleDownload} className="btn-gold px-6 py-3 text-xs tracking-widest uppercase flex items-center gap-2 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                                        <Download size={16} /> Download
                                    </button>
                                </div>
                            )}
                            {/* 4. LAYER: Placeholder */}
                            {!generatedImage && !loading && (
                                <div className="text-[#d2ac47]/20 flex flex-col items-center gap-2">
                                    <Camera size={48} strokeWidth={1} />
                                    <span className="text-[9px] tracking-[0.3em] uppercase">Output Ready</span>
                                </div>
                            )}
                        </div>

                        {/* Metadata Footer (Compact Design) - Mobile */}
                        {activeItem && (
                            <div className="relative px-4 pb-2 pt-2 text-center shrink-0 border-t border-[#d2ac47]/10 bg-[#080808]/50 overflow-hidden w-full">
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

                    {/* Gallery Moved to Bottom Center */}
                    <div className="mt-8 border-t border-[#d2ac47]/10 pt-4">
                        <span className="text-[#d2ac47] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">Recent Creations</span>
                        <UserGallery newItems={galleryItems} columns={3} />
                    </div>

                </div>

                {/* RIGHT COLUMN: Output - High Density Panel */}
                <div className="lg:col-span-4 sticky top-32 z-10 space-y-4">

                    {/* 1. Coins / Credits Widget */}
                    <div className="bg-[#050505] border border-[#d2ac47]/20 rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#d2ac47]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-[#d2ac47]/60 text-[9px] uppercase tracking-[0.3em] mb-1">Balance</span>
                        <div className="flex items-center gap-2 text-[#F9F1D8] drop-shadow-[0_0_10px_rgba(210,172,71,0.5)]">
                            {/* Gold Coin Icon */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd700] via-[#fbeea4] to-[#b8860b] border border-[#fbeea4] shadow-[0_0_15px_rgba(255,215,0,0.6)] flex items-center justify-center mr-2" style={{ animation: 'spinY 5s linear infinite' }}>
                                <div className="w-5 h-5 rounded-full border border-[#b8860b]/50"></div>
                            </div>
                            <span className="text-3xl font-serif font-bold">2,450</span>
                            <div className="flex flex-col leading-none">
                                <span className="text-xs text-[#d2ac47] font-bold uppercase tracking-wider">Credits</span>
                                <span className="text-[9px] text-[#d2ac47]/60 uppercase tracking-widest">Available</span>
                            </div>
                        </div>
                        <button className="mt-2 px-4 py-1.5 border border-[#d2ac47]/30 rounded-full text-[#d2ac47] text-[7px] uppercase tracking-[0.2em] hover:bg-[#d2ac47] hover:text-black transition-all">
                            Add Funds
                        </button>
                    </div>

                    {/* 2. Stats Dashboard (Top) */}
                    <GamificationDashboard />

                    {/* 3. Image Output (VERTICAL 9:16) - DESKTOP ONLY */}
                    <div className="hidden lg:flex bg-[#050505] border border-[#d2ac47]/20 rounded-3xl aspect-[9/16] max-h-[550px] mx-auto relative items-center justify-center overflow-hidden shadow-2xl group flex-col">
                        {/* 1. LAYER: Ambient Background (Blur Fill) */}
                        {generatedImage && (
                            <>
                                <div className="absolute inset-0 pointer-events-none">
                                    <img
                                        src={generatedImage}
                                        alt=""
                                        className="w-full h-full object-cover opacity-60 blur-3xl scale-150 saturate-150"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/20"></div>
                                </div>

                                <img src={generatedImage} alt="Generated Avatar" className="relative z-10 w-full h-full object-contain drop-shadow-2xl shadow-black" />

                                {/* Deco Corners */}
                                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#d2ac47]/50 rounded-tl-lg pointer-events-none z-20"></div>
                                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#d2ac47]/50 rounded-tr-lg pointer-events-none z-20"></div>
                                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#d2ac47]/50 rounded-bl-lg pointer-events-none z-20"></div>
                                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#d2ac47]/50 rounded-br-lg pointer-events-none z-20"></div>
                            </>
                        )}

                        {/* 2. LAYER: Loading Logger (Overlay or Main) */}
                        {loading && (
                            <div className={`flex flex-col items-center justify-center ${generatedImage ? 'absolute inset-0 z-20 bg-black/50 backdrop-blur-sm' : 'w-full h-full'}`}>
                                <AvatarLogger status={currentStatus} error={error} />
                            </div>
                        )}

                        {/* 3. LAYER: Action Buttons (Top Overlay) */}
                        {generatedImage && (
                            <div className="absolute top-12 left-0 w-full z-30 flex justify-center gap-4 transition-opacity duration-300">
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className={`btn-gold px-6 py-3 text-xs tracking-widest uppercase flex items-center gap-2 border border-[#d2ac47]/50 rounded-xl hover:bg-[#d2ac47] hover:text-black shadow-[0_4px_10px_rgba(0,0,0,0.5)] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> {loading ? "Processing..." : "Regenerate"}
                                </button>
                                <button onClick={handleDownload} className="btn-gold px-6 py-3 text-xs tracking-widest uppercase flex items-center gap-2 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                                    <Download size={16} /> Download
                                </button>
                            </div>
                        )}

                        {/* 4. LAYER: Placeholder (Only if nothing else) */}
                        {!generatedImage && !loading && (
                            <div className="text-[#d2ac47]/20 flex flex-col items-center gap-2">
                                <Camera size={48} strokeWidth={1} />
                                <span className="text-[9px] tracking-[0.3em] uppercase">Output Ready</span>
                            </div>
                        )}
                    </div>

                    {/* Metadata Footer (Compact Design) - Desktop */}
                    {activeItem && (
                        <div className="relative px-4 pb-2 pt-2 text-center shrink-0 border-t border-[#d2ac47]/10 bg-[#080808]/50 overflow-hidden w-full rounded-b-3xl">
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

            </div >

            <style>{`
                @keyframes spinY {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }
            `}</style>
        </div >
    );
};

export default AvatarGenerator;
