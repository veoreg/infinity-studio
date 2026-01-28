import React, { useState } from 'react';
import { Maximize2, X, Upload } from 'lucide-react';
import { REF_FACES } from '../constants/refFaces';
import { useTranslation } from 'react-i18next';

interface FaceGalleryProps {
    onSelect: (url: string) => void;
    className?: string;
}

const FaceGallery: React.FC<FaceGalleryProps> = ({ onSelect, className = "" }) => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    // Helper to get full URL
    const getUrl = (filename: string) => `/ref_faces/${filename}`;

    const handleSelect = (filename: string) => {
        // Construct full URL (assuming public folder)
        const fullUrl = window.location.origin + getUrl(filename);
        onSelect(fullUrl);
        setIsExpanded(false);
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
                    {/* Hidden File Input (Removed Upload Tile UI, keeping input just in case logic needs it later, but removing trigger) */}

                    {/* Upload Tile */}
                    <div
                        className="relative shrink-0 w-12 h-16 rounded-lg overflow-hidden cursor-pointer border border-[#d2ac47]/30 hover:border-[#d2ac47] flex items-center justify-center bg-[#d2ac47]/10 transition-all group"
                        onClick={() => document.getElementById('face-gallery-upload')?.click()}
                        title={t('tooltip_upload_edit', 'Upload Custom Face')}
                    >
                        <input
                            type="file"
                            id="face-gallery-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const url = URL.createObjectURL(file);
                                    onSelect(url);
                                }
                            }}
                        />
                        <div className="flex flex-col items-center gap-1">
                            <Upload size={14} className="text-[#d2ac47] group-hover:scale-110 transition-transform" />
                            <span className="text-[6px] uppercase font-bold text-[#d2ac47] tracking-wider">ADD</span>
                        </div>
                    </div>

                    {REF_FACES.map((face, idx) => (
                        <div
                            key={idx}
                            className={`relative shrink-0 w-12 h-16 rounded-lg overflow-hidden cursor-pointer border transition-all ${idx === currentIndex
                                ? 'border-[#d2ac47] shadow-[0_0_10px_rgba(210,172,71,0.3)]'
                                : 'border-transparent hover:border-white/20 opacity-60 hover:opacity-100'
                                }`}
                            onClick={() => {
                                setCurrentIndex(idx);
                                handleSelect(face);
                            }}
                        >
                            <img
                                src={getUrl(face)}
                                alt={`Ref ${idx}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Expanded Modal */}
            {isExpanded && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={32} />
                    </button>

                    <h3 className="text-[#d2ac47] text-xl font-bold uppercase tracking-widest mb-6">
                        {t('select_reference_face', 'Select Reference Face')}
                    </h3>

                    <div className="w-full max-w-4xl max-h-[80vh] overflow-y-auto custom-scrollbar grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 p-2">
                        {/* Add/Upload Tile */}
                        <div
                            className="relative group aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border border-[#d2ac47]/30 hover:border-[#d2ac47] flex flex-col items-center justify-center bg-[#d2ac47]/5 hover:bg-[#d2ac47]/10 transition-all"
                            onClick={() => document.getElementById('face-gallery-upload')?.click()}
                        >
                            <div className="w-12 h-12 rounded-full border border-[#d2ac47]/50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <Upload size={24} className="text-[#d2ac47]" />
                            </div>
                            <span className="text-[10px] uppercase font-bold text-[#d2ac47] tracking-widest">Add New</span>
                        </div>

                        {REF_FACES.map((face, idx) => (
                            <div
                                key={idx}
                                className="relative group aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-[#d2ac47] transition-all"
                                onClick={() => handleSelect(face)}
                            >
                                <img
                                    src={getUrl(face)}
                                    alt={`Ref Face ${idx}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default FaceGallery;
