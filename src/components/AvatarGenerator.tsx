import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next'; // i18n
import axios from 'axios';
import { Wand2, Download, RefreshCw, Sparkles, XCircle, Camera, User, X, Maximize2, Upload, Trash2, Plus } from 'lucide-react';

import UserGallery from './UserGallery';
import ImageUploadZone from './ImageUploadZone';
import FaceGallery from './FaceGallery';
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
            <label className={`text-[var(--text-secondary)] text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5 block ${centerLabel ? 'text-center' : ''} truncate`}>{label}</label>
            <div
                className={`w-full bg-[var(--bg-input)] border ${isOpen ? 'border-[#d2ac47]' : 'border-[var(--border-color)]'} text-[var(--text-primary)] p-2 md:p-2.5 rounded-lg flex justify-between items-center transition-all 
                ${disabled ? 'opacity-50 cursor-not-allowed border-[#d2ac47]/10' : 'cursor-pointer hover:border-[#d2ac47]/60'}
                `}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className="truncate text-[10px] md:text-xs font-bold tracking-widest uppercase">{options.find(o => o.value == value)?.label || value}</span>
                <span className="text-[var(--text-secondary)] text-[8px] transition-transform duration-300 transform shrink-0 ml-2" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>в–ј</span>
            </div>

            {/* Dropdown Options - Absolute positioned with high Z-index */}
            {isOpen && (
                <div className="absolute top-full left-0 min-w-full w-auto whitespace-nowrap bg-[var(--bg-primary)] border border-[#d2ac47] z-[99999] shadow-[0_10px_40px_rgba(0,0,0,0.9)] animate-fade-in-down mt-2 rounded-xl overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            className={`px-3 py-2 text-[10px] md:text-xs cursor-pointer transition-all border-b border-[#d2ac47]/10 last:border-0 uppercase tracking-wider
                                ${opt.value == value
                                    ? 'bg-[#d2ac47] text-black font-bold shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]'
                                    : 'text-[var(--text-primary)] hover:bg-[#d2ac47]/10 hover:text-[var(--text-secondary)] hover:pl-4'
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
        <div className="absolute inset-0 bg-[var(--bg-primary)]/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center space-y-6 z-50">
            {/* Elegant AI Loader: Thin dual-ring system */}
            <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-[1px] border-[var(--border-color)] rounded-full animate-[spin_3s_linear_infinite]"></div>
                <div className="absolute inset-1 border-t-[1px] border-[#d2ac47] rounded-full animate-[spin_2s_linear_infinite]"></div>
                <div className="absolute inset-3 border-b-[1px] border-[#d2ac47]/50 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                <Sparkles size={12} className="text-[var(--text-secondary)] animate-pulse" />
            </div>
            <div className={`font-mono ${error ? 'text-red-500' : 'text-[var(--text-secondary)]'} text-xs uppercase tracking-[0.3em] font-bold`}>
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
    const { t } = useTranslation();
    const [sliderPos, setSliderPos] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMove = React.useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const position = ((clientX - rect.left) / rect.width) * 100;
        setSliderPos(Math.max(0, Math.min(100, position)));
    }, []);

    const onMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        // Prevent default browser drag behavior
        if (!('touches' in e)) {
            e.preventDefault();
        }
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        handleMove(clientX);
    };

    const onMouseUp = React.useCallback(() => {
        setIsDragging(false);
    }, []);

    const onMouseMove = React.useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
        handleMove(clientX);
    }, [isDragging, handleMove]);

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('touchmove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchend', onMouseUp);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchend', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchend', onMouseUp);
        };
    }, [isDragging, onMouseMove, onMouseUp]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full rounded-2xl overflow-hidden cursor-ew-resize select-none border border-[var(--border-color)] group/slider shadow-2xl bg-[var(--bg-input)]"
            onMouseDown={onMouseDown}
            onTouchStart={onMouseDown}
        >
            {/* After Image (Background) */}
            <img
                src={after}
                alt="After"
                className="absolute inset-0 w-full h-full object-contain bg-[var(--bg-input)]"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
            />

            {/* Before Image (Foreground with Clip) */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden z-10"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
                <img
                    src={before}
                    alt="Before"
                    className="absolute inset-0 w-full h-full object-contain bg-[var(--bg-input)]"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                />
            </div>

            {/* Slider Line */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#d2ac47]/80 shadow-[0_0_15px_rgba(210,172,71,0.5)] z-50 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--bg-primary)]/90 backdrop-blur-md border border-[#d2ac47]/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-[#d2ac47] rounded-full"></div>
                        <div className="w-0.5 h-3 bg-[#d2ac47] rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Labels - Always visible, theme-aware */}
            <div className="absolute top-5 left-5 px-3 py-1 bg-[var(--bg-primary)]/80 rounded-full text-[8px] text-[var(--text-primary)] uppercase tracking-[0.2em] backdrop-blur-md border border-[var(--border-color)] z-30 font-bold pointer-events-none select-none shadow-lg">{t('badge_original')}</div>

            {/* Watermark/Instruction */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[var(--bg-primary)]/60 backdrop-blur-sm rounded-full text-[7px] text-[var(--text-secondary)]/60 uppercase tracking-[0.3em] z-30 font-medium whitespace-nowrap opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none select-none">Slide to compare transformation</div>
        </div>
    );
};

// EditPhotoModal Component Removed (Inline Editing Implemented)

const AvatarGenerator: React.FC = () => {
    const { t } = useTranslation(); // i18n hook
    const [loading, setLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string>('pending');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);
    const [editRefImages, setEditRefImages] = useState<string[]>(['', '']);

    // Edit mode tracking - for comparison slider
    const [isEditMode, setIsEditMode] = useState(false);
    const [originalImageForCompare, setOriginalImageForCompare] = useState<string | null>(null);

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
    const [seedMode, setSeedMode] = useState<'random' | 'fixed'>('random');
    const [steps, setSteps] = useState<number>(30); // Default 30 as per user audio hint
    const [cfg, setCfg] = useState<number>(3.5); // Default Quality
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
    const generationStartTime = React.useRef<number>(0);

    // Initial fetch
    useEffect(() => {
        fetchHistory();
        return () => cleanupMonitoring();
    }, []);

    // AI Edit State
    const [showQuickEdit, setShowQuickEdit] = useState(false);
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

        // 1. Polling Fallback (Every 2 seconds - Aggressive)
        pollingInterval.current = setInterval(() => checkStatus(generationId), 2000);

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
                    console.log("рџ”” [REALTIME] Update received for ID:", generationId, "Status:", newRecord.status);

                    if (newRecord.status) {
                        setCurrentStatus(newRecord.status);
                    }

                    const finalUrl = newRecord.result_url || newRecord.image_url || newRecord.url || (newRecord.metadata?.result_url);
                    const isFinished = newRecord.status === 'completed' || newRecord.status === 'success' || newRecord.status === 'Success';

                    if (isFinished && finalUrl) {
                        console.log("рџЋЇ [REALTIME] SUCCESS! Resolving with URL:", finalUrl);

                        // If we have an original image (Edit Mode), this effectively completes the "Before vs After" state
                        // The 'originalImageUrl' state should already be set when the edit started.

                        setGeneratedImage(finalUrl);
                        cleanupMonitoring();
                        setLoading(false);
                        fetchHistory();
                    } else if (newRecord.status === 'failed' || newRecord.status === 'error') {
                        console.error("вќЊ [REALTIME] Generation reported failure:", newRecord.error_message);
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
                console.log("рџ“‹ [POLLING] FULL DATA:", JSON.stringify(data, null, 2));
                console.log("рџ“‹ [POLLING] Status:", data.status, "| result_url:", data.result_url, "| image_url:", data.image_url);
                if (data.status) setCurrentStatus(data.status);

                const finalUrl = (data as any).result_url || data.image_url || data.url || (data.metadata?.result_url);
                // Lenient check: If we have a URL, it's done. Or if distinct status.
                const isFinished = (finalUrl && finalUrl.length > 10) || data.status === 'completed' || data.status === 'success' || data.status === 'Success';

                if (isFinished && finalUrl) {
                    console.log("рџљЂ [POLLING] SUCCESS! Final URL found:", finalUrl);
                    setGeneratedImage(finalUrl);
                    cleanupMonitoring();
                    setLoading(false);
                    fetchHistory();
                    return; // Done
                } else if (data.status === 'failed' || data.status === 'error') {
                    console.error("вќЊ [POLLING] FAILURE:", data.error_message);
                    setError(data.error_message || "Generation failed.");
                    cleanupMonitoring();
                    setLoading(false);
                    return; // Done
                }
            }

            // --- DEEP SCAN / HISTORY POLL ---
            // N8N might have created a NEW row. We fetch the latest item for this user.
            const { data: latestData } = await supabase
                .from('generations')
                .select('*')
                // .eq('metadata->>guest_id', guestId) // REMOVED Strict Filter to match Gallery logic (User Request)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (latestData) {
                const latestUrl = (latestData as any).result_url || latestData.image_url || latestData.url || (latestData.metadata?.result_url);
                const latestFinished = (latestUrl && latestUrl.length > 10) || latestData.status === 'completed' || latestData.status === 'success' || latestData.status === 'Success';

                // TIMESTAMP CHECK: Allow 30s clock skew.
                // If recordTime > startTime - 30000, we consider it "potentially ours".
                const recordTime = new Date(latestData.created_at).getTime();
                // Use a safe margin because server clock might be slightly behind or ahead.
                // We want to differentiate "Old History" vs "Just Created".
                // If we just clicked generate, startTime is NOW. New image should be NOW or slightly later.
                // But if server is behind, it might appear "older". 
                // Let's assume skew is rarely > 1 minute.
                const isRecent = recordTime > (generationStartTime.current - 5000);

                if (latestFinished && latestUrl && isRecent) {
                    // We found a new completed image!
                    // Even if ID mismatches, we trust this is the result the user wants.
                    console.log("рџ•µпёЏ [DEEP SCAN] Found NEWER completed row:", latestData.id);
                    setGeneratedImage(latestUrl);
                    cleanupMonitoring();
                    setLoading(false);
                    fetchHistory(); // Refresh the list UI
                    return;
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
            console.log("рџ›‘ [CANCEL] Attempting to stop generation ID:", genId);
            axios.post('/api/cancel-generation', { generation_id: genId })
                .then(res => console.log("вњ… [CANCEL] Webhook Response:", res.status))
                .catch(err => console.error("вљ пёЏ [CANCEL] Webhook error (harmless):", err.message));
        } else {
            console.warn("вљ пёЏ [CANCEL] No active generation ID found to cancel.");
        }

        // 3. Cleanup & FORCE RESET
        cleanupMonitoring();
        setLoading(false);
        setCurrentStatus('canceled'); // Explicitly show canceled status
        setActiveGenerationId(null);
        if (pollingInterval.current) clearInterval(pollingInterval.current);

        // Ensure no error is left handling
        setError(null);
        localStorage.removeItem('active_avatar_id');
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
        setIsEditMode(false); // This is a new generation, not an edit
        setOriginalImageForCompare(null); // Clear any previous comparison
        generationStartTime.current = Date.now(); // рџ•’ TIME MARKER for Deep Scan

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
                seed: seed,
                steps: steps,
                guidance_scale: cfg,
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
            console.log("рџ“Ў [WEBHOOK] Sending request to:", WEBHOOK_URL);
            console.log("рџ“¦ [WEBHOOK] Payload:", JSON.stringify(payload, null, 2));

            try {
                const response = await axios.post(WEBHOOK_URL, payload, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 60000,
                    signal: controllerRef.current.signal
                });
                console.log("вњ… [WEBHOOK] Response Status:", response.status);
            } catch (postErr: any) {
                // If it's a timeout, we ignore it because monitoring is already running.
                // The backend (n8n) will continue processing and update Supabase.
                if (postErr.code === 'ECONNABORTED' || postErr.message?.includes('timeout')) {
                    console.log("вЏ±пёЏ POST timed out, but monitoring is active. Waiting for Supabase update...");
                    return; // Stay in loading state, monitoring will handle resolution
                } else if (axios.isCancel(postErr) || postErr.name === 'CanceledError') {
                    throw postErr; // Re-throw to be handled by the outer catch
                } else {
                    console.warn("вљ пёЏ Webhook response error, but monitoring continues. If status doesn't change, check backend.", postErr);
                    // We don't throw here to allow monitoring to catch potential success even if webhook response had issues
                    return;
                }
            }

        } catch (err: any) {
            // Check if the request was canceled by the user
            if (axios.isCancel(err) || err.name === 'CanceledError') {
                console.log('Generation canceled by user');
                setError('Generation stopped by user.');
                setLoading(false); // Force loading to false
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

    const handleEditSubmit = async () => {
        console.log("рџ–±пёЏ [QUICK EDIT] Submit triggered. Prompt:", editPrompt);
        if (!editPrompt.trim()) {
            alert("Please enter a description for the edit.");
            return;
        }

        generationStartTime.current = Date.now(); // рџ•’ TIME MARKER for Deep Scan
        setLoading(true);
        setShowQuickEdit(false); // Hide bar while processing
        setIsEditMode(true); // This is an edit, show comparison slider
        if (generatedImage) setOriginalImageForCompare(generatedImage);

        try {
            // 1. Lock in the "Before" state for comparison
            if (generatedImage) {
                // setOriginalImageUrl(generatedImage); // REMOVED (Legacy)
            }

            // NOTE: We do NOT create a row here manually like in handleGenerate.
            // Why? Because 'job_type: edit' is handled differently by the Main Hook currently?
            // Wait, actually, let's keep it simple and consistent with yesterday's working version.
            // Yesterday's version likely just sent the payload and let N8n handle or return the ID.
            // However, to be safe and ensure UI tracking works, we will rely on the
            // "Deep Scan" (polling) to pick up the new row once N8n creates it, 
            // OR if the N8n webhook returns the ID immediately (synchronous).

            // Let's stick to the simplest payload that worked yesterday:

            // 1. Create a unique Generation ID (UUID) for tracking
            const generationId = uuidv4();

            // 2. Create an initial record in the 'generations' table
            const { error: dbError } = await supabase
                .from('generations')
                .insert([{
                    id: generationId,
                    type: 'avatar',
                    prompt: editPrompt,
                    status: 'processing',
                    image_url: generatedImage,
                    metadata: {
                        guest_id: guestId,
                        job_type: 'edit',
                        original_image: originalImageForCompare
                    }
                }]);

            if (dbError) console.error("Database initialization failed for edit:", dbError);

            const payload = {
                generation_id: generationId,
                job_type: "edit",
                gender: gender,
                clothing: "edit",
                face_image_url: generatedImage,
                user_prompt: editPrompt,
                // We no longer send steps/seed for edit jobs to avoid 'messing up' 
                // the fast Qwen model. It uses values pre-set in the backend (n8n JSON).
                instantid_weight: 0.85,
                style_token: "realistic",
                guest_id: guestId
            };

            const response = await fetch('/api/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to start edit workflow via Main Hook');

            // We don't have the new ID yet. 
            // The "Deep Scan" in checkStatus() will detect a new record created after generationStartTime.
            console.log("рџ”„ [EDIT] Request sent. Waiting for Deep Scan to detect new job...");

            // We just keep checking the LAST known ID or just rely on the global poller?
            // Actually, startMonitoring requires an ID. 
            // If we don't have one, we can't call startMonitoring(newId).
            // But checkStatus also has a "Deep Scan" block that runs if we poll ANY valid ID.
            // So we can just keep polling the current ID, and the Deep Scan logic inside checkStatus
            // will notice a NEWER row has appeared.

            // EDIT: Always use deep scan for edits - we need to find a NEW record with different URL
            // Don't use startMonitoring(oldId) as it would just find the old completed record
            console.log("🔄 [EDIT] Starting dedicated Deep Scan loop to find new result...");
            console.log("🕐 [EDIT] Start time ref:", generationStartTime.current);
            console.log("🖼️ [EDIT] Looking for URL different from:", originalImageForCompare?.substring(0, 50));

            let loopCount = 0;
            const maxLoops = 60; // 2 min max

            const deepScanLoop = async () => {
                loopCount++;

                if (loopCount > maxLoops) {
                    console.error("❌ [DEEP SCAN] Timeout after", maxLoops, "attempts");
                    setLoading(false);
                    setError("Generation timed out. Check History for results.");
                    return;
                }

                try {
                    const { data: latestData, error: dbErr } = await supabase
                        .from('generations')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    if (dbErr) {
                        console.error("DB Error:", dbErr);
                        setTimeout(deepScanLoop, 2000);
                        return;
                    }

                    if (latestData) {
                        const latestUrl = (latestData as any).result_url || latestData.image_url || latestData.url || (latestData.metadata?.result_url);
                        const latestFinished = (latestUrl && latestUrl.length > 10) || latestData.status === 'completed' || latestData.status === 'success' || latestData.status === 'Success';
                        const recordTime = new Date(latestData.created_at).getTime();
                        const startTime = generationStartTime.current;
                        // Allow 60 seconds tolerance for clock skew
                        const isRecent = recordTime > (startTime - 60000);

                        console.log(`📊 [SCAN #${loopCount}] ID:${latestData.id?.substring(0, 8)} status:${latestData.status} finished:${latestFinished} recent:${isRecent} URL:${latestUrl?.substring(0, 40)}...`);

                        if (latestFinished && latestUrl && isRecent) {
                            // In edit mode, we need a DIFFERENT image than the one we started with
                            if (isEditMode && originalImageForCompare && latestUrl === originalImageForCompare) {
                                console.log("⏳ [DEEP SCAN] Found same image as original, waiting for edit result...");
                                setTimeout(deepScanLoop, 2000);
                                return;
                            }
                            console.log("✅ [DEEP SCAN] SUCCESS! Found image:", latestUrl);
                            setGeneratedImage(latestUrl);
                            setLoading(false);
                            fetchHistory();
                            return;
                        }
                    }

                    setTimeout(deepScanLoop, 2000);
                } catch (err) {
                    console.error("Deep scan error:", err);
                    setTimeout(deepScanLoop, 2000);
                }
            };

            deepScanLoop();

        } catch (error) {
            console.error("Edit Error:", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert(`Edit Failed Details: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`);
            setLoading(false);
        }
    };

    return (
        <div className="w-full relative animate-fade-in pb-20">


            {/* Header Removed for Redesign 2026 */}

            {/* Switched to Flexbox for Mobile Stability, Grid for Desktop - Match Video/Premium Style */}
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

                {/* Left Banner - Restored High-Res & Art Deco Corners to match Video Generator exactly */}
                {/* Left Panel: Showcase Gallery (Vertical List) - Moved to bottom on mobile (order-3) */}
                <div className="order-3 lg:order-1 lg:col-span-3 lg:h-[1300px] overflow-y-auto custom-scrollbar pr-2">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <Sparkles size={16} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">{t('section_source_frames')}</span>
                        </div>

                        {/* Load & Edit Button (User Request) */}
                        <div className="relative">
                            <button
                                onClick={() => document.getElementById('sidebar-upload-trigger')?.click()}
                                className="px-3 py-1.5 border border-[#d2ac47] text-[var(--text-secondary)] rounded text-[9px] font-bold uppercase tracking-wider hover:bg-[#d2ac47] hover:text-black transition-all flex items-center gap-2"
                            >
                                <Upload size={10} />
                                <span>{t('btn_load_edit')}</span>
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
                                            setShowQuickEdit(true);
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
                                    className="group/item relative bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl overflow-hidden aspect-[9/16] shrink-0 cursor-pointer transition-all hover:border-[#d2ac47] hover:shadow-[0_0_20px_rgba(210,172,71,0.2)]"
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

                                    {/* Hover Overlay - Bottom Actions Toolbar */}
                                    <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex flex-col justify-end items-center p-3 gap-3">

                                        {/* Floating Action Buttons (Download & Delete) */}
                                        <div className="flex gap-4 transform translate-y-4 group-hover/item:translate-y-0 transition-transform duration-300">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(item.result_url || item.image_url || item.url, '_blank');
                                                }}
                                                className="w-9 h-9 rounded-full bg-[var(--bg-input)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center justify-center hover:bg-[#d2ac47] hover:text-black hover:scale-110 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)] dark:bg-[#1a1a1a]/80"
                                                title="Open Full Size"
                                            >
                                                <Maximize2 size={14} />
                                            </button>

                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!window.confirm('Delete this image?')) return;
                                                    const { error } = await supabase.from('generations').delete().eq('id', item.id);
                                                    if (!error) {
                                                        setGalleryItems(prev => prev.filter(i => i.id !== item.id));
                                                    }
                                                }}
                                                className="w-9 h-9 rounded-full bg-[var(--bg-input)]/80 backdrop-blur-md border border-red-500/30 text-red-500/80 flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)] dark:bg-[#1a1a1a]/80"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        {/* "Use As Source" Button */}
                                        <div className="w-full py-2.5 bg-[var(--bg-input)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-secondary)] text-[8px] font-bold uppercase tracking-[0.2em] text-center rounded-xl cursor-pointer hover:bg-[#d2ac47] hover:text-black hover:border-[#d2ac47] transition-all transform translate-y-4 group-hover/item:translate-y-0 transition-transform duration-300 delay-75 shadow-lg dark:bg-black/80">
                                            Use As Source
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {
                        galleryItems.filter(item => {
                            const url = item.result_url || item.video_url || item.url || '';
                            return !url.toLowerCase().endsWith('.mp4') && item.type !== 'video';
                        }).length === 0 && (
                            <div className="text-[var(--text-secondary)]/30 text-xs text-center py-10 font-mono text-[10px] uppercase tracking-widest border border-dashed border-[#d2ac47]/10 rounded-xl mt-4">
                                NO SOURCE IMAGES
                            </div>
                        )
                    }
                </div>

                {/* Center COLUMN: Canvas / Preview (Span 6) */}
                <div className="order-1 lg:order-2 w-full lg:col-span-6 flex flex-col gap-6 relative z-50">

                    {/* NEW: Compact Identity Toolbar (Above Canvas) */}
                    <div className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--border-color)] rounded-xl px-2 py-1 flex flex-col md:flex-row gap-2 items-center justify-between shadow-lg relative z-[200]">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 w-full">
                            <CustomSelect
                                label={t('opt_gender')}
                                value={gender}
                                onChange={setGender}
                                options={[{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }, { label: 'Trans', value: 'transgender' }]}
                            />
                            <div className="group relative">
                                <label className="text-[var(--text-secondary)] text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5 block text-center truncate">{t('opt_age')}</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] p-2 md:p-2.5 text-[10px] md:text-xs text-center rounded-lg focus:border-[#d2ac47] outline-none font-bold tracking-widest uppercase transition-colors hover:border-[#d2ac47]/60"
                                    value={age}
                                    placeholder="24"
                                    onChange={(e) => { if (e.target.value === '' || /^\d+$/.test(e.target.value)) setAge(e.target.value); }}
                                    onBlur={() => { if (age && Number(age) < 18) setAge('18'); if (Number(age) > 90) setAge('90'); }}
                                />
                            </div>
                            <CustomSelect
                                label={t('opt_nation')}
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
                                label={t('opt_clothing')}
                                value={clothing}
                                onChange={setClothing}
                                options={[{ label: 'Dressed', value: 'dressed' }, { label: 'Semi-Dressed', value: 'semi-dressed' }, { label: 'Nude', value: 'nude' }]}
                            />
                            <CustomSelect
                                label={t('opt_role')}
                                value={role}
                                onChange={setRole}
                                options={[
                                    { label: t('opt_any'), value: '' },

                                    { label: t('role_teacher'), value: 'Seductive Teacher' },
                                    { label: t('role_maid'), value: 'Submissive Maid' },
                                    { label: t('role_attendant'), value: 'Insatiable Flight Attendant' },
                                    { label: t('role_boss'), value: 'Strict Boss / CEO' },
                                    { label: t('role_nun'), value: 'Naughty Nun' },
                                    { label: t('role_yoga'), value: 'Gentle Yoga Instructor' },
                                    { label: t('role_gothic'), value: 'BDSM Gothic diva' },
                                    { label: t('role_cyberpunk'), value: 'sex mashine Cyberpunk rebel' },
                                    { label: t('role_secretary'), value: 'The Insatiable Secretary' },
                                    { label: t('role_blogger'), value: 'sexual outspoken tik tok blogger' }
                                ]}
                            />
                        </div>
                    </div>
                    {/* Visual Source (Moved from Input Block) - Acts as "Canvas" if editing */}

                    {/* Main Output / Active Workspace */}
                    <div className="bg-[var(--bg-primary)] dark:bg-black border border-[var(--border-color)] rounded-3xl relative flex items-center justify-center overflow-hidden shadow-2xl group flex-col w-full transition-all duration-700 h-[500px] md:h-[580px] shrink-0 mx-2 md:mx-0">
                        {generatedImage ? (
                            <img src={generatedImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 blur-3xl scale-150 saturate-150" />
                        ) : (
                            // Theme-aware radial gradient
                            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--bg-tertiary)_0%,_var(--bg-primary)_100%)] opacity-50 dark:bg-black dark:opacity-100"></div>
                        )}
                        {/* Light mode only gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#F9F1D8] via-[#F9F1D8]/20 to-transparent dark:hidden"></div>

                        {/* Content Overlay */}
                        {generatedImage ? (
                            <>
                                {/* Image Wrapper with Overlay */}
                                <div className="absolute inset-0 z-10 group cursor-pointer">
                                    {/* Top Right Controls */}
                                    <div className="absolute top-4 right-4 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Try both possible elements (single image or slider container)
                                                const elem = document.getElementById('canvas-content') || document.getElementById('generated-avatar-image');
                                                if (elem) {
                                                    if (document.fullscreenElement) {
                                                        document.exitFullscreen();
                                                    } else {
                                                        elem.requestFullscreen().catch(err => {
                                                            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                                                        });
                                                    }
                                                }
                                            }}
                                            className="p-2 bg-[var(--bg-input)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-secondary)] rounded-full hover:bg-[#d2ac47] hover:text-black transition-all hover:scale-110 shadow-lg dark:bg-black/40"
                                            title="Full Screen"
                                        >
                                            <Maximize2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(t('msg_clear_workspace'))) {

                                                    setGeneratedImage(null);
                                                    setIsEditMode(false);
                                                    setOriginalImageForCompare(null);
                                                }
                                            }}
                                            className="p-2 bg-[var(--bg-input)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-secondary)] rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-all hover:scale-110 shadow-lg dark:bg-black/40"
                                            title="Clear Workspace"
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                    {/* Central Content: Comparison Slider or Single Image */}
                                    <div id="canvas-content" className="w-full h-full relative">
                                        {isEditMode && originalImageForCompare && generatedImage ? (
                                            <ImageComparisonSlider before={originalImageForCompare} after={generatedImage} />
                                        ) : (
                                            <img
                                                id="generated-avatar-image"
                                                src={generatedImage}
                                                alt="Generated Avatar"
                                                className="w-full h-full object-contain drop-shadow-2xl shadow-black"
                                            />
                                        )}

                                        {/* Quick Edit Overlay - Fixed on Mobile (Toast style), Absolute on Desktop */}
                                        {showQuickEdit && (
                                            <div className="fixed bottom-4 inset-x-4 md:absolute md:bottom-20 md:inset-x-4 z-[100] animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                                <div className="bg-[var(--bg-input)]/95 backdrop-blur-xl border border-[#d2ac47]/40 rounded-2xl p-3 md:p-4 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col gap-3 max-w-2xl mx-auto ring-1 ring-[#d2ac47]/20">

                                                    {/* Reference Slots (Quick Edit) */}
                                                    <div className="flex gap-2 shrink-0">
                                                        {[0, 1].map((idx) => (
                                                            <div key={idx} className="relative flex flex-col items-center gap-1 group/wrapper">
                                                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50 group-hover/wrapper:opacity-100 transition-opacity">
                                                                    {t('lbl_ref')} {idx + 2}
                                                                </span>
                                                                <div
                                                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg border border-dashed flex items-center justify-center cursor-pointer transition-all relative overflow-hidden group/slot
                                                                        ${editRefImages[idx] ? 'border-[#d2ac47] bg-[#d2ac47]/10' : 'border-[var(--border-color)] hover:border-[#d2ac47] bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/80'}
                                                                    `}
                                                                    onClick={() => {
                                                                        const input = document.createElement('input');
                                                                        input.type = 'file';
                                                                        input.accept = 'image/*';
                                                                        input.onchange = async (e) => {
                                                                            const file = (e.target as HTMLInputElement).files?.[0];
                                                                            if (file) {
                                                                                const reader = new FileReader();
                                                                                reader.onload = (e) => {
                                                                                    setEditRefImages(prev => {
                                                                                        const next = [...prev];
                                                                                        next[idx] = e.target?.result as string;
                                                                                        return next;
                                                                                    });
                                                                                };
                                                                                reader.readAsDataURL(file);
                                                                            }
                                                                        };
                                                                        input.click();
                                                                    }}
                                                                    title={`${t('btn_upload')} ${t('lbl_ref')} ${idx + 2}`}

                                                                >
                                                                    {editRefImages[idx] ? (
                                                                        <>
                                                                            <img src={editRefImages[idx]!} className="w-full h-full object-cover opacity-80 group-hover/slot:opacity-100 transition-opacity" />
                                                                            <div
                                                                                className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5 opacity-0 group-hover/slot:opacity-100 transition-opacity z-10 hover:bg-red-900"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setEditRefImages(prev => {
                                                                                        const next = [...prev];
                                                                                        next[idx] = '';
                                                                                        return next;
                                                                                    });
                                                                                }}
                                                                            >
                                                                                <X size={8} className="text-white" />
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <Plus className="text-[var(--text-secondary)]/30 group-hover/slot:text-[var(--text-secondary)] transition-colors" size={16} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center w-full">
                                                        <div className="flex gap-2 items-center flex-1">
                                                            <div className="p-2 md:p-3 bg-gold-gradient/10 rounded-xl border border-[var(--border-color)] shrink-0 hidden md:block">
                                                                <Wand2 size={20} className="text-[var(--text-secondary)] animate-pulse" />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={editPrompt}
                                                                onChange={(e) => setEditPrompt(e.target.value)}
                                                                placeholder={t('ph_edit_desc')}
                                                                className="flex-1 bg-transparent text-[var(--text-primary)] text-xs md:text-sm font-medium placeholder-[var(--text-secondary)]/30 focus:outline-none min-w-0"
                                                                autoFocus
                                                                onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
                                                            />
                                                        </div>

                                                        <div className="h-[1px] w-full md:w-[1px] md:h-8 bg-[#d2ac47]/20 mx-0 md:mx-2 shrink-0"></div>

                                                        <div className="flex gap-2 shrink-0 justify-end">
                                                            <button
                                                                onClick={handleEditSubmit}
                                                                disabled={loading || !editPrompt.trim()}
                                                                className="flex-1 md:flex-none px-4 md:px-6 py-2 bg-[#d2ac47]/10 border border-[#d2ac47] text-[#d2ac47] font-black uppercase tracking-widest text-[9px] md:text-[10px] rounded-xl hover:bg-gold-gradient hover:text-black hover:shadow-[0_0_20px_rgba(210,172,71,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 whitespace-nowrap"
                                                            >
                                                                {loading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                                                <span>{loading ? t('vid_forging') : t('btn_quick_edit')}</span>

                                                            </button>
                                                            <button
                                                                onClick={() => setShowQuickEdit(false)}
                                                                className="p-2 text-[var(--text-secondary)]/50 hover:text-red-500 transition-colors bg-black/5 dark:bg-white/5 rounded-xl md:bg-transparent"
                                                            >
                                                                <XCircle size={20} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Overlay Layer - Removed blur & central button */}
                                    <div className="absolute inset-0 z-20 pointer-events-none group-hover:bg-transparent transition-all duration-300">
                                        <div className="absolute bottom-14 right-4 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 flex flex-col gap-2 items-end">
                                            {/* Animate Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (generatedImage) {
                                                        localStorage.setItem('pendingVideoSource', generatedImage);
                                                        window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'video' }));
                                                    }
                                                }}
                                                className="px-4 py-2 bg-[var(--bg-input)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl hover:bg-[#d2ac47] hover:text-black transition-all flex items-center gap-2 shadow-lg hover:scale-105 group/btn dark:bg-black/40"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:animate-pulse">
                                                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                                                    <line x1="7" y1="2" x2="7" y2="22"></line>
                                                    <line x1="17" y1="2" x2="17" y2="22"></line>
                                                    <line x1="2" y1="12" x2="22" y2="12"></line>
                                                    <line x1="2" y1="7" x2="7" y2="7"></line>
                                                    <line x1="2" y1="17" x2="7" y2="17"></line>
                                                    <line x1="17" y1="17" x2="22" y2="17"></line>
                                                    <line x1="17" y1="7" x2="22" y2="7"></line>
                                                </svg>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('btn_to_video')}</span>

                                            </button>

                                            {/* Edit Button - Toggles Quick Edit Bar */}
                                            <button
                                                onClick={() => {
                                                    if (!generatedImage) return;
                                                    setShowQuickEdit(!showQuickEdit);
                                                }}
                                                className={`px-4 py-2 backdrop-blur-md border rounded-xl transition-all flex items-center gap-2 shadow-lg hover:scale-105 group/btn ${showQuickEdit ? 'bg-[#d2ac47] text-black border-[#d2ac47]' : 'bg-[var(--bg-input)]/80 border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[#d2ac47] hover:text-black dark:bg-black/40'}`}
                                            >
                                                <Sparkles size={14} className="group-hover/btn:animate-spin" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{showQuickEdit ? t('btn_close_edit') : t('btn_quick_edit')}</span>

                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Actions - Download Only */}
                                <div className="absolute bottom-4 right-4 z-40">
                                    <button
                                        onClick={handleDownload}
                                        className="px-3 py-1.5 bg-[var(--bg-input)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:bg-[#d2ac47] hover:text-black transition-all flex items-center gap-2 shadow-lg hover:scale-105 dark:bg-black/40"
                                    >
                                        <Download size={12} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">{t('btn_download')}</span>

                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                {/* Gradient Overlay for readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-0"></div>

                                {/* Brand Header */}
                                <div className="mb-8 text-center transform -translate-y-4 relative z-10">
                                    <div className="flex items-center justify-center gap-4 mb-3 opacity-80">
                                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#d2ac47]/50"></div>
                                        <span className="text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.4em] font-bold animate-pulse">{t('title_identity_forge')}</span>
                                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#d2ac47]/50"></div>
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-serif text-[var(--text-primary)] tracking-wide drop-shadow-[0_0_25px_rgba(210,172,71,0.2)] mb-4">
                                        <Trans i18nKey="title_create_avatar" components={{ 1: <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d2ac47] to-[#F9F1D8] italic font-light" /> }} />
                                    </h1>
                                    <p className="text-[var(--text-secondary)]/40 text-[9px] uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed border-t border-[#d2ac47]/10 pt-4 mt-2">
                                        {t('desc_identity_forge')}
                                    </p>
                                </div>

                                {/* Active Workspace Indicator - Larger & Centered & Clickable */}
                                <div
                                    className="flex flex-col items-center opacity-60 mt-4 cursor-pointer hover:opacity-100 hover:scale-110 transition-all active:scale-95 pointer-events-auto relative z-10"
                                    onClick={() => document.getElementById('sidebar-upload-trigger')?.click()}
                                    title={t('tooltip_upload_edit')}

                                >
                                    <Camera size={42} className="text-[var(--text-secondary)]/30 mb-4 animate-pulse group-hover:text-[var(--text-secondary)] transition-colors" />
                                    <span className="text-[var(--text-secondary)]/40 text-[10px] font-bold uppercase tracking-[0.3em] text-center group-hover:text-[var(--text-secondary)] transition-colors">{t('ph_click_upload')}</span>
                                </div>
                            </div>
                        )}

                        {(loading || error) && (
                            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center cursor-pointer" onClick={() => setError(null)}>
                                <AvatarLogger status={currentStatus} error={error} />
                                {error && <div className="absolute bottom-10 text-[var(--text-secondary)]/50 text-[10px] uppercase tracking-widest animate-pulse">{t('btn_close_edit')}</div>}

                            </div>
                        )}
                    </div>

                    {/* Generate Button Area (Floating at bottom of center) */}
                    <div className="flex gap-4">
                        {loading && (
                            <button
                                onClick={handleCancel}
                                className="px-6 py-5 border border-red-500/30 bg-[var(--bg-primary)] text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] group/cancel"
                            >
                                <XCircle size={20} className="transition-transform duration-300 group-hover/cancel:rotate-90" />
                            </button>
                        )}
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className={`flex-1 font-bold uppercase tracking-[0.3em] py-5 rounded-xl shadow-[0_0_25px_rgba(210,172,71,0.4)] transition-all flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(210,172,71,0.6)] ${loading ? 'bg-gold-gradient text-black opacity-90 cursor-wait' : 'bg-gold-gradient text-black border border-[#fbeea4]/30'}`}
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                            {loading ? t('vid_forging') : t('btn_generate')}
                        </button>
                    </div>

                    {/* MOVED: Identity Matrix / Settings (Now below Canvas) */}
                    <div className="grid grid-cols-1 gap-4">


                        {/* 2. Visual Sources - Art Deco Panel */}
                        <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-3xl p-5 md:p-8 relative shadow-2xl transition-all hover:border-[#d2ac47]/40 mx-2 md:mx-0">
                            <div className="absolute top-0 left-0 px-4 md:px-6 py-2 bg-[#d2ac47] text-black text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase rounded-tl-3xl rounded-br-2xl shadow-lg">
                                {t('section_visual_source')}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                                {/* 1. Main Face Input */}
                                <div className="border rounded-2xl p-4 md:p-6 border-[#d2ac47] bg-[var(--bg-input)] flex flex-col group overflow-hidden hover:border-[#d2ac47]/60 h-[340px] md:h-[480px]">
                                    <div className="flex items-center gap-3 mb-4 h-8 shrink-0">
                                        <div className="w-8 h-8 border border-[#d2ac47] rounded-full flex items-center justify-center bg-[#d2ac47]/10 text-[var(--text-secondary)]">
                                            <User size={16} />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text-secondary)]">
                                            {t('label_face_ref')}
                                        </span>
                                    </div>
                                    {/* Drag & Drop Zone */}
                                    <div className="flex-1 relative overflow-hidden rounded-xl mb-3 bg-black/5">
                                        <ImageUploadZone
                                            onImageUpload={({ url }) => {
                                                setFaceImageUrl(url);
                                                setError(null);
                                            }}
                                            currentUrl={faceImageUrl}
                                            placeholder={t('ph_face_photo')}
                                            className="h-full w-full"
                                        />
                                    </div>

                                    {/* Face Gallery - Horizontal Strip */}
                                    <div className="flex justify-center mb-2 shrink-0 w-full px-1">
                                        <FaceGallery
                                            onSelect={(url) => {
                                                setFaceImageUrl(url);
                                                setError(null);
                                            }}
                                            className=""
                                        />
                                    </div>
                                    {/* Likeness Slider - Centered vertically for better balance */}
                                    <div className="h-16 shrink-0 flex flex-col justify-center">
                                        <div className="flex justify-between text-[var(--text-secondary)] text-[9px] font-bold tracking-[0.2em] uppercase mb-1">
                                            <span>{t('label_likeness')}</span>
                                            <span>{instantIdWeight}</span>
                                        </div>
                                        <input type="range" min="0" max="1" step="0.05" value={instantIdWeight} onChange={(e) => setInstantIdWeight(Number(e.target.value))}
                                            className="w-full h-1 bg-[#d2ac47]/20 rounded-lg appearance-none cursor-pointer mt-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#d2ac47] [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-110 transition-all" />
                                    </div>
                                </div>

                                {/* 2. Body Reference Toggle */}
                                <div className={`border rounded-2xl p-4 md:p-6 group/body flex flex-col h-[340px] md:h-[480px] transition-all duration-500 ${error?.includes('Body') ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] bg-red-950/10' : (grabBody && !bodyRefUrl) ? 'border-solid border-red-500/50 bg-red-950/5' : grabBody ? 'border-solid border-[#d2ac47]/50 bg-[var(--bg-input)]' : 'border-dashed border-[var(--border-color)] bg-transparent hover:border-[#d2ac47]/50 hover:bg-[#d2ac47]/5'} `}>

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
                                                    <span className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5 ${!bodyRefUrl ? 'text-red-500' : 'text-[var(--text-secondary)]'}`}>{t('label_body_ref')}</span>
                                                    <span className={`text-[8px] uppercase tracking-wider ${!bodyRefUrl ? 'text-red-500/40' : 'text-[var(--text-secondary)]/40'}`}>{t('ph_close_unused')}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full text-center">
                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text-secondary)]/70">{t('label_body_ref')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Interaction Area */}
                                    <div className="flex-1 relative rounded-xl overflow-hidden mb-3 bg-black/5">
                                        {grabBody ? (
                                            <div className="animate-fade-in w-full h-full">
                                                <ImageUploadZone
                                                    onImageUpload={({ url }) => {
                                                        setBodyRefUrl(url);
                                                        setError(null);
                                                    }}
                                                    currentUrl={bodyRefUrl}
                                                    placeholder={t('ph_body_ref_image')}
                                                    className="h-full w-full"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:bg-[#d2ac47]/5" onClick={() => setGrabBody(true)}>
                                                <div className="w-16 h-16 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)]/70 flex items-center justify-center mb-3 group-hover/body:border-[#d2ac47]/60 group-hover/body:text-[var(--text-secondary)] transition-all">
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M7 5 C7 8 9 11 10.5 12 C12 13 8 18 7 19" />
                                                        <path d="M17 5 C17 8 15 11 13.5 12 C12 13 16 18 17 19" />
                                                    </svg>
                                                </div>
                                                <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-[var(--text-secondary)] text-center px-4">{t('ph_click_body')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* OR Block */}
                                    <div className="flex items-center gap-3 h-6 shrink-0 opacity-60">
                                        <div className="h-[1px] flex-1 bg-[#d2ac47]/30"></div>
                                        <span className="text-[var(--text-secondary)] text-[8px] font-bold tracking-[0.2em]">{t('label_or')}</span>

                                        <div className="h-[1px] flex-1 bg-[#d2ac47]/30"></div>
                                    </div>

                                    {/* Dropdown Controls - Centered vertically */}
                                    <div className="h-16 flex flex-col justify-center shrink-0">
                                        <CustomSelect
                                            label={t('label_body_structure')}
                                            value={bodyType}
                                            onChange={(val) => setBodyType(val)}
                                            disabled={grabBody}
                                            centerLabel={true}
                                            options={[
                                                { label: 'Any', value: '' },
                                                { label: 'Fitness Model', value: 'fitness model' },
                                                { label: 'Thin', value: 'thin' },
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
                                <div className={`border rounded-2xl p-4 md:p-6 group/comp flex flex-col h-[340px] md:h-[480px] transition-all duration-500 ${error?.includes('Background') ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] bg-red-950/10' : (grabComposition && !compositionUrl) ? 'border-solid border-red-500/50 bg-[var(--bg-input)]' : grabComposition ? 'border-solid border-[#d2ac47]/50 bg-[var(--bg-input)]' : 'border-dashed border-[var(--border-color)] bg-transparent hover:border-[#d2ac47]/50 hover:bg-[#d2ac47]/5'} `}>

                                    {/* Structural Alignment: Header Spacer or Real Header */}
                                    <div className="h-8 mb-4 flex items-center gap-3 shrink-0">
                                        {grabComposition ? (
                                            <>
                                                <button
                                                    className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 hover:rotate-90 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 hover:border-red-500 shrink-0 aspect-square shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-in slide-in-from-left-6 fade-in duration-500"
                                                    onClick={() => setGrabComposition(false)}
                                                    title={t('btn_close_edit')}

                                                >
                                                    <XCircle size={20} strokeWidth={2} />
                                                </button>
                                                <div className="flex flex-col leading-none animate-in slide-in-from-left-8 fade-in duration-700">
                                                    <span className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5 ${!compositionUrl ? 'text-red-500' : 'text-[var(--text-secondary)]'}`}>{t('label_bg_reference')}</span>
                                                    <span className={`text-[8px] uppercase tracking-wider ${!compositionUrl ? 'text-red-500/40' : 'text-[var(--text-secondary)]/40'}`}>{t('ph_close_unused')}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full text-center">
                                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text-secondary)]/70">{t('label_bg_reference')}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 relative overflow-hidden rounded-xl mb-3 bg-black/5 focus-within:ring-1 ring-[#d2ac47]/30">
                                        {grabComposition ? (
                                            <div className="animate-fade-in w-full h-full">
                                                <ImageUploadZone
                                                    onImageUpload={({ url }) => {
                                                        setCompositionUrl(url);
                                                        setError(null);
                                                    }}
                                                    currentUrl={compositionUrl}
                                                    placeholder={t('ph_bg_ref_image')}
                                                    className="h-full w-full"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:bg-[#d2ac47]/5" onClick={() => setGrabComposition(true)}>
                                                <div className="w-16 h-16 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)]/70 flex items-center justify-center mb-3 group-hover/comp:border-[#d2ac47]/60 group-hover/comp:text-[var(--text-secondary)] transition-all">
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                        <path d="M3 15C3 15 8 13 11 15C14 17 18 14 21 16" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                    </svg>
                                                </div>
                                                <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-[var(--text-secondary)] text-center px-4">{t('ph_click_bg')}</span>
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
                        {error && <div className="text-red-400 text-center font-serif italic bg-red-950/30 p-4 border border-red-900/50 rounded-xl animate-pulse mb-4">{t('status_error')}: {error}</div>}

                    </div>
                </div >
                {/* Right Panel: Gallery + Fine Tuning (Stacked) - Moved to middle on mobile (order-2) */}
                <div className="order-2 xl:order-3 w-full xl:col-span-3 h-auto xl:h-[1300px] flex flex-col gap-4 relative z-10">

                    {/* 1. Gallery (Styled like VideoGenerator) */}
                    <div className="order-2 xl:order-1 flex-1 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-3xl p-2 shadow-2xl relative flex flex-col overflow-hidden mx-2 md:mx-0 min-h-[650px] lg:min-h-0">
                        <div className="flex items-center justify-between h-10 px-0">
                            <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.2em] pl-4">{t('vid_history')}</span>
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
                    </div >

                    {/* 2. Fine Tuning Block (Moved Here - Compacted) */}
                    <div className="order-1 xl:order-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-3xl p-5 relative z-[100] shadow-2xl transition-all hover:border-[#d2ac47]/40 shrink-0">
                        <div className="absolute top-0 left-0 px-4 py-1.5 bg-[#d2ac47] text-black text-[9px] font-bold tracking-[0.2em] uppercase rounded-tl-3xl rounded-br-2xl shadow-lg">
                            {t('section_fine_tuning')}
                        </div>

                        <div className="mt-4 space-y-4">
                            {/* Art Style */}
                            <CustomSelect
                                label={t('label_art_style')}
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
                                <label className="text-[var(--text-secondary)] text-[9px] font-bold tracking-[0.2em] uppercase mb-1 block">{t('label_prompt')}</label>
                                <textarea value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] p-3 text-xs h-20 focus:outline-none focus:border-[#d2ac47] rounded-xl shadow-inner resize-none"
                                    placeholder={t('ph_prompt')} />

                                <div className="flex flex-col gap-2 mt-2">
                                    <div className="flex flex-col gap-2 p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)]">
                                        <div className="flex justify-between items-center h-6">
                                            <span className="text-[var(--text-secondary)] text-[9px] uppercase tracking-wider font-bold">{t('label_seed')}</span>
                                            <div className="flex bg-[var(--bg-primary)] rounded-lg p-0.5 border border-[var(--border-color)]">
                                                <button
                                                    onClick={() => { setSeedMode('random'); setSeed(-1); }}
                                                    className={`px-3 py-0.5 text-[8px] font-bold uppercase rounded-md transition-all ${seedMode === 'random' ? 'bg-[#d2ac47] text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                                >
                                                    {t('ph_random')}
                                                </button>
                                                <button
                                                    onClick={() => { setSeedMode('fixed'); setSeed((prev) => prev === -1 ? Math.floor(Math.random() * 1000000) : prev); }}
                                                    className={`px-3 py-0.5 text-[8px] font-bold uppercase rounded-md transition-all ${seedMode === 'fixed' ? 'bg-[#d2ac47] text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                                >
                                                    {t('mode_fixed')}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Always visible input to prevent layout shift */}
                                        <div className={`flex items-center gap-2 transition-all duration-300 ${seedMode === 'random' ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
                                            <input
                                                type="text"
                                                value={seed === -1 ? '' : seed}
                                                placeholder={seedMode === 'random' ? "🎲 Randomized" : "Enter Seed"}
                                                onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                                                className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-xs font-mono w-full p-1.5 focus:outline-none focus:border-[#d2ac47] text-center disabled:cursor-not-allowed placeholder:text-[var(--text-secondary)]/50"
                                                disabled={seedMode === 'random'}
                                            />
                                            <button
                                                onClick={() => setSeed(Math.floor(Math.random() * 2147483647))}
                                                className="p-1.5 border border-[var(--border-color)] rounded-lg hover:border-[#d2ac47] text-[var(--text-secondary)] transition-colors bg-[var(--bg-primary)]"
                                                title="New Random Seed"
                                                disabled={seedMode === 'random'}
                                            >
                                                <RefreshCw size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Steps Slider (30-100) */}
                                    <div className="w-full flex flex-col gap-1 b bg-[var(--bg-input)] border border-[var(--border-color)] p-2 px-3 rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[var(--text-secondary)] text-[9px] uppercase tracking-wider">{t('label_steps')}</span>
                                            <span className="text-[#d2ac47] text-[10px] font-mono font-bold">{steps}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="20"
                                            max="100"
                                            step="1"
                                            value={steps}
                                            onChange={(e) => setSteps(parseInt(e.target.value))}
                                            className="w-full h-1 bg-[#d2ac47]/20 rounded-lg appearance-none cursor-pointer mt-1 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#d2ac47] [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                        />
                                    </div>

                                    {/* CFG Mode Toggle (Photoreal vs Quality) */}
                                    <div className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-1 rounded-xl flex gap-1 h-10 relative overflow-hidden">
                                        <button
                                            onClick={() => setCfg(2.5)}
                                            className={`flex-1 flex items-center justify-center gap-2 z-10 transition-all duration-300 ${cfg === 2.5 ? 'text-black font-black' : 'text-[var(--text-secondary)]/60 hover:text-[var(--text-secondary)]'}`}
                                        >
                                            <Camera size={14} />
                                            <span className="text-[9px] uppercase tracking-widest">{t('cfg_natural')}</span>
                                        </button>
                                        <button
                                            onClick={() => setCfg(3.5)}
                                            className={`flex-1 flex items-center justify-center gap-2 z-10 transition-all duration-300 ${cfg === 3.5 ? 'text-black font-black' : 'text-[var(--text-secondary)]/60 hover:text-[var(--text-secondary)]'}`}
                                        >
                                            <Sparkles size={14} />
                                            <span className="text-[9px] uppercase tracking-widest">{t('cfg_vivid')}</span>
                                        </button>
                                        {/* Sliding Background */}
                                        <div
                                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gold-gradient rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(210,172,71,0.3)]"
                                            style={{ left: cfg === 2.5 ? '4px' : 'calc(50%)' }}
                                        ></div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setRawPromptMode(!rawPromptMode)}
                                            className={`flex-1 flex items-center justify-center gap-1 py-2 border transition-all rounded-xl ${rawPromptMode ? 'bg-[#d2ac47] border-[#d2ac47] text-black' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)]/60 hover:text-[var(--text-secondary)] hover:border-[#d2ac47]'}`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${rawPromptMode ? 'bg-black' : 'bg-[#d2ac47]/50'}`}></div>
                                            <span className="text-[8px] uppercase tracking-widest font-bold">{t('label_raw')}</span>
                                        </button>
                                        <button
                                            onClick={() => setUpscale(!upscale)}
                                            className={`flex-1 flex items-center justify-center gap-1 py-2 border transition-all rounded-xl ${upscale ? 'bg-[#d2ac47] border-[#d2ac47] text-black' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)]/60 hover:text-[var(--text-secondary)] hover:border-[#d2ac47]'}`}
                                        >
                                            <Sparkles size={12} className={upscale ? 'text-black' : ''} />
                                            <span className="text-[8px] uppercase tracking-widest font-bold">{t('label_upscale')}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div >
                </div >
            </div > {/* End of Main Grid */}



            {/* Edit Modal Removed - Inline Editing Active */}

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


