import { useContext, useState } from "react";
import Dashboard from "../components/Dashboard.jsx";
import { useUser } from "../hooks/useUser.jsx";
import { AppContext } from "../context/AppContext.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import { LoaderCircle, Mail, Calendar, User } from "lucide-react";
import ProfilePhotoSelector from "../components/ProfilePhotoSelector.jsx";
import uploadProfileImage from "../util/uploadProfileImage.js";
import moment from "moment";

const Profile = () => {
    useUser();
    const { user, updateUser } = useContext(AppContext);

    const [fullName, setFullName] = useState(user?.fullName || "");
    const [profilePhoto, setProfilePhoto] = useState(null);    // new file or avatar URL
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!fullName.trim()) {
            toast.error("Full name cannot be empty");
            return;
        }

        setIsLoading(true);

        try {
            let profileImageUrl = user?.profileImageUrl || "";

            // Handle photo update
            if (profilePhoto) {
                if (typeof profilePhoto === "string") {
                    // DiceBear avatar URL — use directly
                    profileImageUrl = profilePhoto;
                } else {
                    // File upload — send to Cloudinary
                    const uploaded = await uploadProfileImage(profilePhoto);
                    if (uploaded) profileImageUrl = uploaded;
                }
            }

            const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_PROFILE, {
                fullName: fullName.trim(),
                profileImageUrl,
            });

            if (response.status === 200) {
                // Update user in context + localStorage
                const updatedUser = { ...user, ...response.data };
                updateUser(updatedUser);
                setProfilePhoto(null);  // clear pending selection
                toast.success("Profile updated successfully!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dashboard activeMenu="Profile">
            <div className="my-5 mx-auto max-w-2xl">
                <h2 className="text-2xl font-semibold mb-6">My Profile</h2>

                <div className="card">
                    <form onSubmit={handleSave} className="space-y-6">

                        {/* Avatar / Photo selector */}
                        <div className="flex flex-col items-center pb-6 border-b border-gray-100">
                            <ProfilePhotoSelector
                                image={profilePhoto}
                                setImage={setProfilePhoto}
                                currentImageUrl={user?.profileImageUrl}
                            />
                        </div>

                        {/* Read-only info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Mail size={16} className="text-gray-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                                    <p className="text-sm text-gray-700 font-medium truncate">{user?.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar size={16} className="text-gray-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Member Since</p>
                                    <p className="text-sm text-gray-700 font-medium">
                                        {user?.createdAt
                                            ? moment(user.createdAt).format("DD MMM YYYY")
                                            : "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Editable full name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm
                                               focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                    placeholder="Your full name"
                                />
                            </div>
                        </div>

                        {/* Info note */}
                        <p className="text-xs text-gray-400">
                            Email cannot be changed. To update your password, please contact support.
                        </p>

                        {/* Save button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`add-btn flex items-center gap-2 px-6 ${
                                    isLoading ? "opacity-60 cursor-not-allowed" : ""
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <LoaderCircle size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Dashboard>
    );
};

export default Profile;