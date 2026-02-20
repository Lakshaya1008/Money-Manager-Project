import {API_ENDPOINTS} from "./apiEndpoints.js";

// ─── Cloudinary Setup ──────────────────────────────────────────────────────
// You MUST create an unsigned upload preset in your Cloudinary dashboard:
//   Cloudinary Dashboard → Settings → Upload → Upload Presets → Add Preset
//   Set "Signing Mode" to UNSIGNED and note the preset name.
// Then add to your .env.local:
//   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
//   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
//
// The cloud name is visible at: https://console.cloudinary.com/
// (top-right corner of the dashboard)

const CLOUDINARY_UPLOAD_PRESET =
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "moneymanager";

const uploadProfileImage = async (image) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
        throw new Error(
            "Cloudinary cloud name is not configured. " +
            "Add VITE_CLOUDINARY_CLOUD_NAME to your .env.local file."
        );
    }

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Cloudinary 400 almost always means the upload preset doesn't exist
        const cloudinaryMsg = errorData?.error?.message || "";
        if (response.status === 400) {
            throw new Error(
                `Upload failed (400). Check that the upload preset "${CLOUDINARY_UPLOAD_PRESET}" ` +
                `exists in your Cloudinary dashboard (Settings → Upload → Upload Presets) ` +
                `and is set to UNSIGNED. Cloudinary said: "${cloudinaryMsg}"`
            );
        }
        throw new Error(`Image upload failed (${response.status}): ${cloudinaryMsg || "Unknown error"}`);
    }

    const data = await response.json();
    return data.secure_url;
};

export default uploadProfileImage;