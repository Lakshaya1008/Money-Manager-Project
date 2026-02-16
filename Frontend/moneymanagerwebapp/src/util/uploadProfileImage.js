import {API_ENDPOINTS} from "./apiEndpoints.js";

const CLOUDINARY_UPLOAD_PRESET = "moneymanager";

const uploadProfileImage = async (image) => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Image upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.secure_url;
}

export default uploadProfileImage;