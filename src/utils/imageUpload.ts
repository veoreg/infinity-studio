import axios from 'axios';

const IMGBB_API_KEY = '1c25b0eebb392486c41c5c49861bf059';

// Client-side compression helper
const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
        const maxWidth = 2048;
        const maxHeight = 2048;
        const quality = 0.85;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Scale down if too large
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // Fail safe: return original
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        // Create new file from blob
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        console.log(`Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                        resolve(compressedFile);
                    } else {
                        resolve(file); // Fail safe
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = () => resolve(file); // Fail safe
        };
        reader.onerror = () => resolve(file); // Fail safe
    });
};

export const uploadToImgBB = async (file: File): Promise<string> => {
    // 1. Compress Image (Smart Optimization)
    const processedFile = await compressImage(file);

    const formData = new FormData();
    formData.append('image', processedFile);
    formData.append('key', IMGBB_API_KEY);

    try {
        const response = await axios.post('https://api.imgbb.com/1/upload', formData);
        return response.data.data.url;
    } catch (error) {
        console.error('ImgBB Upload Error:', error);
        throw new Error('Failed to upload image. Please try again.');
    }
};
