import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, Download, RefreshCw, User, Sparkles, XCircle } from "lucide-react";
import GamificationDashboard from './GamificationDashboard';
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
            { msg: "Scanner: Initializing biometric handshake...", delay: 800 },
            { msg: "Scanner: Mapping facial topography...", delay: 3000 },
            { msg: "Identity: Extracting structural dna...", delay: 7000 },
            { msg: "Composition: Rigging anatomical skeletal structure...", delay: 12000 },
            { msg: "Engine: Seeding neural latent space...", delay: 18000 },
            { msg: "Detailing: Generating hyper-realistic skin textures...", delay: 28000 },
            { msg: "Lighting: Simulating cinematic ray-tracing...", delay: 38000 },
            { msg: "Optics: Applying vintage lens aberrations...", delay: 48000 },
            { msg: "Studio: Developing final masterpiece...", delay: 55000 }
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
            <RefreshCw className={`w-14 h-14 text-[#d2ac47] ${status !== 'failed' ? 'animate-spin' : ''} drop-shadow-[0_0_15px_rgba(210,172,71,0.5)]`} />
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
                setActiveItem(found);
                cleanupMonitoring();
                setLoading(false);
            }
        }
    }, [galleryItems, loading]);

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
                        setActiveItem(newRecord);
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
                    setActiveItem(data);
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

            // Start monitoring for completion via Supabase BEFORE sending the request
            // This ensures that even if the POST times out, we are already listening for the update.
            startMonitoring(generationId);

            // Send to webhook
            try {
                await axios.post(WEBHOOK_URL, payload, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 60000, // Increase timeout to 60s
                    signal: controllerRef.current.signal
                });
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


            {/* Header */}
            <div className="text-center mb-12 relative z-10 transition-all duration-1000">
                <div className="inline-flex items-center gap-4 mb-4">
                    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-[#d2ac47]"></div>
                    <span className="text-[#d2ac47] text-[10px] font-bold tracking-[0.4em] uppercase animate-pulse">Identity Forge</span>
                    <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-[#d2ac47]"></div>
                </div>
                <h2 className="text-4xl md:text-7xl font-serif text-[#F9F1D8] mb-4 drop-shadow-[0_0_25px_rgba(210,172,71,0.3)] tracking-tight">
                    Create Your <span className="text-gold-luxury italic">Avatar</span>
                </h2>
                <p className="text-[#d2ac47]/60 text-xs uppercase tracking-[0.3em] font-light max-w-lg mx-auto">
                    The ultimate forge for high-fidelity personal identities and artistic portraits.
                </p>
            </div>

            {/* Switched to Flexbox for Mobile Stability, Grid for Desktop - Match Video/Premium Style */}
            <div className="flex flex-col xl:grid xl:grid-cols-12 gap-8 items-stretch">

                {/* Left Banner - Restored High-Res & Art Deco Corners to match Video Generator exactly */}
                <div className="hidden xl:block xl:col-span-3">
                    <div className="h-full w-full relative overflow-hidden group border border-[#d2ac47]/20 rounded-3xl shadow-2xl transition-all hover:border-[#d2ac47]/40">
                        <div className="absolute inset-0 bg-[#080808]/20 z-10 mix-blend-overlay"></div>
                        {/* Art Deco Corners - Matched to Video Gen */}
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#d2ac47]/50 rounded-tl-xl z-30"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#d2ac47]/50 rounded-tr-xl z-30"></div>

                        <img
                            src="/banner_sitting_brunette_high_res.png"
                            alt="Identity Mirror"
                            className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-[4000ms] ease-out"
                        />
                    </div>
                </div>

                {/* Center COLUMN: Forge / Inputs (Increased Width) */}
                <div className="w-full xl:col-span-6 space-y-6 relative z-10">

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
                            <div className="border rounded-2xl p-6 border-[#d2ac47] bg-[#0a0a0a] flex flex-col group overflow-hidden hover:border-[#d2ac47]/60 h-[480px]">
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
                                {/* Likeness Slider - Moved into a Fixed Height Container */}
                                <div className="h-16 shrink-0 flex flex-col justify-end">
                                    <div className="flex justify-between text-[#d2ac47] text-[9px] font-bold tracking-[0.2em] uppercase mb-1">
                                        <span>Likeness Strength</span>
                                        <span>{instantIdWeight}</span>
                                    </div>
                                    <input type="range" min="0" max="1" step="0.05" value={instantIdWeight} onChange={(e) => setInstantIdWeight(Number(e.target.value))}
                                        className="w-full h-1 bg-[#d2ac47]/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-[#d2ac47] [&::-webkit-slider-thumb]:rounded-full" />
                                </div>
                            </div>

                            {/* 2. Body Reference Toggle */}
                            <div className={`border rounded-2xl p-6 group/body flex flex-col h-[480px] transition-all duration-500 ${error?.includes('Body') ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] bg-red-950/10' : (grabBody && !bodyRefUrl) ? 'border-solid border-red-500/50 bg-red-950/5' : grabBody ? 'border-solid border-[#d2ac47]/50 bg-[#0a0a0a]' : 'border-dashed border-[#d2ac47]/30 bg-transparent hover:border-[#d2ac47]/50 hover:bg-[#d2ac47]/5'} `}>

                                {/* Header Area: Fixed Height */}
                                <div className="h-8 mb-4 flex items-center gap-3 shrink-0">
                                    {grabBody ? (
                                        <>
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:rotate-90 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 hover:border-red-500"
                                                onClick={() => setGrabBody(false)}
                                                title="Close Slot"
                                            >
                                                <XCircle size={16} strokeWidth={2} />
                                            </div>
                                            <div className="flex flex-col justify-center leading-none">
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

                                {/* Dropdown Controls - Fixed Height */}
                                <div className="h-16 flex flex-col justify-end shrink-0">
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
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:rotate-90 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 hover:border-red-500"
                                                onClick={() => setGrabComposition(false)}
                                                title="Close Slot"
                                            >
                                                <XCircle size={16} strokeWidth={2} />
                                            </div>
                                            <div className="flex flex-col leading-none">
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
                </div>

                {/* RIGHT COLUMN: History & Workspace */}
                <div className="xl:col-span-3 space-y-4 flex flex-col h-full">
                    {/* 1. Coins / Credits Widget */}
                    <div className="bg-[#050505] border border-[#d2ac47]/20 rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#d2ac47]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-[#d2ac47]/60 text-[9px] uppercase tracking-[0.3em] mb-1">Balance</span>
                        <div className="flex items-center gap-2 text-[#F9F1D8] drop-shadow-[0_0_10px_rgba(210,172,71,0.5)]">
                            <div className="w-8 h-8 rounded-full bg-gold-gradient shadow-[0_0_15px_rgba(255,215,0,0.6)] flex items-center justify-center mr-2">
                                <div className="w-5 h-5 rounded-full border border-black/20"></div>
                            </div>
                            <span className="text-3xl font-serif font-bold">2,450</span>
                            <div className="flex flex-col leading-none">
                                <span className="text-xs text-[#d2ac47] font-bold uppercase tracking-wider">Credits</span>
                                <span className="text-[9px] text-[#d2ac47]/60 uppercase tracking-widest">Available</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Stats Dashboard */}
                    <GamificationDashboard />

                    {/* 3. History / Gallery - VERTICAL PRO BLOCK */}
                    <div className="bg-[#0a0a0a] border border-[#d2ac47]/20 rounded-3xl p-2 shadow-2xl relative flex flex-col overflow-hidden h-[800px] shrink-0">
                        <div className="flex items-center justify-between h-10 px-4">
                            <span className="text-[#d2ac47] text-[10px] font-bold uppercase tracking-[0.2em]">History</span>
                        </div>
                        <UserGallery
                            newItems={galleryItems}
                            onDelete={async (id) => {
                                const { error } = await supabase.from('generations').delete().eq('id', id);
                                if (!error) fetchHistory();
                            }}
                            onSelect={(item) => {
                                setGeneratedImage(item.result_url || (item as any).image_url || (item as any).url || null);
                                setActiveItem(item);
                            }}
                        />
                    </div>

                    {/* 4. Output Area - ALIGNED BLOCK */}
                    <div className="bg-[#050505] border border-[#d2ac47]/20 rounded-3xl relative flex items-center justify-center overflow-hidden shadow-2xl group flex-col w-full transition-all duration-700 h-[280px] shrink-0">
                        {/* 1. LAYER: Ambient Background (Blur Fill) */}
                        <div className="absolute inset-0 pointer-events-none">
                            {generatedImage ? (
                                <img
                                    src={generatedImage}
                                    alt=""
                                    className="w-full h-full object-cover opacity-40 blur-3xl scale-150 saturate-150"
                                />
                            ) : (
                                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#050505_100%)] opacity-50"></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/20"></div>
                        </div>

                        {generatedImage && (
                            <>
                                <img src={generatedImage} alt="Generated Avatar" className="relative z-10 w-full h-full object-contain drop-shadow-2xl shadow-black" />

                                {/* Deco Corners */}
                                <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-[#d2ac47]/50 pointer-events-none z-20 rounded-tl-lg"></div>
                                <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-[#d2ac47]/50 pointer-events-none z-20 rounded-tr-lg"></div>
                                <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-[#d2ac47]/50 pointer-events-none z-20 rounded-bl-lg"></div>
                                <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-[#d2ac47]/50 pointer-events-none z-20 rounded-br-lg"></div>
                            </>
                        )}

                        {/* 2. LAYER: Loading Logger */}
                        {loading && (
                            <div className={`flex flex-col items-center justify-center ${generatedImage ? 'absolute inset-0 z-20 bg-black/50 backdrop-blur-sm' : 'w-full h-full'}`}>
                                <AvatarLogger status={currentStatus} error={error} />
                            </div>
                        )}

                        {/* 3. LAYER: Action Buttons (Top Overlay - Adjusted for sidebar width) */}
                        {generatedImage && (
                            <div className="absolute top-4 left-0 w-full z-30 flex flex-col items-center gap-2 px-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className={`w-full py-2 text-[9px] tracking-widest uppercase flex items-center justify-center gap-2 border border-[#d2ac47] bg-black/60 backdrop-blur-md rounded-lg hover:bg-[#d2ac47] hover:text-black shadow-2xl transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> {loading ? "Processing..." : "Regenerate"}
                                </button>
                                <button onClick={handleDownload} className="w-full py-2 text-[9px] tracking-widest uppercase flex items-center justify-center gap-2 bg-gold-gradient text-black rounded-lg shadow-2xl transition-all hover:scale-105">
                                    <Download size={12} /> Download
                                </button>
                            </div>
                        )}

                        {/* 4. LAYER: Placeholder */}
                        {!generatedImage && !loading && (
                            <div className="text-[#d2ac47]/10 flex flex-col items-center gap-2">
                                <Camera size={48} strokeWidth={0.5} />
                                <span className="text-[8px] tracking-[0.4em] uppercase font-bold">Active Workspace</span>
                            </div>
                        )}

                        {/* Metadata Footer (Inside Output) */}
                        {activeItem && (
                            <div className="absolute bottom-0 left-0 w-full px-3 pb-2 pt-2 text-center z-20 border-t border-[#d2ac47]/10 bg-black/80 backdrop-blur-xl">
                                <p className="text-[#F9F1D8] text-[10px] font-serif italic mb-0.5 truncate">
                                    {activeItem.prompt ? (activeItem.prompt.substring(0, 40) + (activeItem.prompt.length > 40 ? '...' : '')) : (activeItem.label || 'Untitled')}
                                </p>
                                <div className="flex items-center justify-center gap-2 text-[7px] uppercase tracking-[0.2em] text-[#d2ac47]/40 font-bold">
                                    <span>Verified Forge</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Creations Gallery (New Section - Match Video Style) */}
            {galleryItems.length > 0 && (
                <div className="mt-12 animate-fade-in-up">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#d2ac47]/30"></div>
                        <h2 className="text-2xl font-serif text-[#F9F1D8] italic">Recent Masterpieces</h2>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#d2ac47]/30"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {galleryItems.map((item) => (
                            <div
                                key={item.id}
                                className="group/item relative bg-[#080808] border border-[#d2ac47]/10 rounded-2xl overflow-hidden aspect-[9/16] shadow-2xl transition-all hover:border-[#d2ac47]/40 hover:-translate-y-1 cursor-pointer"
                                onClick={() => {
                                    setGeneratedImage(item.result_url || item.image_url || item.url);
                                    setActiveItem(item);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                <img
                                    src={item.result_url || item.image_url || item.url}
                                    alt={item.label}
                                    className="w-full h-full object-cover grayscale-[0.2] transition-all group-hover/item:grayscale-0 group-hover/item:scale-105 duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                    <p className="text-[#F9F1D8] text-[10px] font-serif italic truncate">{item.prompt || item.label || 'Untitled'}</p>
                                    <span className="text-[#d2ac47] text-[8px] uppercase tracking-widest font-bold mt-1">View Full</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes breathe {
                    0% { transform: scale(1); filter: brightness(0.8); }
                    100% { transform: scale(1.05); filter: brightness(1.1); }
                }
                @keyframes spinY {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AvatarGenerator;
