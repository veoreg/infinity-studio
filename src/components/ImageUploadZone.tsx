
import React, { useState, useCallback } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from 'react-i18next';

interface ImageUploadZoneProps {
    onImageUpload: (data: { url: string; fileName: string }) => void;
    currentUrl?: string;
    placeholder?: string;
    className?: string;
}

const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({ onImageUpload, currentUrl, placeholder, className = "" }) => {
    const { t } = useTranslation();
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentUrl || null);

    // Sync external URL changes if needed
    React.useEffect(() => {
        if (currentUrl) setPreview(currentUrl);
    }, [currentUrl]);

    const handleFile = async (file: File) => {
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

            onImageUpload({ url: publicUrl, fileName: file.name });
            setPreview(publicUrl);
        } catch (error) {
            console.error('Upload failed:', error);
            alert(t('error_upload_failed'));
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
        onImageUpload({ url: '', fileName: '' });
    };

    const displayPlaceholder = placeholder || t('drag_n_drop');

    return (
        <div
            className={`relative group w-full transition-all duration-300 rounded-xl overflow-hidden border-2 border-dashed 
                ${isDragging ? 'border-[#d2ac47] bg-[#d2ac47]/10' : 'border-[var(--border-color)]/30 bg-black/20'}
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
                    <span className="text-[#d2ac47] text-[10px] font-bold uppercase tracking-widest">{t('uploading')}</span>
                </div>
            )}

            {preview ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center group/preview overflow-hidden rounded-xl">
                    <img src={preview} alt="Upload Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-all flex flex-col justify-end p-4">
                        <span className="text-[#d2ac47] text-xs font-bold uppercase tracking-widest">{t('image_uploaded')}</span>
                    </div>
                    <button
                        onClick={handleClear}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors z-40"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center px-4 text-center space-y-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${isDragging ? 'scale-110 border-[#d2ac47] bg-[#d2ac47]/20' : 'border-[#d2ac47]/40 bg-[var(--bg-primary)] shadow-sm'}`}>
                        <Upload size={20} className={isDragging ? 'text-[#d2ac47]' : 'text-[var(--text-secondary)]'} />
                    </div>
                    <div>
                        <p className="text-[var(--text-primary)] text-[13px] font-black uppercase tracking-widest mb-1.5">
                            {isDragging ? t('drop_to_upload') : displayPlaceholder}
                        </p>
                        <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider opacity-60">
                            {t('supports_formats')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploadZone;
