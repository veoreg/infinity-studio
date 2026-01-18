import React, { useState, useCallback } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { uploadToImgBB } from '../utils/imageUpload';

interface ImageUploadZoneProps {
    onImageUpload: (url: string) => void;
    currentUrl?: string;
    placeholder?: string;
    className?: string;
}

const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({ onImageUpload, currentUrl, placeholder = "Drag & drop or click to upload", className = "" }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentUrl || null);

    // Sync external URL changes if needed
    React.useEffect(() => {
        if (currentUrl) setPreview(currentUrl);
    }, [currentUrl]);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        setUploading(true);
        // Don't show raw preview to avoid rendering huge files (lag).
        // Wait for compression & upload (~1-2s).

        try {
            const url = await uploadToImgBB(file);
            onImageUpload(url);
            setPreview(url); // Show optimized image from server
        } catch (error) {
            alert('Upload failed. Please try again.');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onImageUpload('');
    };

    return (
        <div
            className={`relative group w-full transition-all duration-300 rounded-xl overflow-hidden border-2 border-dashed 
                ${isDragging ? 'border-[#d2ac47] bg-[#d2ac47]/10' : 'border-[#d2ac47]/30 bg-[#0a0a0a]'}
                ${preview ? 'border-none' : 'hover:border-[#d2ac47]/60'}
                ${className}
            `}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                disabled={uploading}
            />

            {uploading && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <Loader2 className="animate-spin text-[#d2ac47] mb-2" size={24} />
                    <span className="text-[#d2ac47] text-[10px] font-bold uppercase tracking-widest">Uploading...</span>
                </div>
            )}

            {preview ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center group/preview overflow-hidden rounded-xl">
                    <img src={preview} alt="Upload Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-all flex flex-col justify-end p-4">
                        <span className="text-[#d2ac47] text-xs font-bold uppercase tracking-widest">Image Uploaded</span>
                    </div>
                    <button
                        onClick={handleClear}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors z-40"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${isDragging ? 'scale-110 border-[#d2ac47] bg-[#d2ac47]/20' : 'border-[#d2ac47]/30 bg-[#0f0f0f]'}`}>
                        <Upload size={20} className={isDragging ? 'text-[#d2ac47]' : 'text-[#d2ac47]/50'} />
                    </div>
                    <div>
                        <p className="text-[#F9F1D8] text-xs font-bold uppercase tracking-widest mb-1">
                            {isDragging ? "Drop to Upload" : placeholder}
                        </p>
                        <p className="text-[#d2ac47]/50 text-[10px] uppercase tracking-wider">
                            Supports JPG, PNG, WEBP
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploadZone;
