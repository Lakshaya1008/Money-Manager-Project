import { useRef, useState } from "react";
import { Trash, Upload, User, Smile, ChevronLeft, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";

const AVATAR_STYLES = [
    { id: "avataaars",   label: "Cartoon"     },
    { id: "micah",       label: "Illustrated" },
    { id: "lorelei",     label: "Elegant"     },
    { id: "pixel-art",   label: "Pixel"       },
    { id: "notionists",  label: "Minimal"     },
    { id: "thumbs",      label: "Fun"         },
];

const AVATAR_SEEDS = [
    "Felix", "Mia", "Zara", "Leo", "Nova", "Kai",
    "Luna", "Ravi", "Aria", "Finn", "Jade", "Omar",
];

const getDiceBearUrl = (style, seed) =>
    `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

// currentImageUrl = the already-saved URL (shown on profile edit page)
const ProfilePhotoSelector = ({ image, setImage, currentImageUrl }) => {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [activeTab, setActiveTab] = useState("upload");
    const [selectedStyle, setSelectedStyle] = useState(0);
    const [selectedAvatar, setSelectedAvatar] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setSelectedAvatar(null);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = (e) => {
        e.preventDefault();
        setImage(null);
        setPreviewUrl(null);
        setSelectedAvatar(null);
    };

    const onChooseFile = (e) => {
        e.preventDefault();
        inputRef.current?.click();
    };

    const handleSelectAvatar = (url) => {
        setSelectedAvatar(url);
        setImage(url);
        setPreviewUrl(null);
    };

    const prevStyle = () =>
        setSelectedStyle((s) => (s - 1 + AVATAR_STYLES.length) % AVATAR_STYLES.length);
    const nextStyle = () =>
        setSelectedStyle((s) => (s + 1) % AVATAR_STYLES.length);

    // Priority: new file preview > new avatar > existing saved image > placeholder
    const displayImage = previewUrl || selectedAvatar || currentImageUrl;
    const currentStyle = AVATAR_STYLES[selectedStyle];

    return (
        <div className="flex flex-col items-center gap-4 mb-2">

            {/* Preview circle */}
            <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center border-2 border-purple-200">
                    {displayImage ? (
                        <img src={displayImage} alt="profile preview"
                             className="w-full h-full object-cover" />
                    ) : (
                        <User className="text-purple-400" size={40} />
                    )}
                </div>

                {/* Cancel pending change button */}
                {(previewUrl || selectedAvatar) && (
                    <button
                        onClick={handleRemoveImage}
                        className="w-6 h-6 flex items-center justify-center bg-red-500 text-white
                                   rounded-full absolute -bottom-1 -right-1 shadow hover:bg-red-600 transition-colors"
                        title="Cancel change"
                    >
                        <Trash size={11} />
                    </button>
                )}
            </div>

            {/* Tab switcher */}
            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                <button type="button" onClick={() => setActiveTab("upload")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            activeTab === "upload" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}>
                    <Upload size={12} /> Upload Photo
                </button>
                <button type="button" onClick={() => setActiveTab("avatar")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            activeTab === "avatar" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}>
                    <Smile size={12} /> Choose Avatar
                </button>
            </div>

            {/* Upload tab */}
            {activeTab === "upload" && (
                <div className="flex flex-col items-center gap-2">
                    <input type="file" accept="image/*" ref={inputRef}
                           onChange={handleImageChange} className="hidden" />
                    <button type="button" onClick={onChooseFile}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-purple-300
                                   text-purple-600 rounded-lg text-xs font-medium hover:border-purple-500
                                   hover:bg-purple-50 transition-all">
                        <Upload size={14} />
                        {previewUrl ? "Change Photo" : "Select Photo"}
                    </button>
                    <p className="text-[11px] text-gray-400">JPG, PNG or GIF — max 5MB</p>
                </div>
            )}

            {/* Avatar tab */}
            {activeTab === "avatar" && (
                <div className="w-full max-w-xs">
                    <div className="flex items-center justify-between mb-3">
                        <button type="button" onClick={prevStyle}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs font-semibold text-gray-600 tracking-wide uppercase">
                            {currentStyle.label}
                        </span>
                        <button type="button" onClick={nextStyle}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="flex justify-center gap-1 mb-3">
                        {AVATAR_STYLES.map((_, i) => (
                            <button key={i} type="button" onClick={() => setSelectedStyle(i)}
                                    className={`h-1.5 rounded-full transition-all ${
                                        i === selectedStyle ? "bg-purple-600 w-3" : "bg-gray-300 w-1.5"
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {AVATAR_SEEDS.map((seed) => {
                            const url = getDiceBearUrl(currentStyle.id, seed);
                            const isSelected = selectedAvatar === url;
                            return (
                                <button key={seed} type="button" onClick={() => handleSelectAvatar(url)}
                                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all hover:scale-105 ${
                                            isSelected
                                                ? "border-purple-600 shadow-lg shadow-purple-200 scale-105"
                                                : "border-transparent hover:border-purple-300"
                                        }`}>
                                    <img src={url} alt={`Avatar ${seed}`}
                                         className="w-full h-full object-cover bg-purple-50" loading="lazy" />
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-purple-600/10 flex items-center justify-center">
                                            <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5 text-white" fill="none"
                                                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-[11px] text-gray-400 text-center mt-2">
                        Use arrows to explore {AVATAR_STYLES.length} styles · 12 avatars each
                    </p>
                </div>
            )}
        </div>
    );
};

ProfilePhotoSelector.propTypes = {
    image: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    setImage: PropTypes.func.isRequired,
    currentImageUrl: PropTypes.string,
};

export default ProfilePhotoSelector;