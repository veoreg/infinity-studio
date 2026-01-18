import axios from 'axios';

const IMGBB_API_KEY = '1c25b0eebb392486c41c5c49861bf059';

export const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    try {
        const response = await axios.post('https://api.imgbb.com/1/upload', formData);
        return response.data.data.url;
    } catch (error) {
        console.error('ImgBB Upload Error:', error);
        throw new Error('Failed to upload image. Please try again.');
    }
};
