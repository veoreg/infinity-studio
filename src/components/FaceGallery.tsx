import React, { useState } from 'react';
import { Maximize2, X, Upload, Loader2 } from 'lucide-react';
import { REF_FACES } from '../constants/refFaces';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';

interface FaceGalleryProps {
    onSelect: (url: string) => void;
    onToVideo?: (url: string) => void;
    className?: string;
}

const FaceGallery: React.FC<FaceGalleryProps> = ({ onSelect, onToVideo, className = "" }) => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Helper to get full URL - Now supports absolute paths from new gallery
    const getUrl = (filename: string) => {
        if (filename.startsWith('http') || filename.startsWith('/')) return filename;
        return `/ref_faces/${filename}`;
    };

    // Display only REF_FACES (White BG Portraits) for the Center Selector
    const displayFaces = REF_FACES;

    const handleSelect = (filename: string) => {
        // Construct full URL (handle absolute vs relative)
        if (filename.startsWith('http')) {
            onSelect(filename);
            setIsExpanded(false);
            return;
        }

        const fullUrl = filename.startsWith('/')
            ? window.location.origin + filename
            : window.location.origin + getUrl(filename);

        onSelect(fullUrl);
        setIsExpanded(false);
    };

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert(t('error_file_type'));
            return;
        }

        setUploading(true);

        try {
            // Generate unique filename to avoid collisions
            const fileExt = file.name.split('.').pop();
            const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

            // Upload to Supabase 'generations' bucket
            const { error: uploadError } = await supabase.storage
                .from('generations')
                .upload(uniqueName, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('generations')
                .getPublicUrl(uniqueName);

            onSelect(publicUrl);
            setIsExpanded(false);
        } catch (error) {
            console.error('Upload failed:', error);
            alert(t('error_upload_failed'));
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            {/* Compact View - Horizontal Strip */}
            <div className={`w-full ${className}`}>
                <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[9px] uppercase font-bold text-[#d2ac47] tracking-widest opacity-80">
                        {t('face_library', 'FACE LIBRARY')}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                        className="text-[var(--text-secondary)] hover:text-[#d2ac47] transition-colors"
                        title={t('view_gallery', 'View Gallery')}
                    >
                        <Maximize2 size={12} />
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 items-center mask-linear-fade">
                    {/* Hidden File Input */}

                    {/* Upload Tile */}
                    <div
                        className="relative shrink-0 w-9 h-12 rounded-lg overflow-hidden cursor-pointer border border-[#d2ac47]/30 hover:border-[#d2ac47] flex items-center justify-center bg-[#d2ac47]/10 transition-all group"
                        onClick={() => !uploading && document.getElementById('face-gallery-upload')?.click()}
                        title={t('tooltip_upload_edit', 'Upload Custom Face')}
                    >
                        <input
                            type="file"
                            id="face-gallery-upload"
                            className="hidden"
                            accept="image/*"
                            disabled={uploading}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file);
                            }}
                        />
                        {uploading ? (
                            <Loader2 size={14} className="text-[#d2ac47] animate-spin" />
                        ) : (
                            <div className="flex flex-col items-center gap-1">
                                <Upload size={14} className="text-[#d2ac47] group-hover:scale-110 transition-transform" />
                                <span className="text-[6px] uppercase font-bold text-[#d2ac47] tracking-wider">ADD</span>
                            </div>
                        )}
                    </div>

                    {displayFaces.map((face, idx) => (
                        <div
                            key={face.id || idx}
                            className={`relative shrink-0 w-9 h-12 rounded-lg overflow-hidden cursor-pointer border transition-all ${idx === currentIndex
                                ? 'border-[#d2ac47] shadow-[0_0_10px_rgba(210,172,71,0.3)]'
                                : 'border-transparent hover:border-white/20 opacity-60 hover:opacity-100'
                                }`}
                            onClick={() => {
                                setCurrentIndex(idx);
                                handleSelect(face.filename);
                            }}
                        >
                            <img
                                src={getUrl(face.filename)}
                                alt={face.label}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Expanded Modal */}
            {isExpanded && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-2 animate-in fade-in duration-200">
                    <div className="w-full max-w-6xl flex justify-between items-center mb-2 px-2">
                        <h3 className="text-[#d2ac47] text-lg sm:text-xl font-bold uppercase tracking-widest shrink-0">
                            {t('select_reference_face', 'Select Reference Face')}
                        </h3>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar grid grid-cols-3 min-[480px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-1.5 sm:gap-2 p-1">
                        {/* Add/Upload Tile */}
                        <div
                            className="relative group aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border border-[#d2ac47]/30 hover:border-[#d2ac47] flex flex-col items-center justify-center bg-[#d2ac47]/5 hover:bg-[#d2ac47]/10 transition-all"
                            onClick={() => !uploading && document.getElementById('face-gallery-upload')?.click()}
                        >
                            {uploading ? (
                                <Loader2 size={24} className="text-[#d2ac47] animate-spin" />
                            ) : (
                                <>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#d2ac47]/50 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                        <Upload size={20} className="text-[#d2ac47]" />
                                    </div>
                                    <span className="text-[9px] uppercase font-bold text-[#d2ac47] tracking-widest">Add New</span>
                                </>
                            )}
                        </div>

                        {displayFaces.map((face, idx) => (
                            <div
                                key={face.id || idx}
                                className="relative group aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-[#d2ac47] transition-all transform hover:scale-[1.02]"
                                onClick={() => handleSelect(face.filename)}
                            >
                                <img
                                    src={getUrl(face.filename)}
                                    alt={face.label}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {/* Gradient Overlay for better text readability */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none" />



                                {/* Marquee/Scrollable Label Container - Maximized Visibility & Compactness */}
                                <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-7 bg-black/85 backdrop-blur-sm flex items-center justify-center z-20 overflow-hidden pointer-events-none">
                                    <div className="w-full px-0.5 text-center">
                                        <span className="text-[8px] sm:text-[9px] font-bold text-[#d2ac47] uppercase tracking-wider block truncate scale-95 sm:scale-100 origin-center leading-tight">
                                            {face.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </>
    );
};

export default FaceGallery;
