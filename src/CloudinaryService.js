import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

export const uploadImageToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: 'products', // Thư mục lưu trữ trên Cloudinary
        });
        return result.secure_url; // Trả về URL công khai của ảnh
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
};
