import React, { useState } from 'react';
import axios from 'axios';
import { Camera, Download, RefreshCw, User, Layers, Sparkles, XCircle } from "lucide-react";
import GamificationDashboard from './GamificationDashboard';
import UserGallery from './UserGallery';
import ImageUploadZone from './ImageUploadZone';

// Webhook URL (Proxied via Vite)
const WEBHOOK_URL = "https://n8n.develotex.io/webhook/generate-flux-image";

interface CustomSelectProps {
    label: string;
    value: string | number;
    onChange: (val: string) => void;
    options: { label: string, value: string | number }[];
    disabled?: boolean;
}

// Reusable Dropdown Component
const CustomSelect: React.FC<CustomSelectProps> = ({ label, value, onChange, options, disabled }) => {
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
            <label className="text-[#d2ac47] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 block">{label}</label>
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

const AvatarLogger: React.FC = () => {
    const [log, setLog] = useState("Initializing Neural Network...");

    React.useEffect(() => {
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
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 animate-fade-in drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)]">
            <RefreshCw className="w-12 h-12 text-[#d2ac47] animate-spin" />
            <div className="font-mono text-[#d2ac47] text-xs uppercase tracking-widest font-bold">
                {">"} {log}
            </div>
            {/* Progress Bar Simulation */}
            <div className="w-48 h-1 bg-[#d2ac47]/20 rounded-full overflow-hidden mt-4 bg-black/40 backdrop-blur-sm">
                <div className="h-full bg-[#d2ac47] animate-[growWidth_50s_ease-out_forwards]" style={{ width: '0%' }}></div>
            </div>
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
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Identity Specs
    const [gender, setGender] = useState('female');
    const [age, setAge] = useState(24);
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

    // Gallery State
    const [galleryItems, setGalleryItems] = useState<any[]>([]);

    // Cancellation Ref
    const controllerRef = React.useRef<AbortController | null>(null);

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
            setError("Body Reference toggle is ON, but no image uploaded.");
            return;
        }

        if (grabComposition && !compositionUrl) {
            setError("Background Reference toggle is ON, but no image uploaded.");
            return;
        }

        setLoading(true);
        setError(null);

        // reset image only if we want to clear the canvas, 
        // but users might like to see the old one while waiting. 
        // Let's clear it to show "working" state clearly or use a loader overlay.
        // setGeneratedImage(null); 

        try {
            const payload = {
                gender,
                age,
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

            // Request Blob to handle binary image response
            const response = await axios.post(WEBHOOK_URL, payload, {
                responseType: 'blob',
                headers: { 'Content-Type': 'application/json' },
                timeout: 240000, // 4 minutes timeout for avatar generation
                signal: controllerRef.current.signal
            });

            // Create Object URL from the blob
            const imageUrl = URL.createObjectURL(new Blob([response.data]));
            setGeneratedImage(imageUrl);

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
                                <label className="text-[#d2ac47] text-[10px] font-bold tracking-[0.2em] uppercase">Age</label>
                                <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))}
                                    className="w-full bg-[#0a0a0a] border border-[#d2ac47]/30 text-[#F9F1D8] p-3 focus:outline-none focus:border-[#d2ac47] rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <CustomSelect
                                    label="Nationality"
                                    value={nationality}
                                    onChange={(val) => setNationality(val)}
                                    options={[
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
                                <div className="w-full aspect-square relative overflow-hidden rounded-xl mb-3">
                                    <ImageUploadZone
                                        onImageUpload={setFaceImageUrl}
                                        currentUrl={faceImageUrl}
                                        placeholder="Upload Face Photo"
                                        className="h-full w-full"
                                    />
                                </div>
                                {/* Likeness Slider (Moved here) */}
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
                            <div className={`border rounded-2xl p-6 group/body flex flex-col ${error?.includes('Body') ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] bg-red-950/10' : grabBody ? 'border-solid border-[#d2ac47] bg-[#0a0a0a]' : 'border-dashed border-[#d2ac47]/30 bg-transparent hover:border-[#d2ac47]/50 hover:bg-[#d2ac47]/5 h-full min-h-[350px] justify-between'} `}>
                                <div className={`flex items-center gap-3 mb-4 cursor-pointer w-full ${!grabBody && 'h-full justify-center flex-col gap-4'}`} onClick={() => setGrabBody(!grabBody)}>
                                    <button
                                        className={`w-8 h-8 border rounded-full flex items-center justify-center transition-all ${grabBody ? 'border-[#d2ac47] text-[#d2ac47] bg-[#d2ac47]/20 shadow-[0_0_10px_rgba(210,172,71,0.3)]' : 'w-12 h-12 border-[#d2ac47]/40 text-[#d2ac47]/40 scale-125'} `}>
                                        {grabBody ? <XCircle size={16} /> : <Camera size={20} />}
                                    </button>
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors ${grabBody ? 'text-[#d2ac47]' : 'text-[#d2ac47]/40'}`}>
                                            Body Reference
                                        </span>
                                        {grabBody && <span className="text-[8px] text-[#d2ac47]/60 uppercase tracking-wider">(Tap to Close)</span>}
                                    </div>
                                </div>
                                {grabBody && (
                                    <div className="animate-fade-in w-full aspect-square relative overflow-hidden rounded-xl mb-3">
                                        <ImageUploadZone
                                            onImageUpload={setBodyRefUrl}
                                            currentUrl={bodyRefUrl}
                                            placeholder="Upload Body Photo"
                                            className="h-full w-full"
                                        />
                                    </div>
                                )}
                                {/* Body Type Dropdown (Moved Here for UX) */}
                                <div>
                                    <CustomSelect
                                        label={grabBody ? "Structure (From Image)" : "Body Structure"}
                                        value={bodyType}
                                        onChange={(val) => setBodyType(val)}
                                        disabled={grabBody}
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
                            <div className={`border rounded-2xl p-6 group/comp flex flex-col overflow-hidden ${error?.includes('Background') ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] bg-red-950/10' : grabComposition ? 'border-solid border-[#d2ac47] bg-[#0a0a0a]' : 'border-dashed border-[#d2ac47]/30 bg-transparent hover:border-[#d2ac47]/50 hover:bg-[#d2ac47]/5 h-full min-h-[350px] justify-between'} `}>
                                <div className={`flex items-center gap-3 mb-4 cursor-pointer w-full ${!grabComposition && 'h-full justify-center flex-col gap-4'}`} onClick={() => setGrabComposition(!grabComposition)}>
                                    <button
                                        className={`w-8 h-8 border rounded-full flex items-center justify-center transition-all ${grabComposition ? 'border-[#d2ac47] text-[#d2ac47] bg-[#d2ac47]/20 shadow-[0_0_10px_rgba(210,172,71,0.3)]' : 'w-12 h-12 border-[#d2ac47]/40 text-[#d2ac47]/40 scale-125'} `}>
                                        {grabComposition ? <XCircle size={16} /> : <Layers size={20} />}
                                    </button>
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors ${grabComposition ? 'text-[#d2ac47]' : 'text-[#d2ac47]/40'}`}>
                                            Background Ref
                                        </span>
                                        {grabComposition && <span className="text-[8px] text-[#d2ac47]/60 uppercase tracking-wider">(Tap to Close)</span>}
                                    </div>
                                </div>
                                {grabComposition && (
                                    <div className="animate-fade-in w-full aspect-square relative overflow-hidden rounded-xl mb-3">
                                        <ImageUploadZone
                                            onImageUpload={setCompositionUrl}
                                            currentUrl={compositionUrl}
                                            placeholder="Upload Background"
                                            className="h-full w-full"
                                        />
                                    </div>
                                )}
                                {/* Invisible Slider Clone for Exact Height Match */}
                                {grabComposition && (
                                    <div className="invisible pointer-events-none">
                                        <div className="flex justify-between text-[9px] mb-1">
                                            <span>Likeness Strength</span>
                                        </div>
                                        <div className="w-full h-1" />
                                    </div>
                                )}
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
                        <div className="bg-[#050505] border border-[#d2ac47]/20 rounded-3xl aspect-[9/16] relative flex items-center justify-center overflow-hidden shadow-2xl group flex-col min-h-[500px]">
                            {/* 1. LAYER: Generated Image (Bottom) */}
                            {generatedImage && (
                                <>
                                    <img src={generatedImage} alt="Generated Avatar" className="w-full h-full object-contain bg-black/80" />
                                    {/* Deco Corners */}
                                    <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#d2ac47] pointer-events-none"></div>
                                    <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#d2ac47] pointer-events-none"></div>
                                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#d2ac47] pointer-events-none"></div>
                                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#d2ac47] pointer-events-none"></div>
                                </>
                            )}
                            {/* 2. LAYER: Loading Logger */}
                            {loading && (
                                <div className={`flex flex-col items-center justify-center ${generatedImage ? 'absolute inset-0 z-20 bg-black/50 backdrop-blur-sm' : 'w-full h-full'}`}>
                                    <AvatarLogger />
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

                    {/* 3. Image Output (Bottom) - DESKTOP ONLY (Hidden on mobile to show upper copy) */}
                    <div className="hidden lg:flex bg-[#050505] border border-[#d2ac47]/20 rounded-3xl aspect-[9/16] relative items-center justify-center overflow-hidden shadow-2xl group flex-col min-h-[500px]">
                        {/* 1. LAYER: Generated Image (Bottom) */}
                        {generatedImage && (
                            <>
                                <img src={generatedImage} alt="Generated Avatar" className="w-full h-full object-contain bg-black/80" />
                                {/* Buttons moved to separate layer */}
                                {/* Deco Corners for Image */}
                                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#d2ac47] pointer-events-none"></div>
                                <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#d2ac47] pointer-events-none"></div>
                                <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#d2ac47] pointer-events-none"></div>
                                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#d2ac47] pointer-events-none"></div>
                            </>
                        )}

                        {/* 2. LAYER: Loading Logger (Overlay or Main) */}
                        {loading && (
                            <div className={`flex flex-col items-center justify-center ${generatedImage ? 'absolute inset-0 z-20 bg-black/50 backdrop-blur-sm' : 'w-full h-full'}`}>
                                <AvatarLogger />
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
                </div>

            </div>

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
